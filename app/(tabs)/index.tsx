import React, { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { Card } from '@/components/ui/card';
import { PrimaryButton } from '@/components/ui/primary-button';
import { TextField } from '@/components/ui/text-field';
import { formatINR } from '@/lib/money';
import {
  createId,
  estimateFarePaise,
  RIDE_TYPES,
  type RideTypeId,
  useChaloRideStore,
} from '@/state/chaloride-store';

function estimateDistanceKm(dropoff: string) {
  const normalized = dropoff.trim();
  if (!normalized) return 0;
  const base = Math.min(18, Math.max(2, normalized.length / 3));
  return Math.round(base * 10) / 10;
}

export default function HomeScreen() {
  const { state, dispatch } = useChaloRideStore();
  const [pickup, setPickup] = useState('Current location');
  const [dropoff, setDropoff] = useState('');
  const [note, setNote] = useState('');
  const [rideTypeId, setRideTypeId] = useState<RideTypeId>('bike');

  const distanceKm = useMemo(() => estimateDistanceKm(dropoff), [dropoff]);
  const estimatePaise = useMemo(() => {
    if (!distanceKm) return 0;
    return estimateFarePaise(rideTypeId, distanceKm);
  }, [rideTypeId, distanceKm]);

  const canRequest = pickup.trim().length > 0 && dropoff.trim().length > 0 && distanceKm > 0;
  const defaultPm = state.paymentMethods.find((p) => p.id === state.defaultPaymentMethodId);

  const onRequestRide = () => {
    if (!state.user) {
      router.push('/auth/sign-in');
      return;
    }
    const rideId = createId('ride');
    dispatch({
      type: 'ride/create',
      ride: {
        id: rideId,
        requestedAtMs: Date.now(),
        pickup: { label: pickup.trim() },
        dropoff: { label: dropoff.trim() },
        rideTypeId,
        distanceKm,
        status: 'requested',
        estimate: { currency: 'INR', amountPaise: estimatePaise },
        note: note.trim() ? note.trim() : undefined,
      },
    });
    router.push({ pathname: '/ride/[id]', params: { id: rideId } });
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.brand}>ChaloRide</Text>
        <Text style={styles.tagline}>{Platform.select({ default: 'Book rides in seconds' })}</Text>
      </View>

      <Card style={styles.section}>
        <TextField label="Pickup" value={pickup} onChangeText={setPickup} placeholder="Pickup location" />
        <TextField
          label="Drop"
          value={dropoff}
          onChangeText={setDropoff}
          placeholder="Where to?"
          autoCapitalize="words"
        />
        <TextField
          label="Note (optional)"
          value={note}
          onChangeText={setNote}
          placeholder="Gate / landmark / instructions"
          autoCapitalize="sentences"
        />
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Choose a ride</Text>
        <View style={styles.rideTypes}>
          {RIDE_TYPES.map((rt) => {
            const selected = rt.id === rideTypeId;
            const est = distanceKm ? estimateFarePaise(rt.id, distanceKm) : undefined;
            return (
              <Pressable
                key={rt.id}
                accessibilityRole="button"
                onPress={() => setRideTypeId(rt.id)}
                style={[styles.rideType, selected ? styles.rideTypeSelected : undefined]}>
                <Text style={styles.rideTypeTitle}>{rt.title}</Text>
                <Text style={styles.rideTypeMeta}>
                  {rt.capacityText} • {rt.etaMinutes} min
                </Text>
                <Text style={styles.rideTypePrice}>{est ? formatINR({ currency: 'INR', amountPaise: est }) : '—'}</Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.kvLabel}>Distance</Text>
          <Text style={styles.kvValue}>{distanceKm ? `${distanceKm} km` : '—'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.kvLabel}>Payment</Text>
          <Text style={styles.kvValue}>{defaultPm?.label ?? 'Cash'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.kvLabel}>Estimated fare</Text>
          <Text style={styles.kvValue}>
            {estimatePaise ? formatINR({ currency: 'INR', amountPaise: estimatePaise }) : '—'}
          </Text>
        </View>
      </Card>

      <PrimaryButton
        title={state.user ? 'Request ChaloRide' : 'Sign in to request'}
        onPress={onRequestRide}
        disabled={!canRequest}
      />
      <Text style={styles.footnote}>
        Demo build: location, maps, and payments are mocked. Connect a backend + maps SDK to go production-ready.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  header: {
    paddingVertical: 6,
    gap: 4,
  },
  brand: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  tagline: {
    fontSize: 14,
    opacity: 0.7,
  },
  section: { gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '800' },
  rideTypes: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  rideType: {
    width: '48%',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.35)',
    gap: 4,
  },
  rideTypeSelected: {
    borderColor: 'rgba(22,163,74,0.9)',
  },
  rideTypeTitle: { fontSize: 16, fontWeight: '800' },
  rideTypeMeta: { fontSize: 12, opacity: 0.75 },
  rideTypePrice: { marginTop: 2, fontSize: 14, fontWeight: '800' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kvLabel: { fontSize: 13, opacity: 0.7 },
  kvValue: { fontSize: 14, fontWeight: '700' },
  footnote: { fontSize: 12, opacity: 0.6, lineHeight: 16, paddingTop: 4 },
});
