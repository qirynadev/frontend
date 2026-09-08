<script lang="ts">
import { loadStripe } from "@stripe/stripe-js";
import { defineComponent, onBeforeMount, ref } from "vue";
import { StripeElement, StripeElements } from "vue-stripe-js";
import { useAppStore } from "@/stores";

export default defineComponent({
  name: "CardOnly",
  props: {
    stripeKey: {
      type: String,
      required: true,
    },
  },
  components: {
    StripeElements,
    StripeElement,
  },

  setup() {
    const elementStyle = {
      base: {
        color: "#fff",
        fontWeight: "500",
        fontFamily: "Roboto, Open Sans, Segoe UI, sans-serif",
        fontSize: "16px",
        fontSmoothing: "antialiased",
        ":-webkit-autofill": {
          color: "#fce883",
        },
        "::placeholder": {
          color: "#87BBFD",
        },
      },
    };

    // Clé publique Stripe : back-office (settings.site.stripe_pk_api_key) prioritaire,
    // sinon variable d'env VITE_STRIPE_PK (build).
    const appStore = useAppStore();
    const stripeKey = ref(
      (appStore.settings as any)?.site?.stripe_pk_api_key || import.meta.env.VITE_STRIPE_PK
    );
    const instanceOptions = ref({
      // https://stripe.com/docs/js/initializing#init_stripe_js-options
      // stripeAccount: '',
      // apiVersion: '2023-10-16',
      // locale: 'fr'
    });
    const elementsOptions = ref({
      // https://stripe.com/docs/js/elements_object/create#stripe_elements-options
      // stripeAccount: '',
      // apiVersion: '2023-10-16',
      // locale: 'fr'
    });
    const cardOptions = ref({
      // https://stripe.com/docs/stripe.js#element-options
      value: {
        postalCode: "",
      },
    });
    const stripeLoaded = ref(false);
    const card = ref();
    const elms = ref();

    onBeforeMount(() => {
      const stripePromise = loadStripe(stripeKey.value);
      stripePromise.then(() => {
        stripeLoaded.value = true;
      });
    });

    return {
      stripeKey,
      stripeLoaded,
      instanceOptions,
      elementsOptions,
      cardOptions,
      card,
      elms,
      elementStyle,
    };
  },

  methods: {
    async pay(): Promise<any> {
      // Get stripe element
      const cardElement = this.card.stripeElement;

      // Access instance methods, e.g. createToken()
      return this.elms.instance.createToken(cardElement).then((result: object) => {
        // Handle result.error or result.token
        return result;
      });
    },
  },
});
</script>

<template>
  <!-- <StripeElements
    v-if="stripeLoaded"
    v-slot="{ elements }"
    ref="elms"
    :stripe-key="stripeKey"
    :instance-options="instanceOptions"
    :elements-options="elementsOptions"
  >
    <div class="col-12 mb-3">
      <label for="" class="form-label">Numero de carte</label>
      <div class="form-control py-2">
        <StripeElement
          type="cardNumber"
          ref="card"
          :elements="elements"
          :options="cardOptions"
        />
      </div>
    </div>
    <div class="row">
      <div class="col-6 mb-3">
        <label for="" class="form-label">Date d'expiration</label>
        <div class="form-control py-2">
          <StripeElement
            type="cardExpiry"
            ref="card"
            :elements="elements"
            :options="cardOptions"
          />
        </div>
      </div>
      <div class="col-6 mb-3">
        <label for="" class="form-label">CVC</label>
        <div class="form-control py-2">
          <StripeElement
            type="cardCvc"
            ref="card"
            :elements="elements"
            :options="cardOptions"
          />
        </div>
      </div>
    </div>
  </StripeElements> -->

  <StripeElements
    v-if="stripeLoaded"
    v-slot="{ elements }"
    ref="elms"
    :stripe-key="stripeKey"
    :instance-options="instanceOptions"
    :elements-options="elementsOptions"
  >
    <div class="w-full mb-3">
      <div class="input-field">
        <StripeElement type="cardNumber" ref="card" :elements="elements" :options="cardOptions" style="" />
        <label for="" class="form-label">Numero de carte</label>
      </div>
    </div>
    <div class="w-full flex mb-3">
      <div class="input-field">
        <StripeElement type="cardExpiry" ref="card" :elements="elements" :options="cardOptions" :style="elementStyle" />
        <label for="" class="form-label">Date d'expiration</label>
      </div>
      <div class="input-field">
        <label for="" class="form-label">CVC</label>
        <StripeElement type="cardCvc" ref="card" :elements="elements" :options="cardOptions" />
      </div>
    </div>
  </StripeElements>
</template>

<style lang="scss" scoped>
.input-field {
  width: 100%;
  position: relative;
  &:not(:first-child) {
    margin-top: 20px;
  }

  input {
    width: 100%;
    border-radius: 4px;
    font-size: 14px;
    padding: 6px 12px;
    border: 1.5px solid #c9c9c9;
    background: transparent;
    color: var(--color-ink);
    /* box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075); */
    outline: none;
    height: 45px;
    margin-bottom: 10px;

    &:focus {
      border: 2px solid #ff3942;
    }

    &:focus ~ label,
    &:valid ~ label {
      color: #ff3942;
    }
  }

  label {
    position: absolute;
    top: -10px;
    left: 15px;
    font-size: 16px;
    padding: 0 2px;
    background: var(--color-surface);
    color: #555;
    font-size: 14px;
    pointer-events: none;
    transition: 0.3s;
  }
}
</style>
