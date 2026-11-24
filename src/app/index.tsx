import { Redirect } from 'expo-router';

import { useStore } from '@/lib/store';

// Routes each person to the interface for their current mode, like the split
// between a rider app and a driver app.
export default function Index() {
  const { state } = useStore();

  if (!state.role || !state.profile) return <Redirect href="/welcome" />;

  if (state.role === 'client') return <Redirect href="/client" />;

  if (!state.providerProfile) return <Redirect href="/onboarding/provider" />;
  if (state.providerProfile.status === 'review') return <Redirect href="/onboarding/review" />;
  return <Redirect href="/provider" />;
}
