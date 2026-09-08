<script setup lang="ts">
import { DialogClose, DialogContent, DialogDescription, DialogOverlay, DialogPortal, DialogRoot, DialogTitle } from 'reka-ui'
import { sideMenuSections } from '~/config/side-menu'
import { useSessionStore } from '~/core/stores'

/**
 * Menu latéral de l'accueil — portage littéral de `.home-menu` (Figma 551:2).
 *
 * | Élément | Maquette |
 * |---|---|
 * | voile | `rgb(18 17 17 / .7)`, apparition 0,28 s |
 * | panneau | `min(331px, 82.34%)`, rayon `0 30px 30px 0`, ombre `15px 0 40px rgb(0 0 0 / .15)` |
 * | glissement | `translateX(-100%)` → `0`, 0,3 s `cubic-bezier(.22,1,.36,1)` |
 * | en-tête | `padding: 32px 24px 21px`, logo 125×39, fermeture 36×36 ronde `#f3f1fc` |
 * | accueil | avatar 59×59 `#f2effb`, titre 18px/22,5px, texte 12px |
 * | boutons | `#4211f8` plein · contour `#2605f3` |
 * | intertitres | 10px, `letter-spacing: 1px`, capitales, `#94a3b8` |
 * | entrées | `padding: 12px`, rayon 16, icône 40×40, libellé 14px/21px, chevron 16×16 |
 * | encart d'aide | 281px max, `margin-top: 28px`, fond `#f5f3ff`, pastille `#e8e2fd` |
 *
 * ⚠️ Le panneau est **confiné au shell** (`position: absolute` dans `.screen`),
 * pas à la fenêtre : au-delà de 768px il ne déborde pas sur le fond gris.
 * D'où le portail vers `#q-shell` plutôt que vers `<body>`.
 *
 * Le piège de focus, la restitution du focus, `Escape` et le verrouillage du
 * défilement viennent de Reka UI — rien de tout cela n'est réécrit ici.
 */
const open = defineModel<boolean>('open', { default: false })

const localePath = useLocalePath()
const session = useSessionStore()

/** Une navigation depuis le menu doit le refermer. */
function close() {
  open.value = false
}

/**
 * Le bloc d'accueil suit la session.
 *
 * Proposer « Se connecter » à quelqu'un qui l'est déjà est le genre de détail
 * qui décrédibilise tout le reste. Connecté, le menu salue par le prénom et
 * remplace les deux boutons par l'accès au compte et la déconnexion.
 */
const greeting = computed(() =>
  session.isAuthenticated
    ? session.user?.profile.firstName || session.user?.name || ''
    : '',
)

