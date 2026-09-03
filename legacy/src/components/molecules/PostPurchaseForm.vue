<script lang="ts" setup>
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElDatePicker, ElUpload, ElMessage } from "element-plus";
import {
  UserIcon,
  FlagIcon,
  DocumentTextIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ArrowRightIcon,
  CalendarIcon,
  LightBulbIcon,
  ChatBubbleLeftRightIcon,
  BriefcaseIcon,
} from "@heroicons/vue/24/outline";
import { HomeIcon } from "@heroicons/vue/24/outline";
import { GraduationCap, BookOpen, Award, Briefcase } from "lucide-vue-next";
import { i18nRoute } from "@/utils";
import { useRouter } from "vue-router";

const props = defineProps<{
  orderId: string;
  serviceType: "area" | "mba";
  token?: string;
  prefill?: {
    full_name?: string;
    birth_date?: string;
    country_of_residence?: string;
    study_destination?: string;
    preferred_country?: string;
    order_context?: {
      service_name?: string;
      school_name?: string;
      school_country?: string;
    };
  };
}>();

const emit = defineEmits<{
  (e: "submitted"): void;
}>();

const { t, locale } = useI18n();
const router = useRouter();

const currentStep = ref(0);
const isSubmitting = ref(false);

type LanguageKey = "english" | "german" | "spanish" | "french";

const formData = ref({
  full_name: "",
  country_of_residence: "",
  birth_date: null as string | null,
  study_destination: "",
  diploma_type: "",
  area_of_interest: "",
  preferred_start_date: null as string | null,
  annual_budget: "",
  second_destination: "",
  language_levels: {
    english: "",
    german: "",
    spanish: "",
    french: "",
  } as Record<LanguageKey, string>,
});

const cvFile = ref<any[]>([]);
const coverLetterFile = ref<any[]>([]);
const transcriptsFile = ref<any[]>([]);
const professionalProjectFile = ref<any[]>([]);

const steps = computed(() => [
  { title: t("post-purchase.steps.general"), icon: UserIcon },
  { title: t("post-purchase.steps.project"), icon: FlagIcon },
  { title: t("post-purchase.steps.documents"), icon: DocumentTextIcon },
  { title: t("post-purchase.steps.confirmation"), icon: CheckCircleIcon },
]);

// Presentational only: icon shown on each diploma chip (matches mockup).
const diplomaIcons: Record<string, any> = {
  licence: GraduationCap,
  master: BookOpen,
  master_specialise: Award,
  mba: Briefcase,
  doctorat: GraduationCap,
};

const diplomaTypes = computed(() => [
  { value: "licence", label: t("post-purchase.diploma-types.licence") },
  { value: "master", label: t("post-purchase.diploma-types.master") },
  { value: "master_specialise", label: t("post-purchase.diploma-types.master-specialise") },
  { value: "mba", label: t("post-purchase.diploma-types.mba") },
  { value: "doctorat", label: t("post-purchase.diploma-types.doctorat") },
]);

const budgetRanges = computed(() => [
  { value: "less_5000", label: t("post-purchase.budget-ranges.less-5000") },
  { value: "5000-10000", label: t("post-purchase.budget-ranges.from-5000") },
  { value: "10000-20000", label: t("post-purchase.budget-ranges.from-10000") },
  { value: "20000-50000", label: t("post-purchase.budget-ranges.from-20000") },
  { value: "more_50000", label: t("post-purchase.budget-ranges.more-50000") },
]);

const cefrLevels = computed(() => [
  { value: "A1", label: t("post-purchase.cefr.a1") },
  { value: "A2", label: t("post-purchase.cefr.a2") },
  { value: "B1", label: t("post-purchase.cefr.b1") },
  { value: "B2", label: t("post-purchase.cefr.b2") },
  { value: "C1", label: t("post-purchase.cefr.c1") },
  { value: "C2", label: t("post-purchase.cefr.c2") },
  { value: "N/A", label: t("post-purchase.cefr.na") },
]);

