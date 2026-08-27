-- =========================================================
-- JURISTART — PATCH SUPABASE PHASE 2
-- À exécuter UNE FOIS dans Supabase > SQL Editor
-- avant d'utiliser la version connectée de la web app.
-- =========================================================

-- Message opérationnel affiché quand Juristart demande un complément.
alter table public.dossiers
  add column if not exists action_required_message text;

-- Un utilisateur peut marquer comme lue une notification de son propre cabinet.
drop policy if exists "notifications_mark_own_read" on public.notifications;
create policy "notifications_mark_own_read"
on public.notifications
for update
to authenticated
using (
  public.is_juristart()
  or cabinet_id = public.current_cabinet_id()
)
with check (
  public.is_juristart()
  or cabinet_id = public.current_cabinet_id()
);

grant update on public.notifications to authenticated;

-- Index utiles au chargement des tableaux de bord.
create index if not exists dossiers_cabinet_id_idx on public.dossiers(cabinet_id);
create index if not exists dossiers_status_idx on public.dossiers(status);
create index if not exists documents_dossier_id_idx on public.documents(dossier_id);
create index if not exists notifications_cabinet_id_idx on public.notifications(cabinet_id);

-- Le bucket doit rester privé.
update storage.buckets
set public = false
where id = 'juristart-documents';
