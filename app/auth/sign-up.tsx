import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';

import { Card } from '@/components/ui/card';
import { PrimaryButton } from '@/components/ui/primary-button';
import { TextField } from '@/components/ui/text-field';
import { createId, useChaloRideStore } from '@/state/chaloride-store';

export default function SignUpScreen() {
  const { dispatch } = useChaloRideStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const canContinue = name.trim().length >= 2 && phone.trim().length >= 8;

  const onCreate = () => {
    dispatch({
      type: 'auth/signIn',
      user: { id: createId('user'), name: name.trim(), phone: phone.trim(), email: email.trim() || undefined },
    });
    router.replace('/(tabs)');
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Create account</Text>
      <Card style={{ gap: 12 }}>
        <TextField label="Name" value={name} onChangeText={setName} placeholder="Your name" autoCapitalize="words" />
        <TextField
          label="Phone"
          value={phone}
          onChangeText={setPhone}
          placeholder="10-digit mobile number"
          keyboardType="phone-pad"
        />
        <TextField
          label="Email (optional)"
          value={email}
          onChangeText={setEmail}
          placeholder="name@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <PrimaryButton title="Create" onPress={onCreate} disabled={!canContinue} />
        <Text style={styles.muted}>Demo build: account data is stored in memory (resets on reload).</Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: '900' },
  muted: { fontSize: 12, opacity: 0.7, lineHeight: 16 },
});

