import type { MessageAuthor, MessageThread } from '../contracts/message'
import { asArray, asRecord, bool, str } from './primitives'

function toAuthor(raw: unknown): MessageAuthor | null {
  const source = asRecord(raw)
  const id = str(source, 'id')
  if (id === '') return null

  return {
    id,
    name: str(source, 'name') || str(source, 'email'),
    role: str(source, 'role', 'admin'),
    avatar: str(source, 'avatar'),
    online: bool(source, 'is_online', false),
  }
}

/**
 * `created_date` (`JJ/MM/AAAA`) + `created_time` (`HH:mm`) → ISO triable.
 *
 * `MessageResource` ne renvoie pas de vrai timestamp, seulement ces deux
 * chaînes déjà formatées (voir `qiryna-backoffice/app/Http/Resources/MessageResource.php`).
 */
function toIso(source: Record<string, unknown>): string {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(str(source, 'created_date'))
  if (!match) return ''
  const [, day, month, year] = match
  const time = /^\d{2}:\d{2}$/.test(str(source, 'created_time')) ? str(source, 'created_time') : '00:00'
  return `${year}-${month}-${day}T${time}:00`
}

/**
 * Regroupe `sent`/`received` par interlocuteur.
 *
 * `GET /user/messages` ne connaît pas la conversation, seulement ces deux
 * tas : on retient, par interlocuteur, le message le plus récent (aperçu +
 * horodatage) et le nombre de messages reçus non lus.
 */
export function toMessageThreads(raw: unknown): MessageThread[] {
  const source = asRecord(raw)
  const received = asArray(source.received).map(asRecord)
  const sent = asArray(source.sent).map(asRecord)

  const unreadByCounterpart = new Map<string, number>()
  for (const item of received) {
    if (item.read_at) continue
    const author = toAuthor(item.sender)
    if (!author) continue
    unreadByCounterpart.set(author.id, (unreadByCounterpart.get(author.id) ?? 0) + 1)
  }

  const latestByCounterpart = new Map<string, { counterpart: MessageAuthor, previewText: string, lastMessageAt: string }>()
  function consider(counterpart: MessageAuthor | null, item: Record<string, unknown>) {
    if (!counterpart) return
    const lastMessageAt = toIso(item)
    const current = latestByCounterpart.get(counterpart.id)
    if (!current || lastMessageAt > current.lastMessageAt) {
      latestByCounterpart.set(counterpart.id, { counterpart, previewText: str(item, 'text'), lastMessageAt })
    }
  }
  for (const item of received) consider(toAuthor(item.sender), item)
  for (const item of sent) consider(toAuthor(item.receiver), item)

  return [...latestByCounterpart.values()]
    .map(entry => ({
      id: entry.counterpart.id,
      counterpart: entry.counterpart,
      previewText: entry.previewText,
      lastMessageAt: entry.lastMessageAt,
      unreadCount: unreadByCounterpart.get(entry.counterpart.id) ?? 0,
    }))
    .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt))
}
