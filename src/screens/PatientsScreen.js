import { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, Alert, RefreshControl } from 'react-native';
import { Searchbar, FAB, Card, Text, ActivityIndicator, Snackbar } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { patientService } from '../services/patientService';
import { useAuth } from '../context/AuthContext';
import PatientFormModal from '../components/PatientFormModal';

export default function PatientsScreen({ navigation }) {
  const { isPharmacist } = useAuth();
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [links, setLinks] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [addModalVisible, setAddModalVisible] = useState(false);

  const fetchPatients = useCallback(async (pageNum = 1, searchQuery = search) => {
    try {
      const result = await patientService.getAll(pageNum, searchQuery);
      setPatients(result.patients);
      setLinks(result.links);
      setError('');
    } catch (e) {
      if (e.isNetworkError) {
        setError('Server unavailable. Pull down to retry.');
      } else {
        setError(e.message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search]);

  // Refresh data when screen comes into focus (e.g. after editing a patient)
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchPatients(page);
    }, [page])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPatients(1);
    setPage(1);
  };

  const handleSearch = (query) => {
    setSearch(query);
    setPage(1);
    fetchPatients(1, query);
  };

  const renderPatient = ({ item }) => (
    <Card
      style={styles.card}
      onPress={() => navigation.navigate('PatientDetail', { id: item._id, name: `${item.firstName} ${item.lastName}` })}
    >
      <Card.Title
        title={`${item.firstName} ${item.lastName}`}
        subtitle={`Address: ${item.address}`}
      />
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const handleCreatePatient = async (formData) => {
    await patientService.create(formData);
    fetchPatients(1, search);
    setPage(1);
  };

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search patients..."
        onChangeText={handleSearch}
        value={search}
        style={styles.searchbar}
      />

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : null}

      <FlatList
        data={patients}
        renderItem={renderPatient}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        contentContainerStyle={patients.length === 0 ? styles.centered : styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No patients found.</Text>}
      />

      {/* Pagination controls */}
      <View style={styles.pagination}>
        {links.prev && (
          <Text style={styles.pageLink} onPress={() => setPage(p => p - 1)}>← Previous</Text>
        )}
        {links.next && (
          <Text style={styles.pageLink} onPress={() => setPage(p => p + 1)}>Next →</Text>
        )}
      </View>

      <PatientFormModal
        visible={addModalVisible}
        onDismiss={() => setAddModalVisible(false)}
        onSave={handleCreatePatient}
      />

      {isPharmacist && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => {
            // Open a modal or navigate to a create patient screen
            console.log('Navigating with id:', item._id);
            navigation.navigate('PatientDetail', { id: item._id, name: `${item.firstName} ${item.lastName}` });
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchbar: { margin: 12 },
  list: { padding: 12 },
  card: { marginBottom: 8 },
  empty: { textAlign: 'center', color: '#888', marginTop: 24 },
  error: { textAlign: 'center', color: 'red', margin: 12 },
  pagination: { flexDirection: 'row', justifyContent: 'space-between', padding: 12 },
  pageLink: { color: '#2196F3', fontSize: 16, fontWeight: '600' },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 },
});