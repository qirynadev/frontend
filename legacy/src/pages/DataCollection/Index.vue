<script lang="ts" setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { HttpService } from "@/services/httpService";
import { i18nRoute } from "@/utils";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

/* ---------- Validation du token (flux existant) ---------- */
const isLoading = ref(true);
const isValidToken = ref(false);
const isAlreadyComplete = ref(false);
const errorMessage = ref("");
const orderId = ref("");
const userEmail = ref("");
const prefillProgram = ref("");
const token = computed(() => route.params.token as string);

/* ---------- Assistant ---------- */
const current = ref(1); // 1=Infos, 2=Projet, 3=Documents, 4=Succès
const isSubmitting = ref(false);
const submittedAt = ref("20 mai 2024 à 14:35");
const dobType = ref<"text" | "date">("text");

const programName = computed(() => prefillProgram.value || "Management");

const formData = ref({
  full_name: "Doungnan Coulibaly",
  country_of_residence: "",
  birth_date: "",
  study_destination: "France",
  diploma_type: "",
  motivations: "",
  objectives: "",
  start_period: "",
  formation_duration: "",
  how_heard: "",
});

type DocKey = "identity" | "diplomas" | "language_certificate" | "cv" | "cover_letter";
const docFiles = ref<Record<DocKey, File | null>>({
  identity: null,
  diplomas: null,
  language_certificate: null,
  cv: null,
  cover_letter: null,
});

const diplomaTypes = [
  { value: "licence", label: "Licence" },
  { value: "master", label: "Master" },
  { value: "master_specialise", label: "Master Spécialisé" },
  { value: "mba", label: "MBA" },
  { value: "doctorat", label: "Doctorat" },
];

const maskedEmail = computed(() => {
  if (!userEmail.value) return "dou***@email.com";
  const [name, domain] = userEmail.value.split("@");
  if (!domain) return userEmail.value;
  return `${name.slice(0, 3)}***@${domain}`;
});

const trackFill = computed(() => {
  if (current.value === 4) return "100%";
  return `${((current.value - 1) / 2) * 100}%`;
});

const stepState = (n: number) => {
  if (current.value === 4) return "done";
  if (n < current.value) return "done";
  if (n === current.value) return "active";
  return "";
};

/* ---------- Validation au montage ---------- */
onMounted(async () => {
  if (!token.value) {
    isLoading.value = false;
    errorMessage.value = t("data-collection.invalid-link");
    return;
  }
  await validateToken();
});

const validateToken = async () => {
  isLoading.value = true;
  try {
    const http = new HttpService(false);
    const { data, success, message } = await http.post("/client-data/validate-token", {
      token: token.value,
    });

    if (success && data) {
      isValidToken.value = true;
      orderId.value = data.order_id;
      userEmail.value = data.user?.email || "";
      prefillProgram.value =
        data.prefill?.order_context?.service_name || data.prefill?.order_context?.school_name || "";
      if (data.user?.name || data.prefill?.full_name)
        formData.value.full_name = data.user?.name || data.prefill?.full_name;
      if (data.user?.birth_date || data.prefill?.birth_date) {
        formData.value.birth_date = data.user?.birth_date || data.prefill?.birth_date;
        dobType.value = "date";
      }
      if (data.prefill?.country_of_residence) formData.value.country_of_residence = data.prefill.country_of_residence;
      formData.value.study_destination =
        data.prefill?.study_destination || data.prefill?.order_context?.school_country || "France";
    } else {
      isValidToken.value = false;
      if (message?.includes("already") || data?.is_complete) isAlreadyComplete.value = true;
      errorMessage.value = message || t("data-collection.invalid-link");
    }
  } catch (error: any) {
    isValidToken.value = false;
    errorMessage.value = error?.message || t("data-collection.error");
  } finally {
    isLoading.value = false;
  }
};

/* ---------- Interactions ---------- */
const onDobBlur = () => {
  if (!formData.value.birth_date) dobType.value = "text";
};

const onDoc = (key: DocKey, e: Event) => {
  const target = e.target as HTMLInputElement;
  docFiles.value[key] = target.files?.[0] || null;
};

const go = (n: number) => {
  current.value = Math.max(1, Math.min(4, n));
  window.scrollTo({ top: 0, behavior: "smooth" });
};

/* ---------- Validation (contrôle à la soumission) ---------- */
const errors = ref<Record<string, string>>({});

const stepFields: Record<number, { key: string; label: string }[]> = {
  1: [
    { key: "full_name", label: "Nom et prénoms" },
    { key: "country_of_residence", label: "Pays de résidence" },
    { key: "birth_date", label: "Date de naissance" },
    { key: "study_destination", label: "Destination d'étude" },
    { key: "diploma_type", label: "Diplôme à préparer" },
  ],
  2: [
    { key: "motivations", label: "Motivations" },
    { key: "objectives", label: "Objectifs" },
    { key: "start_period", label: "Période de début" },
    { key: "formation_duration", label: "Durée de la formation" },
    { key: "how_heard", label: "Comment vous nous avez connu" },
  ],
};

const requiredDocs: { key: DocKey; label: string }[] = [
  { key: "identity", label: "Passeport ou pièce d'identité" },
  { key: "diplomas", label: "Diplômes et relevés de notes" },
  { key: "cv", label: "CV à jour" },
  { key: "cover_letter", label: "Lettre de motivation" },
];

const requiredMsg = "Ce champ est requis.";
const requiredDocMsg = "Document requis.";

const validate = (): Record<string, string> => {
  const e: Record<string, string> = {};
  [1, 2].forEach((n) => {
    stepFields[n].forEach((f) => {
      const v = (formData.value as any)[f.key];
      if (!v || String(v).trim() === "") e[f.key] = requiredMsg;
    });
  });
  requiredDocs.forEach((d) => {
    if (!docFiles.value[d.key]) e[d.key] = requiredDocMsg;
  });
  errors.value = e;
  return e;
};

const firstInvalidStep = (e: Record<string, string>): number => {
  if (stepFields[1].some((f) => e[f.key])) return 1;
  if (stepFields[2].some((f) => e[f.key])) return 2;
  if (requiredDocs.some((d) => e[d.key])) return 3;
  return 3;
};

