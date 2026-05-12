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

### 2. Renommage `middleware` → `proxy` + refactorisation next-auth
Le codemod renomme `middleware.js` → `proxy.js`. Le runtime `edge` n'est pas supporté dans `proxy`, donc `withAuth` de `next-auth/middleware` (edge) doit être remplacé.

**Solution :** Laisser le codemod renommer le fichier, puis refactoriser `proxy.js` pour utiliser `getToken` de `next-auth/jwt` (compatible Node.js) à la place de `withAuth`.

Le projet utilise la stratégie JWT (`session: { strategy: "jwt" }`), ce qui rend `getToken` directement utilisable dans le proxy.

Avant (middleware.js — edge) :
```js
import { withAuth } from "next-auth/middleware";
export const middleware = withAuth(function middleware(req) { ... }, { callbacks: { authorized } });
```

Après (proxy.js — nodejs) :
```js
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function proxy(request) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token && request.nextUrl.pathname.startsWith("/publications/espace")) {
    return NextResponse.redirect(new URL("/publications/connexion", request.url));
  }

  if (token && (request.nextUrl.pathname === "/publications/connexion" ||
                request.nextUrl.pathname === "/publications/inscription")) {
    return NextResponse.redirect(new URL("/publications/espace", request.url));
  }
}

export const config = {
  matcher: ["/publications/:path*", "/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

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

### Étape 2 — Refactoriser `proxy.js`
Après le codemod, réécrire `proxy.js` pour remplacer `withAuth` (edge) par `getToken` (nodejs) :
- Importer `getToken` depuis `next-auth/jwt` au lieu de `withAuth` depuis `next-auth/middleware`
- Réécrire la logique de redirection avec `getToken` (voir code cible dans la section breaking changes)
- Renommer l'export `middleware` en `proxy`
- Supprimer l'ancienne `middleware.js` si le codemod ne l'a pas fait

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
- `getServerSession` dans les routes API reste inchangé
- Aucune migration de composants ni de logique métier

---

## Critères de succès

- `npm run build` se termine sans erreur
- `npm run dev` démarre normalement
- Les routes protégées via `next-auth/middleware` fonctionnent toujours
- Aucune régression visuelle sur les pages principales
