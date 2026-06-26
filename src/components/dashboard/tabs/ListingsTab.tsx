'use client'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useListings } from '@/hooks/useListings'
import { ListingCard } from '@/components/dashboard/ListingCard'
import { Button, Input, Spinner } from '@/components/ui'
import { Icons } from '@/components/ui/Icons'
import { validateText, sanitizeInput } from '@/lib/moderation'
import { UNITS, DEFAULT_UNIT, type MeasurementUnit, getUnit } from '@/lib/units'
import toast from 'react-hot-toast'

const CATEGORIES = ['Όλες','Σιτάρι','Καλαμπόκι','Βαμβάκι','Ελαιόλαδο','Κριθάρι','Τομάτα','Πορτοκάλια','Ρύζι','Ηλίανθος','Άλλο']

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-44 bg-gray-100" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-7 bg-gray-100 rounded w-1/2" />
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-9 bg-gray-100 rounded-xl" />
      </div>
    </div>
  )
}

export function ListingsTab() {
  const { user } = useAuth()
  const [search, setSearch]     = useState('')
  const [cat, setCat]           = useState('Όλες')
  const [unitFilter, setUnitFilter] = useState<'all' | MeasurementUnit>('all')
  const [showForm, setShowForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: '', category: 'Σιτάρι', price_per_ton: '',
    quantity_tons: '', location: '', description: '',
    measurement_unit: DEFAULT_UNIT as MeasurementUnit,
  })

  const { listings, loading, createListing, updateListing, deleteListing } = useListings({
    search,
    category: cat === 'Όλες' ? undefined : cat,
  })

  // Unit filter applied client-side (DB stores measurement_unit)
  const visibleListings = unitFilter === 'all'
    ? listings
    : listings.filter(l => (l.measurement_unit ?? DEFAULT_UNIT) === unitFilter)

  const blankForm = { title:'', category:'Σιτάρι', price_per_ton:'', quantity_tons:'', location:'', description:'', measurement_unit: DEFAULT_UNIT as MeasurementUnit }

  function resetForm() {
    setForm(blankForm)
    setEditingId(null)
    setShowForm(false)
  }

  function startEdit(l: typeof listings[number]) {
    setForm({
      title: l.title ?? '',
      category: l.category ?? 'Σιτάρι',
      price_per_ton: String(l.price_per_ton ?? ''),
      quantity_tons: String(l.quantity_tons ?? ''),
      location: l.location ?? '',
      description: l.description ?? '',
      measurement_unit: (l.measurement_unit ?? DEFAULT_UNIT) as MeasurementUnit,
    })
    setEditingId(l.id)
    setShowForm(true)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleDelete(l: typeof listings[number]) {
    if (typeof window !== 'undefined' && !window.confirm(`Διαγραφή της αγγελίας «${l.title}»; Η ενέργεια δεν αναιρείται.`)) return
    const error = await deleteListing(l.id)
    if (error) { toast.error(error.message); return }
    toast.success('Η αγγελία διαγράφηκε')
    if (editingId === l.id) resetForm()
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!user) { toast.error('Συνδεθείτε πρώτα'); return }
    if (!form.title.trim()) { toast.error('Ο τίτλος είναι υποχρεωτικός'); return }
    if (Number(form.price_per_ton) <= 0) { toast.error('Η τιμή πρέπει να είναι μεγαλύτερη από 0'); return }

    // Content moderation on free-text fields
    const titleCheck = validateText(form.title, { required: true, maxLength: 120 })
    if (!titleCheck.ok) { toast.error(titleCheck.error!); return }
    const descCheck = validateText(form.description, { maxLength: 2000 })
    if (!descCheck.ok) { toast.error(descCheck.error!); return }
    const locCheck = validateText(form.location, { maxLength: 120 })
    if (!locCheck.ok) { toast.error(locCheck.error!); return }

    setCreating(true)
    const payload = {
      title:         sanitizeInput(form.title),
      category:      form.category,
      description:   sanitizeInput(form.description),
      location:      sanitizeInput(form.location),
      price_per_ton: Number(form.price_per_ton),
      quantity_tons: Number(form.quantity_tons),
      measurement_unit: form.measurement_unit,
    }

    if (editingId) {
      const error = await updateListing(editingId, payload)
      setCreating(false)
      if (error) { toast.error(error.message); return }
      toast.success('Η αγγελία ενημερώθηκε!')
      resetForm()
    } else {
      const { error } = await createListing({ ...payload, user_id: user.id, status: 'active' })
      setCreating(false)
      if (error) { toast.error(error.message); return }
      toast.success('Η αγγελία δημιουργήθηκε!')
      resetForm()
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap gap-3 items-start justify-between">
        <div>
          <h2 className="font-display font-extrabold text-gray-900 text-xl tracking-tight">Αγγελίες</h2>
          <p className="text-sm text-gray-500 mt-0.5">Βρες προϊόντα από όλη την Ελλάδα</p>
        </div>
        <Button onClick={() => { if (showForm) { resetForm() } else { setEditingId(null); setForm(blankForm); setShowForm(true) } }} icon={<Icons.plus className="w-4 h-4" />}>
          <span className="hidden sm:inline">Νέα Αγγελία</span>
          <span className="sm:hidden">Νέα</span>
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-agro-200 shadow-sm p-5">
          <h3 className="font-bold text-gray-900 mb-4 text-sm">{editingId ? 'Επεξεργασία Αγγελίας' : 'Νέα Αγγελία'}</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input label="Τίτλος" placeholder="π.χ. Σκληρό Σιτάρι ποιότητας Α"
                value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="listing-category" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Κατηγορία</label>
              <select id="listing-category" className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-agro-500 focus:ring-2 focus:ring-agro-100"
                value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))}>
                {CATEGORIES.slice(1).map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <Input label="Τοποθεσία" icon={<Icons.map className="w-4 h-4" />}
              placeholder="π.χ. Λάρισα" value={form.location}
              onChange={e => setForm(p => ({...p, location: e.target.value}))} required />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="listing-unit" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Μονάδα μέτρησης</label>
              <select id="listing-unit"
                className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-agro-500 focus:ring-2 focus:ring-agro-100"
                value={form.measurement_unit}
                onChange={e => setForm(p => ({...p, measurement_unit: e.target.value as MeasurementUnit}))}>
                {UNITS.map(u => <option key={u.key} value={u.key}>{u.label}</option>)}
              </select>
            </div>
            <Input label={`Τιμή ανά ${getUnit(form.measurement_unit).perLabel} (€)`} type="number" step="0.01" min="0"
              placeholder="265.00" value={form.price_per_ton}
              onChange={e => setForm(p => ({...p, price_per_ton: e.target.value}))} required />
            <Input label={`Ποσότητα (${getUnit(form.measurement_unit).short})`} type="number" step="0.1" min="0"
              placeholder="100" value={form.quantity_tons}
              onChange={e => setForm(p => ({...p, quantity_tons: e.target.value}))} required />
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Περιγραφή</label>
              <textarea className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-agro-500 focus:ring-2 focus:ring-agro-100 resize-none"
                rows={2} placeholder="Προαιρετική περιγραφή ποιότητας, συνθηκών κ.λπ."
                value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} />
            </div>
            <div className="sm:col-span-2 flex gap-2 flex-wrap">
              <Button type="submit" loading={creating}>{editingId ? 'Αποθήκευση' : 'Δημοσίευση'}</Button>
              <Button variant="ghost" type="button" onClick={resetForm}>Ακύρωση</Button>
            </div>
          </form>
        </div>
      )}

      {/* Search + filters */}
      <div className="space-y-3">
        <div className="relative">
          <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-agro-500 focus:ring-2 focus:ring-agro-100 bg-white"
            placeholder="Αναζήτηση τίτλου, κατηγορίας ή τοποθεσίας..."
            value={search} onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setSearch('')} aria-label="Καθαρισμός αναζήτησης">
              <Icons.x className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                cat === c ? 'bg-agro-800 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-agro-300 hover:text-agro-700'
              }`}>
              {c}
            </button>
          ))}
        </div>
        {/* Unit filter */}
        <div className="flex gap-1.5 flex-wrap items-center">
          <span className="text-xs text-gray-400 font-semibold mr-1">Μονάδα:</span>
          <button onClick={() => setUnitFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${unitFilter === 'all' ? 'bg-agro-800 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-agro-300'}`}>
            Όλες
          </button>
          {UNITS.map(u => (
            <button key={u.key} onClick={() => setUnitFilter(u.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${unitFilter === u.key ? 'bg-agro-800 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-agro-300'}`}>
              {u.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : visibleListings.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Icons.list className="w-12 h-12 mx-auto mb-3 opacity-25" />
          <p className="font-semibold text-gray-600 text-base">Δεν βρέθηκαν αγγελίες</p>
          <p className="text-sm mt-1">
            {search || cat !== 'Όλες' || unitFilter !== 'all'
              ? 'Δοκίμασε διαφορετική αναζήτηση, κατηγορία ή μονάδα'
              : 'Γίνε ο πρώτος που θα δημιουργήσει αγγελία'}
          </p>
          {!search && cat === 'Όλες' && unitFilter === 'all' && (
            <Button className="mt-4" onClick={() => setShowForm(true)} icon={<Icons.plus className="w-4 h-4" />}>
              Δημιουργία Αγγελίας
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="text-xs text-gray-400 font-medium">{visibleListings.length} αγγελίες</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {visibleListings.map(l => <ListingCard key={l.id} listing={l} currentUserId={user?.id} onEdit={() => startEdit(l)} onDelete={() => handleDelete(l)} />)}
          </div>
        </>
      )}
    </div>
  )
}
