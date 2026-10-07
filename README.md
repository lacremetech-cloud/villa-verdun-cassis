# Villa Jean Jaurès — Cassis

Site de présentation et brochure premium du bien, sur le modèle de
[chaletfontromeu](https://github.com/lacremetech-cloud/chaletfontromeu).

## Structure

```
index.html               landing
styles.css               feuille de style (polices auto-hébergées incluses)
main.js                  navigation, révélations, modale, galerie plein écran
brochure/index.html      brochure A4 — 16 pages, autonome, imprimable en PDF
                         (feuilletage : la page pivote sur son bord gauche)
assets/images/           15 photographies du bien
assets/fonts/            Cormorant Garamond & Jost (OFL 1.1), 20 fichiers woff2
assets/brand/            logo Prodigio (source, mot-symbole blanc, mot-symbole encre)
direction-artistique/    archive : comparatif des trois directions proposées
```

Site statique : aucun build, aucune dépendance. Déploiement direct sur Vercel.

## Direction artistique

Direction « Calanque », retenue parmi trois propositions. La palette est prélevée
sur les photographies du bien : le bleu `#5C7488` est celui des meubles de cuisine
et des volets. Typographie Cormorant Garamond (titres) et Jost (textes).

Les polices sont servies depuis le dépôt — aucune requête vers Google Fonts,
donc aucun transfert de données vers un tiers.

## Fond animé du hero

La photo aérienne reste la couche de base : elle s'affiche immédiatement, sert
d'affiche pendant le chargement et de solution de repli. La vidéo se fond
par-dessus une fois qu'elle joue réellement.

Elle n'est pas chargée du tout sur mobile (moins de 761 px), quand l'utilisateur
a désactivé les animations, ni sur connexion lente ou en mode données réduites.
Elle se met en pause dès que le hero sort du champ.

Sur les écrans étroits (moins de 1200 px), où la carte de capture passe sous
le texte, une photographie du bien s'intercale entre les deux : c'est
l'équivalent du lecteur vidéo mobile du site du chalet. Elle est visible sans
défiler, et la carte apparaît juste en dessous. Bloc `.hero__shot` dans
`index.html` : quand les vidéos du bien seront disponibles, remplacer le
`<img>` par un `<video muted loop playsinline>`, la mise en forme suit.

Deux sources possibles pour le fond animé, réglées en tête de `main.js` :

| Constante | Rôle |
|---|---|
| `HERO_VIDEO_MP4` | Fichier servi depuis le dépôt. **À privilégier** : aucun tiers, aucun logo, cadrage et boucle maîtrisés. Vide pour l'instant. |
| `HERO_VIDEO_ID` | Vidéo YouTube, intégrée via l'API officielle en domaine sans cookie. Actuellement `UE3kntZkW8o`, à partir de 40 s. |

Renseigner `HERO_VIDEO_MP4` suffit à basculer sur le fichier local : il prend
automatiquement le pas sur YouTube.

**Droits.** La vidéo `UE3kntZkW8o` — *CASSIS 🇫🇷 Drone Aerial 4K* — est l'œuvre de
**Polychronis Film**. L'intégration YouTube est le seul usage légitime d'une vidéo
tierce : elle reste servie par YouTube, l'auteur conserve attribution et
monétisation. Un téléchargement suivi d'un ré-hébergement sur le site serait une
contrefaçon. Pour un usage pleinement maîtrisé, il faut soit l'accord écrit de
l'auteur, soit des images propres au bien.

## À renseigner avant mise en ligne

| Élément | Emplacement |
|---|---|
| Pixel Meta | `index.html`, commentaire `TODO Meta Pixel` |
| Coordonnées Prodigio | `brochure/index.html`, page 16 (WhatsApp déjà branché) |
| Redirection du tunnel | Systeme.io, voir ci-dessous |
| Mentions légales, confidentialité | pied de page, liens `#` |

## Contact WhatsApp

`https://wa.me/33668680407`, présent en pastille verte au pied de chaque page
intérieure de la brochure, en bouton sur sa dernière page, et au pied du site.

## Formulaire de capture

Le bouton « Recevoir la brochure » ouvre une modale contenant l'iframe du
formulaire Prodigio :

```
https://go.prodigio.fr/bien/villa-jean-jaures/interet
```

Trois points à connaître :

1. **Il n'est chargé qu'à la première ouverture.** L'iframe porte
   `loading="lazy"` et la modale est masquée au repos : aucun appel réseau
   pour les visiteurs qui ne demandent pas la brochure. Vérifié.
2. **Il annonce sa hauteur** par `postMessage`
   (`prodigio:buyer-form:height`), appliquée dans `main.js` pour qu'il n'ait
   ni barre de défilement interne ni blanc en dessous. Le `min-height` de
   520 px tient la place en attendant, puis est relâché.
3. **Le message est doublement vérifié** : la fenêtre émettrice doit être cet
   iframe *et* son origine `https://go.prodigio.fr`. Le contrôle d'origine
   s'ajoute à l'extrait fourni : sans lui, n'importe quelle fenêtre de la page
   pourrait redimensionner le cadre.

Si le formulaire ne s'affiche pas au bout de dix secondes — réseau coupé,
bloqueur, service indisponible — un lien WhatsApp de secours remplace la
boîte vide. Vérifié aussi.

## Points à trancher

**L'ERP ne correspond pas au bien.** L'état des risques et pollutions transmis
(réf. 3739891 du 26/06/2026) porte sur le **17 avenue de Verdun**, parcelle
cadastrée **CL 58**. Le bien est la **Villa Jean Jaurès**, boulevard Jean Jaurès.
Deux adresses différentes : la page de synthèse ERP a donc été **retirée de la
brochure**. À réintégrer si vous confirmez que le document couvre bien ce bien,
ou à remplacer par le bon ERP.

**Surface.** L'annonce publique 1894 L'Immobilier (réf. 15919) indique
**160 m²** et 5 pièces, comme la première description transmise. Une seconde
description indiquait 170 m². C'est le chiffre de l'annonce qui est retenu.

| | Première version | Version retenue |
|---|---|---|
| Surface | 160 m² | **160 m²** (annonce 1894) |
| Chambres | 4 suites parentales | **4 chambres avec salle d'eau, dont 1 suite de plain-pied** |
| Stationnement | places privatives | **1 place** |

**DPE.** Les deux valeurs publiées sont certaines : 154 kWh/m²/an et
4 kgCO₂/m²/an. Les lettres affichées (**C** et **A**) en découlent par les seuils
réglementaires. À confirmer sur le diagnostic lui-même avant diffusion large.

## Photographies de Cassis

Cinq vues libres de droits provenant de Wikimedia Commons complètent les
photographies du bien, dans `assets/images/cassis/`. Les licences imposent
d'en citer les auteurs : la mention figure en pied de page du site et en
dernière page de la brochure. `assets/images/cassis/credits.json` conserve
le détail (œuvre, auteur, licence, page source).

| Fichier | Licence | Auteur |
|---|---|---|
| `cap-canaille-panorama.jpg` | CC BY-SA 4.0 | Chabe01 |
| `calanque-en-vau.jpg` | CC BY-SA 4.0 | kallerna |
| `calanque-port-miou.jpg` | CC BY-SA 4.0 | Chabe01 |
| `plage-grande-mer.jpg` | CC BY-SA 4.0 | Chabe01 |
| `port-de-cassis.jpg` | CC BY 3.0 | Jean-Christophe Benoist |

Les images ont été redimensionnées et recadrées : ces versions dérivées restent
sous la même licence que les originaux.

## Photographies manquantes

Aucune vue de la cuisine d'été ni de la cave. Toutes les vues intérieures montrent
la maison vide. La vue du village transmise (`cassis-cap-canaille.jpg`, 1066 px de
large) était trop petite pour un usage pleine largeur : elle a été remplacée par
les vues libres de droits ci-dessus.

## Logo

Le PNG fourni présente un défaut : les lettres de la baseline se chevauchent
(« IMMMOBILIER D'EXCEPTTIOON »). Seul le mot-symbole est donc utilisé ; la baseline
est composée dans la typographie du site.
