  # Documentation API - Endpoints OAuth2

Cette documentation décrit tous les endpoints disponibles pour l'authentification OAuth2 dans l'API Qiryna Backoffice.

---

## 📋 Table des matières

1. [Inscription/Liaison OAuth](#1-inscriptionliaison-oauth)
2. [Connexion OAuth](#2-connexion-oauth)
3. [Codes de réponse](#3-codes-de-réponse)
4. [Exemples de requêtes](#4-exemples-de-requêtes)
5. [Gestion des erreurs](#5-gestion-des-erreurs)
6. [Utilisation du token Sanctum](#6-utilisation-du-token-sanctum)

---

## 1. Inscription/Liaison OAuth

### `POST /api/auth/social/register`

**Description**: Inscrit un nouvel utilisateur ou lie un provider OAuth à un compte existant.

**Comportement intelligent**:
- Si l'email n'existe pas → Crée un nouveau compte avec profil
- Si l'email existe → Lie le provider au compte existant (auto-linking)
- Si le provider est déjà lié → Met à jour le token

**Headers requis**:
```http
Content-Type: application/json
Accept: application/json
```

**Paramètres du body**:
| Paramètre | Type | Requis | Valeurs possibles | Description |
|-----------|------|--------|-------------------|-------------|
| `provider` | string | ✅ Oui | `google`, `facebook`, `linkedin` | Le provider OAuth utilisé |
| `token` | string | ✅ Oui | Token d'accès OAuth | Token obtenu depuis le provider OAuth |

**Exemple de requête**:
```json
{
  "provider": "google",
  "token": "ya29.a0AfH6SMBx_TOKEN_GOOGLE_ICI"
}
```

**Réponse succès (200 OK)**:
```json
{
  "success": true,
  "data": {
    "access_token": "1|xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "user": {
      "id": "9b8c7e6d-5f4a-3b2c-1d0e-9f8e7d6c5b4a",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "client",
      "is_activated": true,
      "mentalo_id": null,
      "created_at": "13/01/2026",
      "profile": {
        "id": "8a7b6c5d-4e3f-2g1h-0i9j-8k7l6m5n4o3p",
        "first_name": "John",
        "last_name": "Doe",
        "photo": "https://lh3.googleusercontent.com/a/avatar.jpg",
        "role": "client",
        "phone": null,
        "sex": null,
        "birthday": null,
        "city": null,
        "address": null
      },
      "avatar": "https://ui-avatars.com/api/?name=John+Doe&color=f05152&background=fce8e8",
      "settings": {
        "language": "fr"
      }
    }
  }
}
```

**Réponses d'erreur**:

| Code | Message | Cause |
|------|---------|-------|
| 400 | `"The provider field is required."` | Provider manquant |
| 400 | `"The token field is required."` | Token manquant |
| 400 | `"The selected provider is invalid."` | Provider non supporté (ex: twitter) |
| 400 | `"Ce compte {provider} est déjà lié à un autre utilisateur."` | Le compte OAuth est déjà lié à un autre compte |
| 400 | `"Login failed"` | Token OAuth invalide ou expiré |

**Cas d'usage**:
- ✅ Première inscription avec Google/Facebook/LinkedIn
- ✅ Lier Google à un compte existant (créé avec email/password)
- ✅ Lier Facebook à un compte qui a déjà Google
- ✅ Re-registration avec même provider (met à jour le token)

---

## 2. Connexion OAuth

### `POST /api/auth/social/login`

**Description**: Connecte un utilisateur via un provider OAuth déjà lié à son compte.

**Comportement**:
- Vérifie que le provider est déjà lié au compte
- Met à jour le token OAuth
- Génère un nouveau token Sanctum
- Retourne les informations utilisateur

**Headers requis**:
```http
Content-Type: application/json
Accept: application/json
```

**Paramètres du body**:
| Paramètre | Type | Requis | Valeurs possibles | Description |
|-----------|------|--------|-------------------|-------------|
| `provider` | string | ✅ Oui | `google`, `facebook`, `linkedin` | Le provider OAuth utilisé |
| `token` | string | ✅ Oui | Token d'accès OAuth | Token obtenu depuis le provider OAuth |

**Exemple de requête**:
```json
{
  "provider": "facebook",
  "token": "EAABsbCS1iHgBO_TOKEN_FACEBOOK_ICI"
}
```

**Réponse succès (200 OK)**:
```json
{
  "success": true,
  "data": {
    "access_token": "2|yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy",
    "user": {
      "id": "9b8c7e6d-5f4a-3b2c-1d0e-9f8e7d6c5b4a",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "client",
      "is_activated": true,
      "profile": {
        "first_name": "John",
        "last_name": "Doe",
        "photo": "https://graph.facebook.com/avatar.jpg",
        "role": "client"
      }
    }
  }
}
```

**Réponses d'erreur**:

| Code | Message | Cause |
|------|---------|-------|
| 400 | `"The provider field is required."` | Provider manquant |
| 400 | `"The token field is required."` | Token manquant |
| 400 | `"The selected provider is invalid."` | Provider non supporté |
| 400 | `"User not found"` | Aucun compte n'est lié à ce provider OAuth |
| 400 | `"Your account is disabled"` | Compte désactivé ou email non vérifié |
| 400 | `"Login failed"` | Token OAuth invalide ou expiré |

**Différence entre `/login` et `/register`**:

| Aspect | `/register` | `/login` |
|--------|-------------|----------|
| Nouveau compte | ✅ Crée le compte | ❌ Erreur "User not found" |
| Compte existant | ✅ Lie le provider | ✅ Connecte l'utilisateur |
| Provider déjà lié | ✅ Met à jour le token | ✅ Met à jour le token |
| Usage recommandé | Première connexion OAuth | Connexions suivantes |

**Cas d'usage**:
- ✅ Connexions répétées avec le même provider
- ✅ Utilisateur qui a déjà un compte lié

---

## 3. Codes de réponse

| Code HTTP | Signification | Quand ça arrive |
|-----------|---------------|-----------------|
| **200** | ✅ Succès | Authentification réussie |
| **400** | ❌ Bad Request | Validation échouée, token invalide, erreur métier |
| **401** | ❌ Unauthorized | Token Sanctum invalide (routes protégées) |
| **404** | ❌ Not Found | Route inexistante |
| **500** | ❌ Server Error | Erreur serveur interne |

---

## 4. Exemples de requêtes

### 4.1. Inscription avec Google (cURL)

```bash
curl -X POST https://votre-domaine.com/api/auth/social/register \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "provider": "google",
    "token": "ya29.a0AfH6SMBxVotre_Token_Google"
  }'
```

### 4.2. Connexion avec Facebook (JavaScript/Axios)

```javascript
import axios from 'axios';

const loginWithFacebook = async (facebookToken) => {
  try {
    const response = await axios.post('/api/auth/social/login', {
      provider: 'facebook',
      token: facebookToken
    });

    const { access_token, user } = response.data.data;

    // Stocker le token Sanctum
    localStorage.setItem('auth_token', access_token);
    localStorage.setItem('user', JSON.stringify(user));

    return { success: true, user };
  } catch (error) {
    console.error('Login failed:', error.response?.data?.error);
    return { success: false, error: error.response?.data?.error };
  }
};
```

### 4.3. Inscription avec LinkedIn (Vue.js Composition API)

```vue
<script setup>
import { ref } from 'vue';
import axios from 'axios';

const isLoading = ref(false);
const error = ref(null);

const registerWithLinkedIn = async (linkedinToken) => {
  isLoading.value = true;
  error.value = null;

  try {
    const { data } = await axios.post('/api/auth/social/register', {
      provider: 'linkedin',
      token: linkedinToken
    });

    // Stocker le token
    localStorage.setItem('auth_token', data.data.access_token);

    // Rediriger vers dashboard
    router.push('/dashboard');
  } catch (err) {
    error.value = err.response?.data?.error || 'Une erreur est survenue';
  } finally {
    isLoading.value = false;
  }
};
</script>
```

---

## 5. Gestion des erreurs

### Structure d'une réponse d'erreur

```json
{
  "error": "Message d'erreur détaillé"
}
```

### Erreurs courantes et solutions

#### Erreur: "The selected provider is invalid"

**Cause**: Vous avez utilisé un provider non supporté (ex: `twitter`, `github`)

**Solution**: Utilisez uniquement `google`, `facebook` ou `linkedin`

```diff
- "provider": "twitter"
+ "provider": "google"
```

#### Erreur: "Login failed"

**Causes possibles**:
1. Token OAuth expiré (durée de vie: ~1h)
2. Token OAuth invalide ou corrompu
3. Permissions insuffisantes (email non accordé)
4. Problème réseau avec le provider

**Solutions**:
1. Générer un nouveau token OAuth
2. Vérifier que le token est complet (pas tronqué)
3. Demander les bonnes permissions au provider
4. Vérifier la configuration OAuth du provider

#### Erreur: "User not found" (sur /login)

**Cause**: L'utilisateur essaie de se connecter mais le provider n'est pas lié

**Solution**: Utiliser `/register` au lieu de `/login` pour la première connexion

```javascript
// ❌ Mauvais
await axios.post('/api/auth/social/login', { ... }); // Erreur si nouveau

// ✅ Bon
await axios.post('/api/auth/social/register', { ... }); // Auto-link ou création
```

#### Erreur: "Ce compte google est déjà lié à un autre utilisateur"

**Cause**: Le compte Google est déjà associé à un autre compte utilisateur

**Solutions**:
1. Se connecter avec le compte original
2. Utiliser un autre compte Google
3. Contacter le support pour délier le compte

---

## 6. Utilisation du token Sanctum

### 6.1. Stocker le token

**LocalStorage (Simple)**:
```javascript
localStorage.setItem('auth_token', access_token);
```

**Pinia Store (Recommandé)**:
```javascript
// stores/auth.js
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('auth_token') || null,
    user: JSON.parse(localStorage.getItem('user') || 'null')
  }),

  actions: {
    setAuth(token, user) {
      this.token = token;
      this.user = user;
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },

    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  }
});
```

### 6.2. Ajouter le token aux requêtes

**Axios Interceptor (Global)**:
```javascript
// plugins/axios.js
import axios from 'axios';

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

**Requête manuelle**:
```javascript
const response = await axios.get('/api/user/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### 6.3. Vérifier l'authentification

**Route protégée (exemple)**:
```javascript
// Test si le token est valide
const checkAuth = async () => {
  try {
    const { data } = await axios.get('/api/user/me');
    return { authenticated: true, user: data };
  } catch (error) {
    if (error.response?.status === 401) {
      // Token invalide ou expiré
      localStorage.removeItem('auth_token');
      return { authenticated: false };
    }
  }
};
```

### 6.4. Déconnexion

**Endpoint (si implémenté)**:
```javascript
const logout = async () => {
  try {
    // Supprimer le token côté serveur
    await axios.get('/api/user/logout', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Toujours nettoyer côté client
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }
};
```

---

## 7. Flow complet d'authentification

### Diagramme de séquence

```
┌──────────┐         ┌─────────┐         ┌──────────┐         ┌─────────┐
│  Client  │         │  OAuth  │         │   API    │         │   BDD   │
│  (Vue)   │         │Provider │         │ Laravel  │         │  MySQL  │
└────┬─────┘         └────┬────┘         └────┬─────┘         └────┬────┘
     │                    │                   │                    │
     │  1. Click Google   │                   │                    │
     ├───────────────────>│                   │                    │
     │                    │                   │                    │
     │  2. OAuth Popup    │                   │                    │
     │<───────────────────┤                   │                    │
     │                    │                   │                    │
     │  3. User approves  │                   │                    │
     ├───────────────────>│                   │                    │
     │                    │                   │                    │
     │  4. OAuth Token    │                   │                    │
     │<───────────────────┤                   │                    │
     │                    │                   │                    │
     │  5. POST /register │                   │                    │
     ├──────────────────────────────────────>│                    │
     │                    │                   │                    │
     │                    │  6. Validate token│                    │
     │                    │<──────────────────┤                    │
     │                    │                   │                    │
     │                    │  7. User data     │                    │
     │                    ├──────────────────>│                    │
     │                    │                   │                    │
     │                    │                   │  8. Check email    │
     │                    │                   ├───────────────────>│
     │                    │                   │                    │
     │                    │                   │  9. User exists?   │
     │                    │                   │<───────────────────┤
     │                    │                   │                    │
     │                    │                   │ 10. Create/Link    │
     │                    │                   ├───────────────────>│
     │                    │                   │                    │
     │                    │                   │ 11. Generate token │
     │                    │                   │<───────────────────┤
     │                    │                   │                    │
     │  12. Sanctum token │                   │                    │
     │<──────────────────────────────────────┤                    │
     │                    │                   │                    │
     │  13. Store & redirect                  │                    │
     │                    │                   │                    │
```

---

## 8. Providers OAuth supportés

### Google OAuth 2.0

**Scopes requis**:
- `openid` - Identifiant unique
- `profile` - Nom, photo
- `email` - Adresse email

**Données extraites**:
```json
{
  "id": "1234567890",
  "given_name": "John",
  "family_name": "Doe",
  "email": "john.doe@gmail.com",
  "picture": "https://lh3.googleusercontent.com/..."
}
```

**Documentation**: https://developers.google.com/identity/protocols/oauth2

---

### Facebook Login

**Permissions requises**:
- `public_profile` - Nom, photo
- `email` - Adresse email

**Données extraites**:
```json
{
  "id": "123456789012345",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@facebook.com",
  "picture": {
    "data": {
      "url": "https://graph.facebook.com/..."
    }
  }
}
```

**Documentation**: https://developers.facebook.com/docs/facebook-login

---

### LinkedIn OAuth 2.0

**Scopes requis**:
- `r_liteprofile` - Nom, photo
- `r_emailaddress` - Adresse email

**Données extraites**:
```json
{
  "id": "AbCdEfGhIj",
  "localizedFirstName": "John",
  "localizedLastName": "Doe",
  "emailAddress": "john.doe@linkedin.com",
  "profilePicture": {
    "displayImage": "urn:li:digitalmediaAsset:..."
  }
}
```

**Documentation**: https://learn.microsoft.com/en-us/linkedin/shared/authentication/authentication

---

## 9. Limites et quotas

### Rate Limiting

L'API applique les limites suivantes (recommandées):

| Endpoint | Limite | Fenêtre |
|----------|--------|---------|
| `/api/auth/social/login` | 10 requêtes | 1 minute |
| `/api/auth/social/register` | 5 requêtes | 1 minute |

**Réponse si limite dépassée (429)**:
```json
{
  "message": "Too Many Attempts.",
  "error": "Rate limit exceeded"
}
```

---

## 10. Sécurité

### ✅ Bonnes pratiques

1. **Toujours utiliser HTTPS en production**
2. **Ne jamais exposer les client secrets côté client**
3. **Valider les tokens côté serveur**
4. **Stocker les tokens de manière sécurisée**
5. **Implémenter une expiration de session**
6. **Nettoyer les tokens lors de la déconnexion**

### ⚠️ À ne pas faire

1. ❌ Stocker le token dans les cookies sans HttpOnly
2. ❌ Transmettre le token en paramètre d'URL
3. ❌ Réutiliser un token OAuth expiré
4. ❌ Ignorer les erreurs de validation
5. ❌ Faire confiance aux données OAuth sans vérification

---

## Support

Pour toute question ou problème:

1. Consultez les logs: `storage/logs/laravel.log`
2. Vérifiez la documentation du provider OAuth
3. Consultez `docs/OAUTH_SETUP.md` pour la configuration
4. Consultez `docs/OAUTH_TESTING.md` pour les tests

---

**Version**: 1.0.0
**Dernière mise à jour**: 13 janvier 2026
