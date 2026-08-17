<script setup lang="ts">
/**
 * Choix du professeur — pas de maquette (voir `mon-projet/langues/index.vue`
 * pour le contexte). Le professeur se choisit **par commande**, portée par
 * `?order=` (voir `PlanningController::changeTeacher`, qui prend `order_id`).
 *
 * Après sélection, `POST /plannings/new-teacher` assigne le professeur à la
 * commande puis redirige vers le calendrier de ce professeur — pas de retour
 * à cette page, il n'y a plus rien à y faire pour cette commande.
 */
import { planningRepo } from '~/core/repositories'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const localePath = useLocalePath()

const courseId = computed(() => String(route.params.courseId ?? ''))
const orderId = computed(() => String(route.query.order ?? ''))
const lang = computed(() => String(route.query.lang ?? ''))

if (orderId.value === '') {
  throw createError({ statusCode: 400, statusMessage: t('languagePlanning.missingOrder'), fatal: true })
}

const { data: teachers, apiError, isInitialLoading, refresh } = await usePageData(
  `langue-teachers-${courseId.value}`,
  () => planningRepo.teachersByCourse(courseId.value, locale.value),
  { watch: [courseId, locale] },
)

const assigning = ref<string | null>(null)
const assignError = ref(false)

async function choose(teacherId: string) {
  assigning.value = teacherId
  assignError.value = false
  try {
    await planningRepo.assignTeacher(orderId.value, teacherId, locale.value)
    await router.push(localePath(`/mon-projet/langues/${courseId.value}/planifier?order=${orderId.value}&teacher=${teacherId}&lang=${encodeURIComponent(lang.value)}`))
  }
  catch {
    assignError.value = true
    assigning.value = null
  }
}

usePageSeo(() => ({
  title: t('languagePlanning.teacherStepTitle'),
  description: t('languagePlanning.teacherStepIntro'),
  noindex: true,
}))
</script>

<template>
  <AppTopBar back back-to="/mon-projet/langues" :notifications="3" />

  <div class="w-full pb-22">
    <h1 class="m-0 text-4xl leading-normal font-semibold tracking-tight text-text">
      {{ $t('languagePlanning.teacherStepTitle') }}
    </h1>
    <p class="m-0 text-xl leading-[22.75px] text-text">
      {{ $t('languagePlanning.teacherStepIntro') }}
    </p>
  </div>

  <QAlert v-if="assignError" tone="danger" :title="$t('languagePlanning.assignErrorTitle')" class="mb-16" />

  <PageState
    :loading="isInitialLoading"
    :error="apiError"
    :empty="(teachers ?? []).length === 0"
    :empty-title="$t('languagePlanning.noTeacherAvailableTitle')"
    :empty-description="$t('languagePlanning.noTeacherAvailableDescription')"
    :on-retry="() => refresh()"
  >
    <template #loading>
      <div class="flex flex-col gap-16">
        <QSkeleton v-for="index in 2" :key="index" variant="rect" :height="120" />
      </div>
    </template>

    <div class="flex w-full flex-col gap-16">
      <QCard
        v-for="teacher in teachers"
        :key="teacher.id"
        selectable
        :disabled="assigning !== null"
        @click="choose(teacher.id)"
      >
        <div class="flex items-start gap-12">
          <img
            v-if="teacher.photo"
            :src="teacher.photo"
            alt=""
            width="56"
            height="56"
            class="block size-56 shrink-0 rounded-full object-cover"
          >
          <div class="min-w-0 flex-1">
            <p class="m-0 text-xl font-semibold text-navy">{{ teacher.fullName }}</p>
            <p v-if="teacher.experienceYears" class="m-0 text-sm text-muted-2">
              {{ $t('languagePlanning.experienceYears', teacher.experienceYears) }}
            </p>
            <RichText v-if="teacher.biography" :content="teacher.biography" class="mt-6 text-sm text-text" />
          </div>
          <QSpinner v-if="assigning === teacher.id" size="sm" class="shrink-0" />
        </div>
      </QCard>
    </div>
  </PageState>
</template>
