import type { NotificationItem, NotificationList } from '../contracts/notification'
import { asArray, asRecord, bool, num, optionalStr, str } from './primitives'

function toNotificationItem(raw: unknown): NotificationItem {
  const source = asRecord(raw)
  return {
    id: str(source, 'id'),
    type: optionalStr(source, 'type'),
    title: str(source, 'title'),
    body: str(source, 'body'),
    url: optionalStr(source, 'url'),
    read: bool(source, 'read', false),
    createdAt: str(source, 'created_at'),
  }
}

/**
 * `GET /user/notifications` — pagination Laravel standard d'une collection de
 * ressources (`data`, `meta.current_page`, `meta.last_page`).
 */
export function toNotificationList(raw: unknown): NotificationList {
  const source = asRecord(raw)
  const meta = asRecord(source.meta)
  return {
    items: asArray(source.data).map(toNotificationItem),
    page: num(meta, 'current_page', 1),
    totalPages: Math.max(1, num(meta, 'last_page', 1)),
  }
}
