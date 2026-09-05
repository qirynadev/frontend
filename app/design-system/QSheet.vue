<script setup lang="ts">
import { DialogClose, DialogContent, DialogDescription, DialogOverlay, DialogPortal, DialogRoot, DialogTitle } from 'reka-ui'

/**
 * Panneau glissant (menu de l'accueil, filtres…).
 * Le piège de focus, la restitution du focus, `Escape` et le verrouillage du
 * défilement sont fournis par Reka UI — on n'en réécrit aucun.
 */

withDefaults(
  defineProps<{
    title: string
    description?: string
    side?: 'left' | 'right' | 'bottom'
    /** Masque le titre visuellement tout en le laissant aux lecteurs d'écran. */
    hideTitle?: boolean
    closeLabel?: string
    /**
     * Ne se ferme que par un choix explicite dans le contenu (slot) : ni
     * `Échap`, ni clic hors panneau, ni croix. Pour un consentement (cookies…)
     * où une fermeture implicite n'a pas de sens à enregistrer comme un choix.
     */
    persistent?: boolean
  }>(),
  { description: undefined, side: 'left', hideTitle: false, closeLabel: undefined, persistent: false },
)

const open = defineModel<boolean>('open', { default: false })

const sideClass = {
  left: 'inset-y-0 left-0 h-full w-[86%] max-w-320',
  right: 'inset-y-0 right-0 h-full w-[86%] max-w-320',
  bottom: 'inset-x-0 bottom-0 max-h-[85dvh] w-full rounded-t-3xl',
}
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-100 bg-navy/40" />
      <DialogContent
        :class="[
          'fixed z-100 flex flex-col gap-16 overflow-y-auto bg-white p-gutter shadow-drawer',
          sideClass[side],
        ]"
        @escape-key-down="persistent ? $event.preventDefault() : undefined"
        @pointer-down-outside="persistent ? $event.preventDefault() : undefined"
      >
        <div class="flex items-start justify-between gap-12">
          <div class="min-w-0">
            <DialogTitle :class="['m-0 text-3xl font-semibold text-text', hideTitle ? 'sr-only' : '']">
              {{ title }}
            </DialogTitle>
            <DialogDescription v-if="description" class="mt-4 mb-0 text-base text-muted-2">
              {{ description }}
            </DialogDescription>
          </div>

          <DialogClose v-if="!persistent" as-child>
            <QIconButton icon="close" :label="closeLabel ?? $t('ds.sheet.close')" size="md" />
          </DialogClose>
        </div>

        <slot />
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
