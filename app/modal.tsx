import React, { useState } from 'react';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { Card } from '@/components/ui/card';
import { PrimaryButton } from '@/components/ui/primary-button';
import { TextField } from '@/components/ui/text-field';
import { createId, useChaloRideStore } from '@/state/chaloride-store';

export default function ModalScreen() {
  const { state, dispatch } = useChaloRideStore();
  const [label, setLabel] = useState('Visa');
  const [last4, setLast4] = useState('');

  const canAdd = !!state.user && last4.trim().length === 4;

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Add payment method</Text>
      {!state.user ? (
        <Card style={{ gap: 10 }}>
          <Text style={styles.muted}>Sign in first to add payment methods.</Text>
          <PrimaryButton title="Sign in" onPress={() => router.push('/auth/sign-in')} />
        </Card>
      ) : (
        <Card style={{ gap: 12 }}>
          <TextField label="Card label" value={label} onChangeText={setLabel} placeholder="e.g. Visa / HDFC" />
          <TextField
            label="Last 4 digits"
            value={last4}
            onChangeText={(t) => setLast4(t.replace(/[^0-9]/g, '').slice(0, 4))}
            placeholder="1234"
            keyboardType="phone-pad"
            autoCapitalize="none"
          />
          <PrimaryButton
            title="Add card"
            onPress={() => {
              dispatch({
                type: 'payment/addMethod',
                method: { id: createId('pm'), type: 'card', label: `${label.trim() || 'Card'} •••• ${last4}` },
              });
              router.back();
            }}
            disabled={!canAdd}
          />
          <Text style={styles.muted}>Demo only: no real card tokenization or PCI flow is implemented.</Text>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  title: { fontSize: 22, fontWeight: '900' },
  muted: { fontSize: 12, opacity: 0.7, lineHeight: 16 },
});