// Efface l'erreur d'un champ dès qu'il est renseigné.
watch(
  [formData, docFiles],
  () => {
    if (!Object.keys(errors.value).length) return;
    const e = { ...errors.value };
    [1, 2].forEach((n) =>
      stepFields[n].forEach((f) => {
        if (e[f.key] && String((formData.value as any)[f.key] ?? "").trim()) delete e[f.key];
      }),
    );
    requiredDocs.forEach((d) => {
      if (e[d.key] && docFiles.value[d.key]) delete e[d.key];
    });
    errors.value = e;
  },
  { deep: true },
);

const handleSubmit = async () => {
  const e = validate();
  if (Object.keys(e).length) {
    go(firstInvalidStep(e));
    return;
  }

  isSubmitting.value = true;
  try {
    const data = new FormData();
    if (token.value) data.append("token", token.value);
    else data.append("order_id", orderId.value);

    data.append("full_name", formData.value.full_name);
    data.append("country_of_residence", formData.value.country_of_residence);
    if (formData.value.birth_date) data.append("birth_date", formData.value.birth_date);
    data.append("study_destination", formData.value.study_destination);
    data.append("diploma_type", formData.value.diploma_type);
    data.append("motivations", formData.value.motivations);
    data.append("objectives", formData.value.objectives);
    data.append("start_period", formData.value.start_period);
    data.append("formation_duration", formData.value.formation_duration);
    data.append("how_heard", formData.value.how_heard);

    // Mapping vers les champs fichiers attendus par l'API
    const docFieldMap: Record<DocKey, string> = {
      identity: "id_document",
      diplomas: "transcripts",
      language_certificate: "language_certificate",
      cv: "cv",
      cover_letter: "cover_letter",
    };
    (Object.keys(docFiles.value) as DocKey[]).forEach((k) => {
      const f = docFiles.value[k];
      if (f) data.append(docFieldMap[k], f);
    });

    const http = new HttpService(!token.value);
    const endpoint = token.value ? "/client-data/store-via-token" : "/client-data/store";
    await http.post(endpoint, data);

    submittedAt.value = new Date().toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Affiche l'écran de succès (étape 4) après soumission.
    go(4);
  } finally {
    isSubmitting.value = false;
  }
};

const goHome = () => router.push(i18nRoute({ name: "home" }));
const goDashboard = () => router.push(i18nRoute({ name: "dashboard" }));
</script>

