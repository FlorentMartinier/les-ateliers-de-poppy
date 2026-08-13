# 🌺 Poppy in the Sky - Les Ateliers

Bienvenue sur le dépôt du site vitrine **Poppy in the Sky**. Ce site est une application Single Page (SPA) moderne développée avec **Angular** et stylisée entièrement à l'aide de **Tailwind CSS**.

L'architecture du site est entièrement **pilotée par les données (Data-Driven)** : tout le contenu textuel, les bannières, les sous-menus et les réseaux sociaux sont générés dynamiquement à partir d'un unique fichier de configuration JSON.

---

## ⚙️ Architecture pilotée par le JSON

Pour modifier le contenu du site (ajouter un atelier, changer une image, mettre à jour un partenaire), **vous n'avez pas besoin de toucher au code HTML/TypeScript**. Tout se gère dans le fichier de configuration :
`src/assets/config/site-config.json` (ou le chemin équivalent dans votre projet).

---

## 🔝 Propriétés Globales

| Propriété | Type | Description | Exemple |
| --- | --- | --- | --- |
| **`title`** | Chaîne (`string`) | Le titre principal du site internet (affiché dans l'onglet du navigateur). | `"Les ateliers de Poppy"` |
| **`footer`** | Objet (`object`) | Regroupe les réseaux sociaux, le contact et les partenaires du bas de page. | *Voir le détail ci-dessous* |
| **`sections`** | Tableau (`array`) | Liste l'intégralité des pages du site, leur contenu et leur bannière. | *Voir le détail ci-dessous* |

---

## 📑 Structure de l'objet `footer`

| Propriété | Type | Description | Exemple / Rendu |
| --- | --- | --- | --- |
| **`instagram`** | Chaîne (`string`) | URL du compte Instagram. *Si laissé vide, l'icône se masque automatiquement.* | `"[https://www.instagram.com/](https://www.instagram.com/)..."` |
| **`etsy`** | Chaîne (`string`) | URL de la boutique Etsy principale. | `"[https://www.etsy.com/](https://www.etsy.com/)..."` |
| **`facebook`** | Chaîne (`string`) | URL de la page Facebook. | `"[https://www.facebook.com/](https://www.facebook.com/)..."` |
| **`linkedin`** | Chaîne (`string`) | URL du profil LinkedIn. | `"[https://www.linkedin.com/](https://www.linkedin.com/)..."` |
| **`mail`** | Chaîne (`string`) | Adresse e-mail de contact. Génère un lien natif `mailto:`. | `"poppyinthesky@free.fr"` |
| **`partners`** | Tableau (`object[]`) | Liste des liens vers les sites partenaires affichés dans le footer. | Chaque partenaire requiert un **`title`** (Nom) et une **`url`** (Lien). |

---

## 📄 Structure du tableau `sections` (Les Pages)

Chaque objet à l'intérieur du tableau `sections` représente une page ou une sous-page du site.

| Propriété | Type | Description |
| --- | --- | --- |
| **`menu_title`** | Tableau (`string[]`) | **Gestion du menu :** <br>

<br>• Si `1 seule valeur` : Crée une catégorie principale dans le menu (ex: `["Bienvenue"]`).<br>

<br>• Si `2 valeurs` : Le premier élément est le dossier parent, le second est la sous-page (ex: `["Animation enfant...", "Grand coeur bois"]`). |
| **`path`** | Chaîne (`string`) | L'identifiant de l'URL de la page (ex: `animations-adultes/resine-uv`). Pour la page d'accueil, laissez vide (`""`). |
| **`banner_image`** | Chaîne (`string`) | Chemin vers l'image de la bannière supérieure (ex: `assets/banners/bienvenue.jpg`). |
| **`informations`** | Tableau (`object[]`) | Les différents blocs de contenu qui composent le corps de la page. |

---

## 🧩 Structure des blocs imbriqués dans `informations`

À l'intérieur d'une page (`section`), vous pouvez empiler plusieurs blocs dans le tableau `informations`. L'affichage s'adapte dynamiquement selon les propriétés que vous remplissez :

| Propriété | Type | Description / Comportement visuel |
| --- | --- | --- |
| **`title`** | Chaîne (`string`) | Le titre du bloc de texte ou de la galerie d'images. |
| **`description`** | Tableau (`string[]`) | Tableau de paragraphes textuels. **Astuce :** Vous pouvez y injecter des balises HTML comme `<strong>texte</strong>`, des liens `<a href="...">` ou des lignes de tableau `<tr>...</tr>`. |
| **`images`** | Tableau (`string[]`) | Liste de chemins vers des images fixes (ex: `["assets/images/img1.png"]`). |
| **`side_images`** | Tableau (`string[]`) | Images destinées à être affichées sur le côté du texte (disposition en colonnes "Texte à gauche / Image à droite"). |
| **`carrousel`** | Tableau (`string[]`) | Liste d'images qui alimente automatiquement un diaporama défilant (Slider / Carrousel) propre à l'atelier. |

> 💡 **Note de configuration :** Si un composant visuel n'est pas nécessaire pour un bloc (par exemple, pas de carrousel pour la page Bienvenue), vous pouvez simplement omettre la propriété ou lui attribuer la valeur `null`.