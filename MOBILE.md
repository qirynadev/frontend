# Application mobile Qiryna (Capacitor)

- **Branche** : `mobile-capacitor`, à jour de `danube` (la branche de référence du site depuis le 2026-10-29).
- **Principe** : le site Nuxt, livré en page unique dans une coquille native Android et iOS (Capacitor 8). Le site ne change pas : tout ce qui est propre à l'application ne s'active qu'au build `NUXT_MOBILE=1` ou, à l'exécution, quand `isNativeApp()` est vrai (`app/utils/native-app.ts`).
- **Identité** : nom « Qiryna », identifiant `com.qiryna.app` (Android et iOS), version 1.0.2 (code 3).

## Comment ça marche

| Sujet | Site | Application |
| --- | --- | --- |
| Rendu | serveur (SSR) | page unique (`ssr: false`), fichiers embarqués |
| Appels à l'API | BFF Nitro, même origine (`/api/bff`) | BFF du site déployé (`NUXT_MOBILE_BFF_ORIGIN` : production `danube.qiryna.com` par défaut, donc l'API `admin.qiryna.com/api`), en HTTP natif (`CapacitorHttp`) : pas de CORS |
| Session | cookie `httpOnly` posé par le BFF | le même cookie, gardé par le stockage natif du téléphone (`CapacitorCookies`), jamais lisible en JavaScript |
| Traductions | route `/_i18n/...` du serveur | fichiers générés au build (`i18n.experimental.prerenderMessages`) |
| Images | optimiseur `/_ipx` | images telles quelles (`image.provider: 'none'`) |
| Barres système | `viewport-fit=cover` | page entre la barre d'état et la barre de navigation (pas de `cover`) ; iOS : `contentInset: 'always'` |
| Bouton retour Android | — | écran précédent, sortie au premier écran (`app/plugins/capacitor.client.ts`) |

## Points d'attention, et ce qui est fait

### Paiement Stripe (décision : le paiement reste sur le web)

1. L'application démarre le paiement comme le site (`POST /payment/init`).
2. Le lien Stripe s'ouvre dans le **navigateur intégré** (onglet Chrome sur Android, Safari sur iOS), par-dessus l'application (`goToPayment`).
3. Après paiement, Stripe renvoie vers l'écran de succès **du site**, dans ce navigateur intégré. Le jeton `rt` y rouvre la session web : l'écran s'affiche normalement.
4. Quand l'utilisateur referme le navigateur intégré (`browserFinished`), l'application lit l'état de la commande avec sa propre session :
   - **payée ou refusée** : elle ouvre son écran de succès, qui affiche « confirmé » ou « échoué ». L'écran générique renvoie vers celui du bon tunnel.
   - **encore impayée** (paiement abandonné) : l'utilisateur reste sur l'offre et peut réessayer. L'écran de succès, lui, attendrait la confirmation de Stripe jusqu'à 30 s côté back-office, au-delà du délai du BFF (15 s) : il afficherait une erreur 502.
5. Offre gratuite : pas de Stripe, l'écran de succès s'ouvre directement dans l'application.

Aucun changement back-office n'a été nécessaire.

Avec les liens d'application (ci-dessous), le retour de Stripe vers `/…/paiement-reussi` arrive directement dans l'application, sans refermer le navigateur.

### Liens d'application (retour dans l'application)

Un lien vers le site (`danube.qiryna.com`) ouvert hors de l'application revient dans l'application : par exemple « Voir le détail de mon résultat » à la fin du test de niveau dans le LMS, le retour de Stripe, ou un lien reçu par e-mail. Le navigateur intégré se referme et l'écran correspondant s'ouvre (`appUrlOpen` dans `app/plugins/capacitor.client.ts`).

