import Anthropic from '@anthropic-ai/sdk';
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

export async function POST(req: Request): Promise<Response> {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: 'No puedo conectar ahora mismo' },
        { status: 500 }
      );
    }

    const body = (await req.json()) as ConversaRequest;
    const { messages, userContext } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json(
        { error: 'No puedo conectar ahora mismo' },
        { status: 400 }
      );
    }

    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 200,
      temperature: 0.7,
      system: buildSystemPrompt(userContext),
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('\n')
      .trim();

    if (!text) {
      return Response.json(
        { error: 'No puedo conectar ahora mismo' },
        { status: 500 }
      );
    }

    return Response.json({ message: text });
  } catch (err) {
    console.error('[api/conversa] error', err);
    return Response.json(
      { error: 'No puedo conectar ahora mismo' },
      { status: 500 }
    );
  }
}
