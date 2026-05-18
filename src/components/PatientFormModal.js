import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Modal, Portal, Text, TextInput, Button, HelperText } from 'react-native-paper';

export default function PatientFormModal({ visible, onDismiss, onSave, initial }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [dob, setDob]             = useState('');
  const [gender, setGender]       = useState('');
  const [address, setAddress]     = useState('');
  const [error, setError]         = useState('');
  const [saving, setSaving]       = useState(false);

  // Reset fields when modal opens
  useEffect(() => {
    if (visible) {
      setFirstName(initial?.firstName || '');
      setLastName(initial?.lastName || '');
      setDob(initial?.dateOfBirth?.split('T')[0] || '');
      setGender(initial?.gender || '');
      setAddress(initial?.address || '');
      setError('');
    }
  }, [visible, initial]);

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim() || !dob.trim() || !gender.trim()) {
      setError('First name, last name, date of birth, and gender are required.');
      return;
    }
    setSaving(true);
    try {
      await onSave({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth: dob.trim(),
        gender: gender.trim(),
        address: address.trim(),
      });
      onDismiss();
    } catch (e) {
      setError(e.message || 'Failed to save patient.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}
      >
        <ScrollView>
          <Text variant="titleMedium" style={styles.title}>
            {initial ? 'Edit Patient' : 'Add Patient'}
          </Text>

          <TextInput label="First Name" value={firstName}
            onChangeText={setFirstName} mode="outlined" style={styles.input} />
          <TextInput label="Last Name" value={lastName}
            onChangeText={setLastName} mode="outlined" style={styles.input} />
          <TextInput label="Date of Birth (YYYY-MM-DD)" value={dob}
            onChangeText={setDob} mode="outlined" style={styles.input}
            placeholder="2000-01-15" />
          <TextInput label="Gender" value={gender}
            onChangeText={setGender} mode="outlined" style={styles.input} />
          <TextInput label="Address" value={address}
            onChangeText={setAddress} mode="outlined" style={styles.input} />

          {error ? <HelperText type="error" visible>{error}</HelperText> : null}

          <View style={styles.actions}>
            <Button onPress={onDismiss} disabled={saving}>Cancel</Button>
            <Button mode="contained" onPress={handleSave} loading={saving} disabled={saving}>
              {initial ? 'Update' : 'Add'}
            </Button>
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    maxHeight: '80%',
  },
  title: { marginBottom: 16, fontWeight: 'bold' },
  input: { marginBottom: 12 },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
});