import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, Linking, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen({ user, profile, apiKey, goal, onSaveKey, onSaveGoal, onSignOut }) {
  const [key, setKey] = useState(apiKey);
  const [goalText, setGoalText] = useState(String(goal));

  const initials = (user?.name || 'U')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const saveKey = () => {
    if (!key.trim()) {
      Alert.alert('Missing key', 'Paste your Gemini API key first.');
      return;
    }
    onSaveKey(key);
    Alert.alert('Saved', 'Your API key is stored only on this device.');
  };

  const saveGoal = () => {
    const n = parseInt(goalText, 10);
    if (!Number.isFinite(n) || n < 500 || n > 10000) {
      Alert.alert('Invalid goal', 'Enter a daily calorie goal between 500 and 10000.');
      return;
    }
    onSaveGoal(n);
    Alert.alert('Saved', 'Daily calorie goal updated.');
  };

  const confirmSignOut = () => {
    Alert.alert('Sign out', 'Your meal history stays on this device.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: onSignOut },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <Text style={styles.header}>Profile</Text>

      <View style={styles.accountCard}>
        {user?.photo ? (
          <Image source={{ uri: user.photo }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </View>
        )}
        <View style={styles.accountInfo}>
          <Text style={styles.accountName}>{user?.name || 'User'}</Text>
          <Text style={styles.accountEmail} numberOfLines={1}>
            {user?.email || (user?.provider === 'guest' ? 'Guest mode' : '')}
          </Text>
        </View>
        <TouchableOpacity onPress={confirmSignOut} style={styles.signOutIcon}>
          <Ionicons name="log-out-outline" size={22} color="#DC2626" />
        </TouchableOpacity>
      </View>

      {profile && (
        <View style={styles.metricsRow}>
          <View style={styles.metric}>
            <Ionicons name="calendar-outline" size={16} color="#16A34A" />
            <Text style={styles.metricText}>{profile.age} yrs</Text>
          </View>
          <View style={styles.metric}>
            <Ionicons name="resize-outline" size={16} color="#16A34A" />
            <Text style={styles.metricText}>{profile.heightCm} cm</Text>
          </View>
          <View style={styles.metric}>
            <Ionicons name="speedometer-outline" size={16} color="#16A34A" />
            <Text style={styles.metricText}>{profile.weightKg} kg</Text>
          </View>
        </View>
      )}

      <Text style={styles.section}>1. Gemini API Key</Text>
      <Text style={styles.help}>
        The app uses Google Gemini (free tier) to analyze food photos. Get your free key at{' '}
        <Text style={styles.link} onPress={() => Linking.openURL('https://aistudio.google.com/apikey')}>
          aistudio.google.com/apikey
        </Text>
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Paste your API key here"
        value={key}
        onChangeText={setKey}
        autoCapitalize="none"
        autoCorrect={false}
        multiline
      />
      <TouchableOpacity style={styles.button} onPress={saveKey}>
        <Text style={styles.buttonText}>Save API Key</Text>
      </TouchableOpacity>

      <Text style={styles.section}>2. Daily Calorie Goal</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 2000"
        value={goalText}
        onChangeText={setGoalText}
        keyboardType="number-pad"
      />
      <TouchableOpacity style={styles.button} onPress={saveGoal}>
        <Text style={styles.buttonText}>Save Goal</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.signOutButton} onPress={confirmSignOut}>
        <Ionicons name="log-out-outline" size={18} color="#DC2626" />
        <Text style={styles.signOutText}>Sign out</Text>
      </TouchableOpacity>

      <View style={styles.about}>
        <Ionicons name="lock-closed-outline" size={18} color="#6B7280" />
        <Text style={styles.aboutText}>
          Privacy: Photos are sent directly to Google's Gemini API for analysis. All meal data is
          stored only on your device.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 16 },
  accountCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, elevation: 2 },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  avatarPlaceholder: { backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { fontSize: 18, fontWeight: '800', color: '#16A34A' },
  accountInfo: { flex: 1, marginHorizontal: 12 },
  accountName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  accountEmail: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  signOutIcon: { padding: 8 },
  metricsRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  metric: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#FFFFFF', borderRadius: 12, paddingVertical: 10 },
  metricText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  section: { fontSize: 17, fontWeight: '700', color: '#111827', marginTop: 24 },
  help: { fontSize: 13, color: '#6B7280', marginTop: 6, lineHeight: 19 },
  link: { color: '#16A34A', fontWeight: '700' },
  input: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginTop: 12, fontSize: 14, color: '#111827', borderWidth: 1, borderColor: '#E5E7EB' },
  button: { backgroundColor: '#16A34A', borderRadius: 12, padding: 14, marginTop: 12, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  signOutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12, padding: 14, marginTop: 24, backgroundColor: '#FEE2E2' },
  signOutText: { color: '#DC2626', fontWeight: '700', fontSize: 15 },
  about: { flexDirection: 'row', marginTop: 28, alignItems: 'flex-start' },
  aboutText: { flex: 1, marginLeft: 8, fontSize: 12, color: '#6B7280', lineHeight: 18 },
});
