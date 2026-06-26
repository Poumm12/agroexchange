/**
 * Comprehensive list of Greek cities, towns and municipalities.
 *
 * Each entry has:
 *  - label: Greek display name (what the user sees / searches)
 *  - value: OpenWeather-compatible query string ("City,GR")
 *
 * The `value` is already in the format the OpenWeather API expects, so the
 * selector can later be wired to live OpenWeather geocoding/forecast results
 * without changing the UI — the component just passes `value` to /api/weather.
 *
 * Search supports full name, partial name and Greek characters (accent- and
 * case-insensitive) via the `normalizeGreek` helper below.
 */

export interface GreekCity {
  label: string
  value: string
}

export const GREEK_CITIES: GreekCity[] = [
  // ── Αττική ──
  { label: 'Αθήνα', value: 'Athens,GR' },
  { label: 'Πειραιάς', value: 'Piraeus,GR' },
  { label: 'Περιστέρι', value: 'Peristeri,GR' },
  { label: 'Καλλιθέα', value: 'Kallithea,GR' },
  { label: 'Νίκαια', value: 'Nikaia,GR' },
  { label: 'Γλυφάδα', value: 'Glyfada,GR' },
  { label: 'Μαρούσι', value: 'Marousi,GR' },
  { label: 'Ίλιον', value: 'Ilion,GR' },
  { label: 'Αχαρνές', value: 'Acharnes,GR' },
  { label: 'Κηφισιά', value: 'Kifisia,GR' },
  { label: 'Χαλάνδρι', value: 'Chalandri,GR' },
  { label: 'Ζωγράφου', value: 'Zografou,GR' },
  { label: 'Αιγάλεω', value: 'Aigaleo,GR' },
  { label: 'Νέα Σμύρνη', value: 'Nea Smyrni,GR' },
  { label: 'Παλαιό Φάληρο', value: 'Palaio Faliro,GR' },
  { label: 'Βούλα', value: 'Voula,GR' },
  { label: 'Βάρη', value: 'Vari,GR' },
  { label: 'Ραφήνα', value: 'Rafina,GR' },
  { label: 'Λαύριο', value: 'Lavrio,GR' },
  { label: 'Μέγαρα', value: 'Megara,GR' },
  { label: 'Ελευσίνα', value: 'Elefsina,GR' },
  { label: 'Σαλαμίνα', value: 'Salamina,GR' },

  // ── Κεντρική Μακεδονία ──
  { label: 'Θεσσαλονίκη', value: 'Thessaloniki,GR' },
  { label: 'Σέρρες', value: 'Serres,GR' },
  { label: 'Κατερίνη', value: 'Katerini,GR' },
  { label: 'Βέροια', value: 'Veria,GR' },
  { label: 'Νάουσα', value: 'Naoussa,GR' },
  { label: 'Γιαννιτσά', value: 'Giannitsa,GR' },
  { label: 'Έδεσσα', value: 'Edessa,GR' },
  { label: 'Κιλκίς', value: 'Kilkis,GR' },
  { label: 'Πολύγυρος', value: 'Polygyros,GR' },
  { label: 'Αλεξάνδρεια', value: 'Alexandreia,GR' },
  { label: 'Κασσάνδρα', value: 'Kassandra,GR' },
  { label: 'Νέα Μουδανιά', value: 'Nea Moudania,GR' },

  // ── Ανατολική Μακεδονία & Θράκη ──
  { label: 'Καβάλα', value: 'Kavala,GR' },
  { label: 'Ξάνθη', value: 'Xanthi,GR' },
  { label: 'Κομοτηνή', value: 'Komotini,GR' },
  { label: 'Δράμα', value: 'Drama,GR' },
  { label: 'Αλεξανδρούπολη', value: 'Alexandroupoli,GR' },
  { label: 'Ορεστιάδα', value: 'Orestiada,GR' },
  { label: 'Διδυμότειχο', value: 'Didymoteicho,GR' },
  { label: 'Σαπές', value: 'Sapes,GR' },
  { label: 'Χρυσούπολη', value: 'Chrysoupoli,GR' },
  { label: 'Προσοτσάνη', value: 'Prosotsani,GR' },

  // ── Δυτική Μακεδονία ──
  { label: 'Κοζάνη', value: 'Kozani,GR' },
  { label: 'Πτολεμαΐδα', value: 'Ptolemaida,GR' },
  { label: 'Καστοριά', value: 'Kastoria,GR' },
  { label: 'Φλώρινα', value: 'Florina,GR' },
  { label: 'Γρεβενά', value: 'Grevena,GR' },
  { label: 'Αμύνταιο', value: 'Amyntaio,GR' },
  { label: 'Σιάτιστα', value: 'Siatista,GR' },

  // ── Θεσσαλία ──
  { label: 'Λάρισα', value: 'Larissa,GR' },
  { label: 'Βόλος', value: 'Volos,GR' },
  { label: 'Τρίκαλα', value: 'Trikala,GR' },
  { label: 'Καρδίτσα', value: 'Karditsa,GR' },
  { label: 'Ελασσόνα', value: 'Elassona,GR' },
  { label: 'Φάρσαλα', value: 'Farsala,GR' },
  { label: 'Τύρναβος', value: 'Tyrnavos,GR' },
  { label: 'Καλαμπάκα', value: 'Kalabaka,GR' },
  { label: 'Σοφάδες', value: 'Sofades,GR' },
  { label: 'Νέα Ιωνία', value: 'Nea Ionia,GR' },

  // ── Ήπειρος ──
  { label: 'Ιωάννινα', value: 'Ioannina,GR' },
  { label: 'Άρτα', value: 'Arta,GR' },
  { label: 'Πρέβεζα', value: 'Preveza,GR' },
  { label: 'Ηγουμενίτσα', value: 'Igoumenitsa,GR' },
  { label: 'Φιλιππιάδα', value: 'Filippiada,GR' },
  { label: 'Μέτσοβο', value: 'Metsovo,GR' },

  // ── Στερεά Ελλάδα ──
  { label: 'Λαμία', value: 'Lamia,GR' },
  { label: 'Χαλκίδα', value: 'Chalkida,GR' },
  { label: 'Λιβαδειά', value: 'Livadeia,GR' },
  { label: 'Θήβα', value: 'Thebes,GR' },
  { label: 'Άμφισσα', value: 'Amfissa,GR' },
  { label: 'Καρπενήσι', value: 'Karpenisi,GR' },
  { label: 'Αταλάντη', value: 'Atalanti,GR' },
  { label: 'Ιστιαία', value: 'Istiaia,GR' },
  { label: 'Αλιβέρι', value: 'Aliveri,GR' },
  { label: 'Καρύστος', value: 'Karystos,GR' },

  // ── Δυτική Ελλάδα ──
  { label: 'Πάτρα', value: 'Patras,GR' },
  { label: 'Αγρίνιο', value: 'Agrinio,GR' },
  { label: 'Πύργος', value: 'Pyrgos,GR' },
  { label: 'Μεσολόγγι', value: 'Messolonghi,GR' },
  { label: 'Αμαλιάδα', value: 'Amaliada,GR' },
  { label: 'Αίγιο', value: 'Aigio,GR' },
  { label: 'Ναύπακτος', value: 'Nafpaktos,GR' },
  { label: 'Κάτω Αχαΐα', value: 'Kato Achaia,GR' },

  // ── Πελοπόννησος ──
  { label: 'Καλαμάτα', value: 'Kalamata,GR' },
  { label: 'Κόρινθος', value: 'Corinth,GR' },
  { label: 'Τρίπολη', value: 'Tripoli,GR' },
  { label: 'Ναύπλιο', value: 'Nafplio,GR' },
  { label: 'Σπάρτη', value: 'Sparti,GR' },
  { label: 'Άργος', value: 'Argos,GR' },
  { label: 'Γύθειο', value: 'Gytheio,GR' },
  { label: 'Μεγαλόπολη', value: 'Megalopoli,GR' },
  { label: 'Κιάτο', value: 'Kiato,GR' },
  { label: 'Ξυλόκαστρο', value: 'Xylokastro,GR' },
  { label: 'Λουτράκι', value: 'Loutraki,GR' },
  { label: 'Πύλος', value: 'Pylos,GR' },
  { label: 'Μεσσήνη', value: 'Messini,GR' },

  // ── Κρήτη ──
  { label: 'Ηράκλειο', value: 'Heraklion,GR' },
  { label: 'Χανιά', value: 'Chania,GR' },
  { label: 'Ρέθυμνο', value: 'Rethymno,GR' },
  { label: 'Άγιος Νικόλαος', value: 'Agios Nikolaos,GR' },
  { label: 'Ιεράπετρα', value: 'Ierapetra,GR' },
  { label: 'Σητεία', value: 'Sitia,GR' },
  { label: 'Μοίρες', value: 'Moires,GR' },
  { label: 'Τυμπάκι', value: 'Tympaki,GR' },

  // ── Νησιά Αιγαίου ──
  { label: 'Μυτιλήνη', value: 'Mytilene,GR' },
  { label: 'Χίος', value: 'Chios,GR' },
  { label: 'Σάμος', value: 'Samos,GR' },
  { label: 'Ρόδος', value: 'Rhodes,GR' },
  { label: 'Κως', value: 'Kos,GR' },
  { label: 'Κάλυμνος', value: 'Kalymnos,GR' },
  { label: 'Σύρος', value: 'Syros,GR' },
  { label: 'Νάξος', value: 'Naxos,GR' },
  { label: 'Πάρος', value: 'Paros,GR' },
  { label: 'Μύκονος', value: 'Mykonos,GR' },
  { label: 'Σαντορίνη', value: 'Santorini,GR' },
  { label: 'Τήνος', value: 'Tinos,GR' },
  { label: 'Άνδρος', value: 'Andros,GR' },
  { label: 'Ικαρία', value: 'Ikaria,GR' },
  { label: 'Λήμνος', value: 'Limnos,GR' },

  // ── Ιόνια Νησιά ──
  { label: 'Κέρκυρα', value: 'Corfu,GR' },
  { label: 'Ζάκυνθος', value: 'Zakynthos,GR' },
  { label: 'Κεφαλονιά', value: 'Kefalonia,GR' },
  { label: 'Λευκάδα', value: 'Lefkada,GR' },
  { label: 'Αργοστόλι', value: 'Argostoli,GR' },
  { label: 'Ιθάκη', value: 'Ithaki,GR' },
]

/**
 * Normalizes Greek text for accent- and case-insensitive search:
 * lowercases and strips diacritics (τόνους) so "λαρισα" matches "Λάρισα".
 */
export function normalizeGreek(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip combining accents
    .trim()
}

/** Instant search: matches by full or partial name, accent-insensitive. */
export function searchGreekCities(query: string): GreekCity[] {
  const q = normalizeGreek(query)
  if (!q) return GREEK_CITIES
  return GREEK_CITIES.filter(c => normalizeGreek(c.label).includes(q))
}
