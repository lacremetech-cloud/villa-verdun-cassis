#!/usr/bin/env bash
# Que sert vraiment Vercel, en ce moment ?
#
# `git log` dit ce que contient une branche, pas ce qui est en ligne. Les deux
# ont divergé pendant des jours sans que rien ne le signale. Ce script compare
# la page réellement servie au contenu de la branche déclarée dans LIVRAISON.md.
set -u

BRANCHE="${1:-claude/intelligent-rubin-0sbqog}"
URL="${2:-https://villa-verdun-cassis.vercel.app}"

echo "Branche déclarée : $BRANCHE"
echo "Adresse          : $URL"
echo

git fetch origin "$BRANCHE" --quiet || { echo "Impossible de récupérer la branche."; exit 2; }

normaliser() { tr -s '[:space:]' ' ' | sed 's/^ //; s/ $//'; }

enligne=$(curl -fsS --max-time 30 "$URL" | normaliser) || { echo "Le site n'a pas répondu."; exit 2; }
branche=$(git show FETCH_HEAD:index.html | normaliser)

if [ "$enligne" = "$branche" ]; then
  echo "✓ Le site en ligne correspond exactement à $BRANCHE ($(git rev-parse --short FETCH_HEAD))."
  exit 0
fi

echo "✗ ÉCART entre le site en ligne et $BRANCHE."
echo "  Soit le déploiement n'est pas terminé (attendre une minute et relancer),"
echo "  soit Vercel ne sert pas cette branche."
echo
echo "  taille en ligne : ${#enligne} caractères"
echo "  taille branche  : ${#branche} caractères"
exit 1