- **Android (App Links)** : filtre `autoVerify` dans `AndroidManifest.xml`, vérifié par `public/.well-known/assetlinks.json`, servi par le site. Ce fichier porte l'empreinte SHA-256 de la clé d'envoi (`qiryna-upload`). **Tant que danube n'est pas déployé avec ce fichier, Android laisse ces liens au navigateur.**
- **Google Play** : avec la signature d'application Google Play, l'application installée depuis le store est signée par la clé de Google. Il faut ajouter son empreinte (Play Console › Intégrité de l'application) dans `assetlinks.json`.
- **Chemins** : toutes les pages de l'application, sauf `/connexion` et `/inscription`. La connexion LinkedIn du site y revient avec son code : sur un téléphone où l'application est installée, elle quitterait le navigateur et échouerait.
- **Effet de bord** : un paiement fait sur le site mobile, téléphone avec l'application installée, revient lui aussi dans l'application. Si l'application n'est pas connectée au même compte, elle demande la connexion avant d'afficher la commande.
- **Changement de domaine** (par exemple `qiryna.com` à la place de `danube.qiryna.com`) :
  1. servir le même `assetlinks.json` sur le nouveau domaine ;
  2. ajouter son `android:host` au filtre ;
  3. publier une mise à jour.

  Les versions déjà installées ne connaissent que l'ancien domaine : il doit continuer à servir `assetlinks.json` (sans redirection), au moins le temps des mises à jour. Jusqu'à Android 11, un domaine du filtre qui ne sert pas ce fichier invalide tous les autres : n'ajouter un domaine qu'une fois son fichier en ligne.
- **iOS (Universal Links)** : pas encore branché. Il faut le Team ID Apple, la capacité « Associated Domains » (`applinks:danube.qiryna.com`) et le fichier `/.well-known/apple-app-site-association` sur le site.
- **Test sans déploiement** (téléphone de test, version debug) : `adb shell pm set-app-link com.qiryna.app always` force l'association.

### Autres pages externes

- **LMS** : ouvert dans le navigateur intégré, l'application reste dessous. La page de reconnexion (`/lms/entree`, où le LMS renvoie quand sa session expire) le rouvre de la même façon.
- **Liens `target="_blank"`, `mailto:`, `tel:`** : confiés au téléphone (navigateur, messagerie, appel) par Capacitor.

### Visio Zoom (cours de langue)

- Android : autorisations `CAMERA`, `RECORD_AUDIO`, `MODIFY_AUDIO_SETTINGS` déclarées. Capacitor les demande à l'utilisateur au moment où Zoom ouvre la caméra ou le micro, pas au lancement de l'application.
- iOS : textes `NSCameraUsageDescription` et `NSMicrophoneUsageDescription` (sans eux, Apple refuse l'application et iOS la ferme à la première demande).
- Le SDK Zoom tourne dans la WebView comme dans un navigateur mobile, sans en-têtes d'isolation (déjà le cas sur le site). Le tableau blanc reste indisponible sur mobile (limite Zoom, déjà gérée par l'écran).
- **À vérifier sur un vrai téléphone** : séance complète (son, caméra, partage d'écran du prof), et téléchargement d'un fichier du chat (téléchargement de fichier non géré dans la WebView Android).

### PDF du bilan d'orientation

Dans l'application, il est téléchargé par le HTTP natif (avec la session), rangé dans le cache de l'application, puis ouvert dans la visionneuse PDF du téléphone (`openBffPdf`, modules `@capacitor/filesystem` et `@capawesome-team/capacitor-file-opener`).

### Connexion par réseaux sociaux

**Masquée dans l'application** : connexion par e-mail seulement. Google et Facebook refusent leurs fenêtres de connexion dans une WebView, et LinkedIn renverrait vers le site. Les identifiants web (`NUXT_PUBLIC_OAUTH_*`) ne suffisent pas.

Pour l'activer, il faut :

- **des modules natifs** (par exemple `@capgo/capacitor-social-login`) ;
- **côté Google** : un client OAuth Android (identifiant `com.qiryna.app` et empreinte SHA-1 des clés de signature) et un client iOS ;
- **côté Facebook** : les plateformes Android et iOS dans l'application Facebook, plus son *client token* ;
- **côté back-office** : vérifier les jetons natifs (le jeton Google natif peut être émis pour le client web, ce qui limite les changements) ;
- **pour l'App Store** : « Se connecter avec Apple », obligatoire dès qu'une connexion Google ou Facebook est proposée (règle 4.8). Le back-office n'a pas encore de fournisseur Apple.

### Notifications push

Le push web ne fonctionne pas dans une WebView : l'encart d'activation est masqué dans l'application. Pour le push natif, il faut :

- Firebase Cloud Messaging (Android) et APNs (iOS) ;
- le module `@capacitor/push-notifications` ;
- côté back-office, l'enregistrement des jetons d'appareil et l'envoi par FCM, en plus du Web Push existant.

### Cookies et mesure d'audience

Le bandeau cookies du site sert au consentement de Google Analytics. Dans l'application, **ni Google Analytics ni bandeau** :
- aucun suivi, donc aucun consentement à demander ;
- pas de demande d'autorisation de suivi d'Apple (ATT) ;
- des fiches confidentialité des stores plus simples.

Le cookie de session reste : il est indispensable au fonctionnement et n'a pas besoin de consentement.

Pour mesurer l'audience de l'application, il faudra une mesure native (Firebase Analytics) avec son propre consentement.

### Protections du BFF (danube)

- **Contrôle d'origine des écritures** (`server/utils/origin.ts`) : il accepte déjà les origines de l'application (`https://localhost`, `capacitor://localhost`).
- **Cloudflare Turnstile** (anti-robots sur la connexion, l'inscription, le mot de passe oublié et le contact) : éteint en production au 2026-11-02. S'il est activé, deux choses sont nécessaires, sinon ces formulaires seront refusés dans l'application (429) :
  - compiler l'application avec `NUXT_PUBLIC_TURNSTILE_SITE_KEY` ;
  - ajouter `localhost` aux noms d'hôte du widget dans la console Cloudflare.
- **Compatibilité** : le BFF déployé sert aussi les versions de l'application déjà installées, qui ne se mettent pas à jour toutes seules. Une nouvelle exigence du BFF peut casser une ancienne version de l'application : la case des CGV obligatoire, par exemple, a cassé le paiement de la 1.0.1 avant sa recompilation.

### Icône et écran de démarrage

- **Sources** : `mobile/assets/`, générées par `mobile/make-sources.mjs` à partir de l'icône iOS 1024 px fournie.
- **Toutes les tailles** (Android et iOS) se génèrent avec `@capacitor/assets` :

  ```bash
  npx @capacitor/assets generate --assetPath mobile/assets --android --ios \
    --iconBackgroundColor '#ffffff' --iconBackgroundColorDark '#ffffff' \
    --splashBackgroundColor '#ffffff' --splashBackgroundColorDark '#ffffff'
  ```

- **Fond de l'icône Android** : le fond fourni était le quadrillage vert par défaut d'Android Studio ; il est remplacé par du blanc.
- **Taille du logo** : réduite pour tenir dans le cercle visible des icônes adaptatives.

## Exigences des stores encore ouvertes

- **Suppression de compte (bloquant, Apple et Google)** : le bouton « Supprimer mon compte » des réglages n'a pas d'action, et le back-office n'a pas de route pour supprimer un compte. Il faut décider ce qui est supprimé et ce qui est conservé (commandes, factures), puis brancher le bouton. Google demande en plus une page web de demande de suppression.
- **Politique de confidentialité** : son URL publique est à renseigner dans les deux consoles ; les pages légales du site existent.
- **Fiche « Sécurité des données » (Google) et « Confidentialité » (Apple)** : déclarer compte, e-mail, paiement (Stripe), photos ou fichiers joints, mesure d'audience.
- **Compte de test** pour les équipes de revue (Apple et Google), sur l'environnement visé par le build.

## Construire

Node n'est pas installé sur le poste de développement : les commandes Node passent par Docker (`node:22-alpine`, `node_modules` dans le volume `qiryna-front-nm`).

```bash
# 1. Site en page unique, pointé sur la production (ou NUXT_MOBILE_BFF_ORIGIN=https://stage.qiryna.com pour la recette)
NUXT_MOBILE=1 npx nuxt generate
# 2. Copie dans les projets natifs
npx cap sync
# 3. Android, APK et AAB signés (Windows, JDK d'Android Studio)
cd android
JAVA_HOME="C:/Program Files/Android/Android Studio/jbr" \
QIRYNA_KEYSTORE_PROPERTIES="C:/.../qiryna-mobile-signing/keystore.properties" \
./gradlew.bat assembleRelease bundleRelease
# APK : android/app/build/outputs/apk/release/app-release.apk
# AAB (Google Play) : android/app/build/outputs/bundle/release/app-release.aab
```

- **Sources natives pour Gradle** : Gradle lit les sources natives des modules dans `node_modules/@capacitor` et `node_modules/@capawesome-team`. Sous Windows, ces dossiers doivent exister sur le disque (copie depuis le volume Docker, ignorée par git).
- **iOS** : le projet est dans `ios/` (Swift Package Manager, pas de CocoaPods). Il s'ouvre et se compile sur un Mac avec Xcode (`npx cap open ios`) ou sur un service de compilation en ligne, avec un compte Apple Developer.
- **Versions** : à chaque envoi en store, augmenter `versionCode` et `versionName` (`android/app/build.gradle`), ainsi que `CURRENT_PROJECT_VERSION` et `MARKETING_VERSION` (projet Xcode).

## Signature Android (à ne jamais perdre)

- Clé d'envoi Google Play : `qiryna-upload.jks`, alias `qiryna-upload`, rangée **hors du dépôt** avec ses mots de passe (`keystore.properties`). Ni la clé ni les mots de passe ne doivent être commités (`android/.gitignore`).
- **À sauvegarder** dans un coffre (gestionnaire de mots de passe de l'équipe). Avec la signature d'application Google Play (recommandée), une clé d'envoi perdue peut être réinitialisée par Google, mais pas sans délai.

## Vérifié sur émulateur (Android 15)

Démarrage avec le logo Qiryna, accueil chargé avec les données de la recette par le HTTP natif, mise en page entre les barres système, langue suivie du téléphone. Les parcours connectés (connexion, paiement, visio, PDF) restent à valider sur un vrai téléphone : l'émulateur logiciel de ce poste est trop lent pour eux.
