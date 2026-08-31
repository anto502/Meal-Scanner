import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GOOGLE_WEB_CLIENT_ID } from '../authConfig';

// --- Google: guarded import (never crashes if native module missing) ---
let GoogleSignin = null;
let statusCodes = {};
try {
  const gs = require('@react-native-google-signin/google-signin');
  GoogleSignin = gs.GoogleSignin;
  statusCodes = gs.statusCodes || {};
} catch (e) {
  GoogleSignin = null;
}

// --- Apple: iOS-only native module. Must NOT load on Android. ---
let AppleAuthentication = null;
if (Platform.OS === 'ios') {
  try {
    AppleAuthentication = require('expo-apple-authentication');
  } catch (e) {
    AppleAuthentication = null;
  }
}

export default function AuthScreen({ onSignedIn }) {
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (Platform.OS === 'ios' && AppleAuthentication) {
      AppleAuthentication.isAvailableAsync()
        .then(setAppleAvailable)
        .catch(() => setAppleAvailable(false));
    }
  }, []);

  const handleGoogle = async () => {
    setError('');
    if (!GoogleSignin) {
      setError('Google sign-in is not available in this build. Use guest mode.');
      return;
    }
    if (GOOGLE_WEB_CLIENT_ID.startsWith('PASTE_')) {
      Alert.alert(
        'Google sign-in not configured',
        'Add your Google Web Client ID in src/authConfig.js. You can continue as guest for now.'
      );
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
      if (e.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setError('Google Play Services is not available on this device.');
      } else {
        setError('Google sign-in failed. Check SHA-1 and client ID setup, or continue as guest.');
      }
    } finally {
      setBusy(false);
    }
  };

  const handleApple = async () => {
    if (!AppleAuthentication) return;
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
