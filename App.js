import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  getApiKey, saveApiKey, getGoal, saveGoal, getMeals, addMeal, deleteMeal,
  getUser, saveUser, clearUser, getOnboarded, setOnboarded as persistOnboarded,
  getProfile, saveProfile,
} from './src/storage';
import { GOOGLE_WEB_CLIENT_ID } from './src/authConfig';
import AuthScreen from './src/screens/AuthScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import TodayScreen from './src/screens/TodayScreen';
import ScanScreen from './src/screens/ScanScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// --- Google: guarded import (never crashes if native module missing) ---
let GoogleSignin = null;
try {
  GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
} catch (e) {
  GoogleSignin = null;
}

const TABS = [
  { key: 'today', label: 'Today', icon: 'today-outline' },
  { key: 'scan', label: 'Scan', icon: 'camera-outline' },
  { key: 'profile', label: 'Profile', icon: 'person-outline' },
];

export default function App() {
  const [tab, setTab] = useState('today');
  const [ready, setReady] = useState(false);
  const [initError, setInitError] = useState('');
  const [user, setUser] = useState(null);
  const [onboarded, setOnboarded] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [goal, setGoal] = useState(2000);
  const [meals, setMeals] = useState([]);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        if (GoogleSignin) {
          GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID });
        }
        setApiKey(await getApiKey());
        setGoal(await getGoal());
        setMeals(await getMeals());
        setUser(await getUser());
        setOnboarded(await getOnboarded());
        setProfile(await getProfile());
      } catch (e) {
        setInitError(e && e.message ? String(e.message) : String(e));
      } finally {
        setReady(true);
      }
    })();
  }, []);

  if (!ready) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#16A34A" />
        <Text style={styles.loaderText}>Loading...</Text>
      </View>
    );
  }

  if (initError) {
    return (
      <View style={styles.loader}>
        <Ionicons name="alert-circle-outline" size={44} color="#DC2626" />
        <Text style={styles.errorTitle}>Startup error</Text>
        <Text style={styles.errorMessage}>{initError}</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.root}>
        <AuthScreen
          onSignedIn={async (u) => { await saveUser(u); setUser(u); }}
        />
      </View>
    );
  }

  if (!onboarded) {
    return (
      <View style={styles.root}>
        <OnboardingScreen
          onComplete={async ({ profile: p, calorieGoal }) => {
            await saveProfile(p);
            setProfile(p);
            await saveGoal(calorieGoal);
            setGoal(calorieGoal);
            await persistOnboarded(true);
            setOnboarded(true);
          }}
        />
      </View>
    );
  }

  const handleSaveMeal = async (meal) => {
    setMeals(await addMeal(meal));
    setTab('today');
  };
  const handleDeleteMeal = async (id) => setMeals(await deleteMeal(id));
  const handleSaveKey = async (key) => { await saveApiKey(key); setApiKey(key.trim()); };
  const handleSaveGoal = async (calories) => { await saveGoal(calories); setGoal(calories); };
  const handleSignOut = async () => {
    if (user.provider === 'google' && GoogleSignin) {
      try { await GoogleSignin.signOut(); } catch (e) {}
    }
    await clearUser();
    setUser(null);
  };

  return (
    <View style={styles.root}>
      <View style={styles.content}>
        {tab === 'today' && <TodayScreen meals={meals} goal={goal} onDelete={handleDeleteMeal} />}
        {tab === 'scan' && <ScanScreen apiKey={apiKey} onSave={handleSaveMeal} />}
        {tab === 'profile' && (
          <SettingsScreen
            user={user} profile={profile} apiKey={apiKey} goal={goal}
            onSaveKey={handleSaveKey} onSaveGoal={handleSaveGoal} onSignOut={handleSignOut}
          />
        )}
      </View>

      <View style={styles.tabBar}>
        {TABS.map((t) => {
          const active = tab === t.key;
          const isScan = t.key === 'scan';
          return (
            <TouchableOpacity key={t.key} style={styles.tabItem} onPress={() => setTab(t.key)}>
              <View style={isScan ? styles.scanButton : null}>
                <Ionicons name={t.icon} size={isScan ? 26 : 24} color={active ? '#16A34A' : '#9CA3AF'} />
              </View>
              <Text style={[styles.tabLabel, { color: active ? '#16A34A' : '#9CA3AF' }]}>{t.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F9FAFB', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0 },
  loader: { flex: 1, backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center', padding: 24 },
  loaderText: { marginTop: 12, color: '#6B7280', fontSize: 14 },
  errorTitle: { marginTop: 12, fontSize: 18, fontWeight: '700', color: '#111827' },
  errorMessage: { marginTop: 8, color: '#DC2626', fontSize: 13, textAlign: 'center' },
  content: { flex: 1 },
  tabBar: { flexDirection: 'row', height: 64, borderTopWidth: 1, borderTopColor: '#E5E7EB', backgroundColor: '#FFFFFF' },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scanButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center', marginTop: -18, borderWidth: 2, borderColor: '#FFFFFF' },
  tabLabel: { fontSize: 11, marginTop: 2 },
});