<template>
  <div class="dc-page">
    <!-- ===== Etats de validation du token ===== -->
    <div v-if="isLoading || isAlreadyComplete || !isValidToken" class="dc-status-wrap">
      <div class="dc-status">
        <template v-if="isLoading">
          <div class="dc-spinner"></div>
          <p class="dc-status-text">{{ t("data-collection.validating") }}</p>
        </template>
        <template v-else-if="isAlreadyComplete">
          <div class="dc-status-ic blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="m8 12 3 3 5-6"></path></svg>
          </div>
          <h1 class="dc-status-title">{{ t("data-collection.already-complete-title") }}</h1>
          <p class="dc-status-msg">{{ t("data-collection.already-complete-message") }}</p>
          <button class="btn btn-primary" @click="goHome">{{ t("back-to-home") }}</button>
        </template>
        <template v-else>
          <div class="dc-status-ic red">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4M12 17h.01"></path><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"></path></svg>
          </div>
          <h1 class="dc-status-title">{{ t("data-collection.error-title") }}</h1>
          <p class="dc-status-msg">{{ errorMessage }}</p>
          <button class="btn btn-primary" @click="goHome">{{ t("back-to-home") }}</button>
        </template>
      </div>
    </div>

    <!-- ===== Design (sidebar + contenu) ===== -->
    <div v-else class="dc-app">
      <div class="layout">
        <!-- ---------- SIDEBAR ---------- -->
        <aside class="sidebar">
          <h1>Construisons<br />votre avenir<br /><span class="accent">ensemble</span></h1>
          <div class="rule"></div>
          <p v-if="current === 4" class="intro">
            Merci pour la confiance que vous nous accordez. Nous avons bien reçu l'ensemble de vos informations et
            documents. <strong>Notre équipe va maintenant analyser votre projet.</strong>
          </p>
          <p v-else class="intro">
            Merci de compléter ces informations pour nous permettre d'analyser votre projet et de vous offrir un
            accompagnement sur-mesure.
          </p>

          <div class="illus">
            <span class="orbit o-globe"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"></circle><path d="M3 12h18M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18Z"></path></svg></span>
            <span class="orbit o-grad"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 9 12 5 2 9l10 4 10-4Z"></path><path d="M6 11v5c0 1 2.5 2.5 6 2.5s6-1.5 6-2.5v-5"></path></svg></span>
            <span class="orbit o-plane"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5a2.1 2.1 0 0 0-3-3L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.3-.1.7.2.9L8 11l-1.5 2.5L4 13l-1 1 3 2 2 3 1-1-.5-2.5L11 15l3 4.5c.2.3.6.4.9.2l.5-.3c.4-.2.5-.7.4-1.2Z"></path></svg></span>
            <span class="orbit o-bank"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M4 10h16M5 21V10M19 21V10M9 21V10M15 21V10M12 3 4 8h16Z"></path></svg></span>
            <div class="figure">[ illustration étudiant ]<br />remplacer par<br />visuel Qiryna</div>
          </div>

          <div class="secure-card">
            <span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 4 6v6c0 5 3.4 8.5 8 10 4.6-1.5 8-5 8-10V6l-8-4Z"></path><path d="m9 12 2 2 4-4"></path></svg></span>
            <div>
              <h4>Vos données sont sécurisées</h4>
              <p>Vos informations sont protégées et ne seront jamais partagées.</p>
            </div>
          </div>
        </aside>

        <!-- ---------- CONTENT ---------- -->
        <main class="content">
          <div class="page-head">
            <h2>Collecte d'informations</h2>
            <p>Parcours Fiche École</p>
          </div>

          <!-- Stepper -->
          <div class="stepper">
            <div class="steps">
              <div class="track"><div class="fill" :style="{ width: trackFill }"></div></div>
              <div class="step" :class="stepState(1)">
                <div class="dot">
                  <svg v-if="stepState(1) === 'done'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 6"></path></svg>
                  <span v-else class="num">1</span>
                </div>
                <div class="lbl">Infos Générales</div>
              </div>
              <div class="step" :class="stepState(2)">
                <div class="dot">
                  <svg v-if="stepState(2) === 'done'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 6"></path></svg>
                  <span v-else class="num">2</span>
                </div>
                <div class="lbl">Projet d'étude</div>
              </div>
              <div class="step" :class="stepState(3)">
                <div class="dot">
                  <svg v-if="stepState(3) === 'done'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 6"></path></svg>
                  <span v-else class="num">3</span>
                </div>
                <div class="lbl">Documents</div>
              </div>
            </div>
          </div>

          <!-- Programme banner (étapes 1-3) -->
          <div v-if="current !== 4" class="programme">
            <span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"></rect><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><path d="M3 12h18"></path></svg></span>
            <span>Programme sélectionné : <b>{{ programName }}</b></span>
          </div>

          <!-- =============== STEP 1 =============== -->
          <section v-show="current === 1" class="step-pane show">
            <div class="form-card no-card">
              <div class="section-title">
                <span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"></circle><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"></path></svg></span>
                <h3>Informations générales</h3>
              </div>
              <div class="divider"></div>

              <div class="grid-2">
                <div class="field">
                  <label><span class="req">*</span>Nom et prénoms</label>
                  <div class="control" :class="{ invalid: errors.full_name }"><input v-model="formData.full_name" type="text" class="filled" /></div>
                  <p v-if="errors.full_name" class="err-text">{{ errors.full_name }}</p>
                </div>
                <div class="field">
                  <label><span class="req">*</span>Pays de résidence</label>
                  <div class="control" :class="{ filled: formData.country_of_residence, invalid: errors.country_of_residence }">
                    <select v-model="formData.country_of_residence">
                      <option value="">Ex : France, Maroc, Sénégal…</option>
                      <option>France</option>
                      <option>Maroc</option>
                      <option>Sénégal</option>
                      <option>Côte d'Ivoire</option>
                    </select>
                    <span class="chev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"></path></svg></span>
                  </div>
                  <p v-if="errors.country_of_residence" class="err-text">{{ errors.country_of_residence }}</p>
                </div>
                <div class="field">
                  <label><span class="req">*</span>Date de naissance</label>
                  <div class="control" :class="{ invalid: errors.birth_date }">
                    <span class="lead"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"></rect><path d="M16 2v4M8 2v4M3 10h18"></path></svg></span>
                    <input
                      v-model="formData.birth_date"
                      :type="dobType"
                      placeholder="JJ/MM/AAAA"
                      @focus="dobType = 'date'"
                      @blur="onDobBlur"
                    />
                  </div>
                  <p v-if="errors.birth_date" class="err-text">{{ errors.birth_date }}</p>
                </div>
                <div class="field">
                  <label><span class="req">*</span>Destination d'étude</label>
                  <div class="control" :class="{ invalid: errors.study_destination }"><input v-model="formData.study_destination" type="text" class="filled" /></div>
                  <p v-if="errors.study_destination" class="err-text">{{ errors.study_destination }}</p>
                </div>
              </div>

              <div class="field last" style="margin-top: 4px">
                <label><span class="req">*</span>Diplôme que vous souhaitez préparer</label>
                <div class="choices">
                  <button
                    v-for="d in diplomaTypes"
                    :key="d.value"
                    type="button"
                    class="choice"
                    :class="{ sel: formData.diploma_type === d.value }"
                    @click="formData.diploma_type = d.value"
                  >
                    <svg v-if="d.value === 'licence'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 9 12 5 2 9l10 4 10-4Z"></path><path d="M6 11v5c0 1 2.5 2.5 6 2.5s6-1.5 6-2.5v-5"></path></svg>
                    <svg v-else-if="d.value === 'master'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 5a2 2 0 0 1 2-2h6v16H4a2 2 0 0 0-2 2V5Z"></path><path d="M22 5a2 2 0 0 0-2-2h-6v16h6a2 2 0 0 1 2 2V5Z"></path></svg>
                    <svg v-else-if="d.value === 'master_specialise'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="6"></circle><path d="M9 14.5 8 22l4-2 4 2-1-7.5"></path></svg>
                    <svg v-else-if="d.value === 'mba'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"></rect><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><path d="M3 12h18"></path></svg>
                    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 9 12 5 2 9l10 4 10-4Z"></path><path d="M6 11v5c0 1 2.5 2.5 6 2.5s6-1.5 6-2.5v-5"></path><path d="M22 9v5"></path></svg>
                    {{ d.label }}
                  </button>
                </div>
                <p v-if="errors.diploma_type" class="err-text">{{ errors.diploma_type }}</p>
              </div>

              <div class="actions end">
                <button class="btn btn-primary" @click="go(2)">
                  Suivant
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>
                </button>
              </div>
            </div>
          </section>

          <!-- =============== STEP 2 =============== -->
          <section v-show="current === 2" class="step-pane show">
            <div class="form-card no-card">
              <div class="section-title">
                <span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 5a2 2 0 0 1 2-2h6v16H4a2 2 0 0 0-2 2V5Z"></path><path d="M22 5a2 2 0 0 0-2-2h-6v16h6a2 2 0 0 1 2 2V5Z"></path></svg></span>
                <h3>Projet d'étude</h3>
              </div>
              <div class="divider"></div>

              <div class="field">
                <label><span class="req">*</span>Pourquoi avez-vous choisi cette formation ?</label>
                <div class="area-wrap">
                  <textarea v-model="formData.motivations" class="area" :class="{ invalid: errors.motivations }" maxlength="500" placeholder="Expliquez vos motivations…"></textarea>
                  <span class="counter">{{ formData.motivations.length }}/500</span>
                </div>
                <p v-if="errors.motivations" class="err-text">{{ errors.motivations }}</p>
              </div>

              <div class="field">
                <label><span class="req">*</span>Quels sont vos objectifs après l'obtention du diplôme ?</label>
                <div class="area-wrap">
                  <textarea v-model="formData.objectives" class="area" :class="{ invalid: errors.objectives }" maxlength="500" placeholder="Décrivez vos objectifs professionnels…"></textarea>
                  <span class="counter">{{ formData.objectives.length }}/500</span>
                </div>
                <p v-if="errors.objectives" class="err-text">{{ errors.objectives }}</p>
              </div>

              <div class="grid-2">
                <div class="field">
                  <label><span class="req">*</span>Quand souhaitez-vous commencer vos études ?</label>
                  <div class="control" :class="{ filled: formData.start_period, invalid: errors.start_period }">
                    <span class="lead"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"></rect><path d="M16 2v4M8 2v4M3 10h18"></path></svg></span>
                    <select v-model="formData.start_period">
                      <option value="">Sélectionner une période</option>
                      <option>Rentrée Septembre 2026</option>
                      <option>Rentrée Janvier 2027</option>
                      <option>Rentrée Septembre 2027</option>
                    </select>
                    <span class="chev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"></path></svg></span>
                  </div>
                  <p v-if="errors.start_period" class="err-text">{{ errors.start_period }}</p>
                </div>
                <div class="field">
                  <label><span class="req">*</span>Durée de la formation souhaitée</label>
                  <div class="control" :class="{ filled: formData.formation_duration, invalid: errors.formation_duration }">
                    <select v-model="formData.formation_duration">
                      <option value="">Sélectionner</option>
                      <option>6 mois</option>
                      <option>1 an</option>
                      <option>2 ans</option>
                      <option>3 ans et plus</option>
                    </select>
                    <span class="chev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"></path></svg></span>
                  </div>
                  <p v-if="errors.formation_duration" class="err-text">{{ errors.formation_duration }}</p>
                </div>
              </div>

              <div class="field last">
                <label><span class="req">*</span>Comment avez-vous connu Qiryna ?</label>
                <div class="control" :class="{ filled: formData.how_heard, invalid: errors.how_heard }">
                  <select v-model="formData.how_heard">
                    <option value="">Sélectionner une option</option>
                    <option>Réseaux sociaux</option>
                    <option>Recommandation d'un proche</option>
                    <option>Recherche Google</option>
                    <option>Salon étudiant</option>
                    <option>Autre</option>
                  </select>
                  <span class="chev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"></path></svg></span>
                </div>
                <p v-if="errors.how_heard" class="err-text">{{ errors.how_heard }}</p>
              </div>

              <div class="actions">
                <button class="btn btn-ghost" @click="go(1)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"></path></svg>
                  Précédent
                </button>
                <button class="btn btn-primary" @click="go(3)">
                  Suivant
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>
                </button>
              </div>
            </div>
          </section>

          <!-- =============== STEP 3 =============== -->
          <section v-show="current === 3" class="step-pane show">
            <div class="form-card no-card">
              <div class="section-title">
                <span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"></path><path d="M14 2v6h6M9 13h6M9 17h6"></path></svg></span>
                <h3>Documents requis</h3>
              </div>
              <p class="doc-sub">Merci de télécharger les documents ci-dessous.<br />Assurez-vous qu'ils soient lisibles et à jour.</p>

              <div class="doc-row" :class="{ invalid: errors.identity }">
                <span class="dic c-teal"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"></rect><circle cx="12" cy="10" r="2.5"></circle><path d="M8 17c.7-1.8 2.2-3 4-3s3.3 1.2 4 3"></path></svg></span>
                <div class="meta"><h4>Passeport ou pièce d'identité</h4><p>Format accepté : PDF, JPG, PNG (Max. 5Mo)</p><p v-if="errors.identity" class="err-text">{{ errors.identity }}</p></div>
                <label class="btn-upload" :class="{ uploaded: docFiles.identity }">
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" hidden @change="onDoc('identity', $event)" />
                  <svg v-if="docFiles.identity" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 6"></path></svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 9l5-5 5 5M12 4v12"></path></svg>
                  {{ docFiles.identity ? "Ajouté" : "Télécharger" }}
                </label>
              </div>

              <div class="doc-row" :class="{ invalid: errors.diplomas }">
                <span class="dic c-green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"></path><path d="M14 2v6h6M9 15l2 2 4-4"></path></svg></span>
                <div class="meta"><h4>Diplômes et relevés de notes</h4><p>Format accepté : PDF (Max. 10Mo)</p><p v-if="errors.diplomas" class="err-text">{{ errors.diplomas }}</p></div>
                <label class="btn-upload" :class="{ uploaded: docFiles.diplomas }">
                  <input type="file" accept=".pdf" hidden @change="onDoc('diplomas', $event)" />
                  <svg v-if="docFiles.diplomas" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 6"></path></svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 9l5-5 5 5M12 4v12"></path></svg>
                  {{ docFiles.diplomas ? "Ajouté" : "Télécharger" }}
                </label>
              </div>

              <div class="doc-row">
                <span class="dic c-amber"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"></path><path d="M14 2v6h6"></path><circle cx="10" cy="14" r="2"></circle><path d="m10 16-1.5 4 1.5-1 1.5 1L10 16Z"></path></svg></span>
                <div class="meta"><h4>Certificat de langue (si disponible)</h4><p>Format accepté : PDF (Max. 5Mo)</p></div>
                <label class="btn-upload" :class="{ uploaded: docFiles.language_certificate }">
                  <input type="file" accept=".pdf" hidden @change="onDoc('language_certificate', $event)" />
                  <svg v-if="docFiles.language_certificate" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 6"></path></svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 9l5-5 5 5M12 4v12"></path></svg>
                  {{ docFiles.language_certificate ? "Ajouté" : "Télécharger" }}
                </label>
              </div>

              <div class="doc-row" :class="{ invalid: errors.cv }">
                <span class="dic c-blue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"></path><path d="M14 2v6h6M8 13h8M8 17h5"></path></svg></span>
                <div class="meta"><h4>CV à jour</h4><p>Format accepté : PDF (Max. 5Mo)</p><p v-if="errors.cv" class="err-text">{{ errors.cv }}</p></div>
                <label class="btn-upload" :class="{ uploaded: docFiles.cv }">
                  <input type="file" accept=".pdf" hidden @change="onDoc('cv', $event)" />
                  <svg v-if="docFiles.cv" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 6"></path></svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 9l5-5 5 5M12 4v12"></path></svg>
                  {{ docFiles.cv ? "Ajouté" : "Télécharger" }}
                </label>
              </div>

              <div class="doc-row" :class="{ invalid: errors.cover_letter }">
                <span class="dic c-violet"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"></path><path d="M14 2v6h6"></path><path d="M11.5 11 9 13.5 11.5 16M13 11l-1 6"></path></svg></span>
                <div class="meta"><h4>Lettre de motivation</h4><p>Format accepté : PDF (Max. 5Mo)</p><p v-if="errors.cover_letter" class="err-text">{{ errors.cover_letter }}</p></div>
                <label class="btn-upload" :class="{ uploaded: docFiles.cover_letter }">
                  <input type="file" accept=".pdf" hidden @change="onDoc('cover_letter', $event)" />
                  <svg v-if="docFiles.cover_letter" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 6"></path></svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 9l5-5 5 5M12 4v12"></path></svg>
                  {{ docFiles.cover_letter ? "Ajouté" : "Télécharger" }}
                </label>
              </div>

              <div class="info-box">
                <span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4M12 8h.01"></path></svg></span>
                <div>
                  <h4>Informations importantes</h4>
                  <ul>
                    <li>Tous les documents doivent être en français ou en anglais.</li>
                    <li>Les fichiers doivent être nets et lisibles.</li>
                    <li>Vous pourrez ajouter d'autres documents à l'étape suivante si nécessaire.</li>
                  </ul>
                </div>
              </div>

              <div class="actions">
                <button class="btn btn-ghost" @click="go(2)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"></path></svg>
                  Précédent
                </button>
                <button class="btn btn-primary" :disabled="isSubmitting" @click="handleSubmit">
                  {{ isSubmitting ? "Envoi…" : "Soumettre" }}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>
                </button>
              </div>
            </div>
          </section>

          <!-- =============== STEP 4 — SUCCESS =============== -->
          <section v-show="current === 4" class="step-pane show">
            <div class="panel success">
              <div class="check">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m4 12 5 5L20 6"></path></svg>
              </div>
              <h3>Merci ! Votre dossier a bien été soumis.</h3>
              <p>Nous avons reçu l'ensemble de vos informations et documents.</p>

              <div class="next-box">
                <span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"></circle><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"></path><circle cx="17.5" cy="9" r="2.6"></circle><path d="M21 19c0-2.6-1.7-4.8-4-5.5"></path></svg></span>
                <div>
                  <h4>Et ensuite ?</h4>
                  <p>Notre équipe va analyser votre projet avec attention. Vous recevrez un e-mail sous 2 à 3 jours ouvrés avec nos premiers retours et les prochaines étapes pour débuter votre accompagnement.</p>
                </div>
              </div>

              <div class="recap">
                <div class="recap-head">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"></path><path d="M14 2v6h6M9 13h6M9 17h6"></path></svg>
                  <h4>Récapitulatif de votre soumission</h4>
                </div>
                <div class="recap-grid">
                  <div class="chk"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="m8 12 3 3 5-6"></path></svg>Informations générales</div>
                  <div class="info"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"></rect><path d="M16 2v4M8 2v4M3 10h18"></path></svg><div><div class="k">Date de soumission</div><div class="v">{{ submittedAt }}</div></div></div>
                  <div class="chk"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="m8 12 3 3 5-6"></path></svg>Projet d'étude</div>
                  <div class="info"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"></rect><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18"></path></svg><div><div class="k">Programme sélectionné</div><div class="v red">{{ programName }}</div></div></div>
                  <div class="chk"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="m8 12 3 3 5-6"></path></svg>Documents requis</div>
                </div>
              </div>

              <div class="email-row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m3 7 9 6 9-6"></path></svg>
                Un récapitulatif vous a été envoyé par e-mail à <b>{{ maskedEmail }}</b>
              </div>
            </div>
          </section>

          <!-- Help footer -->
          <div class="help">
            <span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 22h4"></path><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V18h6v-1.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2Z"></path></svg></span>
            <div class="txt">
              <h4>Besoin d'aide ?</h4>
              <p>Notre équipe est disponible pour vous accompagner à chaque étape.</p>
            </div>
            <router-link :to="i18nRoute({ name: 'contact' })" class="btn-contact">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.5 8.5 0 0 1-3.9-.9L3 20l1.1-4.1A8.4 8.4 0 1 1 21 11.5Z"></path></svg>
              Contactez-nous
            </router-link>
          </div>

          <!-- Retour au tableau de bord (après l'aide, uniquement sur l'écran de succès) -->
          <div v-if="current === 4" class="actions end">
            <button class="btn btn-primary" @click="goDashboard">
              Retour au tableau de bord
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>
            </button>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* ===========================================================
   Qiryna — Collecte d'informations (design handoff)
   =========================================================== */
