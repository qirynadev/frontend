<script lang="ts" setup>
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import {
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption,
  ElDatePicker,
  ElUpload,
  ElButton,
  ElSteps,
  ElStep,
  ElMessage,
} from "element-plus";
import { UserIcon, FlagIcon, DocumentTextIcon, CloudArrowUpIcon, CheckCircleIcon } from "@heroicons/vue/24/outline";

const props = defineProps<{
  orderId: string;
  token?: string;
  prefill?: {
    full_name?: string;
    birth_date?: string;
    country_of_residence?: string;
    study_destination?: string;
    preferred_country?: string;
    order_context?: {
      service_name?: string;
      destination_country?: string;
      school_country?: string;
    };
  };
}>();

const emit = defineEmits<{
  (e: "submitted"): void;
}>();

const { t, locale } = useI18n();

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
  { title: t("post-purchase.steps.general") },
  { title: t("post-purchase.steps.project") },
  { title: t("post-purchase.steps.documents") },
]);

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
    const dest = p.study_destination || p.order_context?.destination_country || p.order_context?.school_country || "";
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
      ElMessage.success(t("post-purchase.success"));
      emit("submitted");
    } else {
      ElMessage.error(message || t("post-purchase.error"));
    }
  } catch {
    ElMessage.error(t("post-purchase.error"));
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="post-purchase-form">
    <!-- En-tête -->
    <div class="form-header">
      <h2 class="form-title">{{ t("post-purchase.title") }}</h2>
      <p class="form-subtitle">{{ t("post-purchase.subtitle-living") }}</p>

      <div
        v-if="prefill?.order_context?.service_name || prefill?.order_context?.destination_country"
        class="order-context"
      >
        <div v-if="prefill?.order_context?.service_name" class="context-item">
          <span class="context-label">{{ t("post-purchase.context.service") }} :</span>
          <span class="context-value">{{ prefill.order_context.service_name }}</span>
        </div>
        <div v-if="prefill?.order_context?.destination_country" class="context-item">
          <span class="context-label">{{ t("post-purchase.context.destination") }} :</span>
          <span class="context-value">{{ prefill.order_context.destination_country }}</span>
        </div>
      </div>
    </div>

    <!-- Stepper -->
    <ElSteps :active="currentStep" finish-status="success" class="steps-container">
      <ElStep v-for="(step, i) in steps" :key="i" :title="step.title" />
    </ElSteps>

    <div class="form-content">
      <!-- ─── Étape 1 : Informations Générales ─── -->
      <div v-show="currentStep === 0" class="step-content">
        <div class="section-header">
          <UserIcon class="section-icon" />
          <h3>{{ t("post-purchase.general.title") }}</h3>
        </div>

        <ElForm :model="formData" label-position="top">
          <!-- Nom et Prénoms -->
          <ElFormItem :label="t('post-purchase.general.full-name')" required>
            <ElInput v-model="formData.full_name" :placeholder="t('post-purchase.general.full-name-placeholder')" />
          </ElFormItem>

          <!-- Pays de résidence -->
          <ElFormItem :label="t('post-purchase.general.country-of-residence')" required>
            <ElSelect
              v-model="formData.country_of_residence"
              :placeholder="t('post-purchase.general.country-of-residence-placeholder')"
              filterable
              class="w-full"
            >
              <ElOption v-for="c in countries" :key="c.value" :label="c.label" :value="c.value" />
            </ElSelect>
          </ElFormItem>

          <!-- Date de naissance -->
          <ElFormItem :label="t('post-purchase.general.birth-date')" required>
            <ElDatePicker
              v-model="formData.birth_date"
              type="date"
              :placeholder="t('post-purchase.general.birth-date-placeholder')"
              format="DD/MM/YYYY"
              value-format="YYYY-MM-DD"
              class="w-full"
            />
          </ElFormItem>

          <!-- Destination d'étude -->
          <ElFormItem :label="t('post-purchase.general.study-destination')" required>
            <ElInput
              v-model="formData.study_destination"
              :placeholder="t('post-purchase.general.study-destination-placeholder')"
            />
          </ElFormItem>

          <!-- Diplôme préparé -->
          <ElFormItem :label="t('post-purchase.general.diploma')" required>
            <div class="diploma-options">
              <span
                v-for="d in diplomaTypes"
                :key="d.value"
                class="diploma-option"
                :class="{ active: formData.diploma_type === d.value }"
                @click="formData.diploma_type = d.value"
              >
                {{ d.label }}
              </span>
            </div>
          </ElFormItem>
        </ElForm>
      </div>

      <!-- ─── Étape 2 : Projet d'étude ─── -->
      <div v-show="currentStep === 1" class="step-content">
        <div class="section-header">
          <FlagIcon class="section-icon" />
          <h3>{{ t("post-purchase.project.title") }}</h3>
        </div>

        <ElForm :model="formData" label-position="top">
          <!-- Domaine d'intérêt -->
          <ElFormItem :label="t('post-purchase.project.area-of-interest')">
            <ElInput v-model="formData.area_of_interest" :placeholder="t('post-purchase.project.area-placeholder')" />
          </ElFormItem>

          <div class="form-row">
            <!-- Date de rentrée préférée -->
            <ElFormItem :label="t('post-purchase.project.start-date')">
              <ElDatePicker
                v-model="formData.preferred_start_date"
                type="date"
                :placeholder="t('post-purchase.general.birth-date-placeholder')"
                format="DD/MM/YYYY"
                value-format="YYYY-MM-DD"
                class="w-full"
              />
            </ElFormItem>

            <!-- Budget annuel -->
            <ElFormItem :label="t('post-purchase.project.annual-budget')">
              <ElSelect
                v-model="formData.annual_budget"
                :placeholder="t('post-purchase.project.budget-placeholder')"
                class="w-full"
              >
                <ElOption v-for="b in budgetRanges" :key="b.value" :label="b.label" :value="b.value" />
              </ElSelect>
            </ElFormItem>
          </div>

          <!-- Second pays de destination -->
          <ElFormItem :label="t('post-purchase.project.second-destination')">
            <ElInput
              v-model="formData.second_destination"
              :placeholder="t('post-purchase.project.second-destination-placeholder')"
            />
          </ElFormItem>

          <!-- Niveaux de langue -->
          <div class="language-section">
            <p class="language-title">{{ t("post-purchase.language.title") }}</p>
            <div class="language-grid">
              <ElFormItem
                v-for="lang in languages"
                :key="lang.key"
                :label="t('post-purchase.language.level-label', { lang: lang.label })"
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
          </div>
        </ElForm>
      </div>

      <!-- ─── Étape 3 : Documents ─── -->
      <div v-show="currentStep === 2" class="step-content">
        <div class="section-header">
          <DocumentTextIcon class="section-icon" />
          <h3>{{ t("post-purchase.documents.title") }}</h3>
        </div>

        <p class="documents-info">{{ t("post-purchase.documents.info") }}</p>

        <div class="documents-grid">
          <div class="document-upload">
            <label>
              {{ t("post-purchase.documents.cv") }}
              <span class="required">*</span>
            </label>
            <ElUpload v-model:file-list="cvFile" :auto-upload="false" :limit="1" accept=".pdf,.doc,.docx" drag>
              <CloudArrowUpIcon class="upload-icon" />
              <div class="upload-text">{{ t("post-purchase.documents.drag-drop") }}</div>
              <div class="upload-hint">{{ t("post-purchase.documents.hint-pdf") }}</div>
            </ElUpload>
          </div>

          <div class="document-upload">
            <label>
              {{ t("post-purchase.documents.cover-letter") }}
              <span class="required">*</span>
            </label>
            <ElUpload v-model:file-list="coverLetterFile" :auto-upload="false" :limit="1" accept=".pdf,.doc,.docx" drag>
              <CloudArrowUpIcon class="upload-icon" />
              <div class="upload-text">{{ t("post-purchase.documents.drag-drop") }}</div>
              <div class="upload-hint">{{ t("post-purchase.documents.hint-pdf") }}</div>
            </ElUpload>
          </div>

          <div class="document-upload">
            <label>
              {{ t("post-purchase.documents.transcripts") }}
              <span class="required">*</span>
            </label>
            <ElUpload
              v-model:file-list="transcriptsFile"
              :auto-upload="false"
              :limit="1"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              drag
            >
              <CloudArrowUpIcon class="upload-icon" />
              <div class="upload-text">{{ t("post-purchase.documents.drag-drop") }}</div>
              <div class="upload-hint">{{ t("post-purchase.documents.hint-img") }}</div>
            </ElUpload>
          </div>

          <div class="document-upload">
            <label>
              {{ t("post-purchase.documents.professional-project") }}
              <span class="required">*</span>
            </label>
            <ElUpload
              v-model:file-list="professionalProjectFile"
              :auto-upload="false"
              :limit="1"
              accept=".pdf,.doc,.docx"
              drag
            >
              <CloudArrowUpIcon class="upload-icon" />
              <div class="upload-text">{{ t("post-purchase.documents.drag-drop") }}</div>
              <div class="upload-hint">{{ t("post-purchase.documents.hint-pdf") }}</div>
            </ElUpload>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="form-actions">
      <ElButton v-if="currentStep > 0" @click="prevStep">{{ t("post-purchase.previous") }}</ElButton>
      <span v-else></span>

      <div class="action-right">
        <ElButton v-if="currentStep < 2" type="primary" @click="nextStep">
          {{ t("post-purchase.next") }}
        </ElButton>
        <ElButton v-else type="primary" @click="handleSubmit" :loading="isSubmitting">
          <CheckCircleIcon class="btn-icon" v-if="!isSubmitting" />
          {{ t("post-purchase.submit") }}
        </ElButton>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.post-purchase-form {
  width: 100%;
  background: var(--color-surface);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 40px;
}

/* ── En-tête ── */
.form-header {
  text-align: center;
  margin-bottom: 30px;

  .form-title {
    font-size: 22px;
    font-weight: 700;
    color: #1a1a2e;
    margin-bottom: 4px;
  }

  .form-subtitle {
    color: #666;
    font-size: 14px;
    margin-bottom: 0;
  }

  .order-context {
    margin-top: 16px;
    padding: 14px 18px;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-radius: 10px;
    border-left: 4px solid #f05152;
    text-align: left;

    .context-item {
      display: flex;
      gap: 8px;
      margin-bottom: 4px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .context-label {
      font-weight: 600;
      color: #495057;
      font-size: 13px;
    }

    .context-value {
      color: #1a1a2e;
      font-size: 13px;
    }
  }
}

/* ── Stepper ── */
.steps-container {
  margin-bottom: 36px;
}

/* ── Contenu des étapes ── */
.step-content {
  min-height: 360px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  padding-bottom: 14px;
  border-bottom: 2px solid #f0f0f0;

  .section-icon {
    width: 26px;
    height: 26px;
    color: #f05152;
    flex-shrink: 0;
  }

  h3 {
    font-size: 17px;
    font-weight: 600;
    color: #1a1a2e;
    margin: 0;
  }
}

/* ── Badge prérempli ── */
.prefilled-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
  background: #dbeafe;
  color: #1e40af;
  border-radius: 10px;
  margin-left: 8px;
  vertical-align: middle;
}

/* ── Chips diplôme ── */
.diploma-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;

  .diploma-option {
    padding: 8px 18px;
    border: 1.5px solid #e0e0e0;
    border-radius: 20px;
    cursor: pointer;
    font-size: 14px;
    color: #555;
    transition: all 0.2s;
    user-select: none;

    &:hover:not(.active) {
      border-color: #f05152;
      color: #f05152;
    }

    &.active {
      background: #f05152;
      border-color: #f05152;
      color: white;
    }
  }
}

