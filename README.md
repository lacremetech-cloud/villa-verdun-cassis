# Villa Verdun — Cassis

Site de présentation et brochure premium du bien, sur le modèle exact de la
[Villa Jean Jaurès](https://github.com/lacremetech-cloud/Villa-jeanajures-Cassis)
(elle-même calquée sur [chaletfontromeu](https://github.com/lacremetech-cloud/chaletfontromeu)).

Villa contemporaine, 17 avenue de Verdun à Cassis. 135 m² habitables entièrement
restructurés, plus de 600 m² de terrain paysagé, 4 chambres, 4 salles d'eau, 3 WC,
studio indépendant de 16 m², piscine, vue mer et Cap Canaille, DPE B / GES A.
**1 590 000 € FAI**
(le prix figure dans la brochure, pas sur la landing, comme pour Jean Jaurès).

## Structure

```
index.html               landing
styles.css               feuille de style (polices auto-hébergées incluses)
main.js                  navigation, révélations, modale, galerie plein écran
brochure/index.html      brochure A4 — 16 pages, autonome, imprimable en PDF
                         (feuilletage : la page pivote sur son bord gauche)
assets/images/           26 photographies du bien (dossier Drive du 29/09/2026)
assets/images/cassis/    5 vues de Cassis libres de droits
assets/fonts/            Cormorant Garamond & Jost (OFL 1.1), 20 fichiers woff2
assets/brand/            logo Prodigio (source, mot-symbole blanc, mot-symbole encre)
```

Site statique : aucun build, aucune dépendance. Déploiement direct sur Vercel.

## Direction artistique

Direction « Calanque », reprise à l'identique de la Villa Jean Jaurès : même
palette (bleu `#5C7488`, qui répond ici aux menuiseries noires et à la mer),
mêmes typographies Cormorant Garamond (titres) et Jost (textes), mêmes gabarits
de sections et de pages.

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
le texte, une photographie du bien (la terrasse de l'étage) s'intercale entre les deux : c'est
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
| **Tunnel Systeme.io de la Villa Verdun** | `main.js`, constante `FORM_SCRIPT_URL` (vide pour l'instant) |
| Pixel Meta | `index.html`, commentaire `TODO Meta Pixel` |
| Taxe foncière | `brochure/index.html`, page 15 (« sur demande ») |
| Mentions légales, confidentialité | pied de page, liens `#` |

## Contact WhatsApp

`https://wa.me/33668680407`, présent en pastille verte au pied de chaque page
intérieure de la brochure, en bouton sur sa dernière page, et au pied du site.

## Formulaire de capture

Le bouton « Recevoir la brochure » ouvre une modale dans laquelle est injecté le
script d'un tunnel Systeme.io, exactement comme sur la Villa Jean Jaurès.

**Le tunnel de Jean Jaurès n'a pas été repris** : sa page de remerciement renvoie
vers la brochure de Jean Jaurès, un prospect de la Villa Verdun aurait donc reçu
le mauvais dossier. Tant que `FORM_SCRIPT_URL` est vide, la modale propose
directement WhatsApp. Pour brancher le formulaire :

1. Dupliquer le tunnel Jean Jaurès dans Systeme.io.
2. Renseigner l'URL du script dans `main.js` :
   ```js
   var FORM_SCRIPT_URL = 'https://lecambredaze.systeme.io/public/remote/page/XXXXXXXX.js';
   ```
3. Pointer la page de remerciement vers la brochure :
   ```
   https://<domaine-vercel-du-projet>/brochure/
   ```

Le fonctionnement reste celui de Jean Jaurès : script injecté au premier clic,
dans le conteneur `#brochureFormContainer` (il s'auto-positionne après
lui-même), iframe masqué jusqu'à ce que Systeme.io renvoie sa hauteur, lien
WhatsApp de secours au bout de dix secondes.

## Diagnostics (DDT n° 259883 du 26/06/2026)

Source de tous les chiffres techniques du site : dossier de diagnostic technique
de General Services Contrôles, établi pour SAS JCAN IMMO, 17 avenue de Verdun.

**DPE.** Classe **B**, 74 kWh/m²/an en énergie primaire ; GES classe **A**,
2 kgCO₂/m²/an. Dépenses annuelles estimées entre 970 € et 1 360 € (prix moyens
2021 à 2023). N° ADEME 2613E1732500I, valable jusqu'au 25/06/2036. Affiché dans
les prestations de la landing et en page 13 de la brochure (gabarit DPE de la
Villa Jean Jaurès).

**Surfaces.** L'annonce initiale n'était pas conforme à l'attestation de surface ;
**ce sont les chiffres du DDT qui sont retenus** :

| | Annonce | Site (DDT) |
|---|---|---|
| Surface habitable | 145 m² | **135 m²** (135,16) |
| Pièce de vie et cuisine | 50 m² | **52 m²** (51,96) |
| Suite parentale | près de 20 m² | **20 m², salle d'eau comprise** (15,16 + 5,04) |
| Chambre de l'étage | 15 m² | **12 m²** (12,33) |
| Studio | 20 m² | **16 m²** (13,87 + salle d'eau/WC 2,20) |
| Salles de bains | 4 | **4 salles d'eau** (3 dans la maison, 1 au studio) |
| Garage, cave, balcon | — | 19,7 m², 13,3 m², 20 m² (hors surface habitable) |

Pièce modulable (« bureau ») : 10,58 m². Chambre du rez-de-chaussée : 10,93 m².
Le terrain n'est pas mesuré par le DDT : « plus de 600 m² » reste le chiffre
de l'annonce.

Amiante, termites et installation électrique : aucune anomalie relevée.

**ERP.** Le DDT renvoie à un document joint. L'état des risques réf. 3739891 du
26/06/2026, transmis par erreur pour la Villa Jean Jaurès et retiré de sa brochure,
porte sur le 17 avenue de Verdun, parcelle CL 58 : c'est celui de ce bien.

## Points à trancher

**Distances.** Contrairement au boulevard Jean Jaurès, l'avenue de Verdun n'est
pas présentée comme « tout à pied » : le site parle de port, marché et plages
« à quelques minutes ».

**Studio et location saisonnière.** Le revenu locatif est mentionné « dans le
respect de la réglementation locale » (déclaration en mairie à Cassis).

## Photographies manquantes

Aucune vue de la cuisine, du studio, de la pièce modulable, de la chambre de
plain-pied, de la chambre de 15 m², du garage ni de la cave. Toutes les vues
intérieures montrent la maison vide. Les pages concernées s'appuient sur les
vues de la pièce de vie et des façades.

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

## Logo

Le PNG fourni présente un défaut : les lettres de la baseline se chevauchent
(« IMMMOBILIER D'EXCEPTTIOON »). Seul le mot-symbole est donc utilisé ; la baseline
est composée dans la typographie du site.
