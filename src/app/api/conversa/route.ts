import type { DiaryEntry } from '@/lib/storage';

export const runtime = 'nodejs';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

type ConversaRequest = {
  messages: ChatMessage[];
  userContext?: {
    recentEntries?: DiaryEntry[];
    mood?: number;
    emotions?: string[];
  };
};

const SYSTEM_BASE = `Eres "Egoera", un acompañante terapéutico inspirado en la Comunicación No Violenta y la escucha socrática. Hablas siempre en español, con un tono cálido pero no familiar, despacio, sin prisa.

Reglas estrictas:
- NUNCA das consejos directos ni recetas. NUNCA diagnosticas. NUNCA usas la palabra "deberías" ni equivalentes ("tienes que", "lo que necesitas es").
- Tu herramienta principal son las preguntas socráticas, abiertas y específicas (estilo "¿Qué notaste hoy que ayer no?", "¿Dónde sientes eso en el cuerpo?", "¿Qué necesita esa parte de ti?").
- Respondes en MÁXIMO 2 frases. Cortas, precisas, sin rellenar.
- NUNCA usas emojis. NUNCA usas exclamaciones efusivas.
- Reflejas lo que la persona dice antes de preguntar, cuando ayuda. Validas la experiencia, no la juzgas.
- Si la persona expresa ideación suicida o crisis grave, sugieres contactar al 024 (España) con calma y firmeza, sin dramatismo.`;

function buildSystemPrompt(userContext?: ConversaRequest['userContext']): string {
  if (!userContext?.recentEntries || userContext.recentEntries.length === 0) {
    return SYSTEM_BASE;
  }

  const recent = userContext.recentEntries.slice(0, 5);
  const summary = recent
    .map((e) => {
      const date = new Date(e.createdAt).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
      });
      const emotions = e.emotions.join(', ');
      const text = e.text.length > 140 ? `${e.text.slice(0, 140)}...` : e.text;
      return `- ${date} · estado ${e.mood}/10 · ${emotions} — ${text}`;
    })
    .join('\n');

  const moodLine =
    typeof userContext.mood === 'number' ? `\nEstado actual reportado: ${userContext.mood}/10.` : '';
  const emotionsLine =
    userContext.emotions && userContext.emotions.length > 0
      ? `\nEmociones marcadas hoy: ${userContext.emotions.join(', ')}.`
      : '';

  return `${SYSTEM_BASE}

Contexto reciente del diario de la persona (úsalo solo para tener memoria, no lo cites literal salvo que aporte):
${summary}${moodLine}${emotionsLine}`;
}

/**
 * Llama al Vercel AI Gateway (formato OpenAI-compat).
 * Usado cuando ANTHROPIC_API_KEY tiene prefijo `vck_`.
 */
async function callVercelGateway(
  apiKey: string,
  systemPrompt: string,
  messages: ChatMessage[]
): Promise<string> {
  const res = await fetch('https://ai-gateway.vercel.sh/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-sonnet-4-5',
      max_tokens: 200,
      temperature: 0.7,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    }),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    throw new Error(`Gateway ${res.status}: ${errBody.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return data.choices?.[0]?.message?.content?.trim() ?? '';
}

/**
 * Llama directamente a la API de Anthropic.
 * Usado cuando la key tiene formato nativo `sk-ant-...`.
 */
async function callAnthropic(
  apiKey: string,
  systemPrompt: string,
  messages: ChatMessage[]
): Promise<string> {
  const Anthropic = (await import('@anthropic-ai/sdk')).default;
  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 200,
    temperature: 0.7,
    system: systemPrompt,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });
  type TextBlock = { type: 'text'; text: string };
  return response.content
    .filter((b): b is TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();
}

export async function POST(req: Request): Promise<Response> {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return Response.json({ error: 'No puedo conectar ahora mismo' }, { status: 500 });
    }

    const body = (await req.json()) as ConversaRequest;
    const { messages, userContext } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: 'No puedo conectar ahora mismo' }, { status: 400 });
    }

    const systemPrompt = buildSystemPrompt(userContext);
    const useGateway = apiKey.startsWith('vck_');

    const text = useGateway
      ? await callVercelGateway(apiKey, systemPrompt, messages)
      : await callAnthropic(apiKey, systemPrompt, messages);

    if (!text) {
      return Response.json({ error: 'No puedo conectar ahora mismo' }, { status: 500 });
    }

    return Response.json({ message: text });
  } catch (err) {
    console.error('[api/conversa] error', err);
    return Response.json({ error: 'No puedo conectar ahora mismo' }, { status: 500 });
  }
}
