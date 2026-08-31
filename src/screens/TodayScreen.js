import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TodayScreen({ meals, goal, onDelete }) {
  const todayKey = new Date().toISOString().slice(0, 10);
  const todays = meals.filter((m) => (m.time || '').slice(0, 10) === todayKey);

  const totals = todays.reduce((a, m) => ({
    calories: a.calories + (Number(m.calories) || 0),
    protein: a.protein + (Number(m.protein) || 0),
    carbs: a.carbs + (Number(m.carbs) || 0),
    fat: a.fat + (Number(m.fat) || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const remaining = Math.max(0, Math.round(goal - totals.calories));
  const pct = Math.min(100, Math.round((totals.calories / goal) * 100));

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Today</Text>

      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.bigNumber}>{Math.round(totals.calories)}</Text>
          <Text style={styles.goalText}>/ {goal} kcal</Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${pct}%` }]} />
        </View>
        <Text style={styles.remaining}>{remaining} kcal remaining</Text>
      </View>

      <View style={styles.macroRow}>
        <MacroBox label="Protein" value={totals.protein} color="#2563EB" />
        <MacroBox label="Carbs" value={totals.carbs} color="#D97706" />
        <MacroBox label="Fat" value={totals.fat} color="#DC2626" />
      </View>

      <Text style={styles.section}>Meals today ({todays.length})</Text>

      <FlatList
        data={todays}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="camera-outline" size={40} color="#9CA3AF" />
            <Text style={styles.emptyText}>
              No meals yet.{'\n'}Go to the Scan tab and photograph your food.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.meal}>
            <View style={styles.mealInfo}>
              <Text style={styles.mealName} numberOfLines={2}>
                {(item.items || []).map((i) => i.name).join(', ') || 'Meal'}
              </Text>
              <Text style={styles.mealMeta}>
                {formatTime(item.time)} · P {Math.round(item.protein)}g · C {Math.round(item.carbs)}g · F {Math.round(item.fat)}g
              </Text>
            </View>
            <Text style={styles.mealKcal}>{Math.round(item.calories)} kcal</Text>
            <TouchableOpacity onPress={() => onDelete(item.id)}>
              <Ionicons name="trash-outline" size={20} color="#DC2626" />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

function MacroBox({ label, value, color }) {
  return (
    <View style={styles.macroBox}>
      <Text style={[styles.macroValue, { color }]}>{Math.round(value)}g</Text>
      <Text style={styles.macroLabel}>{label}</Text>
    </View>
  );
}

function formatTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return '';
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 12 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, elevation: 2 },
  rowBetween: { flexDirection: 'row', alignItems: 'baseline' },
  bigNumber: { fontSize: 40, fontWeight: '800', color: '#111827' },
  goalText: { fontSize: 16, color: '#6B7280', marginLeft: 6 },
  track: { height: 10, backgroundColor: '#E5E7EB', borderRadius: 5, marginTop: 10 },
  fill: { height: 10, backgroundColor: '#22C55E', borderRadius: 5 },
  remaining: { marginTop: 8, color: '#6B7280', fontSize: 13 },
  macroRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  macroBox: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, alignItems: 'center', elevation: 2 },
  macroValue: { fontSize: 18, fontWeight: '700' },
  macroLabel: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  section: { fontSize: 16, fontWeight: '700', color: '#111827', marginTop: 20, marginBottom: 8 },
  empty: { alignItems: 'center', marginTop: 40 },
  emptyText: { textAlign: 'center', color: '#9CA3AF', marginTop: 8, lineHeight: 20 },
  meal: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, marginBottom: 8, elevation: 1 },
  mealInfo: { flex: 1, marginRight: 8 },
  mealName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  mealMeta: { fontSize: 12, color: '#6B7280', marginTop: 3 },
  mealKcal: { fontSize: 14, fontWeight: '700', color: '#16A34A', textAlign: 'right', marginRight: 12 },
});
