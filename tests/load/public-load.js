import http from 'k6/http'
import { check, sleep } from 'k6'
import { Counter, Rate } from 'k6/metrics'

/**
 * Test de charge des pages publiques et de la connexion, sans paiement ni compte réel.
 *
 *   k6 run -e BASE_URL=https://danube.qiryna.com -e VUS=300 tests/load/public-load.js
 *
 * MODE=head (défaut) : requêtes HEAD. Le serveur fait tout le rendu de la page mais
 * n'envoie pas son contenu : la charge ne dépend plus du débit du poste qui teste.
 * Ne mesure donc ni la bande passante du serveur, ni les fichiers statiques.
 * MODE=get : pages complètes, à lancer depuis une machine bien raccordée
 * (voir `.github/workflows/load-test.yml`).
 *
 * Connexion : faux identifiants uniquement. Le site limite les essais à 10 par minute
 * et par adresse IP : depuis une seule machine, presque toutes les tentatives reçoivent
 * un 429, ce qui mesure cette protection et non le traitement complet de la connexion.
 *
 * RATE=120 : débit fixe en requêtes par seconde, avec peu de connexions (1 200 visiteurs
 * qui lisent chacun une page en 10 s environ font 120 pages/s). Cloudflare termine de
 * toute façon les connexions des visiteurs : pour le serveur, seul le débit compte. Sert
 * quand la connexion du poste ne tient pas des centaines de connexions simultanées.
 *
 * Les erreurs sont séparées : `erreurs_serveur` (5xx, requête expirée) et `erreurs_reseau`
 * (DNS, connexion impossible ou coupée : côté poste ou réseau, le serveur n'a rien reçu).
 *
 * Arrêt automatique : plus de 30 % d'erreurs serveur (`MAX_ERRORS`), plus de 50 % d'erreurs
 * réseau, ou blocage par Cloudflare.
 */
const BASE_URL = (__ENV.BASE_URL || 'https://danube.qiryna.com').replace(/\/$/, '')
const MODE = __ENV.MODE === 'get' ? 'get' : 'head'
const VUS = Number(__ENV.VUS || 10)
const RAMP = __ENV.RAMP || '1m'
const HOLD = __ENV.HOLD || '3m'
const THINK_MIN = Number(__ENV.THINK_MIN || 5)
const THINK_MAX = Number(__ENV.THINK_MAX || 15)
const RATE = Number(__ENV.RATE || 0)
const MAX_ERRORS = Number(__ENV.MAX_ERRORS || 0.3)
const REQUEST_TIMEOUT_CODE = 1050

const LOGIN_SHARE = 0.05
const BFF_SHARE = 0.12
const FALLBACK_SCHOOLS = ['/destinations/france/ecoles/universite-de-rennes']
const FIXED_PAGES = [
  { page: 'accueil', path: '/', weight: 25 },
  { page: 'destination', path: '/destinations/france', weight: 12 },
  { page: 'liste_ecoles', path: '/destinations/france/ecoles', weight: 10 },
  { page: 'langues', path: '/langues', weight: 8 },
  { page: 'logement', path: '/logement', weight: 5 },
  { page: 'orientation', path: '/orientation', weight: 5 },
  { page: 'formule', path: '/offres/droit', weight: 5 },
  { page: 'connexion', path: '/connexion', weight: 10 },
]
const SCHOOL_WEIGHT = 20

const serverErrors = new Rate('erreurs_serveur')
const networkErrors = new Rate('erreurs_reseau')
const status5xx = new Counter('reponses_5xx')
const requestTimeouts = new Counter('requetes_expirees')
const blocked = new Counter('blocages_cloudflare')
const loginRefused = new Counter('connexion_refusee_422')
const loginLimited = new Counter('connexion_limitee_429')

const PAGES = [...FIXED_PAGES.map((item) => item.page), 'fiche_ecole', 'donnees_bff', 'connexion_post', 'controle_cloudflare', 'controle_statique']