.dc-page {
  --red: #f5343f;
  --red-dark: #e11d2a;
  --red-soft: #ffe9ea;
  --red-soft-2: #fff1f1;
  --navy: #16224f;
  --navy-soft: #3c476e;
  --ink: #1b2238;
  --muted: #6b7280;
  --muted-2: #9aa1ae;
  --line: #e7e9ef;
  --line-soft: #eff1f5;
  --field-bg: #ffffff;
  --page: #f6f7fa;
  --white: #ffffff;
  --green: #16a34a;
  --green-soft: #e9f8ef;
  --blue: #2f6bff;
  --blue-soft: #eaf1ff;
  --amber: #e6a100;
  --amber-soft: #fff4d6;
  --teal: #0fa3a3;
  --violet: #7c5cff;
  --violet-soft: #efebff;
  --peach-1: #fbe1da;
  --peach-2: #fcede9;
  --peach-3: #fdf4f1;
  --radius: 16px;
  --radius-lg: 22px;
  --radius-sm: 12px;
  --shadow: 0 18px 50px -28px rgba(22, 34, 79, 0.3);
  --shadow-sm: 0 6px 20px -12px rgba(22, 34, 79, 0.25);

  font-family: "Poppins", system-ui, sans-serif;
  color: var(--ink);
  background: #eceef3;
  font-size: 15px;
  line-height: 1.55;
  min-height: 100vh;
  padding-top: 72px; /* dégage la NavBar globale */

  * {
    box-sizing: border-box;
  }
  a {
    color: inherit;
    text-decoration: none;
  }
  button {
    font-family: inherit;
    cursor: pointer;
  }
}

