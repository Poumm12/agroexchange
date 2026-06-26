'use client'
import { useState, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getSupabaseClient } from '@/lib/supabase-client'
import { Card, Button, Input, TrustBadge, StarRating } from '@/components/ui'
import { Icons } from '@/components/ui/Icons'
import { RoleBadges, VerificationBadges } from '@/components/profile/Badges'
import { validateText, sanitizeInput } from '@/lib/moderation'
import { formatDistanceToNow } from 'date-fns'
import { el } from 'date-fns/locale'
import toast from 'react-hot-toast'

export function ProfileTab() {
  const supabase = getSupabaseClient()
  const { user, updateProfile, updatePassword, deleteAccount } = useAuth()

  const [editMode, setEditMode]         = useState(false)
  const [saving, setSaving]             = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [showPasswordForm, setShowPasswordForm]   = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    full_name: user?.full_name ?? '',
    username:  user?.username ?? '',
    location:  user?.location ?? '',
    phone:     user?.phone ?? '',
    bio:       user?.bio ?? '',
  })

  const [privacy, setPrivacy] = useState({
    show_phone:    user?.show_phone ?? false,
    show_email:    user?.show_email ?? false,
    show_location: user?.show_location ?? true,
  })

  const [roles, setRoles] = useState<string[]>(user?.roles ?? (user?.role ? [user.role] : ['farmer']))

  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })

  function setField(k: string, v: string) {
    setForm(p => ({ ...p, [k]: v }))
  }

  function toggleRole(r: string) {
    setRoles(prev => {
      const has = prev.includes(r)
      const next = has ? prev.filter(x => x !== r) : [...prev, r]
      return next.length ? next : prev
    })
  }

  function togglePrivacy(k: keyof typeof privacy) {
    setPrivacy(p => ({ ...p, [k]: !p[k] }))
  }

  async function handleSave() {
    if (!form.full_name.trim()) { toast.error('Το όνομα είναι υποχρεωτικό'); return }
    // Moderation on free-text profile fields
    const nameCheck = validateText(form.full_name, { required: true, maxLength: 120 })
    if (!nameCheck.ok) { toast.error(nameCheck.error!); return }
    const bioCheck = validateText(form.bio, { maxLength: 1000 })
    if (!bioCheck.ok) { toast.error(bioCheck.error!); return }
    const userCheck = validateText(form.username, { maxLength: 40 })
    if (!userCheck.ok) { toast.error(userCheck.error!); return }
    const locCheck = validateText(form.location, { maxLength: 120 })
    if (!locCheck.ok) { toast.error(locCheck.error!); return }
    setSaving(true)
    const { error } = await updateProfile({
      full_name: sanitizeInput(form.full_name),
      username:  sanitizeInput(form.username),
      location:  sanitizeInput(form.location),
      phone:     sanitizeInput(form.phone),
      bio:       sanitizeInput(form.bio),
      ...privacy,
      roles: roles as any,
      role: roles[0] as any,
    })
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success('Το προφίλ ενημερώθηκε!')
    setEditMode(false)
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    if (file.size > 2 * 1024 * 1024) { toast.error('Το αρχείο πρέπει να είναι κάτω από 2MB'); return }
    setUploadingAvatar(true)
    try {
      const ext  = file.name.split('.').pop()
      const path = `avatars/${user.id}.${ext}`
      const { error: upErr } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })
      if (upErr) throw upErr
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      await updateProfile({ avatar_url: publicUrl })
      toast.success('Η φωτογραφία ανέβηκε!')
    } catch (err: any) {
      toast.error(err.message ?? 'Σφάλμα ανεβάσματος')
    } finally {
      setUploadingAvatar(false)
    }
  }

  async function handleDeleteAvatar() {
    if (!user?.avatar_url) return
    await updateProfile({ avatar_url: undefined })
    toast.success('Η φωτογραφία αφαιρέθηκε')
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    if (pwForm.next.length < 6) { toast.error('Τουλάχιστον 6 χαρακτήρες'); return }
    if (pwForm.next !== pwForm.confirm) { toast.error('Οι κωδικοί δεν ταιριάζουν'); return }
    const error = await updatePassword(pwForm.next)
    if (error) { toast.error(error.message); return }
    toast.success('Ο κωδικός άλλαξε!')
    setShowPasswordForm(false)
    setPwForm({ current: '', next: '', confirm: '' })
  }

  async function handleDeleteAccount() {
    if (deleteConfirmText !== 'ΔΙΑΓΡΑΦΗ') {
      toast.error('Πληκτρολόγησε ΔΙΑΓΡΑΦΗ για επιβεβαίωση')
      return
    }
    const error = await deleteAccount()
    if (error) { toast.error(error.message); return }
    toast.success('Ο λογαριασμός σου διαγράφηκε')
  }

  if (!user) return null

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="font-display font-extrabold text-gray-900 text-xl tracking-tight">Προφίλ</h2>

      {/* Avatar + basic info */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-agro-800 text-white font-bold text-2xl flex items-center justify-center overflow-hidden">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
              ) : (
                user.full_name?.charAt(0)?.toUpperCase() ?? 'U'
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              aria-label="Αλλαγή φωτογραφίας"
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm">
              {uploadingAvatar
                ? <span className="w-3 h-3 border border-agro-600 border-t-transparent rounded-full animate-spin" />
                : <Icons.plus className="w-3 h-3 text-gray-600" />}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-bold text-gray-900 text-lg">{user.full_name}</h3>
            <div className="text-sm text-gray-500">{user.email}</div>
            <div className="flex items-center gap-2 justify-center sm:justify-start mt-2 flex-wrap">
              <RoleBadges roles={user.roles ?? [user.role]} />
              <TrustBadge score={user.trust_score} />
            </div>
            <div className="flex items-center gap-2 justify-center sm:justify-start mt-2 flex-wrap">
              <VerificationBadges user={user} compact />
            </div>
            {user.rating > 0 && (
              <div className="mt-2 flex items-center gap-1.5 justify-center sm:justify-start">
                <StarRating rating={user.rating} size={13} />
                <span className="text-xs text-gray-400">({user.rating_count} αξιολογήσεις)</span>
              </div>
            )}
            <a href={`/user/${user.id}`} target="_blank" rel="noopener noreferrer"
              className="text-xs text-agro-700 hover:underline mt-2 inline-flex items-center gap-1">
              <Icons.eye className="w-3 h-3" /> Προβολή δημόσιου προφίλ
            </a>
            {user.avatar_url && (
              <button onClick={handleDeleteAvatar}
                className="text-xs text-red-500 hover:underline mt-1 block">
                Αφαίρεση φωτογραφίας
              </button>
            )}
          </div>

          {/* Edit toggle */}
          <Button variant={editMode ? 'ghost' : 'secondary'} size="sm"
            onClick={() => {
              if (editMode) {
                setForm({ full_name: user.full_name, username: user.username ?? '', location: user.location ?? '', phone: user.phone ?? '', bio: user.bio ?? '' })
                setPrivacy({ show_phone: user.show_phone ?? false, show_email: user.show_email ?? false, show_location: user.show_location ?? true })
                setRoles(user.roles ?? (user.role ? [user.role] : ['farmer']))
              }
              setEditMode(p => !p)
            }}>
            {editMode ? 'Ακύρωση' : <><Icons.settings className="w-3.5 h-3.5" /> Επεξεργασία</>}
          </Button>
        </div>
      </Card>

      {/* Edit form */}
      {editMode && (
        <Card className="p-6 border-agro-200">
          <h3 className="font-bold text-gray-900 mb-4 text-sm">Επεξεργασία Στοιχείων</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Ονοματεπώνυμο" value={form.full_name}
              onChange={e => setField('full_name', e.target.value)} required />
            <Input label="Username" icon={<Icons.user className="w-4 h-4" />}
              placeholder="π.χ. giorgos_farm" value={form.username}
              onChange={e => setField('username', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} />
            <Input label="Τοποθεσία" icon={<Icons.map className="w-4 h-4" />}
              placeholder="π.χ. Λάρισα" value={form.location}
              onChange={e => setField('location', e.target.value)} />
            <Input label="Τηλέφωνο" type="tel" icon={<Icons.zap className="w-4 h-4" />}
              placeholder="+30 69..." value={form.phone}
              onChange={e => setField('phone', e.target.value)} />
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Bio</label>
              <textarea
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-agro-500 focus:ring-2 focus:ring-agro-100 resize-none"
                rows={3} placeholder="Λίγα λόγια για σένα..." value={form.bio}
                onChange={e => setField('bio', e.target.value)} />
            </div>
          </div>

          {/* Roles */}
          <div className="mt-5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
              Ρόλοι <span className="text-gray-400 normal-case font-normal">(ένας ή περισσότεροι)</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { value: 'farmer',      label: 'Παραγωγός',  emoji: '🌾' },
                { value: 'buyer',       label: 'Αγοραστής',  emoji: '🛒' },
                { value: 'transporter', label: 'Μεταφορέας', emoji: '🚛' },
                { value: 'insurer',     label: 'Ασφαλιστική', emoji: '🛡️' },
              ].map(r => {
                const checked = roles.includes(r.value)
                return (
                  <button key={r.value} type="button" onClick={() => toggleRole(r.value)}
                    aria-pressed={checked}
                    className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl border text-xs font-medium transition-all ${
                      checked ? 'border-agro-500 bg-agro-50 text-agro-800' : 'border-gray-200 bg-white text-gray-600 hover:border-agro-300'
                    }`}>
                    <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 ${checked ? 'bg-agro-700 border-agro-700' : 'border-gray-300'}`}>
                      {checked && <Icons.check className="w-2.5 h-2.5 text-white" />}
                    </span>
                    {r.emoji} {r.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Privacy controls */}
          <div className="mt-5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
              Ορατότητα Στοιχείων στο Δημόσιο Προφίλ
            </label>
            <div className="space-y-2">
              {[
                { key: 'show_email'    as const, label: 'Εμφάνιση email',     icon: Icons.mail },
                { key: 'show_phone'    as const, label: 'Εμφάνιση τηλεφώνου', icon: Icons.zap },
                { key: 'show_location' as const, label: 'Εμφάνιση τοποθεσίας', icon: Icons.map },
              ].map(p => (
                <button key={p.key} type="button" onClick={() => togglePrivacy(p.key)}
                  aria-pressed={privacy[p.key]}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-gray-200 hover:border-agro-300 transition-colors">
                  <span className="flex items-center gap-2 text-sm text-gray-700">
                    <p.icon className="w-4 h-4 text-gray-400" /> {p.label}
                  </span>
                  <span className={`relative w-10 h-5.5 rounded-full transition-colors flex-shrink-0 ${privacy[p.key] ? 'bg-agro-600' : 'bg-gray-300'}`} style={{ height: '22px', width: '40px' }}>
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${privacy[p.key] ? 'translate-x-[20px]' : 'translate-x-0.5'}`} />
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button loading={saving} onClick={handleSave} icon={<Icons.check className="w-4 h-4" />}>
              Αποθήκευση
            </Button>
            <Button variant="ghost" onClick={() => setEditMode(false)}>Ακύρωση</Button>
          </div>
        </Card>
      )}

      {/* Stats */}
      <Card className="p-6">
        <h3 className="font-bold text-gray-900 text-sm mb-4">Στατιστικά</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: 'Συνολικά Deals',  val: user.total_deals },
            { label: 'Επιτυχημένα',     val: user.successful_deals ?? user.total_deals },
            { label: 'Trust Score',     val: `${user.trust_score}/100` },
            { label: 'Αξιολόγηση',      val: user.rating > 0 ? user.rating.toFixed(1) : '—' },
            { label: 'Αξία (€)',         val: user.total_value > 0 ? `€${Number(user.total_value).toLocaleString('el-GR')}` : '—' },
            { label: 'Μέλος',           val: user.created_at ? formatDistanceToNow(new Date(user.created_at), { addSuffix: true, locale: el }) : '—' },
          ].map(s => (
            <div key={s.label} className="text-center p-3 bg-gray-50 rounded-xl">
              <div className="font-display font-black text-xl text-agro-800">{s.val || '—'}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Change Password */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 text-sm">Αλλαγή Κωδικού</h3>
          <Button variant="ghost" size="sm" onClick={() => setShowPasswordForm(p => !p)}>
            {showPasswordForm ? 'Ακύρωση' : 'Αλλαγή'}
          </Button>
        </div>
        {showPasswordForm && (
          <form onSubmit={handlePasswordChange} className="flex flex-col gap-3">
            <Input label="Νέος Κωδικός" type="password" icon={<Icons.lock className="w-4 h-4" />}
              placeholder="••••••••" value={pwForm.next}
              onChange={e => setPwForm(p => ({ ...p, next: e.target.value }))} required />
            <Input label="Επιβεβαίωση Νέου Κωδικού" type="password" icon={<Icons.lock className="w-4 h-4" />}
              placeholder="••••••••" value={pwForm.confirm}
              onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} required />
            <Button type="submit" size="sm" className="self-start">Αποθήκευση Κωδικού</Button>
          </form>
        )}
      </Card>

      {/* Danger zone */}
      <Card className="p-6 border-red-200">
        <h3 className="font-bold text-red-600 text-sm mb-2">Επικίνδυνη Ζώνη</h3>
        <p className="text-xs text-gray-500 mb-4">Η διαγραφή λογαριασμού είναι μη αναστρέψιμη. Όλα τα δεδομένα σου θα διαγραφούν.</p>
        {!showDeleteConfirm ? (
          <button onClick={() => setShowDeleteConfirm(true)}
            className="text-sm font-semibold text-red-500 border border-red-200 rounded-xl px-4 py-2 hover:bg-red-50 transition-colors">
            Διαγραφή Λογαριασμού
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-700 font-medium">
              Πληκτρολόγησε <span className="font-black text-red-600">ΔΙΑΓΡΑΦΗ</span> για επιβεβαίωση:
            </p>
            <input
              className="w-full rounded-xl border border-red-300 px-3 py-2 text-sm outline-none focus:border-red-500"
              placeholder="ΔΙΑΓΡΑΦΗ"
              value={deleteConfirmText}
              onChange={e => setDeleteConfirmText(e.target.value)}
            />
            <div className="flex gap-2">
              <Button variant="danger" size="sm"
                onClick={handleDeleteAccount}
                className="!bg-red-600 hover:!bg-red-700">
                Οριστική Διαγραφή
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText('') }}>
                Ακύρωση
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