const COUNTRY_CODES = [
  "AF",
  "AL",
  "DZ",
  "AD",
  "AO",
  "AG",
  "AR",
  "AM",
  "AU",
  "AT",
  "AZ",
  "BS",
  "BH",
  "BD",
  "BB",
  "BY",
  "BE",
  "BZ",
  "BJ",
  "BT",
  "BO",
  "BA",
  "BW",
  "BR",
  "BN",
  "BG",
  "BF",
  "BI",
  "CV",
  "KH",
  "CM",
  "CA",
  "CF",
  "TD",
  "CL",
  "CN",
  "CO",
  "KM",
  "CG",
  "CD",
  "CR",
  "HR",
  "CU",
  "CY",
  "CZ",
  "DK",
  "DJ",
  "DM",
  "DO",
  "EC",
  "EG",
  "SV",
  "GQ",
  "ER",
  "EE",
  "SZ",
  "ET",
  "FJ",
  "FI",
  "FR",
  "GA",
  "GM",
  "GE",
  "DE",
  "GH",
  "GR",
  "GD",
  "GT",
  "GN",
  "GW",
  "GY",
  "HT",
  "HN",
  "HU",
  "IS",
  "IN",
  "ID",
  "IR",
  "IQ",
  "IE",
  "IL",
  "IT",
  "JM",
  "JP",
  "JO",
  "KZ",
  "KE",
  "KI",
  "KP",
  "KR",
  "KW",
  "KG",
  "LA",
  "LV",
  "LB",
  "LS",
  "LR",
  "LY",
  "LI",
  "LT",
  "LU",
  "MG",
  "MW",
  "MY",
  "MV",
  "ML",
  "MT",
  "MH",
  "MR",
  "MU",
  "MX",
  "FM",
  "MD",
  "MC",
  "MN",
  "ME",
  "MA",
  "MZ",
  "MM",
  "NA",
  "NR",
  "NP",
  "NL",
  "NZ",
  "NI",
  "NE",
  "NG",
  "MK",
  "NO",
  "OM",
  "PK",
  "PW",
  "PA",
  "PG",
  "PY",
  "PE",
  "PH",
  "PL",
  "PT",
  "QA",
  "RO",
  "RU",
  "RW",
  "KN",
  "LC",
  "VC",
  "WS",
  "SM",
  "ST",
  "SA",
  "SN",
  "RS",
  "SC",
  "SL",
  "SG",
  "SK",
  "SI",
  "SB",
  "SO",
  "ZA",
  "SS",
  "ES",
  "LK",
  "SD",
  "SR",
  "SE",
  "CH",
  "SY",
  "TW",
  "TJ",
  "TZ",
  "TH",
  "TL",
  "TG",
  "TO",
  "TT",
  "TN",
  "TR",
  "TM",
  "TV",
  "UG",
  "UA",
  "AE",
  "GB",
  "US",
  "UY",
  "UZ",
  "VU",
  "VE",
  "VN",
  "YE",
  "ZM",
  "ZW",
];

const countries = computed(() => {
  try {
    const names = new Intl.DisplayNames([locale.value], { type: "region" });
    return COUNTRY_CODES.map((code) => ({ value: names.of(code) ?? code, label: names.of(code) ?? code })).sort(
      (a, b) => a.label.localeCompare(b.label, locale.value),
    );
  } catch {
    return COUNTRY_CODES.map((code) => ({ value: code, label: code }));
  }
});

const languages = computed<{ key: LanguageKey; label: string }[]>(() => [
  { key: "english", label: t("post-purchase.language.english") },
  { key: "german", label: t("post-purchase.language.german") },
  { key: "spanish", label: t("post-purchase.language.spanish") },
  { key: "french", label: t("post-purchase.language.french") },
]);

watch(
  () => props.prefill,
  (p) => {
    if (!p) return;
    if (p.full_name) formData.value.full_name = p.full_name;
    if (p.birth_date) formData.value.birth_date = p.birth_date;
    if (p.country_of_residence) formData.value.country_of_residence = p.country_of_residence;
    const dest = p.study_destination || p.order_context?.school_country || "";
    if (dest) formData.value.study_destination = dest;
  },
  { immediate: true },
);

const nextStep = () => {
  if (currentStep.value < 2) currentStep.value++;
};
const prevStep = () => {
  if (currentStep.value > 0) currentStep.value--;
};

