import { pageRepo } from '~/core/repositories'
import { splitLegalHtml } from '~/utils/split-legal-html'

/**
 * Page éditoriale cookies / privacy / CGU : CMS + découpage en cartes.
 */
export async function useLegalCmsPage(slug: 'cookies' | 'privacy' | 'cgu') {
  const { t, locale } = useI18n()

  const { data: page, apiError, isInitialLoading, refresh } = await usePageData(
    `legal-${slug}`,
    () => pageRepo.bySlug(slug, locale.value),
    { watch: [locale] },
  )

  if (page.value === null && !apiError.value) {
    throw createError({ statusCode: 404, statusMessage: t('page.notFound'), fatal: true })
  }

  const document = computed(() =>
    page.value ? splitLegalHtml(page.value.content, page.value.title) : null,
  )

  return { page, document, apiError, isInitialLoading, refresh }
}
