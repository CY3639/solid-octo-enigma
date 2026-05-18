import { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, Alert, ScrollView } from 'react-native';
import { Text, Card, Button, FAB, Divider, ActivityIndicator, Chip, Portal, Modal } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { patientService } from '../services/patientService';
import { medicationProfileService } from '../services/medicationProfileService';
import { useAuth } from '../context/AuthContext';
import PatientFormModal from '../components/PatientFormModal';

export default function PatientDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { isPharmacist } = useAuth();

  const [patient, setPatient] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [patientData, profileData] = await Promise.all([
        patientService.getById(id),
        medicationProfileService.getByPatient(id),
      ]);
      setPatient(patientData);
      setProfiles(profileData);
      setError('');
    } catch (e) {
      setError(e.isNetworkError ? 'Server unavailable.' : e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const handleUpdatePatient = async (formData) => {
    await patientService.update(id. formData);
    fetchData();
  };

  const handleDeletePatient = () => {
    Alert.alert(
      'Delete Patient',
      'This will also delete all medication profiles. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await patientService.delete(id);
              navigation.goBack();
            } catch (e) {
              Alert.alert('Error', e.message);
            }
          },
        },
      ]
    );
  };

  const handleCeaseProfile = async (profileId) => {
    try {
      await medicationProfileService.cease(id, profileId);
      fetchData(); // Refresh to show updated status
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handleDeleteProfile = (profileId) => {
    Alert.alert('Delete Profile', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await medicationProfileService.delete(id, profileId);
            fetchData();
          } catch (e) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
  }

  if (error) {
    return <View style={styles.centered}><Text style={styles.error}>{error}</Text></View>;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Patient Info Card */}
      <Card style={styles.card}>
        <Card.Title title={`${patient.firstName} ${patient.lastName}`} />
        <Card.Content>
          {patient.address && <Text>Address: {patient.address}</Text>}
        </Card.Content>
        {isPharmacist && (
          <Card.Actions>
            <Button onPress={() => setEditModalVisible(true)}>Edit</Button>
            <Button textColor="red" onPress={handleDeletePatient}>Delete</Button>
          </Card.Actions>
        )}
      </Card>

      <PatientFormModal
        visible={editModalVisible}
        onDismiss={() => setEditModalVisible(false)}
        onSave={handleUpdatePatient}
        initial={patient}
      />

      {/* Medication Profiles */}
      <Text variant="titleMedium" style={styles.sectionTitle}>Medication Profiles</Text>

      {isPharmacist && (
        <Button mode="contained" style={styles.addButton} onPress={() => {/* Open add profile modal */}}>
          Add Medication Profile
        </Button>
      )}

      {profiles.length === 0 ? (
        <Text style={styles.empty}>No medication profiles.</Text>
      ) : (
        profiles.map((profile) => (
          <Card key={profile._id} style={styles.profileCard}>
            <Card.Content>
              <Text variant="titleSmall">
                {profile.medication?.brandName || 'Unknown'} ({profile.medication?.activeIngredient})
              </Text>
              <Text>Strength: {profile.medication?.strength}mg</Text>
              <Text>Dosage: {profile.dosage}</Text>
              <Text>Frequency: {profile.frequency}</Text>
              {profile.ceased && <Chip icon="close-circle" style={styles.ceased}>Ceased</Chip>}
            </Card.Content>
            {isPharmacist && (
              <Card.Actions>
                {!profile.ceased && (
                  <Button onPress={() => handleCeaseProfile(profile._id)}>Cease</Button>
                )}
                <Button textColor="red" onPress={() => handleDeleteProfile(profile._id)}>Delete</Button>
              </Card.Actions>
            )}
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { marginBottom: 16 },
  sectionTitle: { marginTop: 8, marginBottom: 8, fontWeight: '700' },
  addButton: { marginBottom: 12 },
  profileCard: { marginBottom: 8 },
  empty: { color: '#888', textAlign: 'center', marginTop: 16 },
  error: { color: 'red', textAlign: 'center' },
  ceased: { marginTop: 8, alignSelf: 'flex-start', backgroundColor: '#ffebee' },
});