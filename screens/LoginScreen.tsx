import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LoginScreen = () => {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<void>) => {
    setError('');
    setBusy(true);
    try {
      await fn();
    } catch (e: any) {
      if (e?.code !== 'SIGN_IN_CANCELLED' && e?.code !== '-5') {
        setError(e?.message ?? 'Something went wrong');
      }
    } finally {
      setBusy(false);
    }
  };

  const submit = () => {
    if (!EMAIL_RE.test(email.trim())) {
      setError('Enter a valid email address');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (mode === 'signup' && password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    run(() =>
      mode === 'login'
        ? signInWithEmail(email.trim(), password)
        : signUpWithEmail(email.trim(), password),
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>SignMeUp</Text>
      <View style={styles.tabs}>
        {(['login', 'signup'] as const).map(m => (
          <TouchableOpacity
            key={m}
            style={[styles.tab, mode === m && styles.tabActive]}
            onPress={() => {
              setMode(m);
              setError('');
            }}
          >
            <Text style={[styles.tabText, mode === m && styles.tabTextActive]}>
              {m === 'login' ? 'Log In' : 'Sign Up'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {mode === 'signup' && (
        <TextInput
          style={styles.input}
          placeholder="Confirm password"
          secureTextEntry
          value={confirm}
          onChangeText={setConfirm}
        />
      )}

      {!!error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity style={styles.primary} onPress={submit} disabled={busy}>
        {busy ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryText}>{mode === 'login' ? 'Log In' : 'Create Account'}</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.or}>or</Text>

      <TouchableOpacity
        style={styles.google}
        onPress={() => run(signInWithGoogle)}
        disabled={busy}
      >
        <Text style={styles.googleText}>Continue with Google</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 32, fontWeight: '700', textAlign: 'center', marginBottom: 24, color: '#4f46e5' },
  tabs: { flexDirection: 'row', marginBottom: 16, backgroundColor: '#f3f4f6', borderRadius: 10 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: '#fff' },
  tabText: { color: '#6b7280', fontWeight: '600' },
  tabTextActive: { color: '#4f46e5' },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  error: { color: '#ef4444', marginBottom: 12 },
  primary: { backgroundColor: '#4f46e5', borderRadius: 10, padding: 14, alignItems: 'center' },
  primaryText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  or: { textAlign: 'center', color: '#6b7280', marginVertical: 14 },
  google: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 14, alignItems: 'center' },
  googleText: { color: '#1f2937', fontWeight: '600', fontSize: 16 },
});

export default LoginScreen;