/* ---------- App shell ---------- */
.dc-app {
  max-width: 100%;
  margin: 0 auto;
  background: var(--white);
  box-shadow: 0 0 80px -40px rgba(22, 34, 79, 0.4);
}
.layout {
  display: grid;
  grid-template-columns: 372px 1fr;
}

/* ---------- Sidebar ---------- */
.sidebar {
  background: radial-gradient(120% 60% at 0% 0%, var(--peach-1) 0%, var(--peach-2) 38%, var(--peach-3) 100%);
  padding: 48px 40px 36px;
  display: flex;
  flex-direction: column;
  position: relative;
}
.sidebar h1 {
  font-size: 34px;
  line-height: 1.12;
  font-weight: 700;
  color: var(--navy);
  margin: 0 0 18px;
  letter-spacing: -0.02em;
}
.sidebar h1 .accent {
  color: var(--red);
}
.sidebar .rule {
  width: 56px;
  height: 4px;
  background: var(--red);
  border-radius: 4px;
  margin-bottom: 22px;
}
.sidebar .intro {
  color: var(--navy-soft);
  font-size: 15px;
  max-width: 290px;
}
.sidebar .intro strong {
  color: var(--navy);
  font-weight: 600;
}
.illus {
  position: relative;
  margin: 26px 0 auto;
  min-height: 300px;
}
.illus .figure {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 300px;
  aspect-ratio: 1/1;
  border-radius: 20px;
  background: repeating-linear-gradient(135deg, #f8d8cf 0 11px, #fbe3dc 11px 22px);
  display: grid;
  place-items: center;
  color: #c98c7e;
  text-align: center;
  font-family: "Roboto Mono", monospace;
  font-size: 11.5px;
  letter-spacing: 0.04em;
  padding: 14px;
}
.illus .orbit {
  position: absolute;
  inset: -6px -6px auto auto;
  width: 46px;
  height: 46px;
  border-radius: 14px;
  background: var(--color-surface);
  display: grid;
  place-items: center;
  box-shadow: 0 10px 24px -12px rgba(22, 34, 79, 0.4);
  z-index: 3;
}
.illus .orbit svg {
  width: 22px;
  height: 22px;
}
.orbit.o-globe {
  top: -8px;
  left: 130px;
  color: var(--teal);
}
.orbit.o-grad {
  top: 70px;
  left: -10px;
  color: var(--blue);
}
.orbit.o-plane {
  top: 30px;
  right: -4px;
  left: auto;
  color: var(--navy);
}
.orbit.o-bank {
  top: 150px;
  right: -8px;
  left: auto;
  color: var(--teal);
}
.secure-card {
  margin-top: 26px;
  background: rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: var(--radius);
  padding: 20px 22px;
  display: flex;
  gap: 14px;
  box-shadow: 0 14px 40px -26px rgba(22, 34, 79, 0.4);
}
.secure-card .ic {
  flex: none;
  width: 40px;
  height: 40px;
  border-radius: 11px;
  background: var(--red-soft);
  color: var(--red);
  display: grid;
  place-items: center;
}
.secure-card .ic svg {
  width: 20px;
  height: 20px;
}
.secure-card h4 {
  margin: 2px 0 5px;
  font-size: 14.5px;
  color: var(--navy);
  font-weight: 600;
}
.secure-card p {
  margin: 0;
  font-size: 13px;
  color: var(--navy-soft);
  line-height: 1.5;
}

/* ---------- Content ---------- */
.content {
  background: var(--white);
  padding: 40px 56px 44px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}
.page-head {
  text-align: center;
  margin-bottom: 4px;
}
.page-head h2 {
  margin: 0 0 4px;
  font-size: 28px;
  font-weight: 700;
  color: var(--navy);
  letter-spacing: -0.01em;
}
.page-head p {
  margin: 0;
  color: var(--muted);
  font-size: 15px;
}

/* Stepper */
.stepper {
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  padding: 30px 56px 24px;
  box-shadow: var(--shadow-sm);
}
.steps {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  position: relative;
}
.steps .track {
  position: absolute;
  top: 19px;
  left: 6%;
  right: 6%;
  height: 3px;
  background: var(--line);
  border-radius: 3px;
  z-index: 0;
}
.steps .track .fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: var(--red);
  border-radius: 3px;
  transition: width 0.4s ease;
}
.step {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 120px;
}
.step .dot {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-surface);
  border: 3px solid var(--line);
  color: var(--muted-2);
  font-weight: 700;
  font-size: 16px;
  display: grid;
  place-items: center;
  transition: 0.25s;
}
.step .dot svg {
  width: 20px;
  height: 20px;
}
.step .lbl {
  font-size: 14.5px;
  font-weight: 600;
  color: var(--muted-2);
  white-space: nowrap;
}
.step.active .dot {
  border-color: var(--red);
  color: var(--red);
  box-shadow: 0 0 0 5px var(--red-soft-2);
}
.step.active .lbl {
  color: var(--red);
}
.step.done .dot {
  border-color: var(--red);
  background: var(--red);
  color: #fff;
}
.step.done .lbl {
  color: var(--red);
}

