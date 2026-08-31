import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { scanMeal } from '../gemini';

export default function ScanScreen({ apiKey, onSave }) {
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const pickAndScan = async (useCamera) => {
    const perm = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!perm.granted) {
      Alert.alert('Permission needed', 'Please allow access so you can scan meals.');
      return;
    }

    const res = useCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.4, base64: true })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.4, base64: true });

    if (res.canceled || !res.assets || !res.assets.length) return;

    const asset = res.assets[0];
    setPhoto(asset);
    setResult(null);
    setError('');
    await analyze(asset);
  };

  const analyze = async (asset) => {
    if (!apiKey) {
      setError('No API key found. Add your free Gemini key in Profile first.');
      return;
    }
    setLoading(true);
    try {
      const data = await scanMeal(apiKey, asset.base64);
      if (!data.items || !data.items.length) {
        setError('No food detected. Try a clearer photo of your plate.');
      } else {
        setResult(data);
      }
    } catch (e) {
      setError(e.message || 'Something went wrong. Check your internet or API key.');
    } finally {
      setLoading(false);
    }
  };

  const totals = result
    ? result.items.reduce((a, it) => ({
        calories: a.calories + (Number(it.calories) || 0),
        protein: a.protein + (Number(it.protein_g) || 0),
        carbs: a.carbs + (Number(it.carbs_g) || 0),
        fat: a.fat + (Number(it.fat_g) || 0),
      }), { calories: 0, protein: 0, carbs: 0, fat: 0 })
    : null;

  const save = () => {
    if (!result) return;
    onSave({
      items: result.items,
      calories: totals.calories,
      protein: totals.protein,
      carbs: totals.carbs,
      fat: totals.fat,
      time: new Date().toISOString(),
    });
    setPhoto(null);
    setResult(null);
    setError('');
    Alert.alert('Meal saved', 'Added to your diary.');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <Text style={styles.header}>Scan a Meal</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={() => pickAndScan(true)}>
          <Ionicons name="camera" size={22} color="#FFFFFF" />
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.buttonAlt]} onPress={() => pickAndScan(false)}>
          <Ionicons name="images" size={22} color="#16A34A" />
          <Text style={[styles.buttonText, { color: '#16A34A' }]}>Gallery</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#16A34A" />
          <Text style={styles.loadingText}>Analyzing your food...</Text>
        </View>
      )}

      {photo && !loading && <Image source={{ uri: photo.uri }} style={styles.preview} />}

      {!!error && !loading && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={18} color="#991B1B" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {result && !loading && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>AI Analysis</Text>
          <Text style={styles.confidence}>Confidence: {result.confidence || 'medium'}</Text>

          {result.items.map((it, i) => (
            <View key={i} style={styles.item}>
              <Text style={styles.itemName}>{it.name}</Text>
              <Text style={styles.itemMeta}>{it.portion_estimate}</Text>
              <Text style={styles.itemMacros}>
                {Math.round(it.calories)} kcal · P {Math.round(it.protein_g)}g · C {Math.round(it.carbs_g)}g · F {Math.round(it.fat_g)}g
              </Text>
            </View>
          ))}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {Math.round(totals.calories)} kcal · P {Math.round(totals.protein)}g · C {Math.round(totals.carbs)}g · F {Math.round(totals.fat)}g
            </Text>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={save}>
            <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Save to Today</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.tipRow}>
        <Ionicons name="bulb-outline" size={16} color="#9CA3AF" />
        <Text style={styles.tip}>
          Photograph your whole plate from above for the most accurate estimate.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 16 },
  buttonRow: { flexDirection: 'row', gap: 12 },
  button: { flex: 1, backgroundColor: '#16A34A', borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  buttonAlt: { backgroundColor: '#DCFCE7' },
  buttonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  loadingBox: { alignItems: 'center', marginTop: 40 },
  loadingText: { marginTop: 10, color: '#6B7280' },
  preview: { width: '100%', height: 200, borderRadius: 16, marginTop: 16, backgroundColor: '#E5E7EB' },
  errorBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#FEE2E2', borderRadius: 12, padding: 14, marginTop: 16 },
  errorText: { color: '#991B1B', flex: 1 },
  resultCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginTop: 16, elevation: 2 },
  resultTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  confidence: { fontSize: 12, color: '#6B7280', marginTop: 2, marginBottom: 8 },
  item: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  itemName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  itemMeta: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  itemMacros: { fontSize: 13, color: '#374151', marginTop: 4 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  totalLabel: { fontSize: 16, fontWeight: '800', color: '#111827' },
  totalValue: { fontSize: 13, fontWeight: '600', color: '#16A34A', flexShrink: 1, textAlign: 'right', marginLeft: 8 },
  saveButton: { backgroundColor: '#16A34A', borderRadius: 14, padding: 16, marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  saveButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 20, paddingHorizontal: 8 },
  tip: { color: '#9CA3AF', fontSize: 13, flex: 1, lineHeight: 19 },
});
