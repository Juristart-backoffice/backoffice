> **IMPORTANT — ÉTAT DU PROJET**
> Ce document décrit en grande partie une **architecture cible**. La version Phase 1 connectée à Supabase met réellement en œuvre l’authentification par mot de passe, le RLS, la base PostgreSQL et le stockage privé Supabase. Le MFA réel, l’antivirus, les e-mails transactionnels, l’audit immuable/WORM, les sauvegardes/PITR et toute affirmation d’« hébergement souverain en France » doivent encore être configurés et vérifiés avant production.

# Juristart — Architecture Technique, Sécurité & Conformité RGPD

## 1. Vue d'ensemble & Principes directeurs

Ce document formalise les spécifications d'architecture technique et de sécurité pour la mise en production de la plateforme **Juristart**.

La plateforme repose sur 4 principes directeurs :
1. **Privacy & Security by Design** : Aucune donnée confidentielle n'est accessible sans vérification d'autorisation cryptographique et logique.
2. **Cloisonnement étanche multi-tenant** : Les cabinets d'avocats sont isolés par un identifiant de cabinet unique (`cabinet_id`). Un cabinet ne peut en aucun cas accéder aux métadonnées ou aux documents d'un confrère.
3. **Moindre privilège & Double facteur (2FA/MFA)** : Accès strictement restreint selon le rôle (`CABINET` vs `JURISTART_OPERATOR` / `JURISTART_ADMIN`). Le 2FA TOTP est obligatoire pour l'équipe Juristart.
4. **Traçabilité & Immuabilité** : Enregistrement continu de chaque action sensible dans un journal d'audit protégé contre l'altération.

---

## 2. Séparation des Espaces & Contrôle d'Accès (RBAC / ABAC)

```
                            ┌────────────────────────────────────────┐
                            │           CLIENT NAVIGATEUR            │
                            └────────────────────┬───────────────────┘
                                                 │ HTTPS / TLS 1.3
                                                 ▼
                            ┌────────────────────────────────────────┐
                            │       API GATEWAY / REVERSE PROXY      │
                            │   Rate Limiting • WAF • HSTS • CSP     │
                            └────────────────────┬───────────────────┘
                                                 │
                     ┌───────────────────────────┴───────────────────────────┐
                     ▼                                                       ▼
      ┌─────────────────────────────┐                         ┌─────────────────────────────┐
      │       ESPACE CABINET        │                         │   BACK-OFFICE JURISTART     │
      │  Rôle : CABINET             │                         │  Rôle : JURISTART_OPERATOR  │
      │  Filtre : WHERE cabinet_id  │                         │  Contrôle : 2FA / MFA TOTP  │
      └──────────────┬──────────────┘                         └──────────────┬──────────────┘
                     │                                                       │
                     └───────────────────────────┬───────────────────────────┘
                                                 │
                                                 ▼
                            ┌────────────────────────────────────────┐
                            │         MOTEUR DE PERMISSION           │
                            │       Tenant Isolation Guard           │
                            └────────────────────┬───────────────────┘
                                                 │
                     ┌───────────────────────────┴───────────────────────────┐
                     ▼                                                       ▼
      ┌─────────────────────────────┐                         ┌─────────────────────────────┐
      │     POSTGRESQL (CHUCK)      │                         │     OBJECT STORAGE (S3)     │
      │  Row-Level Security (RLS)   │                         │  Stockage Chiffré AES-256   │
      │  Données métier + Audit     │                         │  Accès via URLs Pré-signées │
      └──────────────┬──────────────┘                         └──────────────┬──────────────┘
```

### Modèle de Données & Isolation (Row-Level Security)
Au niveau de la base de données (PostgreSQL), la politique de sécurité **Row-Level Security (RLS)** est activée sur l'ensemble des tables métier :

```sql
-- Exemple de politique RLS stricte pour les dossiers
ALTER TABLE dossiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY cabinet_dossiers_isolation ON dossiers
    FOR ALL
    USING (
        current_setting('app.current_user_role') = 'JURISTART_OPERATOR'
        OR
        cabinet_id = current_setting('app.current_cabinet_id')::uuid
    );
```

---

## 3. Gestion de l'Authentification & Comptes Individuels

1. **Comptes individuels nominatifs** :
   - Aucun compte partagé autorisé (chaque avocat, juriste ou formaliste dispose de son propre compte).
   - Identifiant unique basé sur l'adresse e-mail professionnelle vérifiée par jeton cryptographique éphémère (TTL 24h).
