import type { Country } from '~/core/contracts'
import { ApiError } from '~/core/http/errors'
import { authRepo, countryRepo } from '~/core/repositories'
import { useSessionStore } from '~/core/stores'

/**
 * État du formulaire « Informations personnelles », partagé mobile / desktop.
 *
 * Réécrit le 2026-09-20 : la version livrée avec le desktop remplissait le
 * formulaire depuis `reglages-profil-mock`, retiré depuis. Tout vient
 * désormais de la session et de l'API (`POST /user/update-profile`), et les
 * deux écrans partagent le même état — un champ corrigé sur mobile l'est
 * aussi sur desktop.
 *
 * Ni photo ni ville : retirées de l'écran le 2026-09-16 (la photo n'apportait
 * rien au dossier, la ville n'était exploitée nulle part). L'e-mail reste en
 * lecture seule, l'endpoint ne le prend pas en charge.
 */
export async function useReglagesProfil() {
  const { t, locale } = useI18n()
  const localePath = useLocalePath()
  const session = useSessionStore()

  const profile = session.user?.profile
  const firstName = ref(profile?.firstName ?? '')
  const lastName = ref(profile?.lastName ?? '')
  const birthDate = ref(profile?.birthday ?? '')
  const countryId = ref(profile?.country?.id ?? '')
  const email = computed(() => session.user?.email ?? '')

  // Attendu : la découpe du numéro (ci-dessous) a besoin de la liste réelle des
  // indicatifs dès le rendu serveur, sinon un numéro déjà préfixé s'affiche
  // entier dans le champ, indicatif compris.
  const { data: countries } = await useAsyncData(
    'countries',
    () => countryRepo.list(locale.value),
    { watch: [locale], default: () => [] as Country[] },
  )

  /**
   * Indicatif et numéro vivent séparément à l'écran, mais l'API ne connaît
   * qu'un seul champ `phone` (texte libre). On les recompose à l'envoi et on
   * les redécoupe à la relecture — sans quoi un numéro déjà préfixé repartirait
   * avec deux indicatifs.
   *
   * La longueur d'un indicatif ne se devine pas : `+33612345678` se découpe en
   * `33` + `612345678`, pas en `3361` + `2345678`. On la reconnaît dans la
   * liste réelle des pays, le plus long candidat l'emportant (`1242` avant `1`).
   */
  function decouper(brut: string, codes: string[]): { code: string, numero: string } {
    const valeur = brut.trim()
    if (!valeur.startsWith('+')) return { code: '', numero: valeur }

    const chiffres = valeur.slice(1)
    const trouve = [...codes]
      .sort((a, b) => b.length - a.length)
      .find((c) => chiffres.startsWith(c))

    if (!trouve) return { code: '', numero: valeur }
    return { code: trouve, numero: chiffres.slice(trouve.length).replace(/^[\s.-]+/, '') }
  }

  const decoupe = decouper(
    profile?.phone ?? '',
    (countries.value ?? []).map((c) => c.phoneCode).filter((c): c is string => !!c),
  )
  const phone = ref(decoupe.numero)
  const phoneCode = ref(decoupe.code)

  /** Les pays dont l'API donne l'indicatif (`international_phone`). */
  const indicatifs = computed(() => (countries.value ?? []).filter((c) => c.phoneCode))

  const paysChoisi = computed(() => (countries.value ?? []).find((c) => c.id === countryId.value) ?? null)

  /**
   * Pays dont le drapeau précède l'indicatif. Plusieurs pays partagent un
   * indicatif (+1 : États-Unis, Canada…) : on garde celui choisi dans la liste,
   * sinon le pays de résidence s'il a ce même indicatif, sinon le premier
   * trouvé. Purement affiché : l'API ne stocke que le numéro.
   */
  const paysIndicatifId = ref<string | null>(null)
  const paysIndicatif = computed(() => {
    if (!phoneCode.value) return null
    const memeCode = indicatifs.value.filter((c) => c.phoneCode === phoneCode.value)
    return memeCode.find((c) => c.id === paysIndicatifId.value)
      ?? memeCode.find((c) => c.id === countryId.value)
      ?? memeCode[0]
      ?? null
  })

  const libelleIndicatif = computed(() =>
    `${t('settingsPersonal.phoneCodeLabel')} : ${phoneCode.value ? `+${phoneCode.value}` : '—'}`)

  function choisirPays(pays: Country) {
    countryId.value = pays.id ?? ''
  }

  function choisirIndicatif(pays: Country) {
    phoneCode.value = pays.phoneCode ?? ''
    paysIndicatifId.value = pays.id
  }

  /**
   * Un numéro déjà enregistré ne suit jamais le pays : on peut résider quelque
   * part et garder le numéro d'ailleurs. L'indicatif ne se déduit du pays que
   * pour un profil sans téléphone, et reste modifiable à la main.
   */
  const numeroPreexistant = (profile?.phone ?? '').trim() !== ''

  function alignerIndicatifSurPays(id: string) {
    const pays = (countries.value ?? []).find((c) => c.id === id)
    if (!pays?.phoneCode) return
    phoneCode.value = pays.phoneCode
    paysIndicatifId.value = pays.id
  }

  watch(countryId, (id) => {
    if (!numeroPreexistant) alignerIndicatifSurPays(id)
  })

  onMounted(() => {
    if (!numeroPreexistant && !phoneCode.value) alignerIndicatifSurPays(countryId.value)
  })

  /** Ce qui part réellement à l'API : indicatif + numéro, jamais l'un sans l'autre. */
  const numeroComplet = computed(() => {
    const numero = phone.value.trim()
    if (!numero) return ''
    if (numero.startsWith('+')) return numero
    return phoneCode.value ? `+${phoneCode.value} ${numero}` : numero
  })

  const saving = ref(false)
  const errorMessage = ref<string | null>(null)

  async function save() {
    if (saving.value) return
    errorMessage.value = null
    saving.value = true
    try {
      const updated = await authRepo.updateProfile({
        firstName: firstName.value,
        lastName: lastName.value,
        phone: numeroComplet.value,
        countryId: countryId.value,
        birthday: birthDate.value || null,
      }, locale.value)
      session.apply({ user: updated, pendingPayment: session.pendingPayment })
      await navigateTo(localePath('/'))
    }
    catch (error) {
      errorMessage.value = error instanceof ApiError ? error.message : t('settingsPersonal.saveError')
    }
    finally {
      saving.value = false
    }
  }

  return {
    firstName,
    lastName,
    email,
    birthDate,
    countryId,
    phone,
    phoneCode,
    countries,
    indicatifs,
    paysChoisi,
    paysIndicatif,
    libelleIndicatif,
    choisirPays,
    choisirIndicatif,
    saving,
    errorMessage,
    save,
  }
}
