/* ============================================
   JURISTART — Client Supabase (navigateur)
   IMPORTANT : uniquement la Publishable Key ici.
   Ne jamais utiliser de Secret / service_role côté navigateur.
   ============================================ */

const SUPABASE_URL = 'https://wupoowrmamfgxkoyegyz.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_GUMgaE82vU5ojMoVJyFP1Q_aYt-BOtu';

if (!window.supabase) {
  throw new Error('La bibliothèque Supabase n\'a pas été chargée.');
}

window.juristartSupabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

// Phase de test : le MFA Supabase réel sera activé à l'étape suivante.
// Ne pas passer à true avant d'avoir enrôlé les comptes internes Juristart.
window.JURISTART_REQUIRE_REAL_MFA = false;