export const options = {
  discardResponseBodies: true,
  userAgent: 'qiryna-k6-charge/1.0',
  scenarios: {
    visiteurs: RATE > 0
      ? {
          executor: 'ramping-arrival-rate',
          startRate: 1,
          timeUnit: '1s',
          preAllocatedVUs: 60,
          maxVUs: 300,
          stages: [{ duration: RAMP, target: RATE }, { duration: HOLD, target: RATE }],
          gracefulStop: '30s',
          exec: 'visitAtRate',
        }
      : {
          executor: 'ramping-vus',
          startVUs: 0,
          stages: [{ duration: RAMP, target: VUS }, { duration: HOLD, target: VUS }],
          gracefulRampDown: '20s',
          gracefulStop: '30s',
          exec: 'visit',
        },
    // Hors du site : si ces temps montent aussi, c'est le poste qui sature, pas le serveur.
    controle_cloudflare: { executor: 'constant-arrival-rate', rate: 1, timeUnit: '1s', duration: durationOf(RAMP, HOLD), preAllocatedVUs: 5, maxVUs: 10, exec: 'controlCloudflare' },
    // Sur le site, sans rendu : compare le passage par le serveur et le rendu des pages.
    controle_statique: { executor: 'constant-arrival-rate', rate: 1, timeUnit: '1s', duration: durationOf(RAMP, HOLD), preAllocatedVUs: 5, maxVUs: 10, exec: 'controlStatic' },
  },
  thresholds: {
    erreurs_serveur: [{ threshold: `rate<${MAX_ERRORS}`, abortOnFail: true, delayAbortEval: '90s' }],
    erreurs_reseau: [{ threshold: 'rate<0.50', abortOnFail: true, delayAbortEval: '90s' }],
    blocages_cloudflare: [{ threshold: 'count<50', abortOnFail: true }],
    'http_reqs{scenario:visiteurs}': ['count>=0'],
    'http_req_duration{scenario:visiteurs}': ['p(95)<600000'],
    'http_req_failed{scenario:visiteurs}': ['rate<=1'],
    ...Object.fromEntries(PAGES.map((page) => [`http_req_duration{page:${page}}`, ['p(95)<600000']])),
  },
}

function durationOf(...parts) {
  const seconds = parts.reduce((total, part) => {
    const match = /^(\d+)(s|m)$/.exec(part)
    return total + (match ? Number(match[1]) * (match[2] === 'm' ? 60 : 1) : 0)
  }, 0)
  return `${seconds}s`
}

http.setResponseCallback(http.expectedStatuses({ min: 200, max: 399 }, 422, 429))

export function setup() {
  const response = http.get(`${BASE_URL}/sitemap.xml`, { responseType: 'text', timeout: '60s' })
  const paths = [...String(response.body || '').matchAll(/<loc>https?:\/\/[^/]+(\/[^<]*)<\/loc>/g)].map((match) => match[1])
  const schools = paths.filter((path) => /^\/destinations\/[^/]+\/ecoles\/[^/]+$/.test(path))
  return { schools: schools.length > 0 ? schools : FALLBACK_SCHOOLS }
}

function record(response) {
  const expired = response.error_code === REQUEST_TIMEOUT_CODE
  const is5xx = response.status >= 500
  const failed = is5xx || expired
  serverErrors.add(failed)
  networkErrors.add(response.status === 0 && !expired)
  if (is5xx) status5xx.add(1)
  if (expired) requestTimeouts.add(1)
  if (response.status === 403 || response.headers['Cf-Mitigated']) blocked.add(1)
  check(response, { 'réponse sans erreur serveur': () => !failed })
}

function pick(data) {
  const total = FIXED_PAGES.reduce((sum, item) => sum + item.weight, SCHOOL_WEIGHT)
  let draw = Math.random() * total
  for (const item of FIXED_PAGES) {
    draw -= item.weight
    if (draw <= 0) return item
  }
  return { page: 'fiche_ecole', path: data.schools[Math.floor(Math.random() * data.schools.length)] }
}

export function visit(data) {
  loadPage(data)
  sleep(THINK_MIN + Math.random() * (THINK_MAX - THINK_MIN))
}

export function visitAtRate(data) {
  loadPage(data)
}

function loadPage(data) {
  const target = pick(data)
  const params = { tags: { page: target.page, name: target.page }, headers: { 'Accept-Encoding': 'gzip' }, timeout: '30s' }
  record(MODE === 'get' ? http.get(`${BASE_URL}${target.path}`, params) : http.head(`${BASE_URL}${target.path}`, params))

  // Le navigateur recharge ensuite une partie des données du site.
  if (Math.random() < BFF_SHARE) {
    record(http.get(`${BASE_URL}/api/bff/destinations`, { tags: { page: 'donnees_bff', name: 'donnees_bff' }, headers: { Accept: 'application/json', 'Accept-Encoding': 'gzip' }, timeout: '30s' }))
  }

  if (Math.random() < LOGIN_SHARE) login()
}

function login() {
  const response = http.post(
    `${BASE_URL}/api/bff/session`,
    JSON.stringify({ email: `charge-k6-${__VU}@example.invalid`, password: 'mot-de-passe-factice' }),
    { tags: { page: 'connexion_post', name: 'connexion_post' }, headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, timeout: '30s' },
  )
  record(response)
  if (response.status === 422) loginRefused.add(1)
  if (response.status === 429) loginLimited.add(1)
}

export function controlCloudflare() {
  http.head('https://speed.cloudflare.com/__down?bytes=0', { tags: { page: 'controle_cloudflare', name: 'controle_cloudflare' }, timeout: '30s' })
}

export function controlStatic() {
  record(http.head(`${BASE_URL}/favicon.ico`, { tags: { page: 'controle_statique', name: 'controle_statique' }, timeout: '30s' }))
}
