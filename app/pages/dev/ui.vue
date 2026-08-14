<script setup lang="ts">
/**
 * Galerie de vérification du design system (Lot 1.4).
 *
 * ⚠️ Page d'outillage, hors produit : ses libellés de démonstration ne passent
 * volontairement pas par i18n. La règle « aucune chaîne en dur » s'applique aux
 * écrans du produit ; la traduire n'apporterait rien et diluerait les fichiers
 * de langue. Elle n'est servie qu'en développement (voir le garde ci-dessous).
 */

import { iconNames } from '~/design-system/icons'
import { TONES, type Size, type Tone } from '~/design-system/types'

definePageMeta({ layout: false })

if (!import.meta.dev) {
  throw createError({ statusCode: 404, statusMessage: 'Not Found', fatal: true })
}

useHead({ title: 'Qiryna — Design system' })

const sizes: Size[] = ['sm', 'md', 'lg']

// Exposé tel quel pour montrer les trois valeurs, y compris pendant l'hydratation.
const device = useDevice()

// Classes écrites en toutes lettres : Tailwind scanne les sources, une classe
// construite dynamiquement (`text-${x}`) ne serait jamais générée.
const typeScale = [
  { name: 'text-4xs', class: 'text-4xs' },
  { name: 'text-3xs', class: 'text-3xs' },
  { name: 'text-2xs', class: 'text-2xs' },
  { name: 'text-xs', class: 'text-xs' },
  { name: 'text-sm', class: 'text-sm' },
  { name: 'text-md', class: 'text-md' },
  { name: 'text-base', class: 'text-base' },
  { name: 'text-lg', class: 'text-lg' },
  { name: 'text-xl', class: 'text-xl' },
  { name: 'text-2xl', class: 'text-2xl' },
  { name: 'text-3xl', class: 'text-3xl' },
  { name: 'text-4xl', class: 'text-4xl' },
  { name: 'text-5xl', class: 'text-5xl' },
  { name: 'text-6xl', class: 'text-6xl' },
]

// ─── État des démonstrations interactives ─────────────────────────────
const email = ref('marie.dupont@exemple.fr')
const password = ref('')
const emptyField = ref('')
const cgu = ref(false)
const objective = ref('exam')
const authTab = ref('login')
const schoolTab = ref('presentation')
const currentPage = ref(3)
const sheetOpen = ref(false)
const strength = ref<0 | 1 | 2 | 3>(2)

const trustItems = [
  { icon: 'ic-trust-shield', label: 'Paiement', label2: 'sécurisé' },
  { icon: 'ic-trust-laurel', label: 'Accompagnement', label2: 'garanti', circled: true },
  { icon: 'ic-trust-smile', label: 'Satisfaction', label2: 'garantie' },
]

const steps = [
  { title: 'Créez votre compte', description: 'En moins de deux minutes.', icon: 'user' as const },
  { title: 'Recevez le lien', description: 'Vérifiez votre boîte mail.', icon: 'mail' as const },
  { title: 'Choisissez un créneau', description: 'Avec un conseiller Qiryna.', icon: 'calendar' as const },
]

const navItems = [
  { id: 'home', to: '#', icon: 'nav-home', iconActive: 'nav-home-active', iconWidth: 24, iconHeight: 24, label: 'Accueil' },
  { id: 'messages', to: '#', icon: 'nav-messages', iconWidth: 24, iconHeight: 24, label: 'Messages' },
  { id: 'orientation', to: '#', icon: 'ic-orientation-logo', iconWidth: 36, iconHeight: 34, label: 'Orientation' },
  { id: 'project', to: '#', icon: 'nav-projet', iconActive: 'nav-projet-active', iconWidth: 24, iconHeight: 24, label: 'Mon projet' },
  { id: 'account', to: '#', icon: 'nav-compte', iconActive: 'nav-compte-active', iconWidth: 24, iconHeight: 24, label: 'Compte' },
]

