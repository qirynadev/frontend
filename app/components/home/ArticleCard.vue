<script setup lang="ts">
import type { Article } from '~/core/contracts'

/**
 * Carte d'actualité — portage littéral de `.home-news-card`.
 *
 * `flex: 0 0 322px` · rayon 10 · ombre `0 0 3.5px rgb(0 0 0 / .1)` ·
 * `padding: 6px` · `gap: 16px` · vignette 96×96 rayon 6 · corps `padding-top: 16px`
 * · étiquette 9px/13,5px `letter-spacing: .45px` · titre 12px/20px.
 */
defineProps<{ article: Article }>()
</script>

<template>
  <article class="flex w-322 shrink-0 items-center gap-16 rounded-xl bg-white p-6 shadow-card">
    <NuxtImg
      :src="article.image ?? '/img/home-article-thumb.webp'"
      alt=""
      width="96"
      height="96"
      format="webp"
      loading="lazy"
      class="size-96 shrink-0 rounded-md object-cover"
    />

    <div class="min-w-0 flex-1 pt-16 pr-4">
      <div class="flex flex-wrap items-center gap-8">
        <span
          class="rounded-full bg-tag-bg px-8 py-2 text-xs leading-[13.5px] font-medium tracking-[0.45px] text-tag-text"
        >{{ $t('home.news.tag') }}</span>
        <span
          v-if="article.readingMinutes"
          class="text-sm leading-15 font-medium text-navy"
        >• {{ $t('home.news.readingTime', article.readingMinutes) }}</span>
      </div>

      <p
        class="mt-10 mb-0 line-clamp-2 text-base leading-20 font-medium whitespace-pre-line text-navy"
      >{{ article.title }}</p>
    </div>

    <QIcon name="ic-chevron-right-sm" :size="14" class="shrink-0 p-8" />
  </article>
</template>
