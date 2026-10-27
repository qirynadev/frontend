# Application mobile Qiryna (Capacitor)

- **Branche** : `mobile-capacitor` (créée depuis `app` le 2026-10-27).
- **Principe** : le site Nuxt, livré en page unique dans une coquille native Android et iOS (Capacitor 8). Le site lui-même ne change pas : tout ce qui est propre à l'application ne s'active qu'avec `NUXT_MOBILE=1`.
- **Identité** : nom « Qiryna », identifiant `com.qiryna.app`.

## Comment ça marche

| Sujet | Site | Application |
| --- | --- | --- |
| Rendu | serveur (SSR) | page unique (`ssr: false`), fichiers embarqués |
| Appels à l'API | BFF Nitro, même origine (`/api/bff`) | BFF du site déployé (`NUXT_MOBILE_BFF_ORIGIN`, recette par défaut), en HTTP natif (`CapacitorHttp`) |
| Session | cookie `httpOnly` posé par le BFF | le même cookie, gardé par le stockage natif du téléphone (`CapacitorCookies`), jamais lisible en JavaScript |
| Traductions | route `/_i18n/...` du serveur | fichiers générés au build (`i18n.experimental.prerenderMessages`) |
| Images | optimiseur `/_ipx` | images telles quelles (`image.provider: 'none'`) |
| Paiement | redirection Stripe | redirection Stripe dans le navigateur du téléphone (décision : le paiement reste sur le web) |
| Bouton retour Android | — | écran précédent, sortie au premier écran (`app/plugins/capacitor.client.ts`) |

Aucun changement n'est nécessaire côté site ni côté back-office pour cette première version : l'application parle au BFF déployé comme un navigateur.

## Construire

Node n'est pas installé sur le poste de développement : les commandes Node passent par Docker (`node:22-alpine`, `node_modules` dans le volume `qiryna-front-nm`).

```bash
# 1. Site en page unique, pointé sur la recette (ou NUXT_MOBILE_BFF_ORIGIN=https://qiryna.com pour la production)
NUXT_MOBILE=1 npx nuxt generate
# 2. Copie dans le projet Android
npx cap sync android
# 3. APK signé (Windows, JDK d'Android Studio)
cd android
JAVA_HOME="C:/Program Files/Android/Android Studio/jbr" \
QIRYNA_KEYSTORE_PROPERTIES="C:/.../qiryna-mobile-signing/keystore.properties" \
./gradlew.bat assembleRelease          # APK : android/app/build/outputs/apk/release/app-release.apk
./gradlew.bat bundleRelease            # AAB pour Google Play : android/app/build/outputs/bundle/release/
```

Gradle lit les sources natives de Capacitor dans `node_modules/@capacitor` : sur Windows, ce dossier doit exister (copie depuis le volume Docker, ignorée par git).

## Signature (à ne jamais perdre)

- Clé d'envoi Google Play : `qiryna-upload.jks`, alias `qiryna-upload`, rangée **hors du dépôt** avec ses mots de passe (`keystore.properties`). Ni la clé ni les mots de passe ne doivent être commités (`android/.gitignore`).
- **À sauvegarder** dans un coffre (gestionnaire de mots de passe de l'équipe) : sans elle, impossible de publier une mise à jour de l'application sous le même identifiant. Avec la signature d'application Google Play (recommandée), une clé d'envoi perdue peut être réinitialisée par Google, mais pas sans délai.

## Limites connues de cette première version

- **Connexion Google, Facebook, LinkedIn** : les boutons restent grisés (identifiants non fournis au build). Google refuse sa connexion dans une WebView : il faudra des modules natifs et un point d'entrée back-office pour leurs jetons, plus « Se connecter avec Apple » pour l'App Store.
- **Notifications push** : le Web Push du site ne fonctionne pas dans l'application. Il faudra le push natif (Firebase pour Android, APNs pour iOS) et l'enregistrement des appareils côté back-office.
- **PDF du bilan d'orientation** : il s'ouvre dans le navigateur du téléphone, qui n'a pas la session : à télécharger par l'application.
- **Retour après paiement** : le paiement se termine dans le navigateur ; l'utilisateur revient ensuite à l'application à la main. Un lien profond (`paiement-reussi`) pourra le ramener directement.
- **Visio Zoom** : autorisations caméra et micro à déclarer et à tester.
- **iOS** : le projet se génère avec `npx cap add ios`, mais se compile sur un Mac (ou un service de compilation en ligne), avec un compte Apple Developer.
- **Icône et écran de démarrage** : ceux de Capacitor par défaut, à remplacer par ceux de Qiryna (`@capacitor/assets`).
