# AgroExchange — Email Configuration Guide

## Νέο Authentication Flow

Η εγγραφή **δεν απαιτεί επιβεβαίωση email**.
- Ο χρήστης εγγράφεται → λογαριασμός ενεργός αμέσως → αυτόματη είσοδος
- Αποστέλλεται Welcome Email (όχι confirmation email)

---

## Βήμα 1 — Απενεργοποίηση Email Confirmation (ΥΠΟΧΡΕΩΤΙΚΟ)

**Supabase Dashboard → Authentication → Settings:**

```
Email Auth:
  ☑ Enable email provider         → ON
  ☐ Confirm email                 → OFF  ← ΑΠΑΡΑΙΤΗΤΟ
  ☐ Secure email change           → OFF (προαιρετικό)
  Double confirm email changes    → OFF
```

> ⚠️ Αν το "Confirm email" παραμείνει ON, οι χρήστες θα λαμβάνουν
> confirmation email και δεν θα μπορούν να συνδεθούν αμέσως.

---

## Βήμα 2 — Welcome Email με Resend (προτεινόμενο)

### Γιατί Resend;
- Δωρεάν: **3.000 emails/μήνα**
- Αφαιρεί πλήρως το Supabase branding
- Αποστολή από `noreply@agroexchange.gr`
- Πλήρης έλεγχος HTML template

### Εγκατάσταση:
1. Πήγαινε στο [resend.com](https://resend.com) → δωρεάν account
2. **API Keys** → Create API Key → αντέγραψε
3. **Domains** → Add Domain → `agroexchange.gr` → επαλήθευσε DNS
4. Βάλε το key στο `.env.local`:
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
   ```
5. Στο production, βάλε το ίδιο key στο Vercel/hosting environment variables

### Τι γίνεται χωρίς Resend key;
Η πλατφόρμα λειτουργεί κανονικά. Το welcome email εμφανίζεται μόνο στο
server console (για dev). Δεν σταματά η εγγραφή.

---

## Βήμα 3 — Password Reset Email Template

Το reset password email **στέλνεται από Supabase** (όχι Resend).
Για να αφαιρέσεις το Supabase branding:

**Supabase Dashboard → Authentication → Email Templates → Reset Password:**

**Subject:** `Επαναφορά κωδικού – AgroExchange`

**Body (HTML):**
```html
<!DOCTYPE html>
<html lang="el">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F0F7F0;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0F7F0;padding:40px 20px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0"
        style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:520px;width:100%;">
        <tr>
          <td style="background:#2E7D32;padding:32px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;font-family:Georgia,serif;">
              AGRO<span style="color:#A5D6A7;">EXCHANGE</span>
            </h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.7);font-size:13px;">
              Η ψηφιακή αγορά αγροτικών προϊόντων
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px;">
            <h2 style="margin:0 0 16px;color:#111;font-size:20px;font-weight:700;">Επαναφορά Κωδικού</h2>
            <p style="margin:0 0 16px;color:#4B5563;font-size:15px;line-height:1.7;">
              Λάβαμε αίτημα για επαναφορά του κωδικού σου. Πάτα το κουμπί παρακάτω για να ορίσεις νέο κωδικό.
            </p>
            <p style="margin:0 0 28px;color:#4B5563;font-size:15px;line-height:1.7;">
              Αν δεν ζήτησες εσύ αυτή την αλλαγή, αγνόησε αυτό το email.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center">
                <a href="{{ .ConfirmationURL }}"
                  style="display:inline-block;background:#2E7D32;color:#fff;text-decoration:none;
                         padding:14px 36px;border-radius:12px;font-weight:700;font-size:15px;">
                  Επαναφορά Κωδικού
                </a>
              </td></tr>
            </table>
            <p style="margin:24px 0 0;color:#9CA3AF;font-size:12px;text-align:center;">
              Ο σύνδεσμος λήγει σε 1 ώρα.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#F9FAF9;padding:20px 40px;border-top:1px solid #E5E7EB;text-align:center;">
            <p style="margin:0;color:#9CA3AF;font-size:11px;">
              © 2025 AgroExchange · Αθήνα, Ελλάδα
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
```

---

## Βήμα 4 — URL Configuration

**Supabase Dashboard → Authentication → URL Configuration:**

```
Site URL:
  https://yourdomain.gr

Redirect URLs (προσθέστε και τα δύο):
  https://yourdomain.gr/auth/reset-password
  http://localhost:3000/auth/reset-password    ← για local dev
```

> Το `/email-confirmed` δεν χρειάζεται πλέον στο redirect (η επιβεβαίωση είναι OFF).

---

## Σύνοψη API Keys

| Service | URL | Δωρεάν | Χρήση |
|---------|-----|--------|-------|
| **Supabase** | supabase.com | 500MB, 50K req/μήνα | DB + Auth (ΥΠΟΧΡΕΩΤΙΚΟ) |
| **Resend** | resend.com | 3.000 emails/μήνα | Welcome email |
| **OpenWeatherMap** | openweathermap.org | 1.000 req/ημέρα | Καιρός |
| **NewsAPI** | newsapi.org | 100 req/ημέρα (dev) | Αγροτικά νέα |
| **Commodities API** | commodities-api.com | 100 req/μήνα | Τιμές αγοράς |

---

## Checklist πριν το Launch

- [ ] Supabase: "Confirm email" → **OFF**
- [ ] Supabase: Password Reset template → αντικατέστησε με το παραπάνω HTML
- [ ] Supabase: URL Configuration → Site URL + Redirect URLs
- [ ] Resend: Domain verified + API key στο `.env`
- [ ] Supabase Storage: `avatars` bucket → Public
- [ ] SQL: `001_initial_schema.sql` εκτελέστηκε
- [ ] SQL: `002_seed_data.sql` εκτελέστηκε
- [ ] `/api/seed` endpoint κλήθηκε για demo data
