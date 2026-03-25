import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { Card } from '@/components/ui/card';
import { formatINR } from '@/lib/money';
import { RIDE_TYPES, useChaloRideStore } from '@/state/chaloride-store';

function formatWhen(ms: number) {
  try {
    return new Date(ms).toLocaleString();
  } catch {
    return String(ms);
  }
}

export default function RidesScreen() {
  const { state } = useChaloRideStore();
  const rides = state.rides;

  const rideTypeLabel = useMemo(() => {
    const map = new Map(RIDE_TYPES.map((r) => [r.id, r.title]));
    return (id: string) => map.get(id as any) ?? id;
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Your Rides</Text>
      {!state.user ? (
        <Card>
          <Text style={styles.muted}>Sign in to book and see your rides.</Text>
          <Pressable style={styles.linkButton} onPress={() => router.push('/auth/sign-in')}>
            <Text style={styles.linkText}>Sign in</Text>
          </Pressable>
        </Card>
      ) : rides.length === 0 ? (
        <Card>
          <Text style={styles.muted}>No rides yet. Book your first ride from the Book tab.</Text>
        </Card>
      ) : (
        <View style={{ gap: 10 }}>
          {rides.map((r) => (
            <Pressable key={r.id} onPress={() => router.push({ pathname: '/ride/[id]', params: { id: r.id } })}>
              <Card style={styles.rideCard}>
                <View style={styles.row}>
                  <Text style={styles.rideTitle}>
                    {rideTypeLabel(r.rideTypeId)} • {r.status.replace(/_/g, ' ')}
                  </Text>
                  <Text style={styles.ridePrice}>
                    {formatINR(r.finalFare ?? r.estimate)}
                  </Text>
                </View>
                <Text style={styles.meta}>{formatWhen(r.requestedAtMs)}</Text>
                <Text style={styles.place} numberOfLines={1}>
                  From: {r.pickup.label}
                </Text>
                <Text style={styles.place} numberOfLines={1}>
                  To: {r.dropoff.label}
                </Text>
              </Card>
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: '900' },
  muted: { opacity: 0.75, lineHeight: 18 },
  linkButton: { marginTop: 10, alignSelf: 'flex-start' },
  linkText: { fontWeight: '800', color: '#16a34a' },
  rideCard: { gap: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  rideTitle: { fontSize: 14, fontWeight: '900', flex: 1 },
  ridePrice: { fontSize: 14, fontWeight: '900' },
  meta: { fontSize: 12, opacity: 0.7 },
  place: { fontSize: 13, opacity: 0.9 },
});