/* ── Ligne double colonne ── */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
}

/* ── Niveaux de langue ── */
.language-section {
  margin-top: 8px;

  .language-title {
    font-size: 14px;
    font-weight: 600;
    color: #1a1a2e;
    margin-bottom: 14px;
  }

  .language-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;

    @media (max-width: 600px) {
      grid-template-columns: 1fr;
    }
  }
}

/* ── Documents ── */
.documents-info {
  color: #666;
  font-size: 13px;
  margin-bottom: 20px;
  padding: 10px 14px;
  background: #f9f9f9;
  border-radius: 8px;
}

.documents-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
}

.document-upload {
  label {
    display: block;
    font-weight: 500;
    font-size: 14px;
    margin-bottom: 8px;
    color: #1a1a2e;

    .required {
      color: #f05152;
      margin-left: 2px;
    }
  }

  :deep(.el-upload-dragger) {
    padding: 18px;
    border-radius: 10px;

    &:hover {
      border-color: #f05152;
    }
  }

  .upload-icon {
    width: 36px;
    height: 36px;
    color: #c0c4cc;
    margin-bottom: 6px;
  }

  .upload-text {
    font-size: 13px;
    color: #606266;
  }

  .upload-hint {
    font-size: 11px;
    color: #909399;
    margin-top: 3px;
  }
}

/* ── Actions ── */
.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 36px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;

  .action-right {
    display: flex;
    gap: 12px;
  }

  .btn-icon {
    width: 17px;
    height: 17px;
    margin-right: 6px;
  }
}

.w-full {
  width: 100%;
}

/* ── Element Plus overrides ── */
:deep(.el-button--primary) {
  background-color: #f05152;
  border-color: #f05152;

  &:hover {
    background-color: #d63d3e;
    border-color: #d63d3e;
  }

  &.is-disabled {
    background-color: #f8b4b4;
    border-color: #f8b4b4;
  }
}

:deep(.el-step__head.is-finish),
:deep(.el-step__head.is-process) {
  color: #f05152;
  border-color: #f05152;
}

:deep(.el-step__title.is-finish),
:deep(.el-step__title.is-process) {
  color: #f05152;
}

:deep(.el-step__title.is-process) {
  font-weight: 600;
}
</style>
