/**
 * État du formulaire Informations personnelles (session + mock).
 * Partagé mobile / desktop, y compris l’atterrissage `/reglages`.
 */
import { reglagesProfilMock } from '~/config/reglages-profil-mock'
import { useSessionStore } from '~/core/stores'

export type ReglagesProfilFieldIcon = 'person' | 'email' | 'phone' | 'calendar' | 'pin' | 'city'

export interface ReglagesProfilField {
  id: string
  labelKey: string
  model: Ref<string>
  icon: ReglagesProfilFieldIcon
  flag?: boolean
  autocomplete?: string
  inputType?: string
}

export function useReglagesProfil() {
  const session = useSessionStore()

  const firstName = ref('')
  const lastName = ref('')
  const email = ref('')
  const phone = ref('')
  const birthDate = ref('')
  const country = ref('')
  const city = ref('')

  const photoUrl = computed(() => session.user?.profile.photo ?? session.user?.avatar ?? null)
  const localPhoto = ref<string | null>(null)
  const displayPhoto = computed(() => localPhoto.value ?? photoUrl.value)
  const fileInput = useTemplateRef<HTMLInputElement>('fileInput')

  function openPhotoPicker() {
    fileInput.value?.click()
  }

  function onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    if (localPhoto.value) URL.revokeObjectURL(localPhoto.value)
    localPhoto.value = URL.createObjectURL(file)
    input.value = ''
  }

  function fillFromSession() {
    const user = session.user
    const profile = user?.profile
    firstName.value = profile?.firstName || reglagesProfilMock.firstName
    lastName.value = profile?.lastName || reglagesProfilMock.lastName
    email.value = user?.email || reglagesProfilMock.email
    phone.value = profile?.phone || reglagesProfilMock.phone
    birthDate.value = reglagesProfilMock.birthDate
    country.value = reglagesProfilMock.country
    city.value = profile?.city || reglagesProfilMock.city
  }

  onMounted(fillFromSession)
  onBeforeUnmount(() => {
    if (localPhoto.value) URL.revokeObjectURL(localPhoto.value)
  })

  const fields = computed<ReglagesProfilField[]>(() => [
    { id: 'firstName', labelKey: 'settingsPersonal.firstName', model: firstName, icon: 'person', autocomplete: 'given-name' },
    { id: 'lastName', labelKey: 'settingsPersonal.lastName', model: lastName, icon: 'person', autocomplete: 'family-name' },
    { id: 'email', labelKey: 'settingsPersonal.email', model: email, icon: 'email', autocomplete: 'email', inputType: 'email' },
    { id: 'phone', labelKey: 'settingsPersonal.phone', model: phone, icon: 'phone', flag: true, autocomplete: 'tel', inputType: 'tel' },
    { id: 'birthDate', labelKey: 'settingsPersonal.birthDate', model: birthDate, icon: 'calendar' },
    { id: 'country', labelKey: 'settingsPersonal.country', model: country, icon: 'pin', autocomplete: 'country-name' },
    { id: 'city', labelKey: 'settingsPersonal.city', model: city, icon: 'city', autocomplete: 'address-level2' },
  ])

  return {
    fields,
    displayPhoto,
    fileInput,
    openPhotoPicker,
    onPhotoSelected,
  }
}
