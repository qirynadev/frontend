# Alignement frontend ← maquette (`pwa/`)

> **Source de vérité visuelle** : `/home/kadso05/projets/Qiryna/pwa/` (branche `main`).  
> **Cible production** : `frontend-main/` (Nuxt 4, Tailwind v4, composants `Q*`).

Dernière analyse : 2026-08-19 (P0 + P1 + P2).

---

## Principe

| Maquette | Frontend |
|---|---|
| HTML + `app.css` (~15k lignes) | Vue SFC + tokens `@theme` + utilitaires Tailwind |
| Données statiques / query params | API BFF + slugs REST |
| 31 écrans HTML | 37 routes Vue (+ 3 mon-projet/langues, CMS, dev) |

**Règle** : la maquette fait foi pour le **rendu pixel 375px**. Le frontend reproduit les mesures via `DESIGN-SYSTEM.md` et les tokens de `app/assets/css/main.css`.

Cartographie machine-readable : `pwa/sync/screen-map.json`.

---

## Matrice d’alignement (32 écrans)

| Statut | Écrans | Action |
|---|---|---|
| ✅ **Aligned** | home, auth (×3), messages, réglages (×5), langues, objectifs, formule, mon-projet (×5), logement (×3), destinations (×3), ecole-detail, orientation (×3), offre-orientation, paiement-reussi | Maintenance — remesure après chaque merge maquette |
| ⚠️ **Partial** | langues-post-payment, reglages-theme | Dark mode + tunnel langue post-paiement |
| 📐 **Remeasure** | orientation-scolaire | Mesure pixel 375px à refaire |

---

## Phases terminées

### P0 (2026-08-19)
- `home.html` — paragraphe progression unique + espacement
- `offre-orientation.html` — sans hero, badge « Offre unique », 4 prestations par domaine
- `orientation-formules.html` — rubans colorés + titre/icône inline
- `paiement-reussi.html` — descriptions d’étapes retirées

### P1 — Lot 4 destinations (2026-08-19)
| Maquette | Fichiers | Changements |
|---|---|---|
| `destination-etude.html` | `destinations/index.vue`, `DestinationCard.vue` | Sous-titre retiré ; icône `ic-dest-school` |
| `domaines-etude.html` | `destinations/[slug]/index.vue`, `config/domain-area-visual.ts` | Variantes `.dom-card-icon--*` + meta bold par slug |
| `liste-ecole.html` | `destinations/[slug]/ecoles/index.vue` | Puces `.le-chip-icon` dimensionnées par slug |

### P2 — Écrans gap (2026-08-19)
| Maquette | Fichier | Changements |
|---|---|---|
| `offres-logement.html` | `logement/[slug].vue` | Badges « X logements proposés » éditoriaux par rang (couleurs `.of-card-badge--*`) |
| `logement-post-paiement.html` | `logement/paiement-reussi.vue` | Déjà porté (tabs, formulaire, validation `order_id`) — statut ✅ |
| `orientation-post-paiement.html` | `orientation/paiement-reussi.vue` | Déjà porté (frise 4 étapes, halo succès) — statut ✅ |
| `mon-projet-apercu.html` | `mon-projet/apercu.vue` | Déjà porté (remesuré 2026-08-17) — statut ✅ |

---

## Pipeline de travail

```
pwa/main (design) → validation → merge release → npm run maquette:sync
                                                      ↓
                                            frontend-main/maquette/pwa/
                                                      ↓
                              Mesure 375px + portage .vue + tokens main.css
```

**En local** (sans attendre `release`) : copier `pwa/` → `frontend-main/maquette/pwa/` pour comparer.

---

## Fichiers clés frontend

| Rôle | Chemin |
|---|---|
| Tokens | `app/assets/css/main.css` |
| Design system | `DESIGN-SYSTEM.md` |
| Domaines visuels | `app/config/domain-area-visual.ts` |
| Features domaine | `app/config/offer-domain-features.ts` ← miroir `pwa/js/offer-orientation.js` |
| Offre / logement | `app/pages/offres/[slug].vue`, `logement/[slug].vue` |
| Reprise projet | `REPRISE.md` |

---

## Prochaines phases

1. **P3** — Dark mode maquette → `@theme` Nuxt (`reglages-theme.html`)
2. **P4** — Remesure `orientation-scolaire.html` + fermeture `langues-post-payment.html`
