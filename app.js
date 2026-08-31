/* ============================================
   JURISTART — Secure Multi-Tenant Core Engine
   RBAC Authentication, Zero Role Bleed & Audit Logging
   ============================================ */

// ---- Session & Contexte de Connexion ----
let session = {
  isAuthenticated: false,
  role: null, // 'cabinet' | 'juristart' | null
  userId: null,
  cabinetId: null,
  cabinetName: '',
  userName: '',
  initials: '',
  email: '',
  mfaVerified: false,
  ipAddress: '194.214.12.84 (Paris, FR)'
};

// Base d'identités utilisateur de démonstration
const usersDatabase = [
  {
    email: 'm.caron@cabinet-caron.fr',
    role: 'cabinet',
    userId: 'usr_cab_caron_01',
    cabinetId: 'cab_caron',
    cabinetName: 'Cabinet Caron & Associés',
    userName: 'Maître Marc Caron',
    initials: 'MC',
    mfaRequired: false
  },
  {
    email: 'claire.delorme@juristart.fr',
    role: 'juristart',
    userId: 'usr_juri_delorme_04',
    cabinetId: null,
    cabinetName: 'Équipe Formalités Juristart',
    userName: 'Claire Delorme — Responsable Formalités',
    initials: 'CD',
    mfaRequired: true
  }
];

// ---- Données Démo (Multi-Tenant cloisonné par cabinetId) ----
let dossiersData = [
  {
    ref: 'JS-2026-0042',
    cabinetId: 'cab_caron',
    cabinet: 'Cabinet Caron & Associés',
    societe: 'SAS Alpha Conseil',
    type: 'Création de société (SAS)',
    dateTransmission: '27 août 2026',
    statut: 'recu', // 'recu' | 'en_traitement' | 'action_requise' | 'termine'
    instructions: 'Immatriculation SAS au capital de 10 000 €. 2 associés fondateurs. Démarrage activité prévu au 1er septembre.',
    actionRequiredMessage: '',
    documentsComplets: [
      { id: 'doc_4201', name: 'Statuts constitutifs signés.pdf', size: '1.4 Mo', date: '27 août 2026', scanStatus: 'CLEAN' },
      { id: 'doc_4202', name: 'Attestation de dépôt des fonds.pdf', size: '280 Ko', date: '27 août 2026', scanStatus: 'CLEAN' },
      { id: 'doc_4203', name: 'Pièces d’identité des fondateurs.pdf', size: '850 Ko', date: '27 août 2026', scanStatus: 'CLEAN' }
    ],
    documentsFinaux: []
  },
  {
    ref: 'JS-2026-0038',
    cabinetId: 'cab_caron',
    cabinet: 'Cabinet Caron & Associés',
    societe: 'SARL Tech Solutions',
    type: 'Changement de dirigeant',
    dateTransmission: '26 août 2026',
    statut: 'action_requise',
    instructions: 'Remplacement du gérant partant suite à AGO du 20 août.',
    actionRequiredMessage: 'Merci de transmettre le justificatif de domicile de moins de 3 mois du nouveau gérant ainsi que sa pièce d’identité recto-verso.',
    documentsComplets: [
      { id: 'doc_3801', name: 'Procès-verbal d’assemblée générale.pdf', size: '420 Ko', date: '26 août 2026', scanStatus: 'CLEAN' },
      { id: 'doc_3802', name: 'Statuts modifiés.pdf', size: '1.1 Mo', date: '26 août 2026', scanStatus: 'CLEAN' }
    ],
    documentsFinaux: []
  },
  {
    ref: 'JS-2026-0031',
    cabinetId: 'cab_veil',
    cabinet: 'Cabinet Veil & Jourdan',
    societe: 'SCI Les Terrasses de Neuilly',
    type: 'Transfert de siège social',
    dateTransmission: '25 août 2026',
    statut: 'en_traitement',
    instructions: 'Transfert du siège de Paris 16e à Neuilly-sur-Seine. Formalité en cours auprès du greffe de Nanterre.',
    actionRequiredMessage: '',
    documentsComplets: [
      { id: 'doc_3101', name: 'PV d’AGE de transfert.pdf', size: '560 Ko', date: '25 août 2026', scanStatus: 'CLEAN' },
      { id: 'doc_3102', name: 'Attestation de parution JAL.pdf', size: '190 Ko', date: '25 août 2026', scanStatus: 'CLEAN' }
    ],
    documentsFinaux: []
  },
  {
    ref: 'JS-2026-0024',
    cabinetId: 'cab_caron',
    cabinet: 'Cabinet Caron & Associés',
    societe: 'SAS Innovation Lab',
    type: 'Création de société (SAS)',
    dateTransmission: '14 août 2026',
    statut: 'termine',
    instructions: 'Création SAS au capital de 10 000 €. Siège à Paris 8e.',
    actionRequiredMessage: '',
    documentsComplets: [
      { id: 'doc_2401', name: 'Dossier complet immatriculation.pdf', size: '2.8 Mo', date: '14 août 2026', scanStatus: 'CLEAN' }
    ],
    documentsFinaux: [
      { id: 'fin_2401', name: 'Extrait Kbis définitif', filename: 'kbis_sas_innovation_lab.pdf', size: '245 Ko', date: '18 août 2026', scanStatus: 'CLEAN' },
      { id: 'fin_2402', name: 'Récépissé de formalité INPI', filename: 'recepisse_inpi_innovation_lab.pdf', size: '120 Ko', date: '18 août 2026', scanStatus: 'CLEAN' },
      { id: 'fin_2403', name: 'Statuts enregistrés et certifiés', filename: 'statuts_enregistres_innovation_lab.pdf', size: '1.4 Mo', date: '18 août 2026', scanStatus: 'CLEAN' },
      { id: 'fin_2404', name: 'Synthèse du dossier de création', filename: 'synthese_formalite_juristart.pdf', size: '310 Ko', date: '18 août 2026', scanStatus: 'CLEAN' }
    ]
  },
  {
    ref: 'JS-2026-0012',
    cabinetId: 'cab_lefevre',
    cabinet: 'Cabinet Lefèvre-Bertrand',
    societe: 'EURL Martin Conseil',
    type: 'Dissolution',
    dateTransmission: '05 août 2026',
    statut: 'termine',
    instructions: 'Dissolution amiable et clôture des opérations de liquidation.',
    actionRequiredMessage: '',
    documentsComplets: [
      { id: 'doc_1201', name: 'Comptes de clôture + PV.pdf', size: '940 Ko', date: '05 août 2026', scanStatus: 'CLEAN' }
    ],
    documentsFinaux: [
      { id: 'fin_1201', name: 'Certificat de radiation définitif', filename: 'radiation_martin_conseil.pdf', size: '180 Ko', date: '12 août 2026', scanStatus: 'CLEAN' },
      { id: 'fin_1202', name: 'Avis de publication BODACC', filename: 'parution_bodacc_martin.pdf', size: '95 Ko', date: '12 août 2026', scanStatus: 'CLEAN' }
    ]
  }
];

// ---- Journal d'audit local du prototype (non immuable) ----
let auditLogs = [
  {
    timestamp: '27/08/2026 15:45:10',
    event: 'SYSTEM_INIT',
    user: 'Système Juristart',
    role: 'SYSTEM',
    ref: '-',
    ip: '127.0.0.1',
    details: 'Initialisation de l\'architecture de sécurité et du moteur RBAC'
  }
];

let notifications = {
  cabinet: [
    {
      id: 101,
      type: 'action',
      text: 'Une action est requise sur le dossier <strong>SARL Tech Solutions</strong>.',
      dossierRef: 'JS-2026-0038',
      date: 'Il y a 2 heures',
      unread: true
    }
  ],
  juristart: [
    {
      id: 201,
      type: 'new',
      text: 'Nouveau dossier reçu de <strong>Cabinet Caron & Associés</strong> (SAS Alpha Conseil).',
      dossierRef: 'JS-2026-0042',
      date: 'Aujourd’hui',
      unread: true
    }
  ]
};

const SECURITY_CONFIG = {
  maxFileSize: 50 * 1024 * 1024,
  allowedExtensions: ['pdf', 'docx', 'doc', 'jpg', 'jpeg', 'png', 'tif', 'tiff', 'zip']
};

const formalitesSuggestions = [
  'Création de société (SAS)',
  'Création de société (SARL / EURL)',
  'Création de société (SCI)',
  'Création de société (SA / SASU)',
  'Transfert de siège social',
  'Changement de dirigeant / gérant / président',
  'Modification d’activité / objet social',
  'Augmentation de capital social',
  'Réduction de capital social',
  'Cession de parts sociales / actions',
  'Modification de dénomination sociale',
  'Prorogation de durée de la société',
  'Dissolution amiable',
  'Liquidation et radiation',
  'Dépôt des comptes annuels',
  'Ouverture d’établissement secondaire',
  'Fermeture d’établissement secondaire',
  'Transformation de forme juridique',
  'Mise en sommeil de société',
  'Autre formalité juridique'
];

let activeDossierRef = null;
let currentCabinetFilter = 'all';
let currentJuristartFilter = 'all';
let globalSearchQuery = '';
let tempCabinetUploadedFiles = [];
let pendingMfaUser = null;


// ============================================
// SUPABASE — BACKEND RÉEL (PHASE 1)
// ============================================
const sb = window.juristartSupabase;
const STORAGE_BUCKET = 'juristart-documents';

// Réinitialisation de mot de passe Supabase.
// Lorsqu'un lien de récupération est ouvert, Supabase crée une session temporaire
// et émet PASSWORD_RECOVERY. On force alors l'affichage de l'écran dédié.
let passwordRecoveryActive = false;
if (sb) {
  sb.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY') {
      passwordRecoveryActive = true;
      setTimeout(() => {
        navigateTo('login');
        showAuthSubView('update-password');
      }, 0);
    }
  });
}

