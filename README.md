Je souhaite développer un site web pour présenter des création. le site web est développé en angular et avec tailwind css. J'ai déjà initialisé le projet et mis en place tailwind pas besoin de m'aider la dessus. J'aimerais que l'intégralité du contenu du site se fasse via un fichier JSON. Voici un exemple de fichier qui devrait couvrir tous les cas possibles : 
{
    "title": "Les ateliers de Poppy",
    "footer" : {
        "instagram": "https://www.instagram.com/poppyinthesky_les_ateliers/"
        "mail" : "test@test.fr"
    }
    "sections": [
        {
            "menu_title": [
                "Bienvenue"
            ],
            "banner_image": "assets/banners/images.jfif",
            "informations": [
                {
                    "title": "Bienvenue chez POPPY IN THE SKY !",
                    "images": null,
                    "carrousel": null,
                    "description": [
                        "Ce site est dédié au plaisir de la création. Vous y trouverez des propositions d'ateliers créatifs à votre domicile (voir plus haut), des dates d'ateliers créatifs sur Fabrègues (vacances scolaires uniquement), ainsi que les liens vers mes créations personnelles à la vente (un peu plus bas sur cette page). Bonne visite !"
                    ]
                },
                {
                    "title": "Mon actualité :",
                    "images": [
                        "assets/images/atelier_metal.png",
                        "assets/images/atelier_attrape_soleil.png"
                    ],
                    "carrousel": null,
                    "description": null
                }
            ]
        },
        {
            "menu_title": [
                "Présentation"
            ],
            "banner_image": "assets/banners/images.jfif",
            "informations": [
                {
                    "title": "Ateliers loisirs créatifs à domicile sur  Montpellier et Agglomération - adultes et enfants",
                    "images": null,
                    "carrousel": null,
                    "description": [
                        "Bienvenue sur mon site pour une pause créative et festive !"
                    ]
                }
            ]
        },
        {
            "menu_title": [
                "Animation enfant à votre domicile",
                "Grand coeur bois"
            ],
            "banner_image": "assets/banners/images.jfif",
            "informations": [
                {
                    "title": "Atelier décoration cœur",
                    "images": null,
                    "carrousel": null,
                    "description": [
                        "Superbe grande décoration murale (cuisine, chambre, etc) de 29cm d'envergure. Pièce en bois hyper légère.",
                        "A garder pour soi ou à offrir à papa, maman, papi, mami...",
                        "Base en bois, sur laquelle nous allons apprendre à peindre de beaux dégradés à l'éponge, puis travail d'écriture avec une pâte spéciale (molding paste) et enfin un travail de moulage avec de la pâte auto durcissante. ",
                        "Bien entendu, comme dans chacun des ateliers proposés, les couleurs, les décorations sont à volonté et aux goûts de chacun, ce qui garantit une pièce créative unique.",
                        "Le prix indiqué est valable du lundi au samedi. Majoration de 10% les dimanche et jours fériés."
                    ]
                }
            ]
        },
        {
            "menu_title": [
                "Animation enfant à votre domicile",
                "Cadre végétal"
            ],
            "banner_image": "assets/banners/images.jfif",
            "informations": [
                {
                    "title": "Cadre végétal (toutes saisons)",
                    "images": null,
                    "carrousel": [
                        "assets/images/cadre_vegetal_1.jpg",
                        "assets/images/cadre_vegetal_2.jpg",
                        "assets/images/cadre_vegetal_2.jpg",
                        "assets/images/cadre_vegetal_2.jpg",
                        "assets/images/cadre_vegetal_2.jpg",
                        "assets/images/cadre_vegetal_2.jpg",
                        "assets/images/cadre_vegetal_2.jpg",
                        "assets/images/cadre_vegetal_2.jpg",
                        "assets/images/cadre_vegetal_2.jpg"
                    ],
                    "description": [
                        "Cette activité est proposée à partir de 6 ans.",
                        "Toutefois si votre enfant et ses amis sont créatifs et font preuve de dextérité, cette activité peut être proposée dès 5 ans.",
                        "Chaque enfant créera son propre jardin végétal, à base de fournitures \"en fonction de la saison\" (à votre convenance) : de la mousse, du bois, des fleurs, des citrouilles, des champignons, des végétaux factices de toutes sortes, des céramiques que je crée moi-même...",
                        "le cadre en bois fait 12cm de côtés.",
                        "Le tarif proposé est majoré de 10% le dimanche et les jours fériés."
                    ]
                }
            ]
        }
    ]
}

Voici une explication de ce que chaque propriété est censé faire : 
- title = le titre du site web. Il doit être visible sur toutes les pages
- footer = les informations de footer, qui s'affichent dans tous les écrans sous forme d'icones
- sections = corresponds à toutes les pages du site. Toutes les pages doivent être accessible par navigation via un burger menu sur le côté droit.
  - menu_title : le libellé à afficher dans le burger menu pour un écran. A noté que c'est une liste. il y a une notion de hiérarchie (à 2 niveaux maximum). S'il y a plusieurs éléments dans la liste, cela veut dire qu'il faut afficher un menu, et un sous menu dans le burger menu. Il peut y avoir plusieurs sous menu dans un même menu (c'est le cas actuellement dans l'exemple avec "Animation enfant à votre domicile").
  - banner_image = c'est une image de banière à afficher tout en hat d'un écran. La banière prend la totalité de la largeur de l'écran, et n'est pas totalement carré. J'aimerais qu'il soit un peu biseauté.
  - informations : une liste de bloc d'informations à afficher dans l'écran. chaque information est constitué de : 
    - title : le titre
    - images : une succession d'image les unes à la suite des autres (en colonne)
    - carrousel : une liste d'images qui défilent en mode carrousel
    - description : une liste de texte à afficher tel quel.

Au niveau du carrousel : j'aimerais que les images défilent automatiquement sans besoin de cliquer. Elles possèdent toutes la même taille. Et quand on clique sur une image, elle se zoome pour s'afficher en grand sur l'écran.

Au niveau techique, je souhaite : 
- Un componant dédié au carrousel, qui prends une liste de string en paramètre (le path des images) et se débrouille avec
- un component dédié aux "informations"