const validateAllFields = (): { valid: boolean; step: number } => {
  if (!formData.value.full_name.trim()) return { valid: false, step: 0 };
  if (!formData.value.country_of_residence) return { valid: false, step: 0 };
  if (!formData.value.birth_date) return { valid: false, step: 0 };
  if (!formData.value.study_destination.trim()) return { valid: false, step: 0 };
  if (!formData.value.diploma_type) return { valid: false, step: 0 };
  if (!formData.value.area_of_interest.trim()) return { valid: false, step: 1 };
  if (!formData.value.preferred_start_date) return { valid: false, step: 1 };
  if (!formData.value.annual_budget) return { valid: false, step: 1 };
  if (!formData.value.second_destination.trim()) return { valid: false, step: 1 };
  const langs: LanguageKey[] = ["english", "german", "spanish", "french"];
  for (const lang of langs) {
    if (!formData.value.language_levels[lang]) return { valid: false, step: 1 };
  }
  if (!cvFile.value[0]?.raw) return { valid: false, step: 2 };
  if (!coverLetterFile.value[0]?.raw) return { valid: false, step: 2 };
  if (!transcriptsFile.value[0]?.raw) return { valid: false, step: 2 };
  if (!professionalProjectFile.value[0]?.raw) return { valid: false, step: 2 };
  return { valid: true, step: -1 };
};

const handleSubmit = async () => {
  const validation = validateAllFields();
  if (!validation.valid) {
    currentStep.value = validation.step;
    ElMessage.error(t("post-purchase.validation-required"));
    return;
  }
  isSubmitting.value = true;
  try {
    const data = new FormData();
    if (props.token) {
      data.append("token", props.token);
    } else {
      data.append("order_id", props.orderId);
    }
    data.append("full_name", formData.value.full_name);
    data.append("country_of_residence", formData.value.country_of_residence);
    if (formData.value.birth_date) data.append("birth_date", formData.value.birth_date);
    data.append("study_destination", formData.value.study_destination);
    data.append("diploma_type", formData.value.diploma_type);
    data.append("area_of_interest", formData.value.area_of_interest);
    if (formData.value.preferred_start_date) data.append("preferred_start_date", formData.value.preferred_start_date);
    data.append("annual_budget", formData.value.annual_budget);
    data.append("second_destination", formData.value.second_destination);
    languages.value.forEach(({ key }) => {
      data.append(`language_levels[${key}]`, formData.value.language_levels[key]);
    });
    if (cvFile.value[0]?.raw) data.append("cv", cvFile.value[0].raw);
    if (coverLetterFile.value[0]?.raw) data.append("cover_letter", coverLetterFile.value[0].raw);
    if (transcriptsFile.value[0]?.raw) data.append("transcripts", transcriptsFile.value[0].raw);
    if (professionalProjectFile.value[0]?.raw)
      data.append("professional_project", professionalProjectFile.value[0].raw);

    const { HttpService } = await import("@/services/httpService");
    const http = new HttpService(!props.token);
    const endpoint = props.token ? "/client-data/store-via-token" : "/client-data/store";
    const { success, message } = await http.post(endpoint, data);

    if (success) {
      currentStep.value = 3;
    } else {
      ElMessage.error(message || t("post-purchase.error"));
    }
  } catch {
    ElMessage.error(t("post-purchase.error"));
  } finally {
    isSubmitting.value = false;
  }
};

const handleBackHome = () => {
  emit("submitted");
  router.push(i18nRoute({ name: "home" }));
};

// Progress bar fill for the stepper track.
const trackFill = computed(() => {
  const total = steps.value.length - 1;
  return total > 0 ? `${(currentStep.value / total) * 100}%` : "0%";
});

const programName = computed(
  () => props.prefill?.order_context?.service_name || props.prefill?.order_context?.school_name || "",
);
</script>

