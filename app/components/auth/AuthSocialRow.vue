<script setup lang="ts">
import type { SocialProvider } from '~/core/contracts'

/**
 * Rangée de connexions tierces — `.social-row` + `.social-btn--name` de
 * `app.css`, identique sur `connexion.html` et `inscription.html`.
 *
 * | Élément | Maquette |
 * |---|---|
 * | rangée | `display: flex`, `gap: 5px` |
 * | bouton | `flex: 1 1 0`, `min-width: 0`, `padding: 13px 8px`, `gap: 8px`, bord `#e2e8f0`, rayon 10 |
 * | logo | 16×16 |
 * | nom | 11px / 16px, `font-weight: 600`, `--q-navy`, insécable |
 * | sous 360px | `gap: 6px`, `padding: 12px 6px`, nom 10px |
 *
 * **Un écart assumé avec la maquette.** Elle dessine Google, **Apple** et
 * Facebook. Le back-office n'expose que trois fournisseurs —
 * `google`, `facebook`, `linkedin` (`legacy/API_OAUTH_ENDPOINTS.md` § 8) — et
 * aucun d'eux n'est Apple. Le troisième emplacement va donc à LinkedIn, que le
 * brief du Lot 5 demande explicitement. La géométrie est inchangée (trois
 * colonnes `flex: 1 1 0`) : seuls le logo et le mot diffèrent. Un bouton Apple
 * inerte aurait été fidèle au dessin et faux pour l'utilisateur.
 */
const props = defineProps<{
  /** Fournisseurs réellement configurés ; les autres sont grisés. */
  configured: Record<SocialProvider, boolean>
  /** Fournisseur en cours d'authentification. */
  pending: SocialProvider | null
}>()

const emit = defineEmits<{ select: [provider: SocialProvider] }>()

const providers: SocialProvider[] = ['google', 'linkedin', 'facebook']

function isBusy(provider: SocialProvider): boolean {
  return props.pending === provider
}
</script>

<template>
  <div class="flex gap-5">
    <QSocialButton
      v-for="provider in providers"
      :key="provider"
      :provider="provider"
      layout="icon-label"
      class="flex-1"
      :loading="isBusy(provider)"
      :disabled="!configured[provider] || (pending !== null && !isBusy(provider))"
      @click="emit('select', provider)"
    />
  </div>
</template>
