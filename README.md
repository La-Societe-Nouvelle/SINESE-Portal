# SINESE Portal

Portail web pour accéder aux données ouvertes de La Société Nouvelle et publier l’empreinte sociétale et environnementale de son entreprise.

## À propos

Le portail SINESE (Système d'Information National sur l'Empreinte Sociétale des Entreprises) est une plateforme qui permet de :

- **Consulter** les empreintes sociétales et environnementales des entreprises françaises
- **Télécharger** des datasets d'open data sur les indicateurs SINESE
- **Publier** l'empreinte sociétale de son entreprise ou de ses clients
- **Rechercher** des informations sur les entreprises via leur SIREN
- **Visualiser** les données macroéconomiques SINESE

## Technologies

- Next.js 15, React 19, Bootstrap 5
- NextAuth.js, PostgreSQL
- OVH Object Storage (S3)

## Fonctionnalités

### Portail public

- 🔍 Recherche d'entreprises par SIREN/dénomination
- 📊 Visualisation des empreintes sociétales
- 📥 Téléchargement de datasets open data
- 📈 Données macroéconomiques agrégées
- 📧 Formulaire de contact

### Espace publications (authentifié)

- 🔐 Inscription/connexion sécurisée
- 🏢 Gestion d'unités légales
- 📝 Publication de l'empreinte sociétale
- 📂 Stockage sécurisé des documents
- 👤 Gestion du profil utilisateur

## Ressources La Société Nouvelle

### 🌐 [Site web officiel](https://lasocietenouvelle.org)
Découvrez notre mission, nos services et nos engagements pour une économie plus responsable.

### 📊 [API SINESE](https://api.sinese.fr)
API publique pour accéder aux données d'empreinte sociétale des entreprises françaises.
- Endpoint : `/v2/legalunits/{siren}/footprint`

### 📏 [Metriz](https://partners.metriz.lasocietenouvelle.org)
Application de mesure de l'empreinte sociétale pour les entreprises et experts-comptables.

## Contact

**La Société Nouvelle**
- Adresse : 165 avenue de Bretagne, 59000 LILLE
- Email : contact@lasocietenouvelle.org
- Web : [lasocietenouvelle.org](https://lasocietenouvelle.org)

---
