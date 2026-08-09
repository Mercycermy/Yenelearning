import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { LoadingState } from '../src/components/ui';
import { userPrefs } from '../src/data/userPrefs';

export default function AuthGate() {
  const [ready, setReady] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);

  useEffect(() => {
    userPrefs.isFamilySetupComplete().then((value) => {
      setSetupComplete(value);
      setReady(true);
    });
  }, []);

  if (!ready) return <LoadingState />;
  return <Redirect href={setupComplete ? '/dashboard' : '/login'} />;
}