2. **Hachage des mots de passe** :
   - Algorithme obligatoire : **Argon2id** (paramètres recommandés ANSSI : `t=3, m=64MB, p=4`).
   - Aucun mot de passe stocké en clair ou avec des algorithmes obsolètes (MD5, SHA1, simple SHA256).
3. **Authentification Multifacteur (MFA / 2FA)** :
   - Obligatoire pour l'équipe interne Juristart dès la première connexion (standard RFC 6238 TOTP compatible Google Authenticator, Bitwarden, 1Password, YubiKey).
   - Recommandée et activable à la demande pour les cabinets d'avocats.
4. **Gestion des sessions** :
   - Jetons JWT signés asymétriquement (EdDSA / RS256) ou sessions côté serveur stockées dans Redis avec expiration courte (1 heure d'inactivité) et rotation automatique des Refresh Tokens.
   - Cookies positionnés en `Secure`, `HttpOnly`, `SameSite=Strict`.

---

## 4. Stockage Sécurisé des Documents & Pièces Justificatives

Les documents juridiques (statuts, PV, pièces d'identité, KBIS) constituent des données hautement sensibles :

1. **Localisation des données** :
   - Hébergement exclusif dans l'**Union Européenne (France de préférence)**.
   - Fournisseurs conformes ISO 27001, HDS et RGPD (ex. Scaleway Paris ou OVHcloud Gravelines/Roubaix).
2. **Chiffrement au repos (At-Rest)** :
   - Chiffrement côté serveur **AES-256-GCM** / SSE-KMS avec clés managées et renouvelées périodiquement.
3. **Accès et téléchargements sécurisés (URLs Pré-signées)** :
   - Aucun bucket S3 ou répertoire de fichiers n'est ouvert au public.
   - Tout téléchargement nécessite une requête authentifiée auprès de l'API Juristart qui valide les permissions (`cabinet_id`), enregistre l'événement dans le journal d'audit, puis génère une **URL temporaire signée** valable **15 minutes maximum**.
4. **Pipeline d'analyse Antivirus / Antimalware** :
   - Tout fichier entrant est placé dans un sas d'isolation (`quarantine/`), soumis à une analyse automatique (ClamAV / moteur d'analyse de signatures), puis transféré dans le stockage principal uniquement s'il est validé `CLEAN`.

---

## 5. Sécurité des Échanges (In-Transit) & Réseau

1. **Chiffrement réseau** :
   - HTTPS / TLS 1.3 obligatoire avec désactivation des suites cryptographiques obsolètes (TLS 1.0/1.1, SSLv3).
   - En-tête **HSTS (HTTP Strict Transport Security)** configuré avec `max-age=63072000; includeSubDomains; preload`.
2. **En-têtes de Sécurité HTTP** :
   - `Content-Security-Policy` (CSP) stricte interdisant l'exécution de scripts inline non signés.
   - `X-Content-Type-Options: nosniff`.
   - `X-Frame-Options: DENY` (protection anti-clickjacking).
   - `Referrer-Policy: strict-origin-when-cross-origin`.

---

## 6. Journalisation Immuable & Traçabilité (Audit Logs)

Chaque action sensible génère un enregistrement d'audit structuré (JSON) non modifiable :

| Type d'événement | Description | Métadonnées enregistrées |
|------------------|-------------|--------------------------|
| `AUTH_LOGIN` | Connexion utilisateur | `user_id`, `role`, `ip_address`, `user_agent`, `timestamp` |
| `AUTH_MFA_SUCCESS` | Validation second facteur | `user_id`, `method (TOTP)`, `timestamp` |
| `DOSSIER_CREATED` | Dépôt initial de dossier | `dossier_ref`, `cabinet_id`, `nb_pieces`, `sha256_hashes` |
| `DOCUMENT_UPLOADED` | Ajout d'une pièce | `dossier_ref`, `filename`, `filesize`, `uploader_id` |
| `DOCUMENT_DOWNLOADED` | Génération de lien de téléchargement | `dossier_ref`, `filename`, `requester_id`, `signed_url_expiry` |
| `DEMAND_SENT` | Demande de justificatif | `dossier_ref`, `operator_id`, `demand_text` |
| `STATUS_CHANGED` | Modification d'état | `dossier_ref`, `old_status`, `new_status`, `operator_id` |
| `DOSSIER_CLOSED` | Clôture définitive | `dossier_ref`, `operator_id`, `final_documents_count` |
| `ACCESS_DENIED_403` | Tentative d'accès non autorisée | `user_id`, `attempted_resource`, `ip_address` |

Les logs sont exportés vers un stockage distant en mode Append-Only (WORM - Write Once Read Many) conservé pendant 12 mois minimum pour répondre aux exigences légales.

---

## 7. Sauvegardes & Continuité d'Activité (PRA / PCA)

1. **Sauvegardes de la base de données** :
   - Sauvegarde complète quotidienne chiffrée.
   - Sauvegarde continue des journaux de transactions (WAL) permettant une restauration à la seconde près (**Point-in-Time Recovery - PITR**).
   - Objectifs : **RPO < 15 minutes** (perte de données maximale admissible) / **RTO < 2 heures** (délai maximal de reprise).
2. **Géo-redondance** :
   - Réplication des sauvegardes dans deux centres de données distincts situés en France (ex. Paris et Roubaix).
3. **Tests de restauration** :
   - Procédure de restauration automatique testée chaque trimestre en environnement isolé.

---

## 8. Cycle de Vie des Données & Conformité RGPD

1. **Minimisation des données** :
   - Aucun champ superflu collecté lors du dépôt de dossier (uniquement nom de société, type de formalité, pièces et instructions).
2. **Durée de conservation & Archivage** :
   - Dossiers actifs : conservés pendant la durée de la formalité.
   - Dossiers clôturés : accessibles en téléchargement direct pendant **12 mois**, puis archivés de manière chiffrée pendant la durée de prescription légale (5 ans), avant purge automatisée.
3. **Droit d'accès, de rectification et d'effacement** :
   - Procédure d'export complet des données d'un cabinet sous format structuré (JSON + ZIP d'actes).
   - Suppression sécurisée (écrasement cryptographique des clés de chiffrement de l'objet).

---

## 9. Registre des Sous-Traitants Techniques (Conformité RGPD Art. 28)

Conformément à la volonté de maîtriser strictement les sous-traitants, voici la cartographie exclusive des tiers prévus :

| Catégorie | Prestataire sélectionné | Siège & Localisation des données | Données traitées | Justification technique |
|-----------|-------------------------|----------------------------------|------------------|-------------------------|
| **Hébergement & Serveurs** | Scaleway SAS / OVHcloud | 🇫🇷 France (Paris / Roubaix) | Code applicatif, mémoire vive, conteneurs chiffrés | Hébergement souverain sous juridiction française et européenne (immunité CLOUD Act). |
| **Base de données & Stockage S3** | Scaleway Elements Object Storage | 🇫🇷 France (Région fr-par) | Dossiers, pièces justificatives chiffrées AES-256 | Stockage haute disponibilité certifié ISO 27001 avec chiffrement at-rest et URLs signées. |
| **Envoi d'e-mails transactionnels** | Brevo (ex-Sendinblue) | 🇫🇷 France (Paris) | Adresse e-mail du destinataire, nom du cabinet | Notification de dépôt, d'action requise et lien de réinitialisation sécurisé. |
| **Authentification & 2FA** | Moteur interne (Node.js / Go) | 🇫🇷 France (Interne) | Hash Argon2id, clés secrètes TOTP | Aucun sous-traitant d'authentification externe (Auth0, Okta, Firebase) pour conserver la souveraineté totale des accès. |
| **Analyse Antivirus** | ClamAV (Moteur Open Source en conteneur) | 🇫🇷 France (Interne) | Flux d'octets temporaires en mémoire | Analyse antivirale locale sans partage de fichiers avec des tiers de télémétrie. |

---

## 10. Procédure de Clôture Sécurisée des Dossiers

Pour éviter toute clôture accidentelle ou restitution incomplète :
1. **Contrôle automatique de présence des livrables** : Le système vérifie qu'au moins un acte final (Kbis, récépissé, synthèse) est associé au dossier.
2. **Avertissement bloquant ou dérogatoire** : Si aucun document final n'est téléversé, le bouton de clôture est verrouillé par défaut, imposant une case à cocher explicite de confirmation dérogatoire.
3. **Notification atomique** : La mise à jour de statut (`Terminé`), l'attribution des droits de téléchargement au cabinet et l'envoi de l'alerte e-mail sont exécutés dans une transaction atomique.
