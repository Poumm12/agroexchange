/**
 * POST /api/seed
 * Run once after Supabase setup to populate demo data.
 * curl -X POST http://localhost:3000/api/seed
 */
import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function POST() {
  const admin = getSupabaseAdmin()

  try {
    // ── 1. Demo users ─────────────────────────────────────────
    const demoUsers = [
      { email:'kostas@demo.gr',  password:'demo1234', full_name:'Κώστας Παπανικολάου', role:'farmer',      location:'Λάρισα',       trust_score:98, total_deals:284, total_value:248500, total_sales:184, total_purchases:100, rating:4.9, rating_count:112, verified:true  },
      { email:'maria@demo.gr',   password:'demo1234', full_name:'Μαρία Δημητρίου',     role:'buyer',       location:'Θεσσαλονίκη', trust_score:96, total_deals:231, total_value:195200, total_sales:140, total_purchases:91,  rating:4.8, rating_count:87,  verified:true  },
      { email:'nikos@demo.gr',   password:'demo1234', full_name:'Νίκος Αλεξίου',       role:'farmer',      location:'Καλαμάτα',    trust_score:95, total_deals:198, total_value:174800, total_sales:120, total_purchases:78,  rating:4.8, rating_count:74,  verified:true  },
      { email:'spyros@demo.gr',  password:'demo1234', full_name:'Σπύρος Τσιόπουλος',   role:'buyer',       location:'Πάτρα',       trust_score:93, total_deals:175, total_value:152300, total_sales:80,  total_purchases:95,  rating:4.7, rating_count:61,  verified:false },
      { email:'eleni@demo.gr',   password:'demo1234', full_name:'Ελένη Καραγιάννη',    role:'farmer',      location:'Βόλος',       trust_score:91, total_deals:163, total_value:138900, total_sales:100, total_purchases:63,  rating:4.7, rating_count:58,  verified:true  },
      { email:'giorgos@demo.gr', password:'demo1234', full_name:'Γιώργος Παπαδόπουλος',role:'transporter', location:'Λάρισα',       trust_score:96, total_deals:142, total_value:98000,  total_sales:0,   total_purchases:0,   rating:4.8, rating_count:48,  verified:true  },
      { email:'nikos2@demo.gr',  password:'demo1234', full_name:'Νίκος Σταθόπουλος',   role:'transporter', location:'Πάτρα',       trust_score:92, total_deals:98,  total_value:62000,  total_sales:0,   total_purchases:0,   rating:4.6, rating_count:31,  verified:true  },
      { email:'andreas@demo.gr', password:'demo1234', full_name:'Ανδρέας Δημητρίου',   role:'transporter', location:'Ξάνθη',       trust_score:98, total_deals:211, total_value:130000, total_sales:0,   total_purchases:0,   rating:4.9, rating_count:72,  verified:true  },
    ]

    const createdIds: Record<string, string> = {}

    for (const u of demoUsers) {
      const { data: existing } = await admin.auth.admin.listUsers()
      const found = existing?.users?.find(au => au.email === u.email)

      let uid: string
      if (found) {
        uid = found.id
      } else {
        const { data, error } = await admin.auth.admin.createUser({
          email: u.email, password: u.password,
          email_confirm: true,
          user_metadata: { full_name: u.full_name, role: u.role },
        })
        if (error) { console.error('User create error:', error); continue }
        uid = data.user.id
      }
      createdIds[u.email] = uid

      await admin.from('profiles').upsert({
        id: uid, email: u.email, full_name: u.full_name, role: u.role,
        location: u.location, trust_score: u.trust_score,
        total_deals: u.total_deals, total_value: u.total_value,
        total_sales: u.total_sales, total_purchases: u.total_purchases,
        rating: u.rating, rating_count: u.rating_count, verified: u.verified,
      }, { onConflict: 'id' })
    }

    // ── 2. Demo listings ──────────────────────────────────────
    const farmerIds = [
      createdIds['kostas@demo.gr'],
      createdIds['nikos@demo.gr'],
      createdIds['eleni@demo.gr'],
    ].filter(Boolean)

    const listings = [
      { title:'Σκληρό Σιτάρι Ποιότητας Α',         category:'Σιτάρι',    price_per_ton:268,  quantity_tons:120, location:'Λάρισα',       badge:'Νέο',       image_url:'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop' },
      { title:'Ελαιόλαδο Εξαιρετικό Παρθένο',      category:'Ελαιόλαδο', price_per_ton:5450, quantity_tons:8,   location:'Καλαμάτα',    badge:'Δημοφιλές', image_url:'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop' },
      { title:'Καλαμπόκι Ζέας Εκλεκτής Ποιότητας', category:'Καλαμπόκι', price_per_ton:201,  quantity_tons:300, location:'Θεσσαλονίκη', badge:null,        image_url:'https://images.unsplash.com/photo-1601472544271-3b3c3c32c8f9?w=600&auto=format&fit=crop' },
      { title:'Βαμβάκι Βιολογικό',                  category:'Βαμβάκι',   price_per_ton:882,  quantity_tons:50,  location:'Ξάνθη',       badge:'Επείγον',   image_url:'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=600&auto=format&fit=crop' },
      { title:'Πορτοκάλια Μέρλιν Ναβαλίνα',        category:'Πορτοκάλια',price_per_ton:420,  quantity_tons:15,  location:'Πάτρα',       badge:'Νέο',       image_url:'https://images.unsplash.com/photo-1547514701-42782101795e?w=600&auto=format&fit=crop' },
      { title:'Κριθάρι Εξαπλόσειρο',               category:'Κριθάρι',   price_per_ton:212,  quantity_tons:200, location:'Βόλος',       badge:null,        image_url:'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&auto=format&fit=crop' },
    ]

    for (let i = 0; i < listings.length; i++) {
      const uid = farmerIds[i % farmerIds.length]
      if (!uid) continue
      await admin.from('listings').insert({ ...listings[i], user_id: uid, status: 'active' })
    }

    // ── 3. Demo transporters ──────────────────────────────────
    const transporterDefs = [
      { email:'giorgos@demo.gr', vehicle_type:'Φορτηγό MAN 18t',  capacity_tons:20, from_location:'Λάρισα', to_location:'Θεσσαλονίκη', price_per_trip:320, rating:4.8, rating_count:48, total_trips:142, description:'Εξειδίκευση στη μεταφορά σιτηρών.' },
      { email:'nikos2@demo.gr',  vehicle_type:'Φορτηγό Iveco 15t', capacity_tons:15, from_location:'Πάτρα',  to_location:'Αθήνα',       price_per_trip:280, rating:4.6, rating_count:31, total_trips:98,  description:'Εξειδίκευση σε φρούτα και λαχανικά.' },
      { email:'andreas@demo.gr', vehicle_type:'Φορτηγό Volvo 25t', capacity_tons:25, from_location:'Ξάνθη',  to_location:'Θεσσαλονίκη', price_per_trip:210, rating:4.9, rating_count:72, total_trips:211, description:'Top rated μεταφορέας Βορείου Ελλάδας.' },
    ]

    for (const t of transporterDefs) {
      const uid = createdIds[t.email]
      if (!uid) continue
      const { email: _email, ...rest } = t
      await admin.from('transporters').upsert(
        { ...rest, user_id: uid, available: true },
        { onConflict: 'user_id' }
      )
    }

    // ── 4. Demo reviews ───────────────────────────────────────
    const { data: transports } = await admin.from('transporters').select('id').limit(3)
    const reviewerUid = createdIds['kostas@demo.gr']
    if (reviewerUid && transports?.length) {
      for (const t of transports) {
        const { count } = await admin.from('reviews')
          .select('*', { count: 'exact', head: true })
          .eq('transporter_id', t.id)
          .eq('reviewer_id', reviewerUid)
        if ((count ?? 0) === 0) {
          await admin.from('reviews').insert({
            reviewer_id: reviewerUid, transporter_id: t.id,
            rating: 5, comment: 'Εξαιρετική εξυπηρέτηση, έγκαιρη παράδοση!',
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Demo data seeded!',
      users: Object.keys(createdIds).length,
    })
  } catch (e: any) {
    console.error('Seed error:', e)
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