<template>
  <div class="pp">
    <!-- Page head -->
    <div class="pp-head">
      <h2>{{ t("post-purchase.title") }}</h2>
      <div class="pp-sub">
        {{ serviceType === "mba" ? t("post-purchase.subtitle-mba") : t("post-purchase.subtitle-school") }}
      </div>
    </div>

    <!-- Stepper -->
    <div class="pp-stepper">
      <div class="pp-steps">
        <div class="pp-track"><div class="pp-fill" :style="{ width: trackFill }"></div></div>
        <div
          v-for="(step, i) in steps"
          :key="i"
          class="pp-step"
          :class="{ active: i === currentStep, done: i < currentStep }"
        >
          <div class="pp-circle">
            <CheckCircleIcon v-if="i < currentStep" />
            <span v-else>{{ i + 1 }}</span>
          </div>
          <div class="pp-label">{{ step.title }}</div>
        </div>
      </div>
    </div>

    <!-- Program banner -->
    <div v-if="programName" class="pp-program">
      <div class="pp-pill"><BriefcaseIcon /></div>
      <div class="pp-program-txt">
        {{ t("data-collection.program-selected") }}
        <span class="val">{{ programName }}</span>
      </div>
    </div>

    <!-- ============ STEP 1: General info ============ -->
    <div v-show="currentStep === 0">
      <div class="pp-section">
        <div class="pp-section-ic"><UserIcon /></div>
        <h3>{{ t("post-purchase.general.title") }}</h3>
      </div>
      <div class="pp-divider"></div>

      <ElForm :model="formData" label-position="top">
        <div class="pp-grid">
          <ElFormItem :label="t('post-purchase.general.full-name')" required class="pp-item">
            <ElInput v-model="formData.full_name" :placeholder="t('post-purchase.general.full-name-placeholder')" />
          </ElFormItem>

          <ElFormItem :label="t('post-purchase.general.country-of-residence')" required class="pp-item">
            <ElSelect
              v-model="formData.country_of_residence"
              :placeholder="t('post-purchase.general.country-of-residence-placeholder')"
              filterable
              class="w-full"
            >
              <ElOption v-for="c in countries" :key="c.value" :label="c.label" :value="c.value" />
            </ElSelect>
          </ElFormItem>

          <ElFormItem :label="t('post-purchase.general.birth-date')" required class="pp-item">
            <ElDatePicker
              v-model="formData.birth_date"
              type="date"
              :placeholder="t('post-purchase.general.birth-date-placeholder')"
              :prefix-icon="CalendarIcon"
              format="DD/MM/YYYY"
              value-format="YYYY-MM-DD"
              class="w-full"
            />
          </ElFormItem>

          <ElFormItem :label="t('post-purchase.general.study-destination')" required class="pp-item">
            <ElInput
              v-model="formData.study_destination"
              :placeholder="t('post-purchase.general.study-destination-placeholder')"
            />
          </ElFormItem>
        </div>

        <ElFormItem :label="t('post-purchase.general.diploma')" required class="pp-item">
          <div class="pp-chips">
            <div
              v-for="d in diplomaTypes"
              :key="d.value"
              class="pp-chip"
              :class="{ selected: formData.diploma_type === d.value }"
              @click="formData.diploma_type = d.value"
            >
              <component :is="diplomaIcons[d.value]" class="pp-chip-ic" />
              {{ d.label }}
            </div>
          </div>
        </ElFormItem>
      </ElForm>
    </div>

    <!-- ============ STEP 2: Study project ============ -->
    <div v-show="currentStep === 1">
      <div class="pp-section">
        <div class="pp-section-ic blue"><FlagIcon /></div>
        <h3>{{ t("post-purchase.project.title") }}</h3>
      </div>
      <div class="pp-divider"></div>

      <ElForm :model="formData" label-position="top">
        <ElFormItem :label="t('post-purchase.project.area-of-interest')" class="pp-item">
          <ElInput v-model="formData.area_of_interest" :placeholder="t('post-purchase.project.area-placeholder')" />
        </ElFormItem>

        <div class="pp-grid">
          <ElFormItem :label="t('post-purchase.project.start-date')" class="pp-item">
            <ElDatePicker
              v-model="formData.preferred_start_date"
              type="date"
              :placeholder="t('post-purchase.general.birth-date-placeholder')"
              :prefix-icon="CalendarIcon"
              format="DD/MM/YYYY"
              value-format="YYYY-MM-DD"
              class="w-full"
            />
          </ElFormItem>
          <ElFormItem :label="t('post-purchase.project.annual-budget')" class="pp-item">
            <ElSelect
              v-model="formData.annual_budget"
              :placeholder="t('post-purchase.project.budget-placeholder')"
              class="w-full"
            >
              <ElOption v-for="b in budgetRanges" :key="b.value" :label="b.label" :value="b.value" />
            </ElSelect>
          </ElFormItem>
        </div>

        <ElFormItem :label="t('post-purchase.project.second-destination')" class="pp-item">
          <ElInput
            v-model="formData.second_destination"
            :placeholder="t('post-purchase.project.second-destination-placeholder')"
          />
        </ElFormItem>

        <p class="pp-lang-title">{{ t("post-purchase.language.title") }}</p>
        <div class="pp-grid">
          <ElFormItem
            v-for="lang in languages"
            :key="lang.key"
            :label="t('post-purchase.language.level-label', { lang: lang.label })"
            class="pp-item"
          >
            <ElSelect
              v-model="formData.language_levels[lang.key]"
              :placeholder="t('post-purchase.language.select')"
              class="w-full"
            >
              <ElOption v-for="l in cefrLevels" :key="l.value" :label="l.label" :value="l.value" />
            </ElSelect>
          </ElFormItem>
        </div>
      </ElForm>
    </div>

    <!-- ============ STEP 3: Documents ============ -->
    <div v-show="currentStep === 2">
      <div class="pp-section">
        <div class="pp-section-ic orange"><DocumentTextIcon /></div>
        <h3>{{ t("post-purchase.documents.title") }}</h3>
      </div>
      <div class="pp-divider"></div>

      <p class="pp-doc-info">{{ t("post-purchase.documents.info") }}</p>

      <div class="pp-docs">
        <!-- CV -->
        <div class="pp-doc">
          <div class="pp-doc-left">
            <div class="pp-doc-ic"><DocumentTextIcon /></div>
            <div>
              <p class="pp-doc-name">
                {{ t("post-purchase.documents.cv") }}
                <span class="req">*</span>
              </p>
              <p class="pp-doc-hint">{{ t("post-purchase.documents.hint-pdf") }}</p>
            </div>
          </div>
          <ElUpload
            v-model:file-list="cvFile"
            :auto-upload="false"
            :limit="1"
            accept=".pdf,.doc,.docx"
            :show-file-list="false"
          >
            <button type="button" class="pp-upload-btn">
              <span v-if="cvFile.length">{{ cvFile[0]?.name }}</span>
              <span v-else>
                <CloudArrowUpIcon class="up-ic" />
                {{ t("post-purchase.documents.drag-drop") }}
              </span>
            </button>
          </ElUpload>
        </div>
        <!-- Cover letter -->
        <div class="pp-doc">
          <div class="pp-doc-left">
            <div class="pp-doc-ic"><DocumentTextIcon /></div>
            <div>
              <p class="pp-doc-name">
                {{ t("post-purchase.documents.cover-letter") }}
                <span class="req">*</span>
              </p>
              <p class="pp-doc-hint">{{ t("post-purchase.documents.hint-pdf") }}</p>
            </div>
          </div>
          <ElUpload
            v-model:file-list="coverLetterFile"
            :auto-upload="false"
            :limit="1"
            accept=".pdf,.doc,.docx"
            :show-file-list="false"
          >
            <button type="button" class="pp-upload-btn">
              <span v-if="coverLetterFile.length">{{ coverLetterFile[0]?.name }}</span>
              <span v-else>
                <CloudArrowUpIcon class="up-ic" />
                {{ t("post-purchase.documents.drag-drop") }}
              </span>
            </button>
          </ElUpload>
        </div>
        <!-- Transcripts -->
        <div class="pp-doc">
          <div class="pp-doc-left">
            <div class="pp-doc-ic"><DocumentTextIcon /></div>
            <div>
              <p class="pp-doc-name">
                {{ t("post-purchase.documents.transcripts") }}
                <span class="req">*</span>
              </p>
              <p class="pp-doc-hint">{{ t("post-purchase.documents.hint-img") }}</p>
            </div>
          </div>
          <ElUpload
            v-model:file-list="transcriptsFile"
            :auto-upload="false"
            :limit="1"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            :show-file-list="false"
          >
            <button type="button" class="pp-upload-btn">
              <span v-if="transcriptsFile.length">{{ transcriptsFile[0]?.name }}</span>
              <span v-else>
                <CloudArrowUpIcon class="up-ic" />
                {{ t("post-purchase.documents.drag-drop") }}
              </span>
            </button>
          </ElUpload>
        </div>
        <!-- Professional project -->
        <div class="pp-doc">
          <div class="pp-doc-left">
            <div class="pp-doc-ic"><DocumentTextIcon /></div>
            <div>
              <p class="pp-doc-name">
                {{ t("post-purchase.documents.professional-project") }}
                <span class="req">*</span>
              </p>
              <p class="pp-doc-hint">{{ t("post-purchase.documents.hint-pdf") }}</p>
            </div>
          </div>
          <ElUpload
            v-model:file-list="professionalProjectFile"
            :auto-upload="false"
            :limit="1"
            accept=".pdf,.doc,.docx"
            :show-file-list="false"
          >
            <button type="button" class="pp-upload-btn">
              <span v-if="professionalProjectFile.length">{{ professionalProjectFile[0]?.name }}</span>
              <span v-else>
                <CloudArrowUpIcon class="up-ic" />
                {{ t("post-purchase.documents.drag-drop") }}
              </span>
            </button>
          </ElUpload>
        </div>
      </div>
    </div>

    <!-- ============ STEP 4: Confirmation ============ -->
    <div v-if="currentStep === 3" class="pp-confirm">
      <div class="pp-confirm-ic"><CheckCircleIcon /></div>
      <h3>{{ t("post-purchase.confirmation.title") }}</h3>
      <p>{{ t("post-purchase.confirmation.message") }}</p>
      <button class="pp-btn-primary" @click="handleBackHome">
        <HomeIcon class="btn-ic" />
        {{ t("post-purchase.confirmation.back-dashboard") }}
      </button>
    </div>

    <!-- Navigation -->
    <div v-if="currentStep < 3" class="pp-actions">
      <button v-if="currentStep > 0" class="pp-btn-ghost" @click="prevStep">
        <ChevronLeftIcon class="btn-ic" />
        {{ t("post-purchase.previous") }}
      </button>
      <span v-else></span>

      <button v-if="currentStep < 2" class="pp-btn-primary" @click="nextStep">
        {{ t("post-purchase.next") }}
        <ArrowRightIcon class="btn-ic" />
      </button>
      <button v-else class="pp-btn-primary" :disabled="isSubmitting" @click="handleSubmit">
        <CheckCircleIcon v-if="!isSubmitting" class="btn-ic" />
        <span v-else class="pp-spin"></span>
        {{ t("post-purchase.submit") }}
      </button>
    </div>

    <!-- Help banner -->
    <div v-if="currentStep < 3" class="pp-help">
      <div class="pp-help-ic"><LightBulbIcon /></div>
      <div class="pp-help-txt">
        <h4>{{ t("data-collection.help-title") }}</h4>
        <p>{{ t("data-collection.help-text") }}</p>
      </div>
      <router-link :to="i18nRoute({ name: 'contact' })" class="pp-help-btn">
        <ChatBubbleLeftRightIcon class="btn-ic" />
        {{ t("data-collection.help-contact") }}
      </router-link>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.pp {
  --red: #f23645;
  --red-soft: #fce3e1;
  --navy: #1e2747;
  --ink: #2a3253;
  --gray: #6e7488;
  --gray-light: #9ca1b3;
  --border: #ecedf1;
  --border-input: #e6e7ec;
  --purple: #7b78e0;
  --purple-soft: #ecebfb;

  font-family:
    "Poppins",
    system-ui,
    -apple-system,
    sans-serif;
  color: var(--ink);
  max-width: 990px;
  margin: 0 auto;

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
}

