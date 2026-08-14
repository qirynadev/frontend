<script setup lang="ts">
/**
 * Parcours Logement — portage direct de `maquette/pwa/pages/logement.html` & `offres-logement.html`.
 *
 * Fonctionnalités :
 * - Sélection de la destination d'étude pour le logement (France, Canada, Allemagne, Chine) ;
 * - Décompte de logements disponibles et statistiques clés (caution, durée de bail, charges, loyer moyen) ;
 * - Cartes de formules et d'offres de logement avec photos, détails et bouton de réservation/demande.
 */

const { t } = useI18n()
const localePath = useLocalePath()

const selectedCountry = ref('france')

const countries = [
  { id: 'france', name: 'France', count: '350+ logements', flag: '/_maquette/assets/icons/flags/flag-fr.svg', photo: '/_maquette/assets/images/logement/france.png' },
  { id: 'canada', name: 'Canada', count: '350+ logements', flag: '/_maquette/assets/icons/flags/flag-ca.svg', photo: '/_maquette/assets/images/logement/canada.png' },
  { id: 'allemagne', name: 'Allemagne', count: '350+ logements', flag: '/_maquette/assets/icons/flags/flag-de.svg', photo: '/_maquette/assets/images/logement/allemagne.png' },
  { id: 'chine', name: 'Chine', count: '350+ logements', flag: '/_maquette/assets/icons/flags/flag-cn.svg', photo: '/_maquette/assets/images/logement/chine.png' },
]

const stats = [
  { icon: 'ic-ol-stat-caution', value: '1 mois', label: 'de caution' },
  { icon: 'ic-ol-stat-bail', value: '9 à 12 mois', label: 'durée du bail' },
  { icon: 'ic-ol-stat-charges', value: '50 € à 120 €', label: 'de charges' },
  { icon: 'ic-ol-stat-loyer', value: '559 €', label: 'loyer moyen' },
]

const formulas = [
  {
    id: 'comoe',
    title: 'Comoé',
    badge: '2 logements proposés',
    tagline: 'L\'essentiel du séjour',
    price: '249 €',
    features: [
      'Fiche détaillée du logement',
      'Fiche détaillée du Quartier',
      'Assistance administrative de base',
    ],
    featured: false,
  },
  {
    id: 'volga',
    title: 'Volga',
    badge: 'Formule recommandée',
    tagline: 'Sérénité & Confort',
    price: '499 €',
    features: [
      'Accompagnement personnalisé dédié',
      '4 propositions de logements vérifiés',
      'Dossier de réservation prioritaire',
      'Garantie d\'installation sous 72h',
    ],
    featured: true,
  },
]

useHead({
  title: 'Offres de Logement — Qiryna',
  meta: [
    { name: 'description', content: 'Trouvez un logement étudiant accessible et bien desservi en France, au Canada, en Allemagne et en Chine.' },
  ],
})
</script>

<template>
  <div class="flex flex-col gap-24 pb-24">
    <AppTopBar back back-to="/" />

    <!-- Country Selector Section -->
    <div class="flex w-full flex-col gap-12">
      <div class="flex flex-col gap-4">
        <h1 class="m-0 text-lg sm:text-xl font-bold tracking-tight text-navy">
          Choisissez votre destination logement
        </h1>
        <p class="m-0 text-xs sm:text-sm font-medium text-slate-500">
          Trouvez un logement adapté dans le pays de vos études
        </p>
      </div>

      <div class="grid w-full grid-cols-2 sm:grid-cols-4 gap-12">
        <button
          v-for="c in countries"
          :key="c.id"
          type="button"
          class="flex flex-col items-center justify-between rounded-xl border p-12 text-left transition-all cursor-pointer box-border"
          :class="selectedCountry === c.id ? 'border-primary bg-[#f5f3ff] shadow-sm' : 'border-slate-100 bg-white hover:shadow-xs'"
          @click="selectedCountry = c.id"
        >
          <div class="relative w-full overflow-hidden rounded-lg bg-slate-100 h-96">
            <img :src="c.photo" :alt="c.name" class="size-full object-cover" />
            <img :src="c.flag" :alt="c.name" class="absolute bottom-6 left-6 size-24 rounded-full border border-white shadow-2xs" />
          </div>
          <div class="mt-8 flex w-full flex-col items-start leading-tight">
            <span class="text-xs sm:text-sm font-bold text-navy">{{ c.name }}</span>
            <span class="text-[10px] sm:text-xs font-medium text-slate-400 pt-1">{{ c.count }}</span>
          </div>
        </button>
      </div>
    </div>

    <!-- Stats Banner -->
    <div class="flex w-full flex-col gap-12 rounded-xl border border-slate-100 bg-[#f7f6fc] p-16 shadow-xs">
      <h2 class="m-0 text-sm sm:text-base font-bold text-navy">
        Un logement étudiant accessible, bien desservi en {{ countries.find(c => c.id === selectedCountry)?.name }}
      </h2>

      <div class="grid w-full grid-cols-2 sm:grid-cols-4 gap-12">
        <div v-for="(st, idx) in stats" :key="idx" class="flex flex-col items-center text-center gap-4">
          <div class="flex size-40 items-center justify-center rounded-full bg-white shadow-2xs">
            <QIcon name="home" :size="20" class="text-primary" />
          </div>
          <p class="m-0 text-xs sm:text-sm font-bold text-navy">{{ st.value }}</p>
          <p class="m-0 text-[10px] sm:text-xs font-medium text-slate-500">{{ st.label }}</p>
        </div>
      </div>
    </div>

    <!-- Housing Formulations -->
    <div class="flex w-full flex-col gap-16 pt-6">
      <h2 class="m-0 text-base sm:text-lg font-bold text-navy">
        Trouvez la formule qui vous correspond
      </h2>

      <div class="grid w-full grid-cols-1 sm:grid-cols-2 gap-16">
        <div
          v-for="formule in formulas"
          :key="formule.id"
          class="flex flex-col justify-between rounded-xl border p-16 transition-shadow hover:shadow-md"
          :class="formule.featured ? 'border-primary bg-[#f5f3ff] shadow-sm' : 'border-slate-100 bg-white'"
        >
          <div class="flex flex-col gap-10">
            <div class="flex items-center justify-between">
              <h3 class="m-0 text-base font-bold text-navy">{{ formule.title }}</h3>
              <span class="rounded-full bg-primary-10 px-8 py-2 text-2xs font-semibold text-primary">
                {{ formule.badge }}
              </span>
            </div>
            <p class="m-0 text-xs font-medium text-slate-500">{{ formule.tagline }}</p>
            <hr class="my-4 border-slate-200" />
            <ul class="m-0 flex list-none flex-col gap-8 p-0">
              <li v-for="(feat, i) in formule.features" :key="i" class="flex items-center gap-8 text-xs font-medium text-text">
                <QIcon name="check-circle" :size="16" class="text-success" />
                <span>{{ feat }}</span>
              </li>
            </ul>
          </div>

          <div class="mt-16 flex items-center justify-between border-t border-slate-200 pt-12">
            <span class="text-lg font-bold text-navy">{{ formule.price }}</span>
            <QButton :to="localePath('/orientation')" size="sm">
              Choisir cette formule
            </QButton>
          </div>
        </div>
      </div>
    </div>

    <TrustStrip />
  </div>
</template>
