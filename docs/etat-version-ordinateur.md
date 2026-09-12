# Qiryna : où en est la version ordinateur ?

**Pour qui :** toute personne qui suit le projet, sans besoin d’être développeur.  
**Date :** 9 septembre 2026.

En résumé : **le téléphone est largement en place**. **L’ordinateur n’a encore que les écrans les plus visibles** (accueil, connexion, écoles, mon projet). Le reste existe, mais sur grand écran on voit encore la mise en page du téléphone, avec seulement le menu et le pied de page d’ordinateur autour.

---

## Comment ça marche aujourd’hui

Quand on ouvre Qiryna sur un **téléphone**, on voit des écrans pensés pour le petit format.

Quand on ouvre Qiryna sur un **ordinateur** :

- soit l’écran a été **redessiné pour le grand format** (maquette Figma « Web ») → c’est le résultat voulu ;
- soit on voit **le même contenu que sur téléphone**, simplement plus large, avec le menu du haut et le pied de page ordinateur.

C’est ce deuxième cas qu’il reste à traiter, écran par écran.

> Petite note : dans Figma, certains écrans ordinateur ont un **mauvais nom** (par exemple un écran de logement s’appelle encore « Langues 2 »). On s’est fiés au contenu réel, pas au titre.

---

## En une phrase

**Déjà bien avancé :** se connecter, s’inscrire, l’accueil, chercher une école (France, Chine, Canada, Royaume-Uni, États-Unis), la fiche d’une école, et « Mon projet » (vue d’ensemble + admission).

**Pas encore une vraie version ordinateur :** langues, orientation, logement, MBA, messages, réglages, et le détail de « Mon projet » (cours, logement, professeurs…).

---

## Ce qui est déjà prêt sur ordinateur

Ces écrans existent en version téléphone **et** en version ordinateur, d’après les maquettes Figma.

| Ce que voit l’utilisateur | C’est bon ? |
|---|---|
| Page d’accueil | Oui |
| Connexion | Oui |
| Inscription | Oui |
| Mot de passe oublié | Oui |
| Page d’un pays : France, Chine, Canada, Royaume-Uni, États-Unis | Oui |
| Liste des écoles d’un pays | Oui |
| Fiche d’une école | Oui |
| Mon projet (tableau de bord) | Oui |
| Suivi d’admission + documents | Oui |
| Menu du haut et pied de page (sur toutes les pages ordinateur) | Oui |

---

## Ce qui reste à faire

Pour chaque écran : soit la **maquette ordinateur existe déjà dans Figma** (il « suffit » de la construire), soit **il n’y a pas encore de maquette** (il faudra la dessiner, ou accepter que ça reste comme le téléphone).

### Écoles et destinations

| Écran | Sur téléphone | Sur ordinateur | Maquette ordinateur dans Figma ? |
|---|---|---|---|
| Choisir son pays d’études (la grille de drapeaux) | Oui | Pas encore (on voit le téléphone agrandi) | Non |
| Page Allemagne (et tout pays autre que les 5 ci-dessus) | Oui | Pas encore | Non |

### Langues étrangères

| Écran | Sur téléphone | Sur ordinateur | Maquette ordinateur dans Figma ? |
|---|---|---|---|
| Choisir une langue | Oui | Pas encore | Oui — écran « Langues » |
| Choisir ses objectifs | Oui | Pas encore | Non (c’est une étape du parcours formules) |
| Choisir une formule (Kilimandjaro, Aconcagua, Everest) | Oui | Pas encore | Oui — « Choix de la formule » |
| Paiement réussi (cours de langue) | Oui | Pas encore | Oui — « Succès » (réservations confirmées) |

### Orientation

| Écran | Sur téléphone | Sur ordinateur | Maquette ordinateur dans Figma ? |
|---|---|---|---|
| Découvrir l’orientation (moi / mon enfant) | Oui | Pas encore | Oui — écran « Profilage » |
| Choisir une formule d’orientation | Oui | Pas encore | Non |
| Paiement réussi (orientation) | Oui | Pas encore | Non |

### Logement

