# Réglages — Centre d’aide / Contact — mocks hors API

Écrans :
- `/reglages/centre-aide` ← Figma `1586:1194` (hub)
- `/reglages/contact` ← Figma `1572:3457` (Envoyer un message)
- succès inline ← Figma `1572:3044` (Confirmation de demande)

Config :
- `app/config/centre-aide-mock.ts` (WhatsApp)
- `app/config/contact-success-mock.ts` (repli récap)

Assets :
- `public/img/icons/centre-aide/*`
- `public/img/icons/contact-form/*`
- `public/img/icons/contact-success/*`

## Source API

| Élément | Source | Notes |
|---|---|---|
| Envoi du message | — | **Pas d’endpoint** contact / support |
| Nom / email préremplis | `session.user` | Si connecté |
| WhatsApp | `centreAideMock.whatsappPhone` | `wa.me` mock |
| Être rappelé | — | **Pas d’écran** Figma branché (bouton inerte) |
| Politique de confidentialité | lien `/reglages/mentions` | |

## Mockés

| Élément | Contenu | Quand |
|---|---|---|
| Confirmation | Validation locale + délai ~400 ms | Toujours |
| Récap sujet / nom / email | Valeurs du formulaire | Après soumission |
| Repli récap | `contactSuccessMock` | Champ vide |
| WhatsApp | numéro `33700000000` | Hub |

## Navigation

| Action | Route |
|---|---|
| Centre d’aide | `/reglages` → `/reglages/centre-aide` |
| Envoyer un message | hub → `/reglages/contact` |
| Succès | même page contact, état `submitted` |
| Retour (topbar contact) | `/reglages/centre-aide` |
| Retour accueil | `/` |
