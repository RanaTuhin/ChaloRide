import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';

import { Card } from '@/components/ui/card';
import { PrimaryButton } from '@/components/ui/primary-button';
import { TextField } from '@/components/ui/text-field';
import { createId, useChaloRideStore } from '@/state/chaloride-store';

export default function SignInScreen() {
  const { dispatch } = useChaloRideStore();
  const [phone, setPhone] = useState('');

  const canContinue = phone.trim().length >= 8;

  const onContinue = () => {
    const cleaned = phone.trim();
    dispatch({
      type: 'auth/signIn',
      user: { id: createId('user'), name: 'ChaloRider', phone: cleaned },
    });
    router.replace('/(tabs)');
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Sign in</Text>
      <Card style={{ gap: 12 }}>
        <TextField
          label="Phone"
          value={phone}
          onChangeText={setPhone}
          placeholder="10-digit mobile number"
          keyboardType="phone-pad"
        />
        <PrimaryButton title="Continue" onPress={onContinue} disabled={!canContinue} />
        <Text style={styles.muted}>
          Demo sign-in: OTP is skipped. Add an auth provider (OTP / OAuth) for production.
        </Text>
      </Card>

      <PrimaryButton title="Create account" onPress={() => router.push('/auth/sign-up')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: '900' },
  muted: { fontSize: 12, opacity: 0.7, lineHeight: 16 },
});

