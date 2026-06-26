'use client'
import { useState } from 'react'
import { useRankings } from '@/hooks/useRankings'
import { Card, TrustBadge, StarRating, Spinner, SectionLabel, Badge } from '@/components/ui'
import { Icons } from '@/components/ui/Icons'
import type { RankingEntry } from '@/types'

const SORT_OPTIONS = [
  { key: 'total_deals',     label: 'Deals'       },
  { key: 'total_value',     label: 'Αξία'        },
  { key: 'total_sales',     label: 'Πωλήσεις'    },
  { key: 'total_purchases', label: 'Αγορές'      },
  { key: 'trust_score',     label: 'Trust Score' },
  { key: 'rating',          label: 'Βαθμολογία'  },
]

const ROLE_LABEL: Record<string, string> = {
  farmer: 'Παραγωγός', buyer: 'Αγοραστής', transporter: 'Μεταφορέας', admin: 'Admin',
}
const ROLE_VARIANT: Record<string, 'success'|'info'|'warning'|'default'> = {
  farmer: 'success', buyer: 'info', transporter: 'warning', admin: 'default',
}

const MEDAL = [
  'bg-gradient-to-br from-amber-400 to-yellow-500 shadow-amber-200/50',
  'bg-gradient-to-br from-gray-300 to-gray-400 shadow-gray-200/50',
  'bg-gradient-to-br from-orange-400 to-amber-600 shadow-orange-200/50',
]

function formatVal(n: number, prefix = '') {
  if (!n) return '—'
  if (n >= 1000) return `${prefix}${(n / 1000).toFixed(0)}K`
  return `${prefix}${n.toLocaleString('el-GR')}`
}