/* Page head */
.pp-head {
  text-align: center;
  margin-bottom: 28px;
}
.pp-head h2 {
  font-size: 30px;
  font-weight: 700;
  color: var(--navy);
  letter-spacing: -0.4px;
  margin: 0;
}
.pp-sub {
  font-size: 16px;
  color: var(--gray);
  margin-top: 6px;
  font-weight: 400;
}

/* Stepper */
.pp-stepper {
  border: 1.5px solid var(--border);
  border-radius: 18px;
  padding: 26px 56px 22px;
  margin-bottom: 22px;
}
.pp-steps {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  position: relative;
}
.pp-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
  flex: 0 0 auto;
}
.pp-circle {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--color-surface);
  border: 2.5px solid #d7d9e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  color: #b6b9c4;
  transition:
    border-color 0.2s,
    color 0.2s,
    background 0.2s;
}
.pp-circle :deep(svg) {
  width: 22px;
  height: 22px;
}
.pp-step.active .pp-circle {
  border-color: var(--red);
  color: var(--red);
}
.pp-step.done .pp-circle {
  border-color: #22a957;
  background: #22a957;
  color: #fff;
}
.pp-label {
  margin-top: 14px;
  font-size: 15px;
  font-weight: 500;
  color: var(--gray-light);
  white-space: nowrap;
}
.pp-step.active .pp-label {
  color: var(--red);
  font-weight: 600;
}
.pp-step.done .pp-label {
  color: #22a957;
}
.pp-track {
  position: absolute;
  top: 19px;
  left: 60px;
  right: 60px;
  height: 3px;
  background: #e4e6ec;
  z-index: 1;
}
.pp-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: var(--red);
  transition: width 0.3s ease;
}

