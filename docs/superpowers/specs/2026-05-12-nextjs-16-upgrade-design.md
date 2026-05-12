# Migration Next.js 15 → 16 — Design Spec

**Date :** 2026-05-12
**Approche choisie :** Option A — Codemod officiel + garder Webpack pour le build

---

## Contexte

Le projet SINESE-Portal tourne sur Next.js 15.5.7 / React 19.2.1 avec l'App Router.
Il utilise une configuration webpack personnalisée dans `next.config.js` (uniquement pour supprimer des warnings Sass/Bootstrap), ce qui empêche d'adopter Turbopack en build sans travail supplémentaire.

---

## Breaking changes impactant ce projet

### 1. Turbopack activé par défaut en build (critique)
Next.js 16 utilise Turbopack par défaut pour `next build`. La présence d'une config webpack dans `next.config.js` fait **échouer le build**.

**Solution :** Ajouter le flag `--webpack` au script `build` dans `package.json`.

```json
"build": "next build --webpack"
```

### 2. Renommage `middleware` → `proxy` (exception à appliquer)
Le codemod renomme `middleware.js` → `proxy.js`, mais le runtime `edge` n'est pas supporté dans `proxy`. Le fichier `middleware.js` utilise `next-auth/middleware` qui tourne sur edge.

**Solution :** Garder `middleware.js` tel quel. Après le codemod, **annuler** le renommage s'il a été appliqué.

### 3. Async `params` / `searchParams` (déjà migré)
Deux pages utilisent déjà `await params` / `await searchParams` :
- `app/(publications)/publications/(pages)/espace/publier/page.js` ✅
- `app/(publications)/publications/(pages)/espace/publier/[id]/page.js` ✅

Le codemod n'a rien à faire ici.

### 4. `revalidateTag` — 2e argument obligatoire
`revalidateTag` exige maintenant un 2e argument (`cacheLife` profile). **Aucune utilisation trouvée dans ce projet.** Aucune action requise.

### 5. `unstable_cacheLife` / `unstable_cacheTag` — préfixe supprimé
**Non utilisés dans ce projet.** Aucune action requise.

### 6. `next lint` supprimé
Le script `lint` n'existe pas dans `package.json` de ce projet. Aucune action requise.

### 7. `next/image` — nouveaux défauts
- `minimumCacheTTL` passe de 60s à 4h (acceptable)
- `imageSizes` perd la valeur `16` (acceptable)
- `qualities` limité à `[75]` par défaut (acceptable)

Aucune configuration custom `next/image` dans ce projet → pas d'action requise.

---

## Plan d'exécution

### Étape 1 — Exécuter le codemod officiel
```bash
npx @next/codemod@canary upgrade latest
```
Le codemod va :
- Mettre à jour `next`, `react`, `react-dom` vers leurs dernières versions
- Migrer la config `experimental.turbopack` au niveau racine (non utilisée ici)
- Supprimer le préfixe `unstable_` des APIs stabilisées (non utilisées ici)
- Tenter de renommer `middleware.js` → `proxy.js` (à **annuler**)

### Étape 2 — Annuler le renommage middleware
Si le codemod a renommé `middleware.js` en `proxy.js`, annuler avec git :
```bash
git checkout middleware.js
git rm proxy.js  # si créé
```

### Étape 3 — Modifier `package.json`
Ajouter `--webpack` au script `build` pour contourner le conflit Turbopack/webpack.

### Étape 4 — Vérification du build
```bash
npm run build
npm run dev
```
Corriger toute erreur résiduelle.

---

## Ce qui ne change PAS

- La config webpack dans `next.config.js` reste inchangée (suppression de warnings Sass)
- `middleware.js` / `next-auth` reste inchangé
- Aucune migration de composants ni de logique métier

---

## Critères de succès

- `npm run build` se termine sans erreur
- `npm run dev` démarre normalement
- Les routes protégées via `next-auth/middleware` fonctionnent toujours
- Aucune régression visuelle sur les pages principales
