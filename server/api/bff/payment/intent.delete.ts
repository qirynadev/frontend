/** Abandon explicite de l'intention (« Ce n'est pas ce que je voulais acheter »). */
export default defineEventHandler((event) => {
  clearPaymentIntent(event)
  return { ok: true }
})
