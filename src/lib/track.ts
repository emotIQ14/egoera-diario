import { track as vercelTrack } from '@vercel/analytics';

type EventName =
  | 'entry_saved'
  | 'conversa_message_sent'
  | 'pro_cta_clicked'
  | 'onboarding_completed'
  | 'onboarding_skipped'
  | 'export_markdown'
  | 'safety_bar_shown';

export function track(name: EventName, props?: Record<string, string | number>): void {
  if (typeof window === 'undefined') return;
  vercelTrack(name, props);
}
