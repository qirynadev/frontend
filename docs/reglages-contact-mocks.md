# Réglages — Contact (Centre d’aide) — mocks hors API

Écrans :
- `/reglages/contact` ← capture produit (formulaire « Envoyer un message »)
- succès inline après soumission ← capture produit (« Demande envoyée ! »)

Config : `app/config/contact-success-mock.ts`  
Assets : `public/img/icons/contact-success/*`, `public/img/icons/ic-contact-*`

## Source API

| Élément | Source | Notes |
|---|---|---|
| Envoi du message | — | **Pas d’endpoint** contact / support |
| Nom / email préremplis | `session.user` | Si connecté |
| Politique de confidentialité | lien `/reglages/mentions` | Pas d’URL document isolée |

## Mockés

| Élément | Contenu | Quand |
|---|---|---|
| Confirmation | Validation locale + délai ~400 ms | Toujours (pas d’API) |
| Récap sujet / nom / email | Valeurs du formulaire | Après soumission réussie |
| Repli illustration capture | `Demande écrite`, `Prénom et nom`, `exemple@email.com` | Champ vide uniquement (`contactSuccessMock`) |
| Illustration hero | SVG envelope + badge vert | Asset local |
| Sujets du select | 6 options éditoriales i18n | Catalogue support hors API |

## Navigation

| Action | Route |
|---|---|
| Centre d’aide | `/reglages` → `/reglages/contact` |
| Succès | même page, état `submitted` |
| Retour accueil | `/` |
| Retour (topbar) | `/reglages` |
