import { track as vercelTrack } from '@vercel/analytics';

type EventName =
  | 'entry_saved'
  | 'entry_edited'
  | 'entry_deleted'
  | 'conversa_message_sent'
  | 'pro_cta_clicked'
  | 'onboarding_completed'
  | 'onboarding_skipped'
  | 'export_markdown'
  | 'safety_bar_shown'
  | 'historial_opened'
  | 'historial_search_used'
  | 'historial_filter_used';

export function track(name: EventName, props?: Record<string, string | number>): void {
  if (typeof window === 'undefined') return;
  vercelTrack(name, props);
}
