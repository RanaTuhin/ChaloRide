import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/card';

function Item({ title, subtitle, onPress }: { title: string; subtitle: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.item}>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemTitle}>{title}</Text>
        <Text style={styles.itemSubtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.chev}>›</Text>
    </Pressable>
  );
}

export default function SupportScreen() {
  const soon = (topic: string) => Alert.alert('Support (demo)', `${topic}\n\nHook this to chat/call + ticketing in production.`);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Support</Text>
      <Card style={{ padding: 0 }}>
        <Item title="Safety" subtitle="Emergency, share trip, trusted contacts" onPress={() => soon('Safety')} />
        <View style={styles.divider} />
        <Item title="Ride issues" subtitle="Driver behavior, fare issues, lost items" onPress={() => soon('Ride issues')} />
        <View style={styles.divider} />
        <Item title="Payments" subtitle="Refunds, wallet, card problems" onPress={() => soon('Payments')} />
        <View style={styles.divider} />
        <Item title="Account" subtitle="Login, profile, privacy" onPress={() => soon('Account')} />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: '900' },
  item: { paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center' },
  itemTitle: { fontSize: 14, fontWeight: '900' },
  itemSubtitle: { fontSize: 12, opacity: 0.7, marginTop: 2 },
  chev: { fontSize: 20, opacity: 0.45 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(148,163,184,0.35)' },
});

