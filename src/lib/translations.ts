/**
 * translations.ts — string dictionary for localization.
 *
 * Greek (el) is the source of truth. English (en) is provided for the
 * navigation + homepage surface now; deeper screens can be filled in later.
 * Keys use dot-namespacing: nav.*, hero.*, home.*, eco.*
 */
export type Locale = 'el' | 'en'

export const LOCALES: { code: Locale; label: string; flag: string }[] = [
  { code: 'el', label: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'en', label: 'English',  flag: '🇬🇧' },
]

export const translations: Record<Locale, Record<string, string>> = {
  el: {
    // Navigation
    'nav.home':       'Αρχική',
    'nav.market':     'Αγορά',
    'nav.listings':   'Αγγελίες',
    'nav.transport':  'Μεταφορές',
    'nav.map':        'Χάρτης',
    'nav.insurance':  'Ασφάλειες',
    'nav.weather':    'Καιρός',
    'nav.offers':     'Προσφορές',
    'nav.notifs':     'Ειδοποιήσεις',
    'nav.messages':   'Μηνύματα',
    'nav.news':       'Νέα',
    'nav.ranking':    'Κατάταξη',
    'nav.profile':    'Προφίλ',
    'nav.login':      'Σύνδεση',
    'nav.register':   'Εγγραφή',
    'nav.dashboard':  'Dashboard',
    'nav.logout':     'Αποσύνδεση',

    // Market dropdown
    'market.wheat':   'Τιμές Σιταριού',
    'market.corn':    'Τιμές Καλαμποκιού',
    'market.cotton':  'Τιμές Βαμβακιού',
    'market.all':     'Όλες οι Τιμές',

    // Listings dropdown
    'listings.all':    'Όλες οι Αγγελίες',
    'listings.create': 'Δημιουργία Αγγελίας',
    'listings.mine':   'Οι Αγγελίες μου',

    // Transport dropdown
    'transport.search': 'Αναζήτηση',
    'transport.new':    'Νέα Μεταφορά',
    'transport.mine':   'Οι Μεταφορές μου',

    // Hero
    'hero.headline':  'Η αγροτική αγορά σε μία πλατφόρμα',
    'hero.subtitle':  'Βρες αγοραστές, δημοσίευσε αγγελίες, ενημερώσου για τις τιμές της αγοράς και διαχειρίσου τις μεταφορές σου — όλα σε ένα μέρος.',
    'hero.cta_create': 'Δημιουργία Αγγελίας',
    'hero.cta_browse': 'Δείτε Αγγελίες',
    'hero.cta_dashboard': 'Στο Dashboard',

    // Homepage sections
    'home.prices_title':   'Τιμές Αγοράς Σήμερα',
    'home.benefits_title': 'Αγγελίες, τιμές, μεταφορές και νέα σε ένα μέρος',
    'home.listings_title': 'Πρόσφατες Αγγελίες',
    'home.howit_title':    'Πώς λειτουργεί',
    'home.transport_title':'Βρες Μεταφορά',
    'home.stats_title':    'Η αγροτική αγορά γίνεται ψηφιακή',

    // Ecosystem roles
    'eco.farmers':      'Παραγωγοί',
    'eco.buyers':       'Αγοραστές',
    'eco.transporters': 'Μεταφορείς',
    'eco.insurers':     'Ασφαλιστικές Εταιρείες',

    // Units
    'unit.per_ton': 'ανά τόνο',
  },
  en: {
    'nav.home':       'Home',
    'nav.market':     'Market',
    'nav.listings':   'Listings',
    'nav.transport':  'Transport',
    'nav.map':        'Map',
    'nav.insurance':  'Insurance',
    'nav.weather':    'Weather',
    'nav.offers':     'Offers',
    'nav.notifs':     'Notifications',
    'nav.messages':   'Messages',
    'nav.news':       'News',
    'nav.ranking':    'Rankings',
    'nav.profile':    'Profile',
    'nav.login':      'Log in',
    'nav.register':   'Sign up',
    'nav.dashboard':  'Dashboard',
    'nav.logout':     'Log out',

    'market.wheat':   'Wheat Prices',
    'market.corn':    'Corn Prices',
    'market.cotton':  'Cotton Prices',
    'market.all':     'All Prices',

    'listings.all':    'All Listings',
    'listings.create': 'Create Listing',
    'listings.mine':   'My Listings',

    'transport.search': 'Search',
    'transport.new':    'New Transport',
    'transport.mine':   'My Transports',

    'hero.headline':  'The agricultural market in one platform',
    'hero.subtitle':  'Find buyers, post listings, track market prices and manage your transport — all in one place.',
    'hero.cta_create': 'Create Listing',
    'hero.cta_browse': 'Browse Listings',
    'hero.cta_dashboard': 'Go to Dashboard',

    'home.prices_title':   "Today's Market Prices",
    'home.benefits_title': 'Listings, prices, transport and news in one place',
    'home.listings_title': 'Latest Listings',
    'home.howit_title':    'How it works',
    'home.transport_title':'Find Transport',
    'home.stats_title':    'Agriculture goes digital',

    'eco.farmers':      'Producers',
    'eco.buyers':       'Buyers',
    'eco.transporters': 'Transporters',
    'eco.insurers':     'Insurance Companies',

    'unit.per_ton': 'per ton',
  },
}
