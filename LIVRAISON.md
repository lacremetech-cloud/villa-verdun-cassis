# Livraison

Ce fichier existe parce qu'on a passé une soirée à deviner quelle branche était
en ligne. Il répond en premier, et on le tient à jour.

## Ce qui est déployé

| | |
|---|---|
| **Projet** | Landing Villa Verdun |
| **Branche servie par Vercel** | `main` |
| **Adresse publique** | https://villa-verdun-cassis.vercel.app |

**Pousser sur cette branche déploie.** Pousser ailleurs ne déploie rien — y
compris sur `main` si ce n'est pas la branche ci-dessus.

## Une confusion à ne pas refaire

La branche par défaut de **GitHub** et la branche de production de **Vercel**
sont deux réglages distincts, qui peuvent différer. Sur le dépôt voisin
(Jean Jaurès) ils différaient, et ça a été lu de travers une fois.

**Seul le réglage Vercel compte** pour savoir ce qui est en ligne :
*Project Settings → Environments → Production → Branch Tracking*.

Ce projet a longtemps servi `claude/intelligent-rubin-0sbqog`, une branche de
travail au nom illisible que personne ne pouvait deviner. Il sert `main` depuis
le 16 octobre.

## Vérifier ce qui est réellement en ligne

```sh
./verifier-en-ligne.sh
```

Ne jamais se fier à `git log` seul : il dit ce que contient une branche, pas ce
que sert Vercel. Les deux ont divergé pendant des jours sans que rien ne le
signale.

## Avant de pousser

1. `npm run typecheck && npm run test:run` — s'il y a un `package.json`.
2. Relire son propre diff en cherchant ce qui pourrait casser.
3. Après la poussée, **vérifier en ligne** avec la commande ci-dessus. Une
   poussée n'est pas une livraison tant qu'on ne l'a pas constatée.

## Si ça casse

Revenir au commit précédent et pousser :

```sh
git revert --no-edit <commit fautif>
git push origin main
```

Vercel reconstruit. Ne pas changer la branche de production pour « forcer » une
livraison : c'est ce qui crée les divergences qu'on paie ensuite.

## Migrations de base de données

Une migration qui touche une contrainte `check` doit vérifier **la valeur par
défaut de la colonne** dans la même migration. Une contrainte resserrée sans
son défaut a rejeté 65 dépôts d'acquéreurs en vingt-deux heures, sans un
signal. Un test relit désormais toutes les migrations et refuse ce cas
(`src/modules/buyers/crm/valeurs-par-defaut.test.ts`).
