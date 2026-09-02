import type { MessageAuthor, MessageItem, MessageThread } from '../contracts/message'
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
 * tas : on reconstitue, par interlocuteur, le fil complet (pour la modale de
 * détail), le nombre de messages reçus non lus, et — dérivés du fil trié —
 * l'aperçu/horodatage du plus récent pour la carte de liste.
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

  const byCounterpart = new Map<string, { counterpart: MessageAuthor, messages: MessageItem[] }>()
  function collect(counterpart: MessageAuthor | null, item: Record<string, unknown>, mine: boolean) {
    if (!counterpart) return
    const entry = byCounterpart.get(counterpart.id) ?? { counterpart, messages: [] }
    entry.messages.push({ id: str(item, 'id'), text: str(item, 'text'), createdAt: toIso(item), mine })
    byCounterpart.set(counterpart.id, entry)
  }
  for (const item of received) collect(toAuthor(item.sender), item, false)
  for (const item of sent) collect(toAuthor(item.receiver), item, true)

  return [...byCounterpart.values()]
    .map((entry) => {
      const messages = [...entry.messages].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      const last = messages[messages.length - 1]
      return {
        id: entry.counterpart.id,
        counterpart: entry.counterpart,
        previewText: last?.text ?? '',
        lastMessageAt: last?.createdAt ?? '',
        unreadCount: unreadByCounterpart.get(entry.counterpart.id) ?? 0,
        messages,
      }
    })
    .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt))
}
