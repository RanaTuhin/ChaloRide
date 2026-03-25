import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { Card } from '@/components/ui/card';
import { PrimaryButton } from '@/components/ui/primary-button';
import { formatINR } from '@/lib/money';
import { useChaloRideStore } from '@/state/chaloride-store';

export default function WalletScreen() {
  const { state, dispatch } = useChaloRideStore();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Wallet</Text>

      {!state.user ? (
        <Card>
          <Text style={styles.muted}>Sign in to use Wallet and manage payments.</Text>
          <Pressable style={styles.linkButton} onPress={() => router.push('/auth/sign-in')}>
            <Text style={styles.linkText}>Sign in</Text>
          </Pressable>
        </Card>
      ) : (
        <>
          <Card style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>ChaloRide Wallet balance</Text>
            <Text style={styles.balanceValue}>{formatINR(state.walletBalance)}</Text>
            <View style={styles.actions}>
              <PrimaryButton
                title="Add ₹200"
                onPress={() => dispatch({ type: 'wallet/add', amountPaise: 20000 })}
              />
              <PrimaryButton
                title="Add payment method"
                onPress={() => router.push('/modal')}
              />
            </View>
          </Card>

          <Card style={{ gap: 10 }}>
            <Text style={styles.sectionTitle}>Payment methods</Text>
            {state.paymentMethods.map((p) => {
              const selected = p.id === state.defaultPaymentMethodId;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => dispatch({ type: 'payment/setDefault', paymentMethodId: p.id })}
                  style={[styles.pmRow, selected ? styles.pmRowSelected : undefined]}>
                  <Text style={styles.pmLabel}>{p.label}</Text>
                  <Text style={styles.pmMeta}>{selected ? 'Default' : 'Tap to set default'}</Text>
                </Pressable>
              );
            })}
          </Card>
        </>
      )}

      <Text style={styles.footnote}>Payments are mocked in this demo build.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: '900' },
  muted: { opacity: 0.75, lineHeight: 18 },
  linkButton: { marginTop: 10, alignSelf: 'flex-start' },
  linkText: { fontWeight: '800', color: '#16a34a' },
  balanceCard: { gap: 10 },
  balanceLabel: { fontSize: 13, opacity: 0.75 },
  balanceValue: { fontSize: 28, fontWeight: '900' },
  actions: { gap: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '900' },
  pmRow: { paddingVertical: 10, gap: 2 },
  pmRowSelected: { opacity: 1 },
  pmLabel: { fontSize: 14, fontWeight: '800' },
  pmMeta: { fontSize: 12, opacity: 0.7 },
  footnote: { fontSize: 12, opacity: 0.6, lineHeight: 16, paddingTop: 4 },
});