/* Program banner */
.pp-program {
  border: 1.5px solid var(--border);
  border-radius: 14px;
  padding: 14px 22px;
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
}
.pp-pill {
  width: 42px;
  height: 42px;
  border-radius: 11px;
  flex-shrink: 0;
  background: var(--red-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--red);
}
.pp-pill :deep(svg) {
  width: 21px;
  height: 21px;
}
.pp-program-txt {
  font-size: 16px;
  font-weight: 600;
  color: var(--navy);
}
.pp-program-txt .val {
  color: var(--red);
}

/* Section header */
.pp-section {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}
.pp-section-ic {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--red-soft);
  color: var(--red);
  display: flex;
  align-items: center;
  justify-content: center;
}
.pp-section-ic :deep(svg) {
  width: 21px;
  height: 21px;
}
.pp-section-ic.blue {
  background: #eaf1fb;
  color: #3b6fe0;
}
.pp-section-ic.orange {
  background: #fff1e6;
  color: #f08a24;
}
.pp-section h3 {
  font-size: 21px;
  font-weight: 600;
  color: var(--navy);
  margin: 0;
}
.pp-divider {
  height: 1.5px;
  background: var(--border);
  margin-bottom: 24px;
}

/* Form grid */
.pp-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 30px;
}
.pp-item {
  margin-bottom: 20px;
}
.pp-lang-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--navy);
  margin: 6px 0 14px;
}

