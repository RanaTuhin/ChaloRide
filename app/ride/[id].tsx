import React, { useEffect, useMemo, useRef } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { Card } from '@/components/ui/card';
import { PrimaryButton } from '@/components/ui/primary-button';
import { formatINR } from '@/lib/money';
import { estimateFarePaise, randomDriver, randomOtp, RIDE_TYPES, useChaloRideStore } from '@/state/chaloride-store';

function statusLabel(s: string) {
  return s.replace(/_/g, ' ');
}

export default function RideDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, dispatch } = useChaloRideStore();
  const ride = state.rides.find((r) => r.id === id);
  const rideId = ride?.id;
  const rideStatus = ride?.status;
  const rideTypeId = ride?.rideTypeId;
  const rideDistanceKm = ride?.distanceKm;
  const hasDriver = !!ride?.driver;
  const rideType = useMemo(() => RIDE_TYPES.find((r) => r.id === ride?.rideTypeId), [ride?.rideTypeId]);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const clearTimers = () => {
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = [];
    };

    clearTimers();
    if (!rideId || !rideStatus || !rideTypeId || !rideDistanceKm) return;
    if (rideStatus === 'canceled' || rideStatus === 'completed') return;

    if (!hasDriver) {
      dispatch({ type: 'ride/setDriver', rideId, driver: randomDriver(), otp: randomOtp() });
    }

    const scheduleComplete = (ms: number) => {
      timersRef.current.push(
        setTimeout(() => {
          const finalPaise = Math.round(estimateFarePaise(rideTypeId, rideDistanceKm) * 1.05);
          dispatch({
            type: 'ride/setFinalFare',
            rideId,
            finalFare: { currency: 'INR', amountPaise: finalPaise },
          });
          dispatch({ type: 'ride/updateStatus', rideId, status: 'completed' });
        }, ms)
      );
    };

    switch (rideStatus) {
      case 'requested': {
        timersRef.current.push(
          setTimeout(() => dispatch({ type: 'ride/updateStatus', rideId, status: 'accepted' }), 800)
        );
        timersRef.current.push(
          setTimeout(() => dispatch({ type: 'ride/updateStatus', rideId, status: 'arriving' }), 2000)
        );
        timersRef.current.push(
          setTimeout(() => dispatch({ type: 'ride/updateStatus', rideId, status: 'in_progress' }), 5000)
        );
        scheduleComplete(9000);
        break;
      }
      case 'accepted': {
        timersRef.current.push(
          setTimeout(() => dispatch({ type: 'ride/updateStatus', rideId, status: 'arriving' }), 1200)
        );
        timersRef.current.push(
          setTimeout(() => dispatch({ type: 'ride/updateStatus', rideId, status: 'in_progress' }), 4200)
        );
        scheduleComplete(8200);
        break;
      }
      case 'arriving': {
        timersRef.current.push(
          setTimeout(() => dispatch({ type: 'ride/updateStatus', rideId, status: 'in_progress' }), 3000)
        );
        scheduleComplete(7000);
        break;
      }
      case 'in_progress': {
        scheduleComplete(4000);
        break;
      }
      default:
        break;
    }

    return clearTimers;
  }, [dispatch, hasDriver, rideDistanceKm, rideId, rideStatus, rideTypeId]);

  if (!ride) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Ride not found</Text>
        <Text style={styles.muted}>This ride may have been cleared (demo state resets on reload).</Text>
      </ScrollView>
    );
  }

  const canCancel = ride.status === 'requested' || ride.status === 'accepted' || ride.status === 'arriving';
  const canRate = ride.status === 'completed' && !ride.rating;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Ride</Text>

      <Card style={{ gap: 8 }}>
        <Text style={styles.status}>Status: {statusLabel(ride.status)}</Text>
        <Text style={styles.place} numberOfLines={1}>
          From: {ride.pickup.label}
        </Text>
        <Text style={styles.place} numberOfLines={1}>
          To: {ride.dropoff.label}
        </Text>
        <View style={styles.row}>
          <Text style={styles.kvLabel}>Ride</Text>
          <Text style={styles.kvValue}>{rideType?.title ?? ride.rideTypeId}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.kvLabel}>Fare</Text>
          <Text style={styles.kvValue}>{formatINR(ride.finalFare ?? ride.estimate)}</Text>
        </View>
        {ride.note ? <Text style={styles.note}>Note: {ride.note}</Text> : null}
      </Card>

      <Card style={{ gap: 10 }}>
        <Text style={styles.sectionTitle}>Driver</Text>
        {ride.driver ? (
          <>
            <Text style={styles.driverName}>
              {ride.driver.name} • {ride.driver.rating.toFixed(1)}★
            </Text>
            <Text style={styles.muted}>
              {ride.driver.vehicle} • {ride.driver.numberPlate}
            </Text>
            {ride.otp ? <Text style={styles.otp}>Trip OTP: {ride.otp}</Text> : null}
            <View style={styles.driverActions}>
              <Pressable onPress={() => Alert.alert('Call (demo)', 'Integrate call/masking via telephony provider.')}>
                <Text style={styles.linkText}>Call</Text>
              </Pressable>
              <Pressable onPress={() => Alert.alert('Chat (demo)', 'Integrate in-app chat + support ticketing.')}>
                <Text style={styles.linkText}>Chat</Text>
              </Pressable>
              <Pressable onPress={() => Alert.alert('Share trip (demo)', 'Share live tracking link / emergency flow.')}>
                <Text style={styles.linkText}>Share trip</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <Text style={styles.muted}>Finding a nearby driver…</Text>
        )}
      </Card>

      {canCancel ? (
        <PrimaryButton
          title="Cancel ride"
          onPress={() => dispatch({ type: 'ride/updateStatus', rideId: ride.id, status: 'canceled' })}
        />
      ) : null}

      {canRate ? (
        <Card style={{ gap: 10 }}>
          <Text style={styles.sectionTitle}>Rate your ride</Text>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable key={n} onPress={() => dispatch({ type: 'ride/rate', rideId: ride.id, rating: n })}>
                <Text style={styles.star}>{'★'.repeat(n)}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.muted}>Tap a star count to submit rating (demo).</Text>
        </Card>
      ) : ride.rating ? (
        <Card>
          <Text style={styles.sectionTitle}>Thanks!</Text>
          <Text style={styles.muted}>You rated this ride {ride.rating}★.</Text>
        </Card>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: '900' },
  muted: { fontSize: 12, opacity: 0.7, lineHeight: 16 },
  status: { fontSize: 14, fontWeight: '900' },
  place: { fontSize: 13, opacity: 0.9 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kvLabel: { fontSize: 13, opacity: 0.7 },
  kvValue: { fontSize: 13, fontWeight: '800' },
  note: { fontSize: 12, opacity: 0.8, lineHeight: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '900' },
  driverName: { fontSize: 14, fontWeight: '900' },
  otp: { fontSize: 14, fontWeight: '900' },
  driverActions: { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  linkText: { fontWeight: '900', color: '#16a34a' },
  ratingRow: { gap: 10 },
  star: { fontSize: 14, fontWeight: '900' },
});