export function RankingTab() {
  const [sortBy, setSortBy]     = useState('total_deals')
  const { rankings, loading }   = useRankings(sortBy)

  const top3  = rankings.slice(0, 3)
  const rest  = rankings.slice(3)
  const year  = new Date().getFullYear()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display font-extrabold text-gray-900 text-xl tracking-tight">Κατάταξη Χρηστών</h2>
        <p className="text-sm text-gray-500 mt-0.5">Πραγματικά δεδομένα από όλη την πλατφόρμα</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={36} /></div>
      ) : rankings.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Icons.trophy className="w-12 h-12 mx-auto mb-3 opacity-25" />
          <p className="font-semibold text-gray-600">Δεν υπάρχουν δεδομένα ακόμη</p>
          <p className="text-sm mt-1">Η κατάταξη θα εμφανιστεί μόλις γίνουν συναλλαγές</p>
        </div>
      ) : (
        <>
          {/* User of the Year */}
          {top3[0] && (
            <div className="relative bg-gradient-to-br from-amber-500 to-yellow-400 rounded-2xl p-5 sm:p-6 text-white overflow-hidden">
              <div className="absolute right-4 top-4 opacity-10">
                <Icons.trophy className="w-20 h-20" />
              </div>
              <div className="text-xs font-bold tracking-widest uppercase opacity-80 mb-1">
                Χρήστης της Χρονιάς {year}
              </div>
              <div className="font-display font-black text-xl sm:text-2xl mb-1">{top3[0].user.full_name}</div>
              <div className="flex flex-wrap gap-3 sm:gap-5 text-sm opacity-85 mt-2">
                <span>{top3[0].total_deals} Deals</span>
                <span>{formatVal(top3[0].total_value, '€')}</span>
                <span>Trust {top3[0].trust_score}/100</span>
              </div>
            </div>
          )}

          {/* Podium */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {[top3[1], top3[0], top3[2]].filter(Boolean).map((entry, idx) => {
              const isFirst = idx === 1
              const medalIdx = isFirst ? 0 : idx === 0 ? 1 : 2
              return (
                <Card key={entry.rank}
                  className={`p-3 sm:p-5 text-center ${isFirst ? 'border-amber-300 shadow-md -mt-3 sm:-mt-4' : ''}`}>
                  <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full mx-auto mb-2 sm:mb-3 flex items-center justify-center text-white font-black text-xs sm:text-sm shadow-lg ${MEDAL[medalIdx]}`}>
                    {entry.user.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="font-display font-black text-gray-900 text-xs sm:text-sm leading-tight mb-1 truncate px-1">
                    {entry.user.full_name}
                  </div>
                  <div className="text-[10px] sm:text-xs text-gray-400 mb-2 truncate">{entry.user.location}</div>
                  <div className="font-display font-black text-lg sm:text-2xl text-agro-800">{entry.total_deals}</div>
                  <div className="text-[10px] text-gray-400">deals</div>
                  <div className="mt-2 flex justify-center"><TrustBadge score={entry.trust_score} /></div>
                  {isFirst && <div className="mt-2 text-amber-500 flex justify-center"><Icons.trophy className="w-4 h-4" /></div>}
                </Card>
              )
            })}
          </div>

          {/* Sort filter */}
          <div className="flex gap-1.5 flex-wrap">
            {SORT_OPTIONS.map(o => (
              <button key={o.key} onClick={() => setSortBy(o.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  sortBy === o.key ? 'bg-agro-800 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-agro-300'
                }`}>
                {o.label}
              </button>
            ))}
          </div>

          {/* Full table - scrollable on mobile */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm" role="table">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['#','Χρήστης','Ρόλος','Deals','Αξία','Trust','Rating'].map((h, i) => (
                      <th key={h} className={`px-3 sm:px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap ${i <= 1 ? 'text-left' : 'text-right'}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {rankings.map((entry, i) => (
                    <tr key={entry.rank} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 sm:px-4 py-3 w-10">
                        {i < 3 ? (
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-black text-[10px] ${MEDAL[i]}`}>
                            {i + 1}
                          </div>
                        ) : (
                          <span className="text-gray-400 font-semibold text-sm">{i + 1}</span>
                        )}
                      </td>
                      <td className="px-3 sm:px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-agro-800 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                            {entry.user.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-gray-900 text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">{entry.user.full_name}</div>
                            {entry.user.location && <div className="text-[10px] text-gray-400 truncate">{entry.user.location}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-3">
                        <Badge variant={ROLE_VARIANT[entry.user.role] ?? 'default'}>
                          {ROLE_LABEL[entry.user.role] ?? entry.user.role}
                        </Badge>
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-right font-bold text-gray-900">{entry.total_deals || '—'}</td>
                      <td className="px-3 sm:px-4 py-3 text-right font-display font-bold text-agro-800 whitespace-nowrap">
                        {formatVal(entry.total_value, '€')}
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-right"><TrustBadge score={entry.trust_score} /></td>
                      <td className="px-3 sm:px-4 py-3 text-right">
                        {entry.rating > 0 ? <StarRating rating={entry.rating} size={11} showNum={false} /> : <span className="text-gray-300 text-xs">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Sub-leaderboards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {[
              { title: 'Top Sellers',   icon: Icons.trendUp, data: [...rankings].sort((a,b)=>b.total_sales-a.total_sales).slice(0,3),     metric: (e: RankingEntry) => `${e.total_sales} πωλήσεις` },
              { title: 'Top Buyers',    icon: Icons.euro,    data: [...rankings].sort((a,b)=>b.total_purchases-a.total_purchases).slice(0,3), metric: (e: RankingEntry) => `${e.total_purchases} αγορές` },
              { title: 'Top Rated',     icon: Icons.star,    data: [...rankings].filter(r=>r.rating>0).sort((a,b)=>b.rating-a.rating).slice(0,3), metric: (e: RankingEntry) => `${e.rating.toFixed(1)} ⭐` },
            ].map(sec => (
              <Card key={sec.title} className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-agro-100 text-agro-800 flex items-center justify-center flex-shrink-0">
                    <sec.icon className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-gray-900 text-sm">{sec.title}</div>
                </div>
                {sec.data.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">Δεν υπάρχουν δεδομένα</p>
                ) : (
                  <div className="space-y-3">
                    {sec.data.map((entry, i) => (
                      <div key={entry.rank} className="flex items-center gap-2.5">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-black flex-shrink-0 ${MEDAL[i] || 'bg-gray-400'}`}>
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 text-xs truncate">{entry.user.full_name}</div>
                          <div className="text-[10px] text-gray-400">{sec.metric(entry)}</div>
                        </div>
                        <TrustBadge score={entry.trust_score} />
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