function getInitials(name) {
  return String(name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join('') || 'JS';
}

function formatDateFr(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function sanitizeStorageFilename(name) {
  return String(name || 'document')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_');
}

async function hydrateSessionFromSupabase() {
  if (!sb) return false;

  const { data: authData, error: authError } = await sb.auth.getSession();
  if (authError || !authData?.session?.user) return false;

  const user = authData.session.user;
  const { data: profile, error: profileError } = await sb
    .from('profiles')
    .select('id, cabinet_id, full_name, email, role, cabinets(name)')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    console.error('Profil Supabase introuvable', profileError);
    return false;
  }

  const isJuristart = profile.role === 'juristart';
  let mfaVerified = !isJuristart || !window.JURISTART_REQUIRE_REAL_MFA;

  if (isJuristart && window.JURISTART_REQUIRE_REAL_MFA) {
    try {
      const { data: aal } = await sb.auth.mfa.getAuthenticatorAssuranceLevel();
      mfaVerified = aal?.currentLevel === 'aal2';
    } catch (err) {
      console.error('Impossible de vérifier le niveau MFA', err);
      mfaVerified = false;
    }
  }

  const fullName = profile.full_name || user.email || (isJuristart ? 'Équipe Juristart' : 'Utilisateur Cabinet');
  session = {
    isAuthenticated: true,
    role: profile.role,
    userId: user.id,
    cabinetId: profile.cabinet_id,
    cabinetName: isJuristart ? 'Équipe Formalités Juristart' : (profile.cabinets?.name || 'Cabinet partenaire'),
    userName: fullName,
    initials: getInitials(fullName),
    email: profile.email || user.email || '',
    mfaVerified,
    ipAddress: 'Journalisé côté serveur à activer'
  };

  // IMPORTANT : un compte interne Juristart en AAL1 ne charge aucune donnée métier.
  if (!(isJuristart && window.JURISTART_REQUIRE_REAL_MFA && !mfaVerified)) {
    await loadWorkspaceFromSupabase();
  }
  return true;
}

async function loadWorkspaceFromSupabase() {
  if (!sb || !session.isAuthenticated) return;

  let dossierSelect = `
    id, reference, cabinet_id, created_by, company_name, formalite_type,
    instructions, status, created_at, closed_at, action_required_message,
    cabinets(name)
  `;

  let { data: rows, error } = await sb
    .from('dossiers')
    .select(dossierSelect)
    .order('created_at', { ascending: false });

  // Compatibilité si le patch SQL phase 2 n'a pas encore été exécuté.
  if (error && String(error.message || '').includes('action_required_message')) {
    const fallback = await sb
      .from('dossiers')
      .select(`id, reference, cabinet_id, created_by, company_name, formalite_type, instructions, status, created_at, closed_at, cabinets(name)`)
      .order('created_at', { ascending: false });
    rows = fallback.data;
    error = fallback.error;
  }

  if (error) {
    console.error('Erreur chargement dossiers', error);
    showToast('Impossible de charger les dossiers depuis Supabase');
    return;
  }

  const dossierIds = (rows || []).map(r => r.id);
  let docs = [];
  if (dossierIds.length > 0) {
    const docResult = await sb
      .from('documents')
      .select('id, dossier_id, kind, file_name, storage_path, mime_type, size_bytes, visible_to_cabinet, created_at')
      .in('dossier_id', dossierIds)
      .order('created_at', { ascending: true });
    if (docResult.error) console.error('Erreur chargement documents', docResult.error);
    docs = docResult.data || [];
  }

  dossiersData = (rows || []).map(r => {
    const dossierDocs = docs.filter(d => d.dossier_id === r.id);
    const mapDoc = d => ({
      id: d.id,
      name: d.file_name,
      filename: d.file_name,
      size: formatFileSize(Number(d.size_bytes || 0)),
      date: formatDateFr(d.created_at),
      storagePath: d.storage_path,
      mimeType: d.mime_type,
      scanStatus: 'NON_SCANNÉ'
    });

    return {
      id: r.id,
      ref: r.reference,
      cabinetId: r.cabinet_id,
      cabinet: r.cabinets?.name || 'Cabinet partenaire',
      societe: r.company_name,
      type: r.formalite_type,
      dateTransmission: formatDateFr(r.created_at),
      statut: r.status,
      instructions: r.instructions || '',
      actionRequiredMessage: r.action_required_message || '',
      documentsComplets: dossierDocs.filter(d => d.kind !== 'juristart_final').map(mapDoc),
      documentsFinaux: dossierDocs.filter(d => d.kind === 'juristart_final').map(mapDoc)
    };
  });

  await loadNotificationsFromSupabase();
  renderSidebarNav();
  renderNotifications();
}

async function loadNotificationsFromSupabase() {
  if (!sb || !session.isAuthenticated) return;

  if (session.role === 'cabinet') {
    const { data, error } = await sb
      .from('notifications')
      .select('id, dossier_id, title, message, created_at, read_at, dossiers(reference, company_name)')
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error) {
      notifications.cabinet = (data || []).map(n => ({
        id: n.id,
        type: (n.title || '').toLowerCase().includes('action') ? 'action' : ((n.title || '').toLowerCase().includes('termin') ? 'done' : 'new'),
        text: `<strong>${escapeHtml(n.title || 'Notification')}</strong>${n.message ? ` — ${escapeHtml(n.message)}` : ''}`,
        dossierRef: n.dossiers?.reference || '',
        date: formatDateFr(n.created_at),
        unread: !n.read_at
      }));
    }
  } else {
    // La table notifications actuelle vise les cabinets. Pour le back-office,
    // on synthétise les alertes à partir de l'état réel des dossiers.
    notifications.juristart = dossiersData
      .filter(d => d.statut === 'recu' || d.statut === 'action_requise')
      .slice(0, 20)
      .map((d, idx) => ({
        id: `j-${idx}-${d.ref}`,
        type: d.statut === 'action_requise' ? 'action' : 'new',
        text: d.statut === 'action_requise'
          ? `Action en attente sur <strong>${escapeHtml(d.societe)}</strong> (${escapeHtml(d.ref)}).`
          : `Dossier reçu : <strong>${escapeHtml(d.societe)}</strong> — ${escapeHtml(d.cabinet)}.`,
        dossierRef: d.ref,
        date: d.dateTransmission,
        unread: true
      }));
  }
}

async function updateDossierStatus(dossier, status, extra = {}) {
  if (!dossier?.id) throw new Error('Dossier Supabase introuvable');
  const payload = { status, updated_at: new Date().toISOString(), ...extra };
  const { error } = await sb.from('dossiers').update(payload).eq('id', dossier.id);
  if (error) throw error;
}

async function uploadFileToDossier(dossier, file, kind) {
  if (!dossier?.id || !dossier?.cabinetId) throw new Error('Dossier incomplet');
  const folder = kind === 'juristart_final' ? 'final' : 'cabinet';
  const storagePath = `${dossier.cabinetId}/${dossier.id}/${folder}/${Date.now()}_${sanitizeStorageFilename(file.name)}`;

  const { error: uploadError } = await sb.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, file, { cacheControl: '3600', upsert: false, contentType: file.type || undefined });
  if (uploadError) throw uploadError;

  const { error: docError } = await sb.from('documents').insert({
    dossier_id: dossier.id,
    uploaded_by: session.userId,
    kind,
    file_name: file.name,
    storage_path: storagePath,
    mime_type: file.type || null,
    size_bytes: file.size,
    visible_to_cabinet: true
  });

  if (docError) {
    // Nettoyage best-effort si la ligne documentaire n'a pas pu être créée.
    await sb.storage.from(STORAGE_BUCKET).remove([storagePath]);
    throw docError;
  }

  return storagePath;
}

// ============================================
// CONTRÔLE D'ACCÈS & JOURNAL D'AUDIT
// ============================================

function recordAuditLog(event, details, ref = '-') {
  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR') + ' ' + now.toLocaleTimeString('fr-FR');
  const entry = {
    timestamp: dateStr,
    event: event,
    user: session.userName || 'Anonyme',
    role: session.role ? session.role.toUpperCase() : 'GUEST',
    ref: ref,
    ip: session.ipAddress,
    details: details
  };
  auditLogs.unshift(entry);
  renderAuditLogsTable();
}

function checkAccessGuard(targetSpace) {
  if (targetSpace === 'public') return true;

  if (!session.isAuthenticated) {
    recordAuditLog('UNAUTHORIZED_ACCESS_ATTEMPT', `Accès non authentifié bloqué vers ${targetSpace}`);
    openLoginView();
    return false;
  }

  if (targetSpace === 'cabinet' && session.role !== 'cabinet') {
    recordAuditLog('ACCESS_DENIED_403', `Tentative d'accès à l'Espace Cabinet avec le rôle ${session.role}`);
    showAccessDeniedScreen();
    return false;
  }

  if (targetSpace === 'juristart') {
    if (session.role !== 'juristart' || !session.mfaVerified) {
      recordAuditLog('ACCESS_DENIED_403', `Tentative d'accès au Back-office Juristart sans privilèges ou sans 2FA`);
      showAccessDeniedScreen();
      return false;
    }
  }

  return true;
}

function checkDossierAccessGuard(dossier) {
  if (!dossier) return false;

  if (session.role === 'juristart') return true;

  if (session.role === 'cabinet') {
    const isOwner = dossier.cabinetId === session.cabinetId;
    if (!isOwner) {
      recordAuditLog('TENANT_ISOLATION_VIOLATION_BLOCKED', `Tentative d'accès illégitime au dossier tiers ${dossier.ref} par ${session.cabinetId}`, dossier.ref);
      showAccessDeniedScreen();
      return false;
    }
    return true;
  }

  return false;
}

function showAccessDeniedScreen() {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('app-shell').classList.add('active');
  document.querySelectorAll('.app-view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-access-denied').classList.add('active');
}