| Écran | Sur téléphone | Sur ordinateur | Maquette ordinateur dans Figma ? |
|---|---|---|---|
| Choisir un pays pour le logement | Oui | Pas encore | Non |
| Découvrir le logement dans un pays | Oui | Pas encore | Oui — attention, l’écran s’appelle « Langues 2 » dans Figma, mais c’est bien du logement |
| Choisir une formule (Yukon, Comoé, Volga) | Oui | Pas encore | Non |
| Paiement réussi (logement) | Oui | Pas encore | Non |

### Mon projet (le suivi après achat)

Le **tableau de bord** et **l’admission** sont déjà en version ordinateur. Tout le reste, non.

| Écran | Sur téléphone | Sur ordinateur | Maquette ordinateur dans Figma ? |
|---|---|---|---|
| Suivi orientation | Oui | Pas encore | Non |
| Suivi logement | Oui | Pas encore | Non |
| Mes cours de langues | Oui | Pas encore | Non |
| Test / certification | Oui | Pas encore | Non |
| Choisir un professeur | Oui | Pas encore | Oui — l’écran s’appelle « Choix de la formule » dans Figma, mais c’est la liste des professeurs |
| Prendre un créneau | Oui | Pas encore | Non |
| Cours en visio | Oui (appel vidéo) | Pas encore | Non |
| Fiche complète d’un professeur | Pas d’écran téléphone dédié | — | Oui — « Profil du coach » (nouveau pour le téléphone aussi, si on veut le même niveau de détail) |

### Messages, compte et pages d’aide

| Écran | Sur téléphone | Sur ordinateur | Maquette ordinateur dans Figma ? |
|---|---|---|---|
| Mes messages | Oui | Pas encore | Non |
| Réglages (et tout ce qui en dépend : profil, mot de passe, langue, thème, aide, contact, mentions, droits…) | Oui | Pas encore | Non |
| CGU, cookies, FAQ | Oui (pages simples) | Pas encore | Seulement une maquette cookies côté téléphone |
| Page générique « paiement réussi » | Oui | Pas encore | Non |

---

## Maquettes ordinateur qui n’ont pas encore d’équivalent téléphone

Ce ne sont pas des « copies » d’écrans téléphone : ce sont de **nouveaux parcours** à décider (on les construit aussi pour le téléphone, ou seulement pour l’ordinateur).

1. **Collecte d’informations** — un questionnaire en plusieurs étapes après l’achat d’un accompagnement école (infos générales, projet d’études, documents, puis confirmation). Ça n’existe nulle part dans l’application aujourd’hui.
2. **Offre MBA** — une page d’offre dédiée. Dans le menu ordinateur, le lien « MBA » envoie encore vers les destinations d’études.
3. **Recherche de logement** (version longue, en plusieurs étapes : type de logement, préférences, résultats…). Plus complète que l’écran téléphone « Logement sûr ».
4. **Fiche d’un professeur / coach** — portrait détaillé, au-delà de la simple liste.

---

## Dans quel ordre avancer ? (proposition)

Ce qui est le plus visible pour un visiteur sur ordinateur, et qui a déjà une maquette Figma :

1. **Langues** — choisir une langue, choisir une formule, confirmation d’achat, puis professeurs  
2. **Orientation** — page de découverte (« Profilage »), puis les formules (à dessiner s’il n’y a pas de maquette)  
3. **Logement** — d’abord la liste des pays (à dessiner), puis la recherche  
4. **Destinations** — la grille de tous les pays, et les pays manquants (Allemagne…)  
5. **MBA** — la page d’offre déjà dessinée  
6. **Collecte d’informations** — nouveau parcours, à cadrer avec le métier  
7. **Mon projet (détail), messages, réglages** — pas de maquette ordinateur : soit on les dessine, soit on laisse volontairement la version téléphone agrandie

---

## Pour ouvrir les maquettes

Fichier Figma : [Working_Files_Qiryrna](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna)

- Page **téléphone** : les petits écrans (environ la largeur d’un mobile)  
- Page **Web** : les grands écrans ordinateur  

Si vous avez besoin du détail technique (noms de fichiers, identifiants Figma), il existe une version complète pour l’équipe dev : `parite-mobile-desktop.md`.
