import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const GOALS = [
  { key: 'lose', label: 'Lose weight', desc: 'Calorie deficit', icon: 'trending-down-outline' },
  { key: 'maintain', label: 'Maintain weight', desc: 'Stay on track', icon: 'body-outline' },
  { key: 'gain', label: 'Build muscle', desc: 'Calorie surplus', icon: 'barbell-outline' },
];
const ACTIVITIES = [
  { key: 'low', label: 'Sedentary', icon: 'chair-outline' },
  { key: 'mid', label: 'Moderate', icon: 'walk-outline' },
  { key: 'high', label: 'Active', icon: 'fitness-outline' },
];
const STEP_HINTS = ['Welcome', 'Goal', 'About you', 'Your target'];

export default function OnboardingScreen({ onComplete }) {
  const [step, setStep] = useState(0);
  const [objective, setObjective] = useState('maintain');
  const [sex, setSex] = useState('male');
  const [ageText, setAgeText] = useState('');
  const [heightText, setHeightText] = useState('');
  const [weightText, setWeightText] = useState('');
  const [activity, setActivity] = useState('mid');
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState('');

  const detailsValid = useMemo(() => {
    const a = parseInt(ageText, 10);
    const h = parseFloat(heightText);
    const w = parseFloat(weightText);
    return Number.isFinite(a) && a >= 10 && a <= 100 &&
      Number.isFinite(h) && h >= 100 && h <= 250 &&
      Number.isFinite(w) && w >= 30 && w <= 300;
  }, [ageText, heightText, weightText]);

  const baseTarget = useMemo(() => {
    const a = parseInt(ageText, 10);
    const h = parseFloat(heightText);
    const w = parseFloat(weightText);
    if (!detailsValid) return 2000;
    const bmr = sex === 'male' ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161;
    const factor = { low: 1.2, mid: 1.375, high: 1.55 }[activity];
    let tdee = bmr * factor;
    if (objective === 'lose') tdee -= 500;
    if (objective === 'gain') tdee += 300;
    return Math.round(tdee);
  }, [detailsValid, sex, ageText, heightText, weightText, activity, objective]);

  const finalTarget = Math.max(1200, baseTarget + offset);
  const adjust = (delta) => setOffset((o) => Math.max(1200 - baseTarget, o + delta));

  const next = () => {
    setError('');
    if (step === 2 && !detailsValid) {
      setError('Enter a valid age (10-100), height (100-250 cm) and weight (30-300 kg).');
      return;
    }
    if (step < 3) setStep(step + 1);
    else {
      onComplete({
        profile: {
          sex,
          age: parseInt(ageText, 10),
          heightCm: parseFloat(heightText),
          weightKg: parseFloat(weightText),
          activity,
          objective,
        },
        calorieGoal: finalTarget,
      });
    }
  };

  const buttonLabel = step === 2 ? 'Calculate my target' : step === 3 ? 'Start using Meal Scanner' : 'Continue';

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {step > 0 ? (
          <TouchableOpacity onPress={() => setStep(step - 1)} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color="#374151" />
          </TouchableOpacity>
        ) : (
          <View style={styles.backPlaceholder} />
        )}
        <Text style={styles.stepLabel}>{STEP_HINTS[step]}</Text>
        <View style={styles.dots}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={[styles.dot, { opacity: i === step ? 1 : 0.3 }]} />
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {step === 0 && (
          <View>
            <View style={styles.heroIcon}>
              <Ionicons name="restaurant-outline" size={48} color="#16A34A" />
            </View>
            <Text style={styles.heroTitle}>Track your meals in seconds</Text>
            <Text style={styles.heroSub}>Photo-based calorie and macro tracking, powered by AI.</Text>
            <View style={styles.featureRow}>
              <Ionicons name="camera-outline" size={22} color="#16A34A" />
              <Text style={styles.featureText}>Snap a photo of any meal</Text>
            </View>
            <View style={styles.featureRow}>
              <Ionicons name="pulse-outline" size={22} color="#16A34A" />
              <Text style={styles.featureText}>Instant calories and macros</Text>
            </View>
            <View style={styles.featureRow}>
              <Ionicons name="stats-chart-outline" size={22} color="#16A34A" />
              <Text style={styles.featureText}>Daily progress at a glance</Text>
            </View>
          </View>
        )}

        {step === 1 && (
          <View>
            <Text style={styles.sectionTitle}>What is your goal?</Text>
            {GOALS.map((g) => {
              const selected = objective === g.key;
              return (
                <TouchableOpacity key={g.key} style={[styles.optionCard, selected && styles.optionSelected]} onPress={() => setObjective(g.key)}>
                  <Ionicons name={g.icon} size={24} color={selected ? '#16A34A' : '#6B7280'} />
                  <View style={styles.optionText}>
                    <Text style={styles.optionLabel}>{g.label}</Text>
                    <Text style={styles.optionDesc}>{g.desc}</Text>
                  </View>
                  {selected && <Ionicons name="checkmark-circle" size={22} color="#16A34A" />}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={styles.sectionTitle}>About you</Text>
            <Text style={styles.sectionHelp}>Used to calculate your daily calorie target.</Text>

            <View style={styles.chipRow}>
              <TouchableOpacity style={[styles.chip, sex === 'male' && styles.chipSelected]} onPress={() => setSex('male')}>
                <Ionicons name="man-outline" size={18} color={sex === 'male' ? '#16A34A' : '#6B7280'} />
                <Text style={[styles.chipText, sex === 'male' && styles.chipTextSelected]}>Male</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.chip, sex === 'female' && styles.chipSelected]} onPress={() => setSex('female')}>
                <Ionicons name="woman-outline" size={18} color={sex === 'female' ? '#16A34A' : '#6B7280'} />
                <Text style={[styles.chipText, sex === 'female' && styles.chipTextSelected]}>Female</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Age (years)</Text>
            <TextInput style={styles.input} placeholder="e.g. 28" value={ageText} onChangeText={setAgeText} keyboardType="number-pad" />
            <Text style={styles.inputLabel}>Height (cm)</Text>
            <TextInput style={styles.input} placeholder="e.g. 175" value={heightText} onChangeText={setHeightText} keyboardType="number-pad" />
            <Text style={styles.inputLabel}>Weight (kg)</Text>
            <TextInput style={styles.input} placeholder="e.g. 70" value={weightText} onChangeText={setWeightText} keyboardType="number-pad" />

            <Text style={styles.inputLabel}>Activity level</Text>
            <View style={styles.chipRow}>
              {ACTIVITIES.map((a) => {
                const selected = activity === a.key;
                return (
                  <TouchableOpacity key={a.key} style={[styles.activityChip, selected && styles.chipSelected]} onPress={() => setActivity(a.key)}>
                    <Ionicons name={a.icon} size={16} color={selected ? '#16A34A' : '#6B7280'} />
                    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{a.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={{ alignItems: 'center' }}>
            <Ionicons name="speedometer-outline" size={40} color="#16A34A" />
            <Text style={styles.sectionTitle}>Your daily target</Text>
            <View style={styles.targetRow}>
              <TouchableOpacity style={styles.stepper} onPress={() => adjust(-50)}>
                <Ionicons name="remove" size={22} color="#374151" />
              </TouchableOpacity>
              <Text style={styles.targetNumber}>{finalTarget}</Text>
              <TouchableOpacity style={styles.stepper} onPress={() => adjust(50)}>
                <Ionicons name="add" size={22} color="#374151" />
              </TouchableOpacity>
            </View>
            <Text style={styles.targetUnit}>kcal per day</Text>
            <Text style={styles.targetNote}>
              Estimated with the Mifflin-St Jeor formula for a{' '}
              {objective === 'lose' ? 'weight loss' : objective === 'gain' ? 'muscle gain' : 'maintenance'} goal.
              You can change this anytime in Profile.
            </Text>
          </View>
        )}

        {!!error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={16} color="#991B1B" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.primaryButton} onPress={next}>
        <Text style={styles.primaryButtonText}>{buttonLabel}</Text>
        <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backButton: { padding: 6 },
  backPlaceholder: { width: 34 },
  stepLabel: { fontSize: 15, fontWeight: '700', color: '#111827' },
  dots: { flexDirection: 'row', marginLeft: 'auto', gap: 5 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#16A34A' },
  body: { paddingBottom: 16 },
  heroIcon: { alignSelf: 'center', width: 96, height: 96, borderRadius: 28, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center', marginTop: 24, marginBottom: 20 },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center' },
  heroSub: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 8, marginBottom: 28, lineHeight: 20 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, marginBottom: 10 },
  featureText: { fontSize: 14, color: '#374151', fontWeight: '600' },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#111827', marginTop: 12 },
  sectionHelp: { fontSize: 13, color: '#6B7280', marginTop: 4, marginBottom: 12 },
  optionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginTop: 10, borderWidth: 2, borderColor: 'transparent' },
  optionSelected: { borderColor: '#16A34A', backgroundColor: '#F0FDF4' },
  optionText: { flex: 1, marginLeft: 12 },
  optionLabel: { fontSize: 15, fontWeight: '700', color: '#111827' },
  optionDesc: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  chipRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFFFFF', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14, borderWidth: 2, borderColor: 'transparent' },
  activityChip: { flex: 1, justifyContent: 'center', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFFFFF', borderRadius: 12, paddingVertical: 10, borderWidth: 2, borderColor: 'transparent' },
  chipSelected: { borderColor: '#16A34A', backgroundColor: '#F0FDF4' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  chipTextSelected: { color: '#16A34A' },
  inputLabel: { fontSize: 13, fontWeight: '700', color: '#374151', marginTop: 14, marginBottom: 6 },
  input: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', padding: 14, fontSize: 15, color: '#111827' },
  targetRow: { flexDirection: 'row', alignItems: 'center', gap: 20, marginTop: 20 },
  targetNumber: { fontSize: 56, fontWeight: '800', color: '#111827' },
  stepper: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', elevation: 2 },
  targetUnit: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  targetNote: { fontSize: 12, color: '#9CA3AF', textAlign: 'center', lineHeight: 18, marginTop: 16, paddingHorizontal: 8 },
  errorBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, backgroundColor: '#FEE2E2', borderRadius: 12, padding: 12, marginTop: 16 },
  errorText: { color: '#991B1B', flex: 1, fontSize: 13 },
  primaryButton: { backgroundColor: '#16A34A', borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
});
