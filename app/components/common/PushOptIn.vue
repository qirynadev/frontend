<script setup lang="ts">
/**
 * Activation des notifications push sur ce navigateur.
 *
 * Posé en tête de l'onglet « Notification » de la messagerie, là où le
 * client regarde ses notifications. Provisoire : aucun écran de réglage des
 * notifications n'existe encore, à dessiner par Kader. Couleurs en jetons de
 * thème, pour rester lisible en sombre.
 *
 * Rien ne s'affiche quand le push n'a pas de sens ici (navigateur sans push,
 * environnement sans clés, état pas encore lu).
 */
import { usePushNotifications } from '~/composables/usePushNotifications'

const { state, busy, failed, enable, disable } = usePushNotifications()
</script>

<template>
  <div
    v-if="state === 'default' || state === 'subscribed' || state === 'denied' || state === 'ios-install'"
    class="mb-16 w-full rounded-xl border border-border bg-surface-card px-18 py-17 box-border"
    role="region"
    :aria-label="$t('push.offerTitle')"
  >
    <template v-if="state === 'default'">
      <div class="flex items-start gap-14">
        <span class="flex size-40 shrink-0 items-center justify-center overflow-hidden rounded-full bg-msg-avatar-target" aria-hidden="true">
          <QIcon name="ic-bell" :size="20" />
        </span>
        <div class="min-w-0 flex-1">
          <p class="m-0 text-xl leading-20 font-semibold text-text">{{ $t('push.offerTitle') }}</p>
          <p class="m-0 mt-6 text-md leading-[19.5px] text-muted-2">{{ $t('push.offerDesc') }}</p>
          <QButton class="mt-12" size="sm" :loading="busy" :disabled="busy" @click="enable">
            {{ $t('push.activate') }}
          </QButton>
        </div>
      </div>
    </template>

    <div v-else-if="state === 'subscribed'" class="flex items-center justify-between gap-12">
      <p class="m-0 text-md leading-[19.5px] text-text">{{ $t('push.on') }}</p>
      <button
        type="button"
        class="shrink-0 cursor-pointer border-0 bg-transparent p-0 text-md font-medium text-primary underline disabled:cursor-wait disabled:opacity-60"
        :disabled="busy"
        @click="disable"
      >
        {{ $t('push.deactivate') }}
      </button>
    </div>

    <p v-else-if="state === 'denied'" class="m-0 text-md leading-[19.5px] text-muted-2">{{ $t('push.denied') }}</p>

    <p v-else class="m-0 text-md leading-[19.5px] text-muted-2">{{ $t('push.iosHint') }}</p>

    <p v-if="failed" class="m-0 mt-10 text-md leading-[19.5px] font-medium text-danger" role="alert">{{ $t('push.error') }}</p>
  </div>
</template>
