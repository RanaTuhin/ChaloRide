import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { Card } from '@/components/ui/card';
import { PrimaryButton } from '@/components/ui/primary-button';
import { useChaloRideStore } from '@/state/chaloride-store';

function Row({
  title,
  subtitle,
  onPress,
}: {
  title: string;
  subtitle?: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      <Text style={styles.chev}>›</Text>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { state, dispatch } = useChaloRideStore();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Profile</Text>

      {!state.user ? (
        <Card style={{ gap: 10 }}>
          <Text style={styles.muted}>Sign in to book rides, use wallet, and see your history.</Text>
          <PrimaryButton title="Sign in" onPress={() => router.push('/auth/sign-in')} />
          <Pressable onPress={() => router.push('/auth/sign-up')}>
            <Text style={styles.linkText}>Create an account</Text>
          </Pressable>
        </Card>
      ) : (
        <>
          <Card style={{ gap: 6 }}>
            <Text style={styles.name}>{state.user.name}</Text>
            <Text style={styles.meta}>{state.user.phone}</Text>
            {state.user.email ? <Text style={styles.meta}>{state.user.email}</Text> : null}
          </Card>

          <Card style={{ padding: 0 }}>
            <Row title="Support" subtitle="Help, safety, and FAQs" onPress={() => router.push('/support')} />
            <View style={styles.divider} />
            <Row title="Payment methods" subtitle="Manage defaults" onPress={() => router.push('/wallet')} />
            <View style={styles.divider} />
            <Row title="Notifications" subtitle="Coming soon" onPress={() => {}} />
            <View style={styles.divider} />
            <Row title="About ChaloRide" subtitle="Version, terms, privacy" onPress={() => {}} />
          </Card>

          <PrimaryButton title="Sign out" onPress={() => dispatch({ type: 'auth/signOut' })} />
        </>
      )}

      <Text style={styles.footnote}>ChaloRide demo UI: add backend, maps, and payments for production.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: '900' },
  muted: { opacity: 0.75, lineHeight: 18 },
  linkText: { fontWeight: '800', color: '#16a34a' },
  name: { fontSize: 18, fontWeight: '900' },
  meta: { fontSize: 13, opacity: 0.75 },
  row: { paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center' },
  rowTitle: { fontSize: 14, fontWeight: '900' },
  rowSubtitle: { fontSize: 12, opacity: 0.7, marginTop: 2 },
  chev: { fontSize: 20, opacity: 0.45 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(148,163,184,0.35)' },
  footnote: { fontSize: 12, opacity: 0.6, lineHeight: 16, paddingTop: 4 },
});