/* Cards / panels */
.panel {
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}
.programme {
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 16px 22px;
  box-shadow: var(--shadow-sm);
}
.programme .ic {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: var(--red-soft);
  color: var(--red);
  display: grid;
  place-items: center;
  flex: none;
}
.programme .ic svg {
  width: 19px;
  height: 19px;
}
.programme span {
  font-size: 15px;
  color: var(--navy);
  font-weight: 600;
}
.programme span b {
  color: var(--red);
}

/* Form card */
.form-card {
  padding: 30px 34px 32px;
}
/* Étape "Informations générales" : pas d'aspect carte (ni fond, ni bordure, ni ombre) */
.form-card.no-card {
  background: transparent;
  border: none;
  box-shadow: none;
  border-radius: 0;
  padding: 4px 0 0;
}
.section-title {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 6px;
}
.section-title .ic {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: var(--red-soft);
  color: var(--red);
  display: grid;
  place-items: center;
  flex: none;
}
.section-title .ic svg {
  width: 21px;
  height: 21px;
}
.section-title h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--navy);
}
.divider {
  height: 1px;
  background: var(--line-soft);
  margin: 18px 0 24px;
}
.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 22px 28px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 9px;
  margin-bottom: 22px;
}
.field.last {
  margin-bottom: 0;
}
.field label {
  font-size: 14.5px;
  font-weight: 600;
  color: var(--navy);
}
.field label .req {
  color: var(--red);
  margin-right: 2px;
}
.control {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--field-bg);
  border: 1.5px solid var(--line);
  border-radius: var(--radius-sm);
  padding: 0 16px;
  height: 52px;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}