async function onLogout() {
  await session.logout()
  close()
  await navigateTo(localePath('/'))
}
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal to="#q-shell">
      <DialogOverlay
        class="absolute inset-0 z-100 bg-menu-backdrop transition-opacity duration-[280ms] ease-out data-[state=closed]:opacity-0 data-[state=open]:opacity-100"
      />

      <DialogContent
        class="absolute inset-y-0 left-0 z-100 flex max-h-dvh w-[min(331px,82.34%)] flex-col items-center gap-0 overflow-hidden rounded-r-panel bg-surface-card shadow-drawer will-change-transform transition-transform duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] data-[state=closed]:-translate-x-full data-[state=open]:translate-x-0"
        @click="($event.target as HTMLElement).closest('a') && close()"
      >
        <!-- En-tête : logo + fermeture -->
        <div class="flex w-full shrink-0 items-center justify-between border-b border-menu-header-border px-24 pt-32 pb-21">
          <DialogTitle as-child>
            <NuxtLink :to="localePath('/')" class="shrink-0 no-underline">
              <AppLogo :width="125" :height="39" />
            </NuxtLink>
          </DialogTitle>

          <DialogClose
            class="flex size-36 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-menu-close-bg p-0 shadow-xs"
            :aria-label="$t('ds.sheet.close')"
          >
            <QIcon name="ic-menu-close" :size="20" />
          </DialogClose>
        </div>

        <div class="flex w-full flex-1 min-h-0 flex-col items-center overflow-y-auto overscroll-contain pb-[calc(24px+env(safe-area-inset-bottom,0px))] [webkit-overflow-scrolling:touch]">
          <!-- Bienvenue -->
          <div class="flex w-full shrink-0 items-center px-24 pt-9 pb-20">
            <span class="flex size-59 shrink-0 items-center justify-center rounded-full bg-menu-avatar-bg">
              <QIcon name="ic-menu-user" :size="28" />
            </span>
            <div class="flex min-w-0 flex-col gap-2 pl-16">
              <p class="m-0 text-3xl leading-[22.5px] font-semibold text-menu-title">
                {{ greeting ? $t('menu.welcomeBack', { name: greeting }) : $t('menu.welcomeTitle') }}
              </p>
              <DialogDescription class="m-0 text-base leading-normal whitespace-pre-line text-text">
                {{ session.isAuthenticated ? $t('menu.welcomeBackText') : $t('menu.welcomeText') }}
              </DialogDescription>
            </div>
          </div>

          <!-- Connexion / inscription — ou compte / déconnexion. -->
          <div class="flex w-full shrink-0 flex-col gap-10 px-24 pb-24">
            <template v-if="session.isAuthenticated">
              <NuxtLink
                :to="localePath('/compte')"
                class="flex w-full items-center justify-center rounded-xl bg-menu-btn py-14 text-center text-xl leading-20 font-semibold text-white no-underline"
              >
                {{ $t('menu.account') }}
              </NuxtLink>
              <button
                type="button"
                class="flex w-full cursor-pointer items-center justify-center rounded-xl border border-menu-btn-outline bg-surface-card py-15 text-center text-xl leading-20 font-semibold text-menu-btn-outline"
                @click="onLogout"
              >
                {{ $t('menu.signOut') }}
              </button>
            </template>

            <template v-else>
              <NuxtLink
                :to="localePath('/connexion')"
                class="flex w-full items-center justify-center rounded-xl bg-menu-btn py-14 text-center text-xl leading-20 font-semibold text-white no-underline"
              >
                {{ $t('menu.signIn') }}
              </NuxtLink>
              <NuxtLink
                :to="localePath('/inscription')"
                class="flex w-full items-center justify-center rounded-xl border border-menu-btn-outline bg-surface-card py-15 text-center text-xl leading-20 font-semibold text-menu-btn-outline no-underline"
              >
                {{ $t('menu.signUp') }}
              </NuxtLink>
            </template>
          </div>

          <!-- Sections -->
          <template v-for="section in sideMenuSections" :key="section.labelKey">
            <!-- La maquette place un filet avant chaque section. -->
            <span aria-hidden="true" class="mx-24 h-1 w-[calc(100%-48px)] shrink-0 bg-menu-sep" />

            <p class="m-0 w-full shrink-0 px-24 pt-10 pb-[10.5px] text-sm leading-15 font-medium tracking-[1px] text-menu-label uppercase">
              {{ $t(section.labelKey) }}
            </p>

            <nav class="flex w-full shrink-0 flex-col px-16">
              <NuxtLink
                v-for="entry in section.entries"
                :key="entry.id"
                :to="localePath(entry.to)"
                class="flex w-full items-center justify-between rounded-3xl p-12 text-text no-underline"
              >
                <span class="flex items-center gap-12 text-xl leading-21 font-medium">
                  <QIcon :name="entry.icon" :size="40" />
                  <span>{{ $t(entry.labelKey) }}</span>
                </span>
                <QIcon name="ic-menu-chevron" :size="16" />
              </NuxtLink>
            </nav>
          </template>

          <!-- Besoin d'aide ? -->
          <SupportLink
            class="mt-18 flex w-281 max-w-[calc(100%-50px)] shrink-0 items-center gap-11 rounded-xl bg-surface-2 px-9 py-10 text-text no-underline"
          >
            <span class="flex size-44 shrink-0 items-center justify-center rounded-full bg-primary-soft">
              <QIcon name="ic-menu-help" :size="24" />
            </span>
            <span class="flex min-w-0 flex-1 flex-col">
              <span class="text-base leading-20 font-bold">{{ $t('menu.helpTitle') }}</span>
              <span class="text-sm leading-16">{{ $t('menu.helpText') }}</span>
            </span>
            <QIcon name="ic-menu-help-chevron" :size="16" />
          </SupportLink>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
