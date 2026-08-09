import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { LoadingState } from '../src/components/ui';
import { userPrefs } from '../src/data/userPrefs';

export default function ParentGate() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Parent Space is intentionally locked on every visit.
    userPrefs.clearAuth().finally(() => setReady(true));
  }, []);

  if (!ready) return <LoadingState />;
  return <Redirect href={{ pathname: '/login', params: { destination: 'parent' } }} />;
}
