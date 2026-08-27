# Juristart — Phase 1 Supabase

Cette version relie le prototype à Supabase pour les fonctions essentielles :

- authentification réelle e-mail / mot de passe ;
- récupération du rôle (`cabinet` / `juristart`) depuis `profiles` ;
- chargement réel des dossiers avec RLS ;
- création réelle d'un dossier ;
- stockage privé réel des pièces dans `juristart-documents` ;
- dépôt de pièces complémentaires ;
- actions Juristart : prise en charge, demande de complément, reprise, clôture ;
- dépôt et téléchargement réels des documents finaux ;
- notifications cabinet enregistrées en base.

## Avant de déployer cette version

1. Dans Supabase > SQL Editor, exécuter `supabase_phase2.sql` une seule fois.
2. Vérifier que le bucket `juristart-documents` est privé.
3. Vérifier que les politiques RLS créées précédemment sont actives.
4. Utiliser uniquement des données de test.
5. Pousser les fichiers modifiés sur le repository GitHub privé puis laisser Netlify redéployer.

## Comptes de test

Les identifiants e-mail affichés dans l'interface sont :

- `avocat.test@juristart.fr`
- `admin.test@juristart.fr`

Les mots de passe restent ceux créés directement dans Supabase et ne sont pas présents dans le code.

## Ce qui n'est PAS encore prêt pour la production

- MFA / 2FA Supabase réellement enrôlé et imposé aux comptes Juristart ;
- journal d'audit serveur immuable (le journal visible reste local pour l'instant) ;
- analyse antivirus / antimalware des fichiers ;
- notifications e-mail ;
- véritable ZIP serveur pour « télécharger tout » ;
- politique finale de conservation / purge ;
- sauvegardes et PRA/PCA vérifiés ;
- revue RGPD / contrat de sous-traitance / DPA ;
- revue de sécurité avant utilisation de vraies pièces clients.

**Ne pas utiliser de vraies pièces d'identité ou de vrais dossiers clients avant ces étapes.**