function recoverFromAccessDenied() {
  if (session.role === 'juristart') {
    showAppView('juristart-dashboard');
  } else if (session.role === 'cabinet') {
    showAppView('cabinet-dashboard');
  } else {
    navigateTo('home');
  }
}

// ============================================
// ROUTEUR / GESTION DES ESPACES
// ============================================

function navigateTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const appShell = document.getElementById('app-shell');
  const publicNav = document.getElementById('publicNav');
  const publicFooter = document.getElementById('publicFooter');

  if (page === 'home') {
    appShell.classList.remove('active');
    document.getElementById('page-home').classList.add('active');
    if (publicNav) publicNav.style.display = '';
    if (publicFooter) publicFooter.style.display = '';
    window.scrollTo(0, 0);
  } else if (page === 'login') {
    appShell.classList.remove('active');
    document.getElementById('page-login').classList.add('active');
    if (publicNav) publicNav.style.display = 'none';
    if (publicFooter) publicFooter.style.display = 'none';
    showAuthSubView('main-login');
    window.scrollTo(0, 0);
  } else if (page === 'app') {
    const targetSpace = session.role === 'juristart' ? 'juristart' : 'cabinet';
    if (!checkAccessGuard(targetSpace)) return;

    document.getElementById('page-home').classList.remove('active');
    document.getElementById('page-login').classList.remove('active');
    appShell.classList.add('active');
    if (publicNav) publicNav.style.display = 'none';
    if (publicFooter) publicFooter.style.display = 'none';

    applySessionContext();
    if (session.role === 'cabinet') {
      showAppView('cabinet-dashboard');
    } else {
      showAppView('juristart-dashboard');
    }
  }

  window.location.hash = page;
}

function showAppView(viewName) {
  if (viewName.startsWith('juristart') && !checkAccessGuard('juristart')) return;
  if (viewName.startsWith('cabinet') && !checkAccessGuard('cabinet')) return;

  document.querySelectorAll('.app-view').forEach(v => v.classList.remove('active'));

  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.classList.remove('active');
  });

  const activeLink = document.querySelector(`.sidebar-link[data-view="${viewName}"]`);
  if (activeLink) activeLink.classList.add('active');

  const viewEl = document.getElementById('view-' + viewName);
  if (viewEl) viewEl.classList.add('active');

  if (viewName === 'cabinet-dashboard') {
    renderCabinetDossiersTable();
  } else if (viewName === 'cabinet-deposer') {
    resetCabinetDepositForm();
  } else if (viewName === 'juristart-dashboard') {
    renderJuristartDossiersTable();
  } else if (viewName === 'juristart-audit') {
    renderAuditLogsTable();
  }

  window.scrollTo(0, 0);
}

function handleLogoNavigate() {
  if (session.role === 'cabinet') {
    showAppView('cabinet-dashboard');
  } else if (session.role === 'juristart') {
    showAppView('juristart-dashboard');
  } else {
    navigateTo('home');
  }
}

function applySessionContext() {
  const topCab = document.getElementById('topbarCabinetName');
  const topUser = document.getElementById('topbarUserName');
  const sideCab = document.getElementById('sidebarCabinetName');
  const sideUser = document.getElementById('sidebarUserName');
  const sideInitials = document.getElementById('sidebarUserInitials');
  const sideIndicator = document.getElementById('sidebarRoleIndicator');
  const searchWrap = document.getElementById('topbarSearchWrap');

  if (session.role === 'cabinet') {
    if (topCab) topCab.textContent = session.cabinetName;
    if (topUser) topUser.textContent = session.userName;
    if (sideCab) sideCab.textContent = session.cabinetName;
    if (sideUser) sideUser.textContent = session.userName;
    if (sideInitials) sideInitials.textContent = session.initials;
    if (sideIndicator) sideIndicator.textContent = 'Espace Cabinet';
    if (searchWrap) searchWrap.style.display = 'none';
  } else if (session.role === 'juristart') {
    // AUCUN MÉLANGE avec Cabinet Caron : Strictement Back-office Juristart
    if (topCab) topCab.textContent = 'Juristart Back-office';
    if (topUser) topUser.textContent = session.userName;
    if (sideCab) sideCab.textContent = 'Opérations Juristart';
    if (sideUser) sideUser.textContent = session.userName;
    if (sideInitials) sideInitials.textContent = session.initials;
    if (sideIndicator) sideIndicator.textContent = 'Back-office Juristart';
    if (searchWrap) searchWrap.style.display = 'block';
  }

  renderSidebarNav();
  renderNotifications();
}

function renderSidebarNav() {
  const container = document.getElementById('sidebarNavContainer');
  if (!container) return;

  if (session.role === 'cabinet') {
    const cabinetDossiers = dossiersData.filter(d => d.cabinetId === session.cabinetId);
    const actionCount = cabinetDossiers.filter(d => d.statut === 'action_requise').length;

    container.innerHTML = `
      <div class="sidebar-nav-title">Menu Cabinet</div>
      <a class="sidebar-link active" data-view="cabinet-dashboard" onclick="showAppView('cabinet-dashboard')">
        <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
        <span>Dossiers transmis</span>
        ${actionCount > 0 ? `<span class="sidebar-action-badge">${actionCount}</span>` : ''}
      </a>
      <a class="sidebar-link" data-view="cabinet-deposer" onclick="showAppView('cabinet-deposer')">
        <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        <span>Déposer un dossier</span>
      </a>
    `;
  } else {
    // Rôle Juristart
    const recuCount = dossiersData.filter(d => d.statut === 'recu').length;
    const actionCount = dossiersData.filter(d => d.statut === 'action_requise').length;

    container.innerHTML = `
      <div class="sidebar-nav-title">Back-office Opérations</div>
      <a class="sidebar-link active" data-view="juristart-dashboard" onclick="showAppView('juristart-dashboard')">
        <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
        <span>Tous les dossiers</span>
      </a>
      <a class="sidebar-link" onclick="filterJuristartFromNav('recu')">
        <svg viewBox="0 0 24 24"><path d="M22 12h-6l-2 3h-4l-2-3H2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-7z"/><path d="M5.45 5.11L2 12v0h20v0l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
        <span>Dossiers reçus</span>
        ${recuCount > 0 ? `<span class="sidebar-recu-badge">${recuCount}</span>` : ''}
      </a>
      <a class="sidebar-link" onclick="filterJuristartFromNav('en_traitement')">
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <span>En traitement</span>
      </a>
      <a class="sidebar-link" onclick="filterJuristartFromNav('action_requise')">
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span>Action requise</span>
        ${actionCount > 0 ? `<span class="sidebar-action-badge">${actionCount}</span>` : ''}
      </a>
      <a class="sidebar-link" onclick="filterJuristartFromNav('termine')">
        <svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <span>Dossiers terminés</span>
      </a>
      <div class="sidebar-nav-title" style="margin-top:var(--space-md);">Sécurité & Conformité</div>
      <a class="sidebar-link" data-view="juristart-audit" onclick="showAppView('juristart-audit')">
        <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <span>Journal d'audit</span>
      </a>
    `;
  }
}

function filterJuristartFromNav(status) {
  currentJuristartFilter = status;
  showAppView('juristart-dashboard');
}

// ============================================
// AUTHENTIFICATION UNIQUE (LE RÔLE DÉPEND DU COMPTE)
// ============================================

function openLoginView() {
  navigateTo('login');
}

function prefillLogin(email) {
  const input = document.getElementById('login-email-input');
  if (input) input.value = email;
}

function showAuthSubView(view) {
  document.querySelectorAll('.auth-view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById('auth-' + view + '-view');
  if (target) target.classList.add('active');
}

async function handleUnifiedLoginSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('login-email-input').value.trim().toLowerCase();
  const password = document.getElementById('login-password-input').value;

  if (!email || !password) return;
  showToast('Connexion sécurisée en cours…');

  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) {
    console.error(error);
    alert('Connexion impossible. Vérifiez votre e-mail et votre mot de passe.');
    return;
  }

  const ok = await hydrateSessionFromSupabase();
  if (!ok) {
    await sb.auth.signOut();
    alert('Votre compte existe mais son profil Juristart n’est pas correctement configuré.');
    return;
  }

  if (session.role === 'juristart' && window.JURISTART_REQUIRE_REAL_MFA && !session.mfaVerified) {
    await prepareJuristartMfa();
    return;
  }

  recordAuditLog('AUTH_LOGIN_SUCCESS', `Connexion Supabase réussie (${session.email})`);
  navigateTo('app');
  showToast(session.role === 'juristart' ? 'Bienvenue dans le Back-office Juristart' : `Bienvenue, ${session.userName}`);
}

let pendingMfaFactorId = null;
let pendingMfaMode = null; // 'enroll' | 'challenge'

function normalizeMfaCode(value) {
  return String(value || '').replace(/\D/g, '').slice(0, 6);
}

function renderMfaQr(qrCode) {
  const box = document.getElementById('mfa-enroll-qr');
  if (!box) return;

  box.innerHTML = '';
  if (!qrCode) return;

  // Supabase peut renvoyer un SVG, une data URL ou une URL.
  if (String(qrCode).trim().startsWith('<svg')) {
    box.innerHTML = qrCode;
  } else {
    const img = document.createElement('img');
    img.src = qrCode;
    img.alt = 'QR code MFA Juristart';
    img.style.maxWidth = '220px';
    img.style.width = '100%';
    img.style.height = 'auto';
    box.appendChild(img);
  }
}

