# StaffConnect Mobile

The mobile app for [StaffConnect](https://github.com/Taiwooye/Staff-connect), a marketplace that connects households and businesses in Lagos and Oyo with home-help professionals.

It is built with **Expo (React Native + Expo Router)**. The same code runs on iOS and Android, and exports to the web for a hosted demo.

**Live demo:** https://staffconnect-mobile.vercel.app. Every push to `main` redeploys automatically through Vercel's GitHub integration.

## Two apps in one, like Uber and Bolt

Uber and Bolt ship separate apps for riders and drivers because the two sides do different jobs. A rider *requests and tracks*. A driver *goes online, decides on offers in seconds, and completes work*. StaffConnect follows the same split. The role a person chooses during onboarding decides which interface they get, and each side has its own navigation and visual identity.

| | **Client app** (light, emerald) | **Provider app** (dark "work mode", amber) |
|---|---|---|
| Home | Map with nearby pros, plus "What do you need help with?" service grid | Map with a big **GO** button, today's earnings, acceptance rate |
| Core action | Book: area, address, now or scheduled, hours, tasks, payment, price breakdown | Incoming job offer with a **15-second countdown ring**, take-home pay, distance, and accept/decline |
| Live flow | **Compare available pros and choose one yourself** → they accept → on the way (live route and ETA) → arrived → share **start code** → in progress → **rate** (stars, tags, comment, tip) | Head to client (navigation banner) → I've arrived → enter client's **start code** → checklist → complete → rate client |
| Tabs | Home · Bookings · Account | Work · Jobs · Earnings · Profile |
| Onboarding | Phone + OTP → name and area → what you need → your matches | Phone + OTP → name and area → services → work areas → rate and availability → bio → ID, selfie, address, and references → review → approval |

### You choose, not the app

Nobody is assigned automatically. After filling in a booking, the client taps **See available pros** and gets a sortable list: best match, top rated, lowest price or nearest. Each entry shows the match %, rating, reasons and the total price at that pro's rate. The client can open any profile to read reviews, then taps **Choose** and confirms before the request is sent. If the pro doesn't suit, **Choose someone else** returns to the list.

### Profiles, accounts and ratings

- **Edit profile:** upload or take a photo (cropped square and stored small on the device), and change your name, phone and area. Providers can also edit services, work areas, rate, availability and bio.
- **Bank account:** add, change or remove an account, with a demo name check. The number is masked as ····1234.
- **Rating:** a dedicated screen with large stars and labels (Poor → Excellent), quick tags, a comment and an optional tip. Unrated bookings show a **Rate** button in Bookings and on the pro's profile, and your reviews appear on the pro's profile and count towards their average.

### Matching

Both sides get suggestions ranked by a match score, with the reasons shown ([`src/lib/matching.ts`](src/lib/matching.ts)):

- **Clients** say what help they need and how often (one-off, weekly, daily, live-in) at the end of onboarding, or later from Account. They see **"Your matches"**: professionals in their state ranked by services covered (45), location (30), working arrangement (15) and track record (10). They can open a profile and **book that pro directly** at the pro's own rate.
- **Professionals** get a **Jobs** tab of longer-term openings from households, schools, events and businesses. Openings are ranked by service (45), work areas (30), schedule overlap (15) and whether the job pays their rate (10). Jobs scoring 60+ show as *Recommended*. Professionals apply with their own asking pay and a note, then track **Applied → Shortlisted → Hired**. In the demo, the hirer hires if the asking pay is within budget.

People can switch sides from the Account tab ("Earn with StaffConnect" / "Switch to booking help"), much like Uber's "Drive with Uber".

## Demo mode

There is no backend yet. A simulation in [`src/lib/store.tsx`](src/lib/store.tsx) plays the other side of the marketplace, so either app can be tried on a single device:

- Client: a demo pro accepts after about 5 seconds, travels for about 20 seconds, and the job runs at a compressed speed (each booked hour takes a few seconds).
- Provider: the application is auto-approved after about 6 seconds. While online, job offers arrive every few seconds.
- The OTP code is **1234**. The client's start code is shown as a hint in the provider app.
- All people, ratings, and jobs are fictional. Data is stored on the device with AsyncStorage. No money moves, and payments are recorded only.

## Run it

```bash
npm install
npx expo start          # press i / a, or scan the QR code with Expo Go
npx expo start --web    # browser
```

## Checks

```bash
npx tsc --noEmit
npx eslint src
npx expo export -p web  # static web build in dist/
```

## Project layout

```
src/app/                 Expo Router screens
  welcome.tsx            intro carousel
  onboarding/            role → phone/OTP → details → provider application → review
  client/                client tabs (home, bookings, account)
  book/[service].tsx     booking sheet
  trip/[id].tsx          client live job tracking
  provider/              provider tabs (work, jobs, earnings, profile)
  matches.tsx            client match results
  pro/[id].tsx           professional profile + direct booking
  job/[id].tsx           job opening detail + application
  work/[id].tsx          provider active-job flow
src/components/          UI kit, SVG city map, shared account view
src/lib/                 theme palettes, catalogue (pros, job openings), matching, store and simulation
```

## Deploy

The web demo deploys to Vercel with [`vercel.json`](vercel.json), which runs `expo export -p web` and serves `dist/` as a single-page app. For store builds, use EAS (`npx eas-cli@latest build`).

## Next steps toward production

- Replace the simulation with Supabase (the website already uses it): jobs table, realtime job status, and provider presence.
- Real maps and location (`react-native-maps` + `expo-location`) on native.
- Push notifications for job offers (`expo-notifications`), plus SMS OTP through Supabase Auth.
- Real document verification and a payments provider (e.g. Paystack) when money handling is in scope.