.control:focus-within {
  border-color: var(--red);
  box-shadow: 0 0 0 4px var(--red-soft-2);
}
.control .lead {
  color: var(--muted-2);
  display: grid;
  place-items: center;
  flex: none;
}
.control .lead svg {
  width: 18px;
  height: 18px;
}
.control .chev {
  margin-left: auto;
  color: var(--muted-2);
  flex: none;
  pointer-events: none;
}
.control .chev svg {
  width: 18px;
  height: 18px;
}
.control input,
.control select {
  border: none;
  outline: none;
  background: transparent;
  font-family: inherit;
  font-size: 15px;
  color: var(--ink);
  width: 100%;
  height: 100%;
}
.control select {
  appearance: none;
  cursor: pointer;
  color: var(--muted);
}
.control input::placeholder {
  color: var(--muted-2);
}
.control input.filled,
.control.filled select {
  color: var(--ink);
}
textarea.area {
  border: 1.5px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--field-bg);
  padding: 14px 16px;
  resize: vertical;
  font-family: inherit;
  font-size: 15px;
  color: var(--ink);
  min-height: 118px;
  width: 100%;
  outline: none;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}
textarea.area:focus {
  border-color: var(--red);
  box-shadow: 0 0 0 4px var(--red-soft-2);
}
textarea.area::placeholder {
  color: var(--muted-2);
}

/* États d'erreur (validation à la soumission) */
.control.invalid,
textarea.area.invalid {
  border-color: var(--red);
  box-shadow: 0 0 0 4px var(--red-soft-2);
}
.doc-row.invalid {
  border-color: var(--red);
  background: var(--red-soft-2);
}
.err-text {
  color: var(--red);
  font-size: 12.5px;
  font-weight: 500;
  margin: 4px 0 0;
}
.area-wrap {
  position: relative;
}
.counter {
  position: absolute;
  right: 14px;
  bottom: 12px;
  font-size: 12.5px;
  color: var(--muted-2);
}

/* Diplome cards */
.choices {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
  margin-top: 2px;
}
.choice {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 9px;
  background: var(--white);
  border: 1.5px solid var(--line);
  border-radius: var(--radius-sm);
  padding: 14px 12px;
  min-height: 56px;
  font-size: 14px;
  font-weight: 500;
  color: var(--navy);
  transition: 0.15s;
  text-align: left;
}
.choice svg {
  width: 22px;
  height: 22px;
  color: var(--muted);
  flex: none;
}
.choice:hover {
  border-color: #f7aeb2;
  background: var(--red-soft-2);
}
.choice.sel {
  border-color: var(--red);
  background: var(--red-soft-2);
  color: var(--red);
  box-shadow: 0 0 0 3px var(--red-soft-2);
}
.choice.sel svg {
  color: var(--red);
}

/* Buttons row */
.actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 28px;
}
.actions.end {
  justify-content: flex-end;
}
.btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  font-size: 15px;
  border-radius: var(--radius-sm);
  padding: 13px 26px;
  border: none;
  transition: 0.14s;
}
.btn svg {
  width: 18px;
  height: 18px;
}
.btn-primary {
  background: var(--red);
  color: #fff;
  box-shadow: 0 12px 26px -12px rgba(245, 52, 63, 0.75);
}
.btn-primary:hover:not(:disabled) {
  background: var(--red-dark);
  transform: translateY(-1px);
}
.btn-primary:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
.btn-ghost {
  background: var(--color-surface);
  color: var(--navy);
  border: 1.5px solid var(--line);
}
.btn-ghost:hover {
  border-color: var(--muted-2);
}

/* Documents */
.doc-sub {
  color: var(--muted);
  font-size: 14px;
  margin: 2px 0 20px;
  line-height: 1.5;
}
.doc-row {
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1.5px solid var(--line);
  border-radius: var(--radius-sm);
  padding: 16px 18px;
  margin-bottom: 14px;
  background: var(--color-surface);
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}
.doc-row:hover {
  border-color: #d7dbe6;
  box-shadow: var(--shadow-sm);
}
.doc-row .dic {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  flex: none;
}
.doc-row .dic svg {
  width: 22px;
  height: 22px;
}
.doc-row .meta {
  flex: 1;
}
.doc-row .meta h4 {
  margin: 0 0 3px;
  font-size: 15px;
  font-weight: 600;
  color: var(--navy);
}
.doc-row .meta p {
  margin: 0;
  font-size: 13px;
  color: var(--muted);
}
.btn-upload {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  background: var(--color-surface);
  border: 1.5px solid var(--line);
  color: var(--navy);
  font-weight: 600;
  font-size: 14px;
  padding: 11px 18px;
  border-radius: 10px;
  transition: 0.15s;
  white-space: nowrap;
  cursor: pointer;
}
.btn-upload svg {
  width: 16px;
  height: 16px;
}
.btn-upload:hover {
  border-color: var(--red);
  color: var(--red);
}
.btn-upload.uploaded {
  border-color: var(--green);
  color: var(--green);
  background: var(--green-soft);
}
.dic.c-blue {
  background: var(--blue-soft);
  color: var(--blue);
}
.dic.c-green {
  background: var(--green-soft);
  color: var(--green);
}
.dic.c-amber {
  background: var(--amber-soft);
  color: var(--amber);
}
.dic.c-teal {
  background: #e5f6f6;
  color: var(--teal);
}
.dic.c-violet {
  background: var(--violet-soft);
  color: var(--violet);
}
.info-box {
  display: flex;
  gap: 14px;
  background: var(--blue-soft);
  border: 1px solid #d6e4ff;
  border-radius: var(--radius-sm);
  padding: 18px 20px;
  margin-top: 22px;
}
.info-box .ic {
  color: var(--blue);
  flex: none;
}
.info-box .ic svg {
  width: 20px;
  height: 20px;
}
.info-box h4 {
  margin: 0 0 8px;
  font-size: 14.5px;
  color: var(--blue);
  font-weight: 600;
}
.info-box ul {
  margin: 0;
  padding-left: 18px;
  color: var(--navy-soft);
  font-size: 13.5px;
}
.info-box li {
  margin-bottom: 4px;
}