async function prepareJuristartMfa() {
  if (!sb || session.role !== 'juristart') return;

  try {
    const { data: aal, error: aalError } = await sb.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aalError) throw aalError;

    if (aal?.currentLevel === 'aal2') {
      session.mfaVerified = true;
      await loadWorkspaceFromSupabase();
      recordAuditLog('AUTH_MFA_SUCCESS', `Session AAL2 validée (${session.email})`);
      navigateTo('app');
      showToast('Authentification renforcée validée');
      return;
    }

    const { data: factorsData, error: factorsError } = await sb.auth.mfa.listFactors();
    if (factorsError) throw factorsError;

    const verifiedTotp = (factorsData?.totp || []).find(f => f.status === 'verified');

    if (verifiedTotp) {
      pendingMfaFactorId = verifiedTotp.id;
      pendingMfaMode = 'challenge';
      const input = document.getElementById('mfa-code-input');
      if (input) input.value = '';
      showAuthSubView('mfa-step');
      showToast('Code Authenticator requis');
      setTimeout(() => input?.focus(), 50);
      return;
    }

    // Aucun facteur vérifié : première configuration du compte Juristart.
    const { data: enrollData, error: enrollError } = await sb.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: 'Juristart Back-office'
    });
    if (enrollError) throw enrollError;

    pendingMfaFactorId = enrollData.id;
    pendingMfaMode = 'enroll';

    renderMfaQr(enrollData?.totp?.qr_code);

    const secretEl = document.getElementById('mfa-enroll-secret');
    if (secretEl) secretEl.textContent = enrollData?.totp?.secret || '—';

    const input = document.getElementById('mfa-enroll-code-input');
    if (input) input.value = '';

    showAuthSubView('mfa-enroll');
    showToast('Configurez votre application Authenticator');
    setTimeout(() => input?.focus(), 50);
  } catch (err) {
    console.error('Erreur préparation MFA', err);
    alert(`Impossible de préparer l’authentification MFA : ${err.message || err}`);
  }
}

async function handleMfaEnrollSubmit(e) {
  e.preventDefault();
  const input = document.getElementById('mfa-enroll-code-input');
  const code = normalizeMfaCode(input?.value);

  if (!pendingMfaFactorId || code.length !== 6) {
    alert('Saisissez le code à 6 chiffres affiché dans votre application Authenticator.');
    return;
  }

  try {
    const { error } = await sb.auth.mfa.challengeAndVerify({
      factorId: pendingMfaFactorId,
      code
    });
    if (error) throw error;

    session.mfaVerified = true;
    pendingMfaMode = null;
    await loadWorkspaceFromSupabase();
    recordAuditLog('AUTH_MFA_ENROLLED', `MFA TOTP activé et session AAL2 validée (${session.email})`);
    navigateTo('app');
    showToast('MFA activé — Back-office sécurisé');
  } catch (err) {
    console.error('Erreur enrôlement MFA', err);
    alert('Code incorrect ou expiré. Attendez le prochain code dans votre application Authenticator et réessayez.');
  }
}

async function handleMfaStepSubmit(e) {
  e.preventDefault();
  const input = document.getElementById('mfa-code-input');
  const code = normalizeMfaCode(input?.value);

  if (!pendingMfaFactorId || code.length !== 6) {
    alert('Saisissez un code Authenticator valide à 6 chiffres.');
    return;
  }

  try {
    const { error } = await sb.auth.mfa.challengeAndVerify({
      factorId: pendingMfaFactorId,
      code
    });
    if (error) throw error;

    session.mfaVerified = true;
    pendingMfaMode = null;
    await loadWorkspaceFromSupabase();
    recordAuditLog('AUTH_MFA_SUCCESS', `Second facteur TOTP validé (${session.email})`);
    navigateTo('app');
    showToast('Authentification renforcée validée');
  } catch (err) {
    console.error('Erreur validation MFA', err);
    alert('Code incorrect ou expiré. Vérifiez votre application Authenticator et réessayez.');
  }
}

async function handleCabinetRegisterSubmit(e) {
  e.preventDefault();
  const nom = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;

  const { error } = await sb.auth.signUp({
    email,
    password,
    options: { data: { full_name: nom } }
  });

  if (error) {
    alert(`Création impossible : ${error.message}`);
    return;
  }

  // La liaison au cabinet reste une opération d'invitation / administration.
  await sb.auth.signOut();
  showAuthSubView('main-login');
  alert('Compte créé. Juristart doit maintenant rattacher ce compte à votre cabinet avant le premier accès.');
}

async function handleForgotSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('forgot-email').value.trim();
  const { error } = await sb.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  });
  if (error) {
    alert(`Impossible d’envoyer le lien : ${error.message}`);
    return;
  }
  showToast('Lien de réinitialisation envoyé');
  showAuthSubView('main-login');
}

async function handleUpdatePasswordSubmit(e) {
  e.preventDefault();
  const password = document.getElementById('reset-password-input').value;
  const confirmPassword = document.getElementById('reset-password-confirm-input').value;

  if (!password || password.length < 12) {
    alert('Le nouveau mot de passe doit contenir au moins 12 caractères.');
    return;
  }
  if (password !== confirmPassword) {
    alert('Les deux mots de passe ne correspondent pas.');
    return;
  }

  const { error } = await sb.auth.updateUser({ password });
  if (error) {
    console.error(error);
    alert(`Impossible de modifier le mot de passe : ${error.message}`);
    return;
  }

  passwordRecoveryActive = false;
  await sb.auth.signOut();
  document.getElementById('reset-password-input').value = '';
  document.getElementById('reset-password-confirm-input').value = '';
  navigateTo('login');
  showToast('Mot de passe modifié. Vous pouvez vous reconnecter.');
}

async function handleLogout() {
  recordAuditLog('AUTH_LOGOUT', `Déconnexion de l'utilisateur ${session.userName}`);
  await sb.auth.signOut();
  session = {
    isAuthenticated: false, role: null, userId: null, cabinetId: null,
    cabinetName: '', userName: '', initials: '', email: '', mfaVerified: false,
    ipAddress: 'Journalisé côté serveur à activer'
  };
  dossiersData = [];
  notifications = { cabinet: [], juristart: [] };
  navigateTo('home');
  showToast('Session fermée');
}

