<script lang="ts" setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useAppStore, useSchoolStore, useMbaStore } from "@/stores";
import type { OfferType } from "@/constants/constant.type";
import { GlobalLoaderVue } from "@/components/atoms/loaders";
import { CheckCircleIcon, ClockIcon, UserGroupIcon } from "@heroicons/vue/24/solid";
import execIcon from "@/assets/images/exec.png";
import { i18nRoute } from "@/utils";

const router = useRouter();
const appStore = useAppStore();
const schoolStore = useSchoolStore();
const mbaStore = useMbaStore();

const { selectedOffer } = storeToRefs(schoolStore);

const offerList = computed<OfferType[]>(() => appStore.offerList);
const isFetching = computed(() => appStore.isFetching);

const handleOfferClick = (offer: OfferType) => {
  if (offer.slug === "mba") {
    mbaStore.selectedArea = offer.area;
  } else {
    schoolStore.selectedArea = offer.area;
  }
  selectedOffer.value = offer;
  router.push(
    i18nRoute({
      name: "area-formula",
      params: { areaslug: offer.area?.slug ?? offer.slug },
    }),
  );
};
</script>

<template>
  <div class="global-container">
    <div class="container-inner">
      <div class="left-part">
        <div class="headline mb-6">
          <h1 class="text-[22px] font-bold">{{ $t("coaching") }}</h1>
        </div>

        <GlobalLoaderVue v-if="isFetching" />

        <div v-else class="offers-list">
          <div v-for="(offer, index) in offerList" :key="index" class="offer-card">
            <!-- En-tête -->
            <div class="offer-header">
              <img :src="offer.icon ?? execIcon" class="offer-icon" alt="" />
              <h2 class="offer-title">{{ offer.title }}</h2>
              <span class="offer-price">{{ offer.amount }} €</span>
            </div>

            <!-- Contenu -->
            <div class="offer-body">
              <!-- Description -->
              <div v-if="offer.description" class="offer-description my-description" v-html="offer.description" />

              <!-- Heures + items -->
              <div class="offer-meta">
                <div v-if="offer.nbr_hours" class="meta-item">
                  <ClockIcon class="meta-icon" />
                  <span>{{ offer.nbr_hours }} heures</span>
                </div>
                <div v-if="offer.mentors?.length" class="meta-item">
                  <UserGroupIcon class="meta-icon" />
                  <span>{{ offer.mentors.length }} mentor{{ offer.mentors.length > 1 ? "s" : "" }}</span>
                </div>
              </div>

              <!-- Items / inclusions -->
              <ul v-if="offer.items?.length" class="offer-items">
                <li v-for="(item, i) in offer.items" :key="i" class="offer-item">
                  <CheckCircleIcon class="check-icon" />
                  <div>
                    <p class="item-title">{{ item.title }}</p>
                    <p v-if="item.description" class="item-desc">{{ item.description }}</p>
                  </div>
                </li>
              </ul>

              <!-- Mentors -->
              <div v-if="offer.mentors?.length" class="mentors-row">
                <div v-for="(mentor, mi) in offer.mentors.slice(0, 2)" :key="mi" class="mentor-chip">
                  <img :src="mentor.photo" :alt="mentor.full_name" class="mentor-avatar" />
                  <span class="mentor-name">{{ mentor.full_name }}</span>
                </div>
              </div>

              <!-- CTA -->
              <div class="offer-footer">
                <button type="button" class="cta-btn" @click="handleOfferClick(offer)">
                  {{ $t("formulaButton") }}
                </button>
              </div>
            </div>
          </div>

          <!-- État vide -->
          <div v-if="offerList.length === 0" class="text-center text-ink-muted py-10">
            {{ $t("no-data") }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.headline {
  border-bottom: 1px solid #c0c0c091;
  padding-bottom: 10px;
}

.offers-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-bottom: 80px;
}

.offer-card {
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  background: var(--color-surface);
}

/* Header */
.offer-header {
  background-color: #273c66;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;

  .offer-icon {
    width: 32px;
    height: 32px;
    object-fit: contain;
    filter: invert(1) brightness(10);
    flex-shrink: 0;
  }

  .offer-title {
    color: #fff;
    font-size: 18px;
    font-weight: 700;
    flex: 1;
    margin: 0;
  }

  .offer-price {
    color: #fff;
    font-size: 20px;
    font-weight: 700;
    white-space: nowrap;
  }
}

/* Body */
.offer-body {
  padding: 16px 20px;
}

.offer-description {
  font-size: 14px;
  color: #444;
  margin-bottom: 14px;
  line-height: 1.6;
}

/* Meta (heures, mentors) */
.offer-meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 14px;

  .meta-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #555;
  }

  .meta-icon {
    width: 16px;
    height: 16px;
    color: #273c66;
    flex-shrink: 0;
  }
}

/* Items */
.offer-items {
  list-style: none;
  padding: 0;
  margin: 0 0 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  .offer-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;

    .check-icon {
      width: 16px;
      height: 16px;
      color: #ff3942;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .item-title {
      font-size: 14px;
      font-weight: 500;
      margin: 0;
      color: #222;
    }

    .item-desc {
      font-size: 12px;
      color: #777;
      margin: 2px 0 0;
    }
  }
}

/* Mentors */
.mentors-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;

  .mentor-chip {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #f4f6fb;
    border-radius: 50px;
    padding: 4px 12px 4px 4px;

    .mentor-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
    }

    .mentor-name {
      font-size: 13px;
      font-weight: 500;
      color: #273c66;
    }
  }
}

/* CTA */
.offer-footer {
  border-top: 1px solid #eee;
  padding-top: 14px;
  display: flex;
  justify-content: flex-end;

  .cta-btn {
    background-color: #ff3942;
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    padding: 8px 24px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    text-transform: uppercase;
    letter-spacing: 0.5px;

    &:hover {
      background-color: #d42e36;
    }
  }
}

.global-container {
  .container-inner {
    @media (max-width: 1023px) {
      padding-bottom: 70px;
    }
  }
}
</style>