/* Help footer */
.help {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 18px 24px;
  box-shadow: var(--shadow-sm);
}
.help .ic {
  width: 42px;
  height: 42px;
  border-radius: 11px;
  flex: none;
  background: var(--violet-soft);
  color: var(--violet);
  display: grid;
  place-items: center;
}
.help .ic svg {
  width: 21px;
  height: 21px;
}
.help .txt h4 {
  margin: 0 0 2px;
  font-size: 15px;
  font-weight: 600;
  color: var(--navy);
}
.help .txt p {
  margin: 0;
  font-size: 13.5px;
  color: var(--muted);
}
.help .btn-contact {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  background: var(--red-soft);
  color: var(--red);
  border: none;
  font-weight: 600;
  font-size: 14px;
  padding: 11px 18px;
  border-radius: 10px;
  transition: 0.15s;
}
.help .btn-contact:hover {
  background: var(--red);
  color: #fff;
}
.help .btn-contact svg {
  width: 16px;
  height: 16px;
}

/* Success */
.success {
  padding: 44px 40px 40px;
  text-align: center;
}
.success .check {
  width: 92px;
  height: 92px;
  border-radius: 50%;
  background: var(--green-soft);
  display: grid;
  place-items: center;
  margin: 0 auto 22px;
}
.success .check svg {
  width: 50px;
  height: 50px;
  color: var(--green);
}
.success h3 {
  margin: 0 0 8px;
  font-size: 26px;
  font-weight: 700;
  color: var(--navy);
}
.success > p {
  margin: 0 auto 26px;
  font-size: 16px;
  color: var(--muted);
  max-width: 460px;
}
.next-box {
  display: flex;
  gap: 16px;
  text-align: left;
  background: var(--green-soft);
  border: 1px solid #cfefd9;
  border-radius: var(--radius);
  padding: 20px 24px;
  margin: 0 auto 18px;
  max-width: 720px;
}
.next-box .ic {
  color: var(--navy);
  flex: none;
  margin-top: 2px;
}
.next-box .ic svg {
  width: 26px;
  height: 26px;
}
.next-box h4 {
  margin: 0 0 6px;
  font-size: 15px;
  color: var(--navy);
  font-weight: 600;
}
.next-box p {
  margin: 0;
  font-size: 13.5px;
  color: var(--navy-soft);
  line-height: 1.6;
}
.recap {
  text-align: left;
  background: #f7f8fb;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 22px 26px;
  margin: 0 auto 16px;
  max-width: 720px;
}
.recap .recap-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}
.recap .recap-head svg {
  width: 20px;
  height: 20px;
  color: var(--blue);
}
.recap .recap-head h4 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--navy);
}
.recap-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 24px;
}
.recap-grid .chk {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: var(--navy);
}
.recap-grid .chk svg {
  width: 18px;
  height: 18px;
  color: var(--green);
  flex: none;
}
.recap-grid .info {
  display: flex;
  gap: 10px;
}
.recap-grid .info svg {
  width: 18px;
  height: 18px;
  color: var(--muted-2);
  margin-top: 2px;
  flex: none;
}
.recap-grid .info .k {
  font-size: 12.5px;
  color: var(--muted);
}
.recap-grid .info .v {
  font-size: 14px;
  font-weight: 600;
  color: var(--navy);
}
.recap-grid .info .v.red {
  color: var(--red);
}
.email-row {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
  background: var(--color-surface);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 15px 22px;
  margin: 0 auto;
  max-width: 720px;
  font-size: 14px;
  color: var(--navy);
}
.email-row svg {
  width: 19px;
  height: 19px;
  color: var(--muted-2);
}
.email-row b {
  color: var(--navy);
}

/* step visibility */
.step-pane.show {
  display: block;
  animation: fade 0.35s ease;
}
@keyframes fade {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

/* ===== Etats de validation du token ===== */
.dc-status-wrap {
  max-width: 100%;
  margin: 0 auto;
  padding: 60px 24px;
}
.dc-status {
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  min-height: 50vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 48px;
  gap: 10px;
}
.dc-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--line);
  border-top-color: var(--red);
  border-radius: 50%;
  animation: dc-spin 0.8s linear infinite;
}
@keyframes dc-spin {
  to {
    transform: rotate(360deg);
  }
}
.dc-status-text {
  color: var(--muted);
  font-size: 14px;
  margin-top: 6px;
}
.dc-status-ic {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  margin-bottom: 6px;
}
.dc-status-ic svg {
  width: 44px;
  height: 44px;
}
.dc-status-ic.blue {
  background: var(--blue-soft);
  color: var(--blue);
}
.dc-status-ic.red {
  background: var(--red-soft);
  color: var(--red);
}
.dc-status-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--navy);
  margin: 4px 0;
}
.dc-status-msg {
  font-size: 14px;
  color: var(--muted);
  max-width: 420px;
  line-height: 1.6;
  margin-bottom: 22px;
}

/* Responsive */
@media (max-width: 1080px) {
  .layout {
    grid-template-columns: 1fr;
  }
  .sidebar {
    display: none;
  }
  .content {
    padding: 28px 24px 36px;
  }
  .grid-2 {
    grid-template-columns: 1fr;
  }
  .choices {
    grid-template-columns: repeat(2, 1fr);
  }
  .recap-grid {
    grid-template-columns: 1fr;
  }
}
</style>
