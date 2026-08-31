import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import { GOOGLE_WEB_CLIENT_ID } from '../authConfig';

export default function AuthScreen({ onSignedIn }) {
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    AppleAuthentication.isAvailableAsync().then(setAppleAvailable).catch(() => setAppleAvailable(false));
  }, []);

  const handleGoogle = async () => {
    setError('');
    if (GOOGLE_WEB_CLIENT_ID.startsWith('PASTE_')) {
      Alert.alert('Google sign-in not configured', 'Add your Google Web Client ID in src/authConfig.js. You can continue as guest for now.');
      return;
    }
    setBusy(true);
    try {
      await GoogleSignin.hasPlayServices();
      const res = await GoogleSignin.signIn();
      if (res && res.type === 'success') {
        const u = res.data.user;
        onSignedIn({
          provider: 'google',
          id: u.id || u.email || String(Date.now()),
          name: u.name || u.email || 'Google user',
          email: u.email || '',
          photo: u.photo || null,
        });
      }
    } catch (e) {
      if (e.code === statusCodes.SIGN_IN_CANCELLED || e.code === statusCodes.IN_PROGRESS) return;
      setError(e.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE
        ? 'Google Play Services is not available on this device.'
        : 'Google sign-in failed. Check SHA-1 and client ID setup, or continue as guest.');
    } finally {
      setBusy(false);
    }
  };

  const handleApple = async () => {
    setError('');
    setBusy(true);
    try {
      const c = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      const name = `${c.fullName?.givenName || ''} ${c.fullName?.familyName || ''}`.trim();
      onSignedIn({ provider: 'apple', id: c.user, name: name || 'Apple user', email: c.email || '', photo: null });
    } catch (e) {
      if (e.code !== 'ERR_CANCELED') setError('Apple sign-in failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleGuest = () => {
    setError('');
    onSignedIn({ provider: 'guest', id: 'guest', name: 'Guest', email: '', photo: null });
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoWrap}>
        <View style={styles.logo}>
          <Ionicons name="restaurant" size={40} color="#FFFFFF" />
        </View>
        <Text style={styles.title}>Meal Scanner</Text>
        <Text style={styles.subtitle}>Track calories with a single photo</Text>
      </View>

      <TouchableOpacity style={[styles.button, styles.googleButton]} onPress={handleGoogle} disabled={busy}>
        <Ionicons name="logo-google" size={20} color="#DB4437" />
        <Text style={[styles.buttonText, { color: '#111827' }]}>Continue with Google</Text>
      </TouchableOpacity>

      {appleAvailable && (
        <TouchableOpacity style={[styles.button, styles.appleButton]} onPress={handleApple} disabled={busy}>
          <Ionicons name="logo-apple" size={20} color="#FFFFFF" />
          <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Continue with Apple</Text>
        </TouchableOpacity>
      )}

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity style={styles.guestButton} onPress={handleGuest} disabled={busy}>
        <Ionicons name="person-circle-outline" size={20} color="#6B7280" />
        <Text style={styles.guestText}>Continue without an account</Text>
      </TouchableOpacity>

      {busy && <ActivityIndicator style={{ marginTop: 16 }} color="#16A34A" />}

      {!!error && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={16} color="#991B1B" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <Text style={styles.footer}>Your meal data is stored privately on this device.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  logoWrap: { alignItems: 'center', marginBottom: 40 },
  logo: { width: 88, height: 88, borderRadius: 24, backgroundColor: '#16A34A', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 15, color: '#6B7280', marginTop: 6 },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 14, padding: 16, gap: 10 },
  googleButton: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB' },
  appleButton: { backgroundColor: '#111827', marginTop: 12 },
  buttonText: { fontSize: 15, fontWeight: '700' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  dividerText: { marginHorizontal: 12, color: '#9CA3AF', fontSize: 12, fontWeight: '600' },
  guestButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, gap: 8 },
  guestText: { color: '#6B7280', fontSize: 14, fontWeight: '600' },
  errorBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, backgroundColor: '#FEE2E2', borderRadius: 12, padding: 12, marginTop: 8 },
  errorText: { color: '#991B1B', flex: 1, fontSize: 13 },
  footer: { textAlign: 'center', color: '#9CA3AF', fontSize: 12, marginTop: 32 },
});