function renderCabinetDossiersTable() {
  const tbody = document.getElementById('cabinetDossiersTableBody');
  if (!tbody) return;

  // CLOISONNEMENT STRICT : Un cabinet ne voit QUE ses propres dossiers
  let filtered = dossiersData.filter(d => d.cabinetId === session.cabinetId);

  if (currentCabinetFilter !== 'all') {
    filtered = filtered.filter(d => {
      if (currentCabinetFilter === 'recu') return d.statut === 'recu' || d.statut === 'en_traitement';
      return d.statut === currentCabinetFilter;
    });
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center;padding:40px;color:var(--text-secondary);">
          Aucun dossier trouvé dans cette catégorie.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(d => {
    let statusPill = '';
    if (d.statut === 'action_requise') {
      statusPill = `<span class="status-pill status-pill--action">Action requise</span>`;
    } else if (d.statut === 'termine') {
      statusPill = `<span class="status-pill status-pill--termine">Terminé</span>`;
    } else {
      statusPill = `<span class="status-pill status-pill--recu">Reçu</span>`;
    }

    return `
      <tr onclick="openCabinetDossierDetail('${d.ref}')">
        <td><span class="col-societe">${escapeHtml(d.societe)}</span></td>
        <td><span class="col-type">${escapeHtml(d.type)}</span></td>
        <td><span class="col-date">${escapeHtml(d.dateTransmission)}</span></td>
        <td><span class="col-ref">${escapeHtml(d.ref)}</span></td>
        <td>${statusPill}</td>
        <td style="text-align:right;">
          <a class="action-open-link" onclick="event.stopPropagation(); openCabinetDossierDetail('${d.ref}')">
            Consulter
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </td>
      </tr>
    `;
  }).join('');
}

function filterCabinetDossiers(filterKey, btnEl) {
  currentCabinetFilter = filterKey;
  document.querySelectorAll('#view-cabinet-dashboard .filter-tab').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  renderCabinetDossiersTable();
}

function openCabinetDossierDetail(ref) {
  const dossier = dossiersData.find(d => d.ref === ref);
  if (!dossier) return;

  // Contrôle de permission sur le dossier
  if (!checkDossierAccessGuard(dossier)) return;

  activeDossierRef = ref;
  recordAuditLog('DOSSIER_VIEWED', `Consultation du dossier ${dossier.societe} par son cabinet propriétaire`, ref);

  const container = document.getElementById('cabinetDossierDetailContainer');
  if (!container) return;

  let statusBadgeHtml = '';
  if (dossier.statut === 'action_requise') {
    statusBadgeHtml = `<span class="status-pill status-pill--action">Action requise</span>`;
  } else if (dossier.statut === 'termine') {
    statusBadgeHtml = `<span class="status-pill status-pill--termine">Terminé</span>`;
  } else {
    statusBadgeHtml = `<span class="status-pill status-pill--recu">Reçu</span>`;
  }

  let actionRequiseHtml = '';
  if (dossier.statut === 'action_requise') {
    actionRequiseHtml = `
      <div class="action-requise-banner">
        <div class="action-requise-header">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Action requise pour poursuivre le traitement
        </div>
        <p class="action-requise-text">
          ${escapeHtml(dossier.actionRequiredMessage || "Un justificatif complémentaire est nécessaire.")}
        </p>

        <div class="upload-complement-box">
          <div style="display:flex;align-items:center;gap:10px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <span style="font-size:0.875rem;color:var(--navy);font-weight:500;">Sélectionnez le document demandé (PDF, DOCX, Images, max 50 Mo)</span>
          </div>

          <div style="display:flex;gap:10px;align-items:center;">
            <input type="file" id="cabinetComplementFileInput" style="display:none" onchange="handleCabinetAddComplement(event, '${dossier.ref}')">
            <button class="btn btn-primary btn-sm" onclick="document.getElementById('cabinetComplementFileInput').click()">
              + Ajouter le document demandé
            </button>
          </div>
        </div>
      </div>
    `;
  }

  let documentsFinauxHtml = '';
  if (dossier.statut === 'termine' && dossier.documentsFinaux && dossier.documentsFinaux.length > 0) {
    documentsFinauxHtml = `
      <div style="margin-top:var(--space-2xl);">
        <h3 class="documents-section-title">Documents définitifs disponibles</h3>
        <p style="font-size:0.875rem;color:var(--text-secondary);margin-bottom:var(--space-md);">
          Les formalités sont closes. Vos actes sont accessibles depuis votre espace authentifié.
        </p>
        <div class="documents-list-grid">
          ${dossier.documentsFinaux.map(doc => `
            <div class="document-download-card">
              <div class="doc-info-left">
                <div class="doc-icon-wrap">
                  <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                </div>
                <div>
                  <div class="doc-name">${escapeHtml(doc.name)}</div>
                  <div class="doc-sub">${escapeHtml(doc.filename)} • ${escapeHtml(doc.size)} • Mis à disposition le ${escapeHtml(doc.date)}</div>
                </div>
              </div>
              <button class="btn btn-primary btn-sm" onclick="secureDownloadFile('${escapeHtml(doc.name)}', '${escapeHtml(doc.filename)}', '${dossier.ref}')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Télécharger
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <a class="dossier-view-back" onclick="showAppView('cabinet-dashboard')">
      <svg viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
      Retour à la liste des dossiers
    </a>

    <div class="dossier-card-container">
      <div class="dossier-view-top">
        <div class="dossier-view-title">
          <h1>${escapeHtml(dossier.societe)}</h1>
          <div class="dossier-view-meta-row">
            <span><strong>Formalité :</strong> ${escapeHtml(dossier.type)}</span>
            <span><strong>Référence :</strong> ${escapeHtml(dossier.ref)}</span>
            <span><strong>Transmis le :</strong> ${escapeHtml(dossier.dateTransmission)}</span>
          </div>
        </div>
        <div>
          ${statusBadgeHtml}
        </div>
      </div>

      ${actionRequiseHtml}

      <div class="dossier-info-grid">
        <div class="dossier-info-cell">
          <div class="dossier-info-cell__label">Société</div>
          <div class="dossier-info-cell__value">${escapeHtml(dossier.societe)}</div>
        </div>
        <div class="dossier-info-cell">
          <div class="dossier-info-cell__label">Type de formalité</div>
          <div class="dossier-info-cell__value">${escapeHtml(dossier.type)}</div>
        </div>
        <div class="dossier-info-cell">
          <div class="dossier-info-cell__label">Date de transmission</div>
          <div class="dossier-info-cell__value">${escapeHtml(dossier.dateTransmission)}</div>
        </div>
        <div class="dossier-info-cell">
          <div class="dossier-info-cell__label">Référence Juristart</div>
          <div class="dossier-info-cell__value">${escapeHtml(dossier.ref)}</div>
        </div>
      </div>

      ${dossier.instructions ? `
        <div class="dossier-instructions-box">
          <div class="dossier-instructions-label">Instructions transmises par votre cabinet</div>
          <div class="dossier-instructions-text">${escapeHtml(dossier.instructions)}</div>
        </div>
      ` : ''}

      <div style="margin-top:var(--space-xl);">
        <h3 class="documents-section-title">Pièces transmises</h3>
        <div class="documents-list-grid">
          ${dossier.documentsComplets.map(doc => `
            <div class="document-download-card">
              <div class="doc-info-left">
                <div class="doc-icon-wrap">
                  <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
                </div>
                <div>
                  <div class="doc-name">${escapeHtml(doc.name)}</div>
                  <div class="doc-sub">${escapeHtml(doc.size)} • Déposé le ${escapeHtml(doc.date || dossier.dateTransmission)}</div>
                </div>
              </div>
              <span class="security-tag">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Accès privé
              </span>
            </div>
          `).join('')}
        </div>
      </div>

      ${documentsFinauxHtml}
    </div>
  `;

  showAppView('cabinet-dossier');
}

async function handleCabinetAddComplement(e, ref) {
  const file = e.target.files[0];
  if (!file || !validateFileUpload(file)) return;
  const dossier = dossiersData.find(d => d.ref === ref);
  if (!dossier) return;

  try {
    await uploadFileToDossier(dossier, file, 'cabinet_supplement');
    recordAuditLog('DOCUMENT_UPLOADED', `Pièce complémentaire réelle ${file.name} ajoutée sur ${ref}`, ref);
    await loadWorkspaceFromSupabase();
    showToast('Pièce complémentaire transmise à Juristart');
    openCabinetDossierDetail(ref);
  } catch (err) {
    console.error(err);
    alert(`Impossible d’envoyer le document : ${err.message}`);
  } finally {
    e.target.value = '';
  }
}

function resetCabinetDepositForm() {
  const form = document.getElementById('cabinetDepositForm');
  if (form) form.reset();
  tempCabinetUploadedFiles = [];
  renderCabinetUploadedFiles();
}

function renderCabinetUploadedFiles() {
  const tray = document.getElementById('uploadedFilesTray');
  if (!tray) return;

  if (tempCabinetUploadedFiles.length === 0) {
    tray.innerHTML = '';
    return;
  }

  tray.innerHTML = tempCabinetUploadedFiles.map(f => `
    <div class="file-row-item">
      <div class="file-row-left">
        <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
        <span class="file-row-name">${escapeHtml(f.name)}</span>
        <span class="file-row-size">(${escapeHtml(f.size)})</span>
      </div>
      <span class="file-row-remove" onclick="removeCabinetUploadedFile(${f.id})" title="Retirer ce fichier">✕</span>
    </div>
  `).join('');
}

function removeCabinetUploadedFile(id) {
  tempCabinetUploadedFiles = tempCabinetUploadedFiles.filter(f => f.id !== id);
  renderCabinetUploadedFiles();
}

function handleFileInputChange(e) {
  const files = Array.from(e.target.files);
  for (let f of files) {
    if (validateFileUpload(f)) {
      tempCabinetUploadedFiles.push({
        id: Date.now() + Math.random(),
        name: f.name,
        size: formatFileSize(f.size),
        file: f
      });
    }
  }
  renderCabinetUploadedFiles();
  e.target.value = '';
}

function validateFileUpload(file) {
  if (file.size > SECURITY_CONFIG.maxFileSize) {
    alert(`Le fichier ${file.name} dépasse la limite autorisée de 50 Mo.`);
    recordAuditLog('FILE_UPLOAD_REJECTED', `Taille excessive (${formatFileSize(file.size)}) pour ${file.name}`);
    return false;
  }
  const ext = file.name.split('.').pop().toLowerCase();
  if (!SECURITY_CONFIG.allowedExtensions.includes(ext)) {
    alert(`Extension .${ext} non autorisée. Formats acceptés : PDF, DOCX, DOC, JPG, PNG, TIF, ZIP.`);
    recordAuditLog('FILE_UPLOAD_REJECTED', `Extension non autorisée .${ext} pour ${file.name}`);
    return false;
  }
  return true;
}

async function handleCabinetDepositSubmit(e) {
  e.preventDefault();

  const type = document.getElementById('formalite-type-input').value.trim();
  const societe = document.getElementById('societe-nom-input').value.trim();
  const instructions = document.getElementById('instructions-input').value.trim();

  if (!type || !societe) {
    alert('Veuillez renseigner le type de formalité et le nom de la société.');
    return;
  }
  if (!session.cabinetId) {
    alert('Votre compte n’est pas encore rattaché à un cabinet.');
    return;
  }
  if (tempCabinetUploadedFiles.length === 0) {
    alert('Veuillez déposer au moins un fichier dans la zone de dépôt.');
    return;
  }

  showToast('Transmission sécurisée du dossier…');

  const { data: created, error: createError } = await sb
    .from('dossiers')
    .insert({
      cabinet_id: session.cabinetId,
      created_by: session.userId,
      company_name: societe,
      formalite_type: type,
      instructions: instructions || null,
      status: 'recu'
    })
    .select('id, reference, cabinet_id, company_name, formalite_type, instructions, status, created_at')
    .single();

  if (createError) {
    console.error(createError);
    alert(`Le dossier n’a pas pu être créé : ${createError.message}`);
    return;
  }

  const dossierForUpload = { id: created.id, cabinetId: created.cabinet_id };
  try {
    for (const item of tempCabinetUploadedFiles) {
      await uploadFileToDossier(dossierForUpload, item.file, 'cabinet_upload');
    }
  } catch (err) {
    console.error(err);
    alert(`Le dossier ${created.reference} a été créé, mais au moins un fichier n’a pas pu être envoyé. Contactez Juristart avant de recommencer.`);
    await loadWorkspaceFromSupabase();
    return;
  }

  recordAuditLog('DOSSIER_CREATED', `Dossier réel Supabase ${created.reference} transmis avec ${tempCabinetUploadedFiles.length} fichier(s)`, created.reference);
  const generatedRef = created.reference;
  tempCabinetUploadedFiles = [];
  await loadWorkspaceFromSupabase();

  const refDisplay = document.getElementById('confirmRefDisplay');
  if (refDisplay) refDisplay.textContent = generatedRef;
  const modal = document.getElementById('confirmationModal');
  if (modal) modal.classList.add('open');
}

function closeConfirmationModal() {
  closeModal('confirmationModal');
  showAppView('cabinet-dashboard');
  showToast('Dossier ajouté à votre tableau de bord');
}

// ============================================
// ESPACE 3 : BACK-OFFICE JURISTART
// ============================================

function renderJuristartDossiersTable() {
  const tbody = document.getElementById('juristartDossiersTableBody');
  if (!tbody) return;

  const countRecu = dossiersData.filter(d => d.statut === 'recu').length;
  const countTraitement = dossiersData.filter(d => d.statut === 'en_traitement').length;
  const countAction = dossiersData.filter(d => d.statut === 'action_requise').length;

  const badgeRecu = document.getElementById('juristartRecuCounter');
  const badgeTrait = document.getElementById('juristartTraitementCounter');
  const badgeAct = document.getElementById('juristartActionCounter');

  if (badgeRecu) badgeRecu.textContent = `${countRecu} reçu${countRecu > 1 ? 's' : ''}`;
  if (badgeTrait) badgeTrait.textContent = `${countTraitement} en traitement`;
  if (badgeAct) badgeAct.textContent = `${countAction} action requise`;

  let filtered = dossiersData;

  if (currentJuristartFilter !== 'all') {
    filtered = filtered.filter(d => d.statut === currentJuristartFilter);
  }

  if (globalSearchQuery) {
    const q = globalSearchQuery.toLowerCase();
    filtered = filtered.filter(d =>
      d.cabinet.toLowerCase().includes(q) ||
      d.societe.toLowerCase().includes(q) ||
      d.ref.toLowerCase().includes(q) ||
      d.type.toLowerCase().includes(q)
    );
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;padding:40px;color:var(--text-secondary);">
          Aucun dossier ne correspond aux critères de recherche.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(d => {
    let statusPill = '';
    if (d.statut === 'recu') {
      statusPill = `<span class="status-pill status-pill--recu">Reçu</span>`;
    } else if (d.statut === 'en_traitement') {
      statusPill = `<span class="status-pill status-pill--traitement">En traitement</span>`;
    } else if (d.statut === 'action_requise') {
      statusPill = `<span class="status-pill status-pill--action">Action requise</span>`;
    } else if (d.statut === 'termine') {
      statusPill = `<span class="status-pill status-pill--termine">Terminé</span>`;
    }

    return `
      <tr onclick="openJuristartDossierDetail('${d.ref}')">
        <td><span class="col-cabinet">${escapeHtml(d.cabinet)}</span></td>
        <td><span class="col-societe">${escapeHtml(d.societe)}</span></td>
        <td><span class="col-type">${escapeHtml(d.type)}</span></td>
        <td><span class="col-date">${escapeHtml(d.dateTransmission)}</span></td>
        <td><span class="col-ref">${escapeHtml(d.ref)}</span></td>
        <td>${statusPill}</td>
        <td style="text-align:right;">
          <a class="action-open-link" onclick="event.stopPropagation(); openJuristartDossierDetail('${d.ref}')">
            Traiter
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </td>
      </tr>
    `;
  }).join('');
}

function filterJuristartDossiers(filterKey, btnEl) {
  currentJuristartFilter = filterKey;
  document.querySelectorAll('#view-juristart-dashboard .filter-tab').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  renderJuristartDossiersTable();
}

function handleGlobalSearch(val) {
  globalSearchQuery = val.trim();
  renderJuristartDossiersTable();
}

function openJuristartDossierDetail(ref) {
  if (!checkAccessGuard('juristart')) return;

  activeDossierRef = ref;
  const dossier = dossiersData.find(d => d.ref === ref);
  if (!dossier) return;

  recordAuditLog('DOSSIER_OPERATOR_ACCESS', `Ouverture du dossier ${dossier.societe} par l'opérateur Juristart`, ref);

  const container = document.getElementById('juristartDossierDetailContainer');
  if (!container) return;

  let statusBadgeHtml = '';
  if (dossier.statut === 'recu') {
    statusBadgeHtml = `<span class="status-pill status-pill--recu">Reçu</span>`;
  } else if (dossier.statut === 'en_traitement') {
    statusBadgeHtml = `<span class="status-pill status-pill--traitement">En traitement</span>`;
  } else if (dossier.statut === 'action_requise') {
    statusBadgeHtml = `<span class="status-pill status-pill--action">Action requise</span>`;
  } else if (dossier.statut === 'termine') {
    statusBadgeHtml = `<span class="status-pill status-pill--termine">Terminé</span>`;
  }

  let internalOpsHtml = `
    <div class="internal-ops-card">
      <div class="internal-ops-header">
        <div class="internal-ops-title">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="11" y2="17"/></svg>
          Actions Opérateur Juristart
        </div>
        <span style="font-size:0.75rem;color:var(--text-muted);">Statut actuel : <strong>${dossier.statut}</strong></span>
      </div>

      <div class="internal-actions-row">
        ${dossier.statut === 'recu' ? `
          <button class="btn btn-primary btn-sm" onclick="handleTakeCharge('${dossier.ref}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            Prendre en charge le dossier
          </button>
        ` : ''}

        ${dossier.statut === 'action_requise' ? `
          <button class="btn btn-primary btn-sm" onclick="handleResumeProcessing('${dossier.ref}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>
            Reprendre le traitement (En traitement)
          </button>
        ` : ''}

        <button class="btn btn-outline btn-sm" onclick="openDemandModal('${dossier.ref}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Demander un document / une information
        </button>

        ${dossier.statut !== 'termine' ? `
          <button class="btn btn-gold btn-sm" onclick="openStrictCloseModal('${dossier.ref}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            Clôturer le dossier
          </button>
        ` : `
          <span style="font-size:0.8125rem;color:var(--status-termine);font-weight:600;">✓ Ce dossier a été clôturé</span>
        `}
      </div>

      ${dossier.statut === 'action_requise' && dossier.actionRequiredMessage ? `
        <div style="margin-top:var(--space-md);padding:10px 14px;background:#ffffff;border-radius:var(--radius-xs);border:1px solid var(--status-action-border);">
          <div style="font-size:0.75rem;font-weight:600;color:var(--status-action);text-transform:uppercase;">Demande transmise au cabinet :</div>
          <div style="font-size:0.84375rem;color:#78350f;margin-top:2px;">${escapeHtml(dossier.actionRequiredMessage)}</div>
        </div>
      ` : ''}
    </div>
  `;

  // Section Restitution / Documents Finaux
  let finalDocsUploadHtml = `
    <div style="margin-top:var(--space-2xl);padding-top:var(--space-lg);border-top:1px solid var(--border-light);">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-sm);">
        <h3 class="documents-section-title" style="margin:0;">Documents finaux destinés au cabinet</h3>
        <input type="file" id="juristartFinalFileInput" multiple style="display:none" onchange="handleJuristartAddFinalDoc(event, '${dossier.ref}')">
        <button class="btn btn-outline btn-sm" onclick="document.getElementById('juristartFinalFileInput').click()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          + Déposer des documents finaux (Kbis, récépissé, statuts…)
        </button>
      </div>

      <p style="font-size:0.8125rem;color:var(--text-secondary);margin-bottom:var(--space-md);">
        Ces pièces seront stockées dans l'espace privé et restituées à l'Espace Cabinet lors de la clôture définitive.
      </p>

      <div class="documents-list-grid">
        ${dossier.documentsFinaux && dossier.documentsFinaux.length > 0 ? dossier.documentsFinaux.map((doc, idx) => `
          <div class="document-download-card">
            <div class="doc-info-left">
              <div class="doc-icon-wrap" style="color:var(--status-termine);">
                <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
              </div>
              <div>
                <div class="doc-name">${escapeHtml(doc.name)}</div>
                <div class="doc-sub">${escapeHtml(doc.filename)} • ${escapeHtml(doc.size)} • Mis à disposition le ${escapeHtml(doc.date)}</div>
              </div>
            </div>
            <div style="display:flex;gap:8px;align-items:center;">
              <button class="btn btn-ghost btn-sm" onclick="secureDownloadFile('${escapeHtml(doc.name)}', '${escapeHtml(doc.filename)}', '${dossier.ref}')">Consulter</button>
              ${dossier.statut !== 'termine' ? `<button class="btn btn-ghost btn-sm" style="color:#c53030;" onclick="removeFinalDoc('${dossier.ref}', ${idx})">Retirer</button>` : ''}
            </div>
          </div>
        `).join('') : `
          <div style="padding:16px;background:var(--bg);border-radius:var(--radius-sm);text-align:center;font-size:0.84375rem;color:var(--text-muted);">
            Aucun document final déposé. Vous devrez déposer au moins un acte final avant de clôturer le dossier.
          </div>
        `}
      </div>
    </div>
  `;

  container.innerHTML = `
    <a class="dossier-view-back" onclick="showAppView('juristart-dashboard')">
      <svg viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
      Retour à la liste des dossiers
    </a>

    <div class="dossier-card-container">
      <div class="dossier-view-top">
        <div class="dossier-view-title">
          <h1>${escapeHtml(dossier.societe)}</h1>
          <div class="dossier-view-meta-row">
            <span><strong>Cabinet :</strong> ${escapeHtml(dossier.cabinet)}</span>
            <span><strong>Formalité :</strong> ${escapeHtml(dossier.type)}</span>
            <span><strong>Référence :</strong> ${escapeHtml(dossier.ref)}</span>
            <span><strong>Reçu le :</strong> ${escapeHtml(dossier.dateTransmission)}</span>
          </div>
        </div>
        <div>
          ${statusBadgeHtml}
        </div>
      </div>

      ${internalOpsHtml}

      <div class="dossier-info-grid">
        <div class="dossier-info-cell">
          <div class="dossier-info-cell__label">Cabinet d'avocats émetteur</div>
          <div class="dossier-info-cell__value">${escapeHtml(dossier.cabinet)}</div>
        </div>
        <div class="dossier-info-cell">
          <div class="dossier-info-cell__label">Société concernée</div>
          <div class="dossier-info-cell__value">${escapeHtml(dossier.societe)}</div>
        </div>
        <div class="dossier-info-cell">
          <div class="dossier-info-cell__label">Type de formalité</div>
          <div class="dossier-info-cell__value">${escapeHtml(dossier.type)}</div>
        </div>
        <div class="dossier-info-cell">
          <div class="dossier-info-cell__label">Date de réception</div>
          <div class="dossier-info-cell__value">${escapeHtml(dossier.dateTransmission)}</div>
        </div>
      </div>

      ${dossier.instructions ? `
        <div class="dossier-instructions-box">
          <div class="dossier-instructions-label">Instructions transmises par le cabinet</div>
          <div class="dossier-instructions-text">${escapeHtml(dossier.instructions)}</div>
        </div>
      ` : ''}

      <div style="margin-top:var(--space-xl);">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-md);">
          <h3 class="documents-section-title" style="margin:0;">Documents transmis par le cabinet</h3>
          <button class="btn btn-primary btn-sm" onclick="secureDownloadAllZip('${dossier.ref}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Télécharger tous les fichiers
          </button>
        </div>

        <div class="documents-list-grid">
          ${dossier.documentsComplets.map(doc => `
            <div class="document-download-card">
              <div class="doc-info-left">
                <div class="doc-icon-wrap">
                  <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
                </div>
                <div>
                  <div class="doc-name">
                    ${escapeHtml(doc.name)}
                    ${doc.isNew ? `<span class="internal-badge-new-doc">Nouveau document</span>` : ''}
                  </div>
                  <div class="doc-sub">${escapeHtml(doc.size)} • Reçu le ${escapeHtml(doc.date || dossier.dateTransmission)}</div>
                </div>
              </div>
              <button class="btn btn-outline btn-sm" onclick="secureDownloadFile('${escapeHtml(doc.name)}', '${escapeHtml(doc.name)}', '${dossier.ref}')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Télécharger
              </button>
            </div>
          `).join('')}
        </div>
      </div>

      ${finalDocsUploadHtml}
    </div>
  `;

  showAppView('juristart-dossier');
}

async function handleTakeCharge(ref) {
  const dossier = dossiersData.find(d => d.ref === ref);
  if (!dossier) return;
  try {
    await updateDossierStatus(dossier, 'en_traitement');
    recordAuditLog('STATUS_CHANGE_PROCESSING', `Prise en charge réelle du dossier ${ref}`, ref);
    await loadWorkspaceFromSupabase();
    showToast(`Dossier ${ref} pris en charge`);
    openJuristartDossierDetail(ref);
  } catch (err) {
    alert(`Mise à jour impossible : ${err.message}`);
  }
}

async function handleResumeProcessing(ref) {
  const dossier = dossiersData.find(d => d.ref === ref);
  if (!dossier) return;
  try {
    await updateDossierStatus(dossier, 'en_traitement', { action_required_message: null });
    recordAuditLog('STATUS_RESUMED', `Reprise réelle du traitement ${ref}`, ref);
    await loadWorkspaceFromSupabase();
    showToast(`Traitement repris pour ${ref}`);
    openJuristartDossierDetail(ref);
  } catch (err) {
    alert(`Mise à jour impossible : ${err.message}`);
  }
}

function openDemandModal(ref) {
  activeDossierRef = ref;
  const dossier = dossiersData.find(d => d.ref === ref);
  if (!dossier) return;

  document.getElementById('demandModalDossierRef').textContent = `${dossier.societe} (${ref})`;
  document.getElementById('demandTextarea').value = '';
  document.getElementById('demandDocModal').classList.add('open');
}

async function handleSendDocDemand(e) {
  e.preventDefault();
  const ref = activeDossierRef;
  const text = document.getElementById('demandTextarea').value.trim();
  if (!text) return;
  const dossier = dossiersData.find(d => d.ref === ref);
  if (!dossier) return;

  try {
    await updateDossierStatus(dossier, 'action_requise', { action_required_message: text });
    const { error: notifError } = await sb.from('notifications').insert({
      cabinet_id: dossier.cabinetId,
      dossier_id: dossier.id,
      title: 'Action requise',
      message: text
    });
    if (notifError) throw notifError;

    recordAuditLog('DEMAND_SENT', `Demande réelle envoyée pour ${ref}`, ref);
    closeModal('demandDocModal');
    await loadWorkspaceFromSupabase();
    showToast('Demande transmise au cabinet');
    openJuristartDossierDetail(ref);
  } catch (err) {
    console.error(err);
    alert(`Demande impossible : ${err.message}`);
  }
}

function openStrictCloseModal(ref) {
  activeDossierRef = ref;
  const dossier = dossiersData.find(d => d.ref === ref);
  if (!dossier) return;

  const warningContainer = document.getElementById('closeModalWarningContainer');
  const btnConfirm = document.getElementById('btnConfirmClosure');

  const hasFinalDocs = dossier.documentsFinaux && dossier.documentsFinaux.length > 0;

  if (!hasFinalDocs) {
    warningContainer.innerHTML = `
      <div class="closure-warning-box">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <div>
          <div class="closure-warning-title">Avertissement : Aucun document final déposé</div>
          <div class="closure-warning-text">
            Vous vous apprêtez à clôturer ce dossier sans avoir téléversé de livrables (Kbis, récépissé, synthèse). Le cabinet ne recevra aucun document définitif.
          </div>
          <label class="form-checkbox-label" style="margin-top:8px;color:#991b1b;font-weight:500;">
            <input type="checkbox" id="chkForceCloseWithoutDocs" onchange="toggleForceCloseButton(this.checked)">
            Je confirme vouloir clôturer exceptionnellement sans document final
          </label>
        </div>
      </div>
    `;
    btnConfirm.disabled = true;
    btnConfirm.classList.add('btn-disabled');
  } else {
    warningContainer.innerHTML = `
      <div style="background:var(--status-termine-bg);border:1px solid var(--status-termine-border);border-radius:var(--radius-sm);padding:10px 12px;margin-bottom:var(--space-md);font-size:0.8125rem;color:var(--status-termine);">
        ✓ ${dossier.documentsFinaux.length} document(s) final(aux) prêt(s) à être restitué(s) au cabinet.
      </div>
    `;
    btnConfirm.disabled = false;
    btnConfirm.classList.remove('btn-disabled');
  }

  document.getElementById('closeModalTitle').textContent = `Clôturer le dossier ${dossier.societe} ?`;
  document.getElementById('closeDossierModal').classList.add('open');
}

function toggleForceCloseButton(isChecked) {
  const btnConfirm = document.getElementById('btnConfirmClosure');
  if (btnConfirm) {
    btnConfirm.disabled = !isChecked;
    btnConfirm.classList.toggle('btn-disabled', !isChecked);
  }
}

async function confirmCloseDossier() {
  const ref = activeDossierRef;
  const dossier = dossiersData.find(d => d.ref === ref);
  if (!dossier) return;

  try {
    await updateDossierStatus(dossier, 'termine', {
      action_required_message: null,
      closed_at: new Date().toISOString()
    });

    const { error: notifError } = await sb.from('notifications').insert({
      cabinet_id: dossier.cabinetId,
      dossier_id: dossier.id,
      title: 'Dossier terminé',
      message: 'Les documents finaux sont disponibles dans votre espace cabinet.'
    });
    if (notifError) throw notifError;

    recordAuditLog('DOSSIER_CLOSED', `Clôture réelle du dossier ${ref}`, ref);
    closeModal('closeDossierModal');
    await loadWorkspaceFromSupabase();
    showToast('Dossier clôturé — le cabinet peut récupérer ses documents');
    openJuristartDossierDetail(ref);
  } catch (err) {
    console.error(err);
    alert(`Clôture impossible : ${err.message}`);
  }
}

async function handleJuristartAddFinalDoc(e, ref) {
  const files = Array.from(e.target.files);
  if (files.length === 0) return;
  const dossier = dossiersData.find(d => d.ref === ref);
  if (!dossier) return;

  try {
    for (const file of files) {
      if (validateFileUpload(file)) {
        await uploadFileToDossier(dossier, file, 'juristart_final');
        recordAuditLog('FINAL_DOC_UPLOADED', `Document final réel ${file.name} déposé pour ${ref}`, ref);
      }
    }
    await loadWorkspaceFromSupabase();
    showToast(`${files.length} document(s) final(aux) ajouté(s)`);
    openJuristartDossierDetail(ref);
  } catch (err) {
    console.error(err);
    alert(`Dépôt impossible : ${err.message}`);
  } finally {
    e.target.value = '';
  }
}

async function removeFinalDoc(ref, idx) {
  const dossier = dossiersData.find(d => d.ref === ref);
  if (!dossier || session.role !== 'juristart') return;

  const doc = dossier.documentsFinaux?.[idx];
  if (!doc?.id) {
    alert('Ce document ne peut pas être supprimé : aucune référence Supabase n’est disponible.');
    return;
  }

  const confirmed = window.confirm(`Supprimer définitivement « ${doc.name} » de ce dossier ?`);
  if (!confirmed) return;

  try {
    const { data: deletedRows, error: deleteError } = await sb
      .from('documents')
      .delete()
      .eq('id', doc.id)
      .eq('dossier_id', dossier.id)
      .eq('kind', 'juristart_final')
      .select('id');

    if (deleteError) throw deleteError;
    if (!deletedRows || deletedRows.length === 0) {
      throw new Error('Suppression refusée ou document déjà absent.');
    }

    // Une fois la ligne retirée du dossier, on purge le fichier privé.
    // En cas d'échec de purge, le fichier devient un objet orphelin privé mais
    // n'est plus exposé dans le dossier. Il pourra être nettoyé côté stockage.
    let storageCleanupFailed = false;
    if (doc.storagePath) {
      const { error: storageError } = await sb.storage
        .from(STORAGE_BUCKET)
        .remove([doc.storagePath]);
      if (storageError) {
        storageCleanupFailed = true;
        console.error('Fichier retiré du dossier mais purge Storage impossible', storageError);
      }
    }

    recordAuditLog('FINAL_DOC_REMOVED', `Suppression réelle du document final ${doc.name}`, ref);
    await loadWorkspaceFromSupabase();
    showToast(storageCleanupFailed
      ? 'Document retiré du dossier — purge Storage à vérifier'
      : 'Document final supprimé');
    openJuristartDossierDetail(ref);
  } catch (err) {
    console.error(err);
    alert(`Suppression impossible : ${err.message}`);
  }
}

// ============================================
// JOURNAL D'AUDIT (SÉCURITÉ & LOGS)
// ============================================

function renderAuditLogsTable() {
  const tbody = document.getElementById('auditLogsTableBody');
  if (!tbody) return;

  tbody.innerHTML = auditLogs.map(l => `
    <tr>
      <td><span class="audit-entry-time">${escapeHtml(l.timestamp)}</span></td>
      <td><span class="audit-action-badge">${escapeHtml(l.event)}</span></td>
      <td><span class="audit-actor-name">${escapeHtml(l.user)}</span> <span style="font-size:0.7rem;color:var(--text-muted);">(${escapeHtml(l.role)})</span></td>
      <td><span class="col-ref">${escapeHtml(l.ref)}</span></td>
      <td><span style="font-family:var(--font-mono);font-size:0.75rem;color:var(--text-secondary);">${escapeHtml(l.ip)}</span></td>
      <td><span style="font-size:0.8125rem;color:var(--text);">${escapeHtml(l.details)}</span></td>
    </tr>
  `).join('');
}

function exportAuditLogs() {
  const dataStr = JSON.stringify(auditLogs, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Juristart_Audit_Logs_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  recordAuditLog('AUDIT_LOG_EXPORTED', `Exportation du registre d'audit par ${session.userName}`);
  showToast('Export du journal d\'audit téléchargé');
}

// ============================================
// TÉLÉCHARGEMENT SÉCURISÉ (STOCKAGE PRIVÉ SUPABASE)
// ============================================

async function secureDownloadFile(title, filename, ref) {
  const dossier = dossiersData.find(d => d.ref === ref);
  if (!dossier) return;
  const allDocs = [...(dossier.documentsComplets || []), ...(dossier.documentsFinaux || [])];
  const doc = allDocs.find(d => d.filename === filename || d.name === filename || d.name === title);

  if (!doc?.storagePath) {
    alert('Ce document appartient encore aux données de démonstration et n’est pas stocké dans Supabase.');
    return;
  }

  showToast(`Téléchargement sécurisé de « ${title} »…`);
  const { data, error } = await sb.storage.from(STORAGE_BUCKET).download(doc.storagePath);
  if (error) {
    console.error(error);
    alert(`Téléchargement impossible : ${error.message}`);
    return;
  }

  recordAuditLog('SECURE_DOWNLOAD', `Téléchargement Supabase RLS de ${filename}`, ref);
  const url = URL.createObjectURL(data);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || title;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function secureDownloadAllZip(ref) {
  const dossier = dossiersData.find(d => d.ref === ref);
  if (!dossier) return;
  const docs = dossier.documentsComplets || [];
  if (!docs.length) return;

  // Phase 1 : téléchargements individuels réels. La création d'un ZIP serveur
  // sera ajoutée ultérieurement pour éviter de fabriquer une fausse archive.
  showToast(`Téléchargement de ${docs.length} fichier(s)…`);
  for (const doc of docs) {
    if (doc.storagePath) {
      await secureDownloadFile(doc.name, doc.filename || doc.name, ref);
      await new Promise(resolve => setTimeout(resolve, 250));
    }
  }
}

function toggleNotifDropdown(e) {
  e.stopPropagation();
  const dropdown = document.getElementById('notifDropdown');
  const btn = document.getElementById('notifBtn');
  if (!dropdown) return;

  const isOpen = dropdown.classList.toggle('open');
  if (btn) btn.classList.toggle('active', isOpen);

  if (isOpen) {
    const dot = document.getElementById('notifDot');
    if (dot) dot.style.display = 'none';
  }
}

document.addEventListener('click', function (e) {
  const dropdown = document.getElementById('notifDropdown');
  const btn = document.getElementById('notifBtn');
  if (dropdown && !dropdown.contains(e.target) && e.target !== btn) {
    dropdown.classList.remove('open');
    if (btn) btn.classList.remove('active');
  }
});

function renderNotifications() {
  const list = document.getElementById('notifList');
  const dot = document.getElementById('notifDot');
  if (!list) return;

  const roleNotifs = session.role ? (notifications[session.role] || []) : [];
  const unreadCount = roleNotifs.filter(n => n.unread).length;

  if (dot) {
    dot.style.display = unreadCount > 0 ? 'block' : 'none';
  }

  if (roleNotifs.length === 0) {
    list.innerHTML = `<div style="padding:20px;text-align:center;font-size:0.8125rem;color:var(--text-muted);">Aucune notification</div>`;
    return;
  }

  list.innerHTML = roleNotifs.map(n => {
    let iconSvg = '';
    if (n.type === 'action') {
      iconSvg = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--status-action)" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
    } else if (n.type === 'done') {
      iconSvg = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--status-termine)" stroke-width="2.2"><polyline points="20 6 9 17 4 12"/></svg>`;
    } else {
      iconSvg = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>`;
    }

    return `
      <div class="notif-item ${n.unread ? 'unread' : ''}" onclick='handleNotifClick(${JSON.stringify(n.dossierRef)}, ${JSON.stringify(String(n.id))})'>
        <div class="notif-item-icon">${iconSvg}</div>
        <div class="notif-item-content">
          <div class="notif-item-text">${n.text}</div>
          <div class="notif-item-date">${escapeHtml(n.date)}</div>
        </div>
      </div>
    `;
  }).join('');
}

async function handleNotifClick(dossierRef, notifId) {
  const notifs = notifications[session.role];
  const notif = notifs?.find(n => String(n.id) === String(notifId));
  const wasUnread = Boolean(notif?.unread);
  if (notif) notif.unread = false;

  // Pour les cabinets, l'état lu/non-lu est réellement persisté en base.
  if (session.role === 'cabinet' && notif?.id && wasUnread) {
    const { error } = await sb
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notif.id);
    if (error) console.error('Impossible de marquer la notification comme lue', error);
  }

  renderNotifications();
  const dropdown = document.getElementById('notifDropdown');
  if (dropdown) dropdown.classList.remove('open');

  if (session.role === 'cabinet') {
    openCabinetDossierDetail(dossierRef);
  } else if (session.role === 'juristart') {
    openJuristartDossierDetail(dossierRef);
  }
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('open');
}

let toastTimer = null;
function showToast(msg) {
  const toast = document.getElementById('toastNotice');
  const toastMsg = document.getElementById('toastMessage');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = msg;
  toast.classList.add('show');

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

// ============================================
// AUTOCOMPLÉTION & UTILS
// ============================================

const formaliteInput = document.getElementById('formalite-type-input');
const formaliteDropdown = document.getElementById('formaliteDropdown');

if (formaliteInput && formaliteDropdown) {
  formaliteInput.addEventListener('input', function () {
    const q = this.value.trim().toLowerCase();
    if (q.length === 0) {
      formaliteDropdown.classList.remove('open');
      return;
    }

    const matches = formalitesSuggestions.filter(s => s.toLowerCase().includes(q));
    if (matches.length === 0) {
      formaliteDropdown.classList.remove('open');
      return;
    }

    formaliteDropdown.innerHTML = matches.map(s => {
      const regex = new RegExp(`(${escapeRegex(q)})`, 'gi');
      const highlighted = s.replace(regex, '<strong>$1</strong>');
      return `<div class="autocomplete-item" onclick="selectFormaliteSuggestion('${escapeHtml(s)}')">${highlighted}</div>`;
    }).join('');

    formaliteDropdown.classList.add('open');
  });

  formaliteInput.addEventListener('focus', function () {
    if (this.value.trim().length > 0) {
      this.dispatchEvent(new Event('input'));
    }
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.autocomplete-box')) {
      formaliteDropdown.classList.remove('open');
    }
  });
}

function selectFormaliteSuggestion(val) {
  if (formaliteInput) formaliteInput.value = val;
  if (formaliteDropdown) formaliteDropdown.classList.remove('open');
}

const dropzone = document.getElementById('depositDropzone');

if (dropzone) {
  ['dragenter', 'dragover'].forEach(name => {
    dropzone.addEventListener(name, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(name => {
    dropzone.addEventListener(name, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('dragover');
    });
  });

  dropzone.addEventListener('drop', (e) => {
    const files = Array.from(e.dataTransfer.files);
    for (let f of files) {
      if (validateFileUpload(f)) {
        tempCabinetUploadedFiles.push({
          id: Date.now() + Math.random(),
          name: f.name,
          size: formatFileSize(f.size),
          file: f
        });
      }
    }
    renderCabinetUploadedFiles();
  });
}

function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 o';
  const k = 1024;
  const sizes = ['o', 'Ko', 'Mo', 'Go'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Initialisation
async function init() {
  const recoveryPath = window.location.pathname.replace(/\/+$/, '') === '/reset-password';
  if (recoveryPath) {
    const { data } = await sb.auth.getSession();
    if (data?.session) {
      passwordRecoveryActive = true;
      navigateTo('login');
      showAuthSubView('update-password');
      return;
    }
  }

  const restored = await hydrateSessionFromSupabase();
  const hash = window.location.hash.replace('#', '');

  if (restored && (hash === 'app' || hash === 'cabinet' || hash === 'juristart')) {
    navigateTo('app');
  } else if (hash === 'login') {
    navigateTo('login');
  } else if (restored && hash === '') {
    navigateTo('app');
  } else {
    navigateTo('home');
  }
}

window.addEventListener('hashchange', async () => {
  const hash = window.location.hash.replace('#', '');
  if (hash === 'home') navigateTo('home');
  else if (hash === 'login') navigateTo('login');
  else if (hash === 'app' || hash === 'cabinet' || hash === 'juristart') {
    if (!session.isAuthenticated) await hydrateSessionFromSupabase();
    if (session.isAuthenticated) navigateTo('app');
    else navigateTo('login');
  }
});

init();