/* Diploma chips */
.pp-chips {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
  width: 100%;
}
.pp-chip {
  border: 1.5px solid var(--border-input);
  border-radius: 13px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  background: var(--color-surface);
  transition:
    border-color 0.15s,
    background 0.15s,
    box-shadow 0.15s,
    color 0.15s;
  font-size: 14.5px;
  font-weight: 500;
  color: var(--ink);
  user-select: none;
  text-align: center;
  padding: 0 8px;
}
.pp-chip-ic {
  width: 20px;
  height: 20px;
  color: #5a6076;
  flex-shrink: 0;
}
.pp-chip:hover {
  border-color: #d6bcc0;
}
.pp-chip.selected {
  border-color: var(--red);
  background: var(--red-soft);
  box-shadow: 0 0 0 3px rgba(242, 54, 69, 0.08);
  color: var(--red);
}
.pp-chip.selected .pp-chip-ic {
  color: var(--red);
}

/* Documents */
.pp-doc-info {
  font-size: 13px;
  color: var(--gray);
  background: #f6f7fa;
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 18px;
}
.pp-docs {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.pp-doc {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border: 1.5px solid var(--border);
  border-radius: 16px;
  padding: 14px 18px;
}
.pp-doc-left {
  display: flex;
  align-items: center;
  gap: 14px;
}
.pp-doc-ic {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #f6f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9aa0b2;
  flex-shrink: 0;
}
.pp-doc-ic :deep(svg) {
  width: 20px;
  height: 20px;
}
.pp-doc-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--navy);
  margin: 0;
}
.pp-doc-name .req {
  color: var(--red);
}
.pp-doc-hint {
  font-size: 12.5px;
  color: var(--gray-light);
  margin: 2px 0 0;
}
.pp-upload-btn {
  border: 1.5px solid var(--border-input);
  background: var(--color-surface);
  border-radius: 12px;
  padding: 10px 16px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: var(--gray);
  cursor: pointer;
  white-space: nowrap;
  transition:
    border-color 0.15s,
    color 0.15s;
}
.pp-upload-btn:hover {
  border-color: var(--red);
  color: var(--red);
}
.pp-upload-btn span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.up-ic {
  width: 16px;
  height: 16px;
}

