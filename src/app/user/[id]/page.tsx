import type { Metadata } from 'next'
import { PublicProfile } from '@/components/profile/PublicProfile'

export const metadata: Metadata = {
  title: 'Προφίλ Χρήστη',
  description: 'Δες το δημόσιο προφίλ, τις αγγελίες και τις αξιολογήσεις του χρήστη στο AgroExchange.',
}

export default function UserProfilePage({ params }: { params: { id: string } }) {
  return <PublicProfile userId={params.id} />
}
