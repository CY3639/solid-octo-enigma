import { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, HelperText, Switch } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isPharmacist, setIsPharmacist] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username.trim() || !password.trim()) {
      setError('All fields are required.');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await register(username.trim(), password, isPharmacist);
      setSuccess('Account created. An admin will approve your access.');
      // Don't auto-login — your API requires admin approval first
    } catch (e) {
      if (e.isNetworkError) {
        setError('Cannot reach the server. Check your connection.');
      } else {
        setError(e.data?.message || e.message || 'Registration failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <Text variant="headlineLarge" style={styles.title}>Create Account</Text>

        <TextInput
          label="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          style={styles.input}
          mode="outlined"
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          mode="outlined"
        />

        <View style={styles.switchRow}>
          <Text variant="bodyLarge">Register as Pharmacist</Text>
          <Switch value={isPharmacist} onValueChange={setIsPharmacist} />
        </View>

        {error ? <HelperText type="error" visible>{error}</HelperText> : null}
        {success ? <HelperText type="info" visible style={{ color: 'green' }}>{success}</HelperText> : null}

        <Button mode="contained" onPress={handleRegister} loading={loading} disabled={loading} style={styles.button}>
          Register
        </Button>

        <Button mode="text" onPress={() => navigation.goBack()} style={styles.link}>
          Already have an account? Sign in
        </Button>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  title: { textAlign: 'center', marginBottom: 32 },
  input: { marginBottom: 12 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 4 },
  button: { marginTop: 8, paddingVertical: 4 },
  link: { marginTop: 12 },
});