/* Confirmation */
.pp-confirm {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 40px 0;
}
.pp-confirm-ic {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #e9f6ee;
  color: #22a957;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
}
.pp-confirm-ic :deep(svg) {
  width: 46px;
  height: 46px;
}
.pp-confirm h3 {
  font-size: 26px;
  font-weight: 700;
  color: var(--navy);
  margin: 0 0 12px;
}
.pp-confirm p {
  font-size: 15px;
  color: var(--gray);
  max-width: 420px;
  line-height: 1.6;
  margin: 0 0 28px;
}

/* Buttons */
.pp-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 30px 0 0;
}
.pp-btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: var(--red);
  color: #fff;
  border: none;
  font-family: inherit;
  font-size: 17px;
  font-weight: 600;
  padding: 14px 32px;
  border-radius: 13px;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(242, 54, 69, 0.32);
  transition:
    transform 0.12s,
    box-shadow 0.15s,
    opacity 0.15s;
}
.pp-btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(242, 54, 69, 0.4);
}
.pp-btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.pp-btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--color-surface);
  color: var(--gray);
  border: 1.5px solid var(--border-input);
  font-family: inherit;
  font-size: 15px;
  font-weight: 600;
  padding: 13px 24px;
  border-radius: 13px;
  cursor: pointer;
  transition: border-color 0.15s;
}
.pp-btn-ghost:hover {
  border-color: #cbd0db;
}
.btn-ic {
  width: 19px;
  height: 19px;
}
.pp-spin {
  width: 17px;
  height: 17px;
  border: 2.5px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: pp-spin 0.7s linear infinite;
}
@keyframes pp-spin {
  to {
    transform: rotate(360deg);
  }
}

/* Help banner */
.pp-help {
  border: 1.5px solid var(--border);
  border-radius: 16px;
  padding: 18px 24px;
  display: flex;
  align-items: center;
  gap: 18px;
  margin-top: 30px;
}
.pp-help-ic {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  flex-shrink: 0;
  background: var(--purple-soft);
  color: var(--purple);
  display: flex;
  align-items: center;
  justify-content: center;
}
.pp-help-ic :deep(svg) {
  width: 23px;
  height: 23px;
}
.pp-help-txt {
  flex: 1;
}
.pp-help-txt h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--navy);
  margin: 0 0 4px;
}
.pp-help-txt p {
  font-size: 14px;
  color: var(--gray);
  font-weight: 400;
  margin: 0;
}
.pp-help-btn {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  background: var(--red-soft);
  color: var(--red);
  border: none;
  font-family: inherit;
  font-size: 14.5px;
  font-weight: 600;
  padding: 12px 20px;
  border-radius: 11px;
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
  transition: background 0.15s;
}
.pp-help-btn:hover {
  background: #fbd4d1;
}

/* Element Plus field theming to match the mockup */
:deep(.el-form-item__label) {
  font-size: 15px;
  font-weight: 500;
  color: var(--ink);
  padding-bottom: 8px;
  line-height: 1.2;
}
:deep(.el-input__wrapper),
:deep(.el-select__wrapper) {
  min-height: 52px;
  border-radius: 12px;
  box-shadow: 0 0 0 1.5px var(--border-input);
  padding: 0 16px;
  font-family: inherit;

  &:hover {
    box-shadow: 0 0 0 1.5px #d6d8e0;
  }
  &.is-focus,
  &.is-focused {
    box-shadow:
      0 0 0 1.5px var(--red),
      0 0 0 3px rgba(242, 54, 69, 0.1) !important;
  }
}
:deep(.el-input__inner),
:deep(.el-select__placeholder) {
  font-size: 16px;
  color: var(--ink);
}
:deep(.el-date-editor.el-input),
:deep(.el-select) {
  width: 100%;
}
:deep(.el-upload) {
  display: block;
}
:deep(.el-upload-list) {
  display: none;
}

/* Responsive */
@media (max-width: 720px) {
  .pp-stepper {
    padding: 22px 20px 18px;
  }
  .pp-label {
    font-size: 12px;
  }
  .pp-track {
    left: 30px;
    right: 30px;
  }
  .pp-grid {
    grid-template-columns: 1fr;
  }
  .pp-chips {
    grid-template-columns: repeat(2, 1fr);
  }
  .pp-doc {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .pp-upload-btn {
    width: 100%;
  }
  .pp-help {
    flex-wrap: wrap;
  }
  .pp-help-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