const authOptions = [
  { value: 'login', label: 'Connexion' },
  { value: 'signup', label: 'Inscription' },
]

const schoolOptions = [
  { value: 'presentation', label: 'Présentation' },
  { value: 'formations', label: 'Formations' },
  { value: 'avis', label: 'Avis', disabled: true },
]

const strengthHints: Record<number, string> = {
  0: '8 caractères minimum',
  1: 'Mot de passe faible',
  2: 'Mot de passe moyen',
  3: 'Mot de passe fort',
}
</script>

<template>
  <div class="min-h-dvh bg-backdrop px-gutter py-32">
    <div class="mx-auto flex max-w-1100 flex-col gap-24">
      <header class="flex flex-col gap-8">
        <h1 class="m-0 text-6xl font-bold tracking-tight text-text">Design system Qiryna</h1>
        <p class="m-0 max-w-640 text-xl text-muted-2">
          31 primitives issues de la déduplication des 813 classes de
          <code>maquette/pwa/css/app.css</code>. Chaque variante est une prop, jamais un
          fichier. Les états non-nominaux (chargement, vide, erreur) sont en fin de page.
        </p>
      </header>

      <!-- ═══ Tokens ═══════════════════════════════════════════════ -->
      <DevSection title="Tokens — couleurs" source="le bloc :root de la maquette">
        <div class="grid grid-cols-2 gap-12 shell:grid-cols-4">
          <div
            v-for="swatch in [
              { name: 'primary', class: 'bg-primary' },
              { name: 'primary-dark', class: 'bg-primary-dark' },
              { name: 'primary-link', class: 'bg-primary-link' },
              { name: 'navy', class: 'bg-navy' },
              { name: 'text', class: 'bg-text' },
              { name: 'muted', class: 'bg-muted' },
              { name: 'muted-2', class: 'bg-muted-2' },
              { name: 'border', class: 'bg-border' },
              { name: 'surface', class: 'bg-surface' },
              { name: 'surface-2', class: 'bg-surface-2' },
              { name: 'surface-3', class: 'bg-surface-3' },
              { name: 'backdrop', class: 'bg-backdrop' },
              { name: 'success', class: 'bg-success' },
              { name: 'warning', class: 'bg-warning' },
              { name: 'danger', class: 'bg-danger' },
              { name: 'info', class: 'bg-info' },
            ]"
            :key="swatch.name"
            class="flex flex-col gap-6"
          >
            <span :class="[swatch.class, 'h-48 w-full rounded-lg border border-border']" />
            <code class="text-xs text-muted-2">{{ swatch.name }}</code>
          </div>
        </div>
      </DevSection>

      <DevSection title="Tokens — typographie">
        <div class="flex flex-col gap-8">
          <p v-for="step in typeScale" :key="step.name" class="m-0 flex items-baseline gap-16">
            <code class="w-64 shrink-0 text-xs text-muted-2">{{ step.name }}</code>
            <span :class="[step.class, 'text-text']">Étudier à l'étranger avec Qiryna</span>
          </p>
        </div>
      </DevSection>

      <!-- ═══ Base ════════════════════════════════════════════════ -->
      <DevSection title="QButton" source="btn-primary, btn-outline, btn-cta, btn-start, *-cta, formule-card-btn…">
        <DevRow label="Variantes (tone primary)">
          <QButton variant="solid">Solide</QButton>
          <QButton variant="outline">Contour</QButton>
          <QButton variant="ghost">Fantôme</QButton>
          <QButton variant="link">Lien</QButton>
        </DevRow>

        <DevRow label="Tonalités (solid)">
          <QButton v-for="tone in TONES" :key="tone" :tone="tone">{{ tone }}</QButton>
        </DevRow>

        <DevRow label="Tonalités (outline)">
          <QButton v-for="tone in TONES" :key="tone" variant="outline" :tone="tone">{{ tone }}</QButton>
        </DevRow>

        <DevRow label="Tailles">
          <QButton v-for="size in sizes" :key="size" :size="size">Taille {{ size }}</QButton>
        </DevRow>

        <DevRow label="Avec icônes">
          <QButton icon-start="plus">Ajouter</QButton>
          <QButton icon-end="arrow-right" variant="outline">Continuer</QButton>
          <QButton icon-start="credit-card" tone="success">Payer</QButton>
        </DevRow>

        <DevRow label="États : normal · hover (survolez) · focus (Tab) · disabled · loading">
          <QButton>Normal</QButton>
          <QButton disabled>Désactivé</QButton>
          <QButton loading>Chargement</QButton>
          <QButton variant="outline" loading>Chargement</QButton>
        </DevRow>

        <DevRow label="Pleine largeur (block)" stack>
          <QButton block size="lg">Créer mon compte</QButton>
          <QButton block variant="outline" icon-start="headset">Parler à un conseiller</QButton>
        </DevRow>
      </DevSection>

      <DevSection title="QIconButton" source="dest-back, ed-icon-btn, le-school-heart, *-notif + notif-badge">
        <DevRow label="Variantes et tailles">
          <QIconButton icon="chevron-left" label="Retour" />
          <QIconButton icon="heart" label="Ajouter aux favoris" variant="surface" />
          <QIconButton icon="close" label="Fermer" variant="outline" />
          <QIconButton v-for="size in sizes" :key="size" icon="bell" :label="`Notifications ${size}`" :size="size" variant="surface" />
        </DevRow>

        <DevRow label="Avec pastille (absorbe les 11 couples *-notif / *-notif-badge)">
          <QIconButton icon="bell" label="3 notifications" :badge="3" size="lg" />
          <QIconButton icon="bell" label="128 notifications" :badge="128" size="lg" variant="surface" />
          <QIconButton icon="bell" label="Aucune notification" :badge="0" size="lg" variant="outline" />
        </DevRow>

        <DevRow label="Désactivé">
          <QIconButton icon="chevron-right" label="Suivant" disabled variant="surface" />
        </DevRow>
      </DevSection>

      <DevSection title="QIcon" source="les 206 fichiers assets/icons/*.svg chargés en balises img">
        <div class="grid grid-cols-4 gap-12 shell:grid-cols-8">
          <div v-for="name in iconNames" :key="name" class="flex flex-col items-center gap-6 rounded-lg border border-border-soft p-10">
            <QIcon :name="name" :size="24" class="text-primary" />
            <code class="text-center text-4xs break-all text-muted-2">{{ name }}</code>
          </div>
        </div>
      </DevSection>

      <DevSection title="QSpinner">
        <DevRow label="Tailles">
          <QSpinner v-for="size in sizes" :key="size" :size="size" class="text-primary" />
          <QSpinner size="md" class="text-danger" />
          <QSpinner size="md" label="Chargement en cours" class="text-success" />
        </DevRow>
      </DevSection>

      <DevSection title="QDivider" source="divider-or, order-sep, stat-divider, q-trust__sep, step-connector">
        <DevRow label="Horizontal · pointillé · avec libellé" stack>
          <QDivider />
          <QDivider dashed />
          <QDivider label="ou" />
        </DevRow>
        <DevRow label="Vertical">
          <div class="flex h-52 items-center gap-16">
            <span class="text-base text-text">Gauche</span>
            <QDivider orientation="vertical" />
            <span class="text-base text-text">Droite</span>
            <QDivider orientation="vertical" dashed :length="40" />
            <span class="text-base text-text">Fin</span>
          </div>
        </DevRow>
      </DevSection>

      <!-- ═══ Surfaces ════════════════════════════════════════════ -->
      <DevSection title="QCard" source="form-card, dest-card, langue-card, objectifs-card, service-card, order-card…">
        <DevRow label="Variantes" stack>
          <div class="grid gap-12 shell:grid-cols-4">
            <QCard variant="elevated"><p class="m-0 text-base text-text">elevated</p></QCard>
            <QCard variant="outlined"><p class="m-0 text-base text-text">outlined</p></QCard>
            <QCard variant="flat"><p class="m-0 text-base text-text">flat</p></QCard>
            <QCard variant="tinted"><p class="m-0 text-base text-text">tinted</p></QCard>
          </div>
        </DevRow>

        <DevRow label="Teintes (variant tinted)" stack>
          <div class="grid gap-12 shell:grid-cols-6">
            <QCard v-for="tone in TONES" :key="tone" variant="tinted" :tone="tone" padding="sm">
              <p class="m-0 text-sm text-text">{{ tone }}</p>
            </QCard>
          </div>
        </DevRow>

        <DevRow label="Sélectionnable : non sélectionnée · sélectionnée · désactivée" stack>
          <div class="grid gap-12 shell:grid-cols-3">
            <QCard selectable>
              <QMediaRow title="Anglais" description="Langue la plus demandée">
                <template #leading><QIconCircle icon="globe" tone="info" size="lg" /></template>
              </QMediaRow>
            </QCard>
            <QCard selectable selected>
              <QMediaRow title="Espagnol" description="Sélectionné">
                <template #leading><QIconCircle icon="globe" tone="success" size="lg" /></template>
                <template #trailing><QIcon name="check-circle" :size="18" class="text-primary-link" /></template>
              </QMediaRow>
            </QCard>
            <QCard selectable disabled>
              <QMediaRow title="Japonais" description="Bientôt disponible">
                <template #leading><QIconCircle icon="globe" tone="neutral" size="lg" /></template>
              </QMediaRow>
            </QCard>
          </div>
        </DevRow>
      </DevSection>

      <DevSection title="QIconCircle" source="step-icon-circle, objectifs-icon, dom-card-icon, help-icon-wrap, service-icon…">
        <DevRow label="Tonalités (soft)">
          <QIconCircle v-for="tone in TONES" :key="tone" icon="graduation" :tone="tone" size="lg" />
        </DevRow>
        <DevRow label="Tonalités (solid)">
          <QIconCircle v-for="tone in TONES" :key="tone" icon="check" :tone="tone" size="lg" solid />
        </DevRow>
        <DevRow label="Tailles">
          <QIconCircle v-for="size in (['sm', 'md', 'lg', 'xl'] as const)" :key="size" icon="award" :size="size" />
        </DevRow>
      </DevSection>

      <DevSection title="QBadge" source="langue-tag ×7, status-badge ×3, lpp-badge ×2, objectifs-badge, service-badge, stripe-badge…">
        <DevRow label="soft"><QBadge v-for="tone in TONES" :key="tone" :tone="tone">{{ tone }}</QBadge></DevRow>
        <DevRow label="solid"><QBadge v-for="tone in TONES" :key="tone" :tone="tone" variant="solid">{{ tone }}</QBadge></DevRow>
        <DevRow label="outline"><QBadge v-for="tone in TONES" :key="tone" :tone="tone" variant="outline">{{ tone }}</QBadge></DevRow>
        <DevRow label="Tailles, icône, pastille">
          <QBadge v-for="size in sizes" :key="size" :size="size">Très demandée</QBadge>
          <QBadge icon="trending-up" tone="success">En croissance</QBadge>
          <QBadge dot tone="warning">En cours</QBadge>
          <QBadge dot tone="neutral">À venir</QBadge>
          <QBadge dot tone="success">Terminé</QBadge>
        </DevRow>
      </DevSection>

      <DevSection title="QChip" source="le-chip + le-chip-icon--arch/ing/mgmt/sci">
        <DevRow label="Non sélectionnée · sélectionnée · désactivée">
          <QChip icon="building">Architecture</QChip>
          <QChip icon="settings" selected>Ingénierie</QChip>
          <QChip icon="briefcase" tone="success" selected>Management</QChip>
          <QChip icon="book" disabled>Sciences</QChip>
        </DevRow>
      </DevSection>

      <DevSection title="QMediaRow" source="info-row, home-menu-item, service-body, le-school-body, order-item, formule-feature… (~70 classes)">
        <DevRow label="Compositions" stack>
          <QCard variant="outlined">
            <QMediaRow title="HEC Paris" description="Jouy-en-Josas, France">
              <template #leading><QIconCircle icon="building" size="lg" /></template>
              <template #trailing><QIcon name="chevron-right" :size="16" class="text-muted" /></template>
            </QMediaRow>
          </QCard>

          <QCard variant="outlined">
            <QMediaRow
              title="Accompagnement Everest"
              description="Dossier, visa, logement et suivi personnalisé jusqu'à votre arrivée sur place — un texte volontairement long pour montrer la troncature sur deux lignes."
              :clamp="2"
              align="start"
            >
              <template #leading><QIconCircle icon="award" tone="danger" size="xl" /></template>
              <template #meta><QBadge tone="warning" size="sm" dot>En cours</QBadge></template>
              <template #trailing><QButton size="sm" variant="outline">Démarrer</QButton></template>
            </QMediaRow>
          </QCard>
        </DevRow>
      </DevSection>

      <!-- ═══ Formulaire ══════════════════════════════════════════ -->
      <DevSection title="QInput" source="input-group, input-field, field-icon, eye-btn, is-valid, is-invalid">
        <div class="grid gap-16 shell:grid-cols-2">
          <QInput v-model="emptyField" label="Nom complet" placeholder="Marie Dupont" icon="user" />
          <QInput v-model="email" label="Adresse e-mail" icon="mail" state="valid" hint="Adresse vérifiée" />
          <QInput
            v-model="emptyField"
            label="Adresse e-mail"
            placeholder="vous@exemple.fr"
            icon="mail"
            error="Cette adresse n'est pas valide."
          />
          <QInput
            v-model="password"
            label="Mot de passe"
            type="password"
            placeholder="••••••••"
            icon="lock"
            revealable
            hint="8 caractères minimum, dont un chiffre."
          />
          <QInput v-model="emptyField" label="Champ désactivé" placeholder="Indisponible" icon="lock" disabled />
          <QInput v-model="emptyField" label="Recherche" placeholder="Une école, une ville…" icon="search" type="search" />
        </div>
      </DevSection>

      <DevSection title="QPasswordStrength" source="password-strength-bar (is-weak/is-medium/is-strong), password-match-hint">
        <DevRow label="Les quatre scores" stack>
          <div class="grid gap-16 shell:grid-cols-4">
            <QPasswordStrength v-for="score in ([0, 1, 2, 3] as const)" :key="score" :score="score" :hint="strengthHints[score]" />
          </div>
        </DevRow>
        <DevRow label="Interactif">
          <QButton v-for="score in ([0, 1, 2, 3] as const)" :key="score" size="sm" variant="outline" @click="strength = score">
            Score {{ score }}
          </QButton>
          <div class="w-full max-w-320"><QPasswordStrength :score="strength" :hint="strengthHints[strength]" /></div>
        </DevRow>
      </DevSection>

      <DevSection title="QCheckbox · QRadio" source="cgu-row/cgu-checkbox/cgu-text, objectifs-radio, langue-check">
        <DevRow label="Cases à cocher" stack>
          <QCheckbox v-model="cgu">
            J'accepte les conditions générales d'utilisation et la politique de confidentialité.
          </QCheckbox>
          <QCheckbox :model-value="true" label="Recevoir les actualités Qiryna" />
          <QCheckbox :model-value="false" label="Case désactivée" disabled />
          <QCheckbox :model-value="false" invalid error="Vous devez accepter les CGU pour continuer." label="Case en erreur" />
        </DevRow>

        <DevRow label="Boutons radio" stack>
          <QRadio v-model="objective" value="exam" name="objectif" label="Préparer un examen" />
          <QRadio v-model="objective" value="pro" name="objectif" label="Progresser professionnellement" />
          <QRadio v-model="objective" value="other" name="objectif" label="Option désactivée" disabled />
          <p class="m-0 text-sm text-muted-2">Valeur : <code>{{ objective }}</code></p>
        </DevRow>
      </DevSection>

      <DevSection title="QSocialButton" source="social-btn, social-btn--name, social-row">
        <DevRow label="layout=icon-label · icon · stacked · loading · disabled" stack>
          <div class="grid gap-8 shell:grid-cols-3">
            <QSocialButton provider="google" />
            <QSocialButton provider="facebook" />
            <QSocialButton provider="apple" />
          </div>
          <div class="grid gap-8 shell:grid-cols-3">
            <QSocialButton provider="google" layout="icon" />
            <QSocialButton provider="facebook" layout="stacked" label-top="Continuer avec" />
            <QSocialButton provider="apple" layout="icon-label" loading />
          </div>
          <div class="grid gap-8 shell:grid-cols-3">
            <QSocialButton provider="google" disabled />
          </div>
        </DevRow>
      </DevSection>

      <DevSection title="QSegmentedControl" source="auth-toggle (×2 pages) + ed-tabs / ed-tab.is-active">
        <DevRow label="variant=pill — navigation clavier ←/→/Home/End" stack>
          <QSegmentedControl v-model="authTab" :options="authOptions" aria-label="Mode d'authentification" />
          <p class="m-0 text-sm text-muted-2">Onglet actif : <code>{{ authTab }}</code></p>
        </DevRow>
        <DevRow label="variant=underline (dont une option désactivée)" stack>
          <QSegmentedControl v-model="schoolTab" :options="schoolOptions" variant="underline" aria-label="Sections de la fiche école" />
        </DevRow>
      </DevSection>

      <!-- ═══ Contenu ═════════════════════════════════════════════ -->
      <DevSection title="QSectionHeader · QHero" source="home-section-title, dom-section-title, le-title, hero-row, *-intro">
        <DevRow label="QSectionHeader" stack>
          <QSectionHeader title="Nos destinations" variant="page" subtitle="12 pays accompagnés" />
          <QSectionHeader title="Écoles recommandées" subtitle="24 résultats">
            <template #action><QButton variant="link" size="sm">Tout voir</QButton></template>
          </QSectionHeader>
        </DevRow>

        <DevRow label="QHero" stack>
          <QHero title="Bienvenue" text="Reprenez votre projet là où vous l'aviez laissé.">
            <template #illustration>
              <div class="flex size-178 items-center justify-center rounded-2xl bg-surface-2">
                <QIcon name="plane" :size="72" class="text-primary" />
              </div>
            </template>
            <QButton icon-end="arrow-right">Continuer</QButton>
          </QHero>
        </DevRow>
      </DevSection>

      <DevSection title="QHelpBox" source="help-box, inscription-help-box, dest-help, objectifs-help, lpp-support, paiement-help (~38 classes)">
        <DevRow label="Tonalités" stack>
          <QHelpBox title="Besoin d'aide ?" description="Nos conseillers répondent en moins de 2 h." icon="headset">
            <template #action><QButton size="sm" variant="outline">Nous écrire</QButton></template>
          </QHelpBox>
          <QHelpBox tone="success" icon="check-circle" title="Paiement confirmé" description="Un e-mail de confirmation vient de vous être envoyé." />
          <QHelpBox tone="warning" icon="clock" title="Dossier incomplet" description="Il manque votre relevé de notes." >
            <template #action><QButton size="sm" tone="warning">Compléter</QButton></template>
          </QHelpBox>
          <QHelpBox tone="info" icon="lightbulb" title="Une autre langue ?" description="Dites-nous laquelle, nous l'ajouterons." stack-action>
            <template #action><QButton size="sm" block variant="outline" tone="info">Proposer une langue</QButton></template>
          </QHelpBox>
        </DevRow>
      </DevSection>

      <DevSection title="QTrustBar" source="q-trust + les 5 clones dest-/dom-/formule-/langue-/objectifs- (41 classes)">
        <QTrustBar :items="trustItems" aria-label="Nos garanties" />
      </DevSection>

      <DevSection title="QStepper" source="steps-container, mdp-steps-*, lpp-steps-*, paiement-step-* (~40 classes)">
        <DevRow label="Vertical — étape 1 franchie" stack>
          <QStepper :steps="steps" :current="0" />
        </DevRow>
        <DevRow label="Horizontal — sans numéro" stack>
          <QStepper :steps="steps" :current="1" orientation="horizontal" :numbered="false" />
        </DevRow>
      </DevSection>

      <DevSection title="QProgressBar · QProgressRing · QStat" source="progress-bar-*, progress-ring-*, stat-item, dom-stat*, projet-stat*">
        <DevRow label="Barres" stack>
          <QProgressBar :value="0" label="Dossier" show-value />
          <QProgressBar :value="45" label="Dossier" show-value />
          <QProgressBar :value="100" :tone="'success'" label="Dossier" show-value />
          <div class="flex gap-16">
            <QProgressBar v-for="size in sizes" :key="size" :value="60" :size="size" />
          </div>
        </DevRow>

        <DevRow label="Anneaux">
          <QProgressRing :value="0" label="du projet" />
          <QProgressRing :value="38" label="du projet" />
          <QProgressRing :value="100" tone="success" label="terminé" :size="96" />
        </DevRow>

        <DevRow label="Statistiques" stack>
          <QCard variant="tinted" tone="neutral" padding="sm">
            <div class="flex items-center">
              <QStat icon="building" value="1 240" label="Écoles partenaires" />
              <QDivider orientation="vertical" />
              <QStat icon="globe" value="12" label="Destinations" />
              <QDivider orientation="vertical" />
              <QStat icon="calendar" value="14 mars" label="Prochain RDV" tone="warning" />
            </div>
          </QCard>
        </DevRow>
      </DevSection>

      <!-- ═══ Navigation ══════════════════════════════════════════ -->
      <DevSection title="QTopBar · QBottomNav" source="les 12 *-topbar, page-header, bottom-nav, nav-item*">
        <DevRow label="QTopBar" stack>
          <div class="rounded-xl border border-border-soft px-16">
            <QTopBar back title="Fiche école">
              <template #trailing><QIconButton icon="bell" label="Notifications" :badge="2" size="lg" /></template>
            </QTopBar>
          </div>
        </DevRow>

        <DevRow label="QBottomNav — prop `inline` (en production : position fixe, calée sur la zone sûre)" stack>
          <div class="rounded-xl bg-backdrop p-15">
            <QBottomNav :items="navItems" active="project" inline />
          </div>
          <p class="m-0 text-sm text-muted-2">
            La version câblée sur la configuration et la route courante est
            <code>AppBottomNav</code> — visible en bas de toutes les pages du produit.
          </p>
        </DevRow>
      </DevSection>

      <DevSection title="QPager · QCarousel" source="q-pager__btn, le-dots, formule-slider-*, home-news-scroll">
        <DevRow :label="`Pagination numérotée (page ${currentPage} / 8)`" stack>
          <QPager v-model:page="currentPage" :total="8" />
        </DevRow>

        <DevRow label="Carrousel (défilement tactile + pastilles)" stack>
          <QCarousel :count="4" dots arrows item-width="full" aria-label="Formules d'accompagnement">
            <template #default="{ index }">
              <QCard variant="outlined">
                <div class="flex flex-col gap-8">
                  <QBadge :tone="(['primary', 'success', 'warning', 'danger'] as Tone[])[index]">Formule {{ index + 1 }}</QBadge>
                  <p class="m-0 text-3xl font-semibold text-text">{{ ['Base', 'Kilimandjaro', 'Aconcagua', 'Everest'][index] }}</p>
                  <p class="m-0 text-base text-muted-2">Faites glisser horizontalement pour parcourir les formules.</p>
                </div>
              </QCard>
            </template>
          </QCarousel>
        </DevRow>
      </DevSection>

      <DevSection title="QSheet" source="home-menu-* (backdrop, panel, header, list, sep… ~25 classes)">
        <DevRow label="Piège de focus, Escape et verrouillage du défilement fournis par Reka UI">
          <QButton icon-start="menu" @click="sheetOpen = true">Ouvrir le panneau</QButton>
          <QSheet v-model:open="sheetOpen" title="Menu" description="Navigation secondaire">
            <div class="flex flex-col gap-12">
              <QMediaRow v-for="item in navItems" :key="item.id" :title="item.label">
                <template #leading><QIconCircle :icon="item.icon" size="md" /></template>
                <template #trailing><QIcon name="chevron-right" :size="16" class="text-muted" /></template>
              </QMediaRow>
              <QDivider />
              <QButton block variant="outline" icon-start="logout">Se déconnecter</QButton>
            </div>
          </QSheet>
        </DevRow>
      </DevSection>

      <DevSection title="useDevice()" source="rien — la maquette n'a pas de logique d'appareil">
        <DevRow label="matchMedia uniquement — redimensionnez la fenêtre, les valeurs suivent" stack>
          <div class="grid gap-12 shell:grid-cols-3">
            <QCard variant="outlined" padding="sm">
              <QStat align="start" :value="String(device.isMobile.value)" label="isMobile" icon="target" />
            </QCard>
            <QCard variant="outlined" padding="sm">
              <QStat align="start" :value="String(device.isDesktop.value)" label="isDesktop" icon="building" />
            </QCard>
            <QCard variant="outlined" padding="sm">
              <QStat align="start" :value="String(device.isHydrated.value)" label="isHydrated" icon="check-circle" />
            </QCard>
          </div>
          <QAlert tone="warning" title="Rendu serveur">
            Au premier rendu, <code>isMobile</code> et <code>isDesktop</code> valent tous deux
            <code>false</code> : aucune largeur n'est connue. Ne jamais s'en servir pour choisir
            <em>quoi</em> rendre — la mise en page passe par les variantes CSS
            <code>shell:</code>, qui fonctionnent sans JavaScript.
          </QAlert>
        </DevRow>
      </DevSection>

      <!-- ═══ États non-nominaux ══════════════════════════════════ -->
      <DevSection title="États non-nominaux" source="rien — la maquette ne montre que le nominal">
        <DevRow label="QSkeleton — chargement" stack>
          <div class="grid gap-16 shell:grid-cols-3">
            <QSkeleton variant="card" />
            <div class="flex flex-col gap-16">
              <QSkeleton variant="row" />
              <QSkeleton variant="row" />
              <QSkeleton variant="row" />
            </div>
            <div class="flex flex-col gap-16">
              <QSkeleton variant="text" :lines="4" />
              <QSkeleton variant="rect" :height="64" />
              <QSkeleton variant="circle" :size="56" />
            </div>
          </div>
        </DevRow>

        <DevRow label="QEmptyState — vide" stack>
          <QCard variant="outlined" padding="none">
            <QEmptyState
              title="Aucune école ne correspond"
              description="Élargissez votre recherche ou retirez un filtre pour voir plus de résultats."
            >
              <template #action><QButton variant="outline">Réinitialiser les filtres</QButton></template>
            </QEmptyState>
          </QCard>
        </DevRow>

        <DevRow label="QAlert — erreur, succès, avertissement, information" stack>
          <QAlert title="Connexion impossible" message="Vérifiez votre adresse e-mail et votre mot de passe." dismissible />
          <QAlert tone="success" title="Dossier envoyé" message="Vous recevrez une réponse sous 72 h." />
          <QAlert tone="warning" message="Votre session expirera dans 5 minutes." />
          <QAlert tone="info" title="Nouveau" message="Les tests d'orientation sont disponibles." dismissible />
        </DevRow>
      </DevSection>
    </div>
  </div>
</template>
