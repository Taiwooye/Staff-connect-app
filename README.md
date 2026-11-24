# StaffConnect Mobile

The mobile app for [StaffConnect](https://github.com/Taiwooye/Staff-connect), a marketplace that connects households and businesses in Lagos and Oyo with home-help professionals.

It is built with **Expo (React Native + Expo Router)**. The same code runs on iOS and Android, and exports to the web for a hosted demo.

## Two apps in one, like Uber and Bolt

Uber and Bolt ship separate apps for riders and drivers because the two sides do different jobs. A rider *requests and tracks*. A driver *goes online, decides on offers in seconds, and completes work*. StaffConnect follows the same split. The role a person chooses during onboarding decides which interface they get, and each side has its own navigation and visual identity.

| | **Client app** (light, emerald) | **Provider app** (dark "work mode", amber) |
|---|---|---|
| Home | Map with nearby pros, plus "What do you need help with?" service grid | Map with a big **GO** button, today's earnings, acceptance rate |
| Core action | Book: area, address, now or scheduled, hours, tasks, payment, price breakdown | Incoming job offer with a **15-second countdown ring**, take-home pay, distance, and accept/decline |
| Live flow | Matching → pro on the way (live route and ETA) → arrived → share **start code** → in progress → rate and tip | Head to client (navigation banner) → I've arrived → enter client's **start code** → checklist → complete → rate client |
| Tabs | Home · Bookings · Account | Work · Earnings · Profile |
| Onboarding | Phone + OTP → name and area | Phone + OTP → name and area → services → work areas → rate and availability → bio → ID, selfie, address, and references → review → approval |

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
  provider/              provider tabs (work, earnings, profile)
  work/[id].tsx          provider active-job flow
src/components/          UI kit, SVG city map, shared account view
src/lib/                 theme palettes, service catalogue, store and simulation
```

## Deploy

The web demo deploys to Vercel with [`vercel.json`](vercel.json), which runs `expo export -p web` and serves `dist/` as a single-page app. For store builds, use EAS (`npx eas-cli@latest build`).

## Next steps toward production

- Replace the simulation with Supabase (the website already uses it): jobs table, realtime job status, and provider presence.
- Real maps and location (`react-native-maps` + `expo-location`) on native.
- Push notifications for job offers (`expo-notifications`), plus SMS OTP through Supabase Auth.
- Real document verification and a payments provider (e.g. Paystack) when money handling is in scope.
