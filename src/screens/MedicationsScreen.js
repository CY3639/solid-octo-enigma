import { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, Alert, RefreshControl } from 'react-native';
import {
  Searchbar,
  FAB,
  Card,
  Text,
  ActivityIndicator,
  Button,
  Chip,
  Portal,
  Modal,
  TextInput,
  HelperText,
} from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { medicationService } from '../services/medicationService';
import { useAuth } from '../context/AuthContext';

// Add/Edit Modal
// prefills fields when editing; starts blank when adding.

function MedicationModal({ visible, onDismiss, onSave, initial }) {
  const [brandName, setBrandName] = useState(initial?.brandName || '');
  const [activeIngredient, setActiveIngredient] = useState(initial?.activeIngredient || '');
  const [strength, setStrength] = useState(initial?.strength?.toString() || '');
  const [form, setForm] = useState(initial?.form || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Reset fields whenever the modal opens (handles both add and edit)
  const handleVisible = () => {
    setBrandName(initial?.brandName || '');
    setActiveIngredient(initial?.activeIngredient || '');
    setStrength(initial?.strength?.toString() || '');
    setForm(initial?.form || '');
    setError('');
  };

  const handleSave = async () => {
    if (!brandName.trim() || !activeIngredient.trim() || !strength.trim() || !form.trim()) {
      setError('All fields are required.');
      return;
    }
    setSaving(true);
    try {
      await onSave({ brandName, activeIngredient, strength: Number(strength), form });
      onDismiss();
    } catch (e) {
      setError(e.message || 'Failed to save medication.');
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
        onShow={handleVisible}
      >
        <Text variant="titleMedium" style={styles.modalTitle}>
          {initial ? 'Edit Medication' : 'Add Medication'}
        </Text>

        <TextInput
          label="Brand Name"
          value={brandName}
          onChangeText={setBrandName}
          style={styles.input}
          mode="outlined"
        />
        <TextInput
          label="Active Ingredient"
          value={activeIngredient}
          onChangeText={setActiveIngredient}
          style={styles.input}
          mode="outlined"
        />
        <TextInput
          label="Strength (mg)"
          value={strength}
          onChangeText={setStrength}
          keyboardType="numeric"
          style={styles.input}
          mode="outlined"
        />
        <TextInput
          label="Form (tablet / capsule / liquid / other)"
          value={form}
          onChangeText={setForm}
          style={styles.input}
          mode="outlined"
        />

        {error ? <HelperText type="error" visible>{error}</HelperText> : null}

        <View style={styles.modalActions}>
          <Button onPress={onDismiss} disabled={saving}>Cancel</Button>
          <Button mode="contained" onPress={handleSave} loading={saving} disabled={saving}>
            {initial ? 'Update' : 'Add'}
          </Button>
        </View>
      </Modal>
    </Portal>
  );
}

// Main Screen

export default function MedicationsScreen() {
  const { isPharmacist } = useAuth();

  const [medications, setMedications] = useState([]);
  const [search, setSearch]           = useState('');
  const [page, setPage]               = useState(1);
  const [links, setLinks]             = useState({});
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [error, setError]             = useState('');

  // modal state - null means "closed / adding new", object means "editing existing"
  const [modalVisible, setModalVisible]   = useState(false);
  const [editingMed, setEditingMed]       = useState(null);

  // data fetching 

  const fetchMedications = useCallback(async (pageNum = 1, searchQuery = search) => {
    try {
      const result = await medicationService.getAll(pageNum, searchQuery);
      setMedications(result.medications);
      setLinks(result.links);
      setError('');
    } catch (e) {
      setError(e.isNetworkError ? 'Server unavailable. Pull down to retry.' : 'Failed to load medications.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search]);

  // refresh every time the screen comes back into focus
  // e.g. after the OS background/foreground cycle
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchMedications(page, search);
    }, [page, search])
  );

  const handleSearch = (text) => {
    setSearch(text);
    setPage(1); // reset to page 1 on new search
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchMedications(1, search);
  };

  // CRUD handlers

  const handleAdd = async (formData) => {
    await medicationService.create(formData);
    fetchMedications(page, search); // Refresh list after add
  };

  const handleEdit = async (formData) => {
    await medicationService.update(editingMed._id, formData);
    fetchMedications(page, search);
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Medication',
      'Remove this medication from the catalogue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await medicationService.delete(id);
              fetchMedications(page, search);
            } catch {
              Alert.alert('Error', 'Could not delete medication.');
            }
          },
        },
      ]
    );
  };

  // render helpers

  const renderMedication = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleSmall">{item.brandName}</Text>
        <Text style={styles.subtitle}>{item.activeIngredient}</Text>
        <View style={styles.chipRow}>
          <Chip compact style={styles.chip}>{item.strength}mg</Chip>
          <Chip compact style={styles.chip}>{item.form}</Chip>
        </View>
      </Card.Content>

      {isPharmacist && (
        <Card.Actions>
          <Button
            onPress={() => {
              setEditingMed(item);
              setModalVisible(true);
            }}
          >
            Edit
          </Button>
          <Button textColor="red" onPress={() => handleDelete(item._id)}>
            Delete
          </Button>
        </Card.Actions>
      )}
    </Card>
  );

  // loading state

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // render

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search by brand or ingredient…"
        value={search}
        onChangeText={handleSearch}
        style={styles.searchbar}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={medications}
        renderItem={renderMedication}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        contentContainerStyle={medications.length === 0 ? styles.centered : styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No medications found.</Text>}
      />

      {/* Pagination controls — mirrors PatientsScreen pattern */}
      <View style={styles.pagination}>
        {links.prev && (
          <Text style={styles.pageLink} onPress={() => setPage(p => p - 1)}>← Previous</Text>
        )}
        {links.next && (
          <Text style={styles.pageLink} onPress={() => setPage(p => p + 1)}>Next →</Text>
        )}
      </View>

      {/* FAB — only visible to pharmacists */}
      {isPharmacist && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => {
            setEditingMed(null); // null = "add new" mode
            setModalVisible(true);
          }}
        />
      )}

      {/* Shared Add/Edit modal — mode determined by editingMed */}
      <MedicationModal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        onSave={editingMed ? handleEdit : handleAdd}
        initial={editingMed}
      />
    </View>
  );
}

// Styles

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#f5f5f5' },
  centered:    { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchbar:   { margin: 12 },
  list:        { padding: 12 },
  card:        { marginBottom: 8 },
  subtitle:    { color: '#555', marginTop: 2, marginBottom: 6 },
  chipRow:     { flexDirection: 'row', gap: 6, marginTop: 4 },
  chip:        { alignSelf: 'flex-start' },
  empty:       { textAlign: 'center', color: '#888', marginTop: 24 },
  error:       { textAlign: 'center', color: 'red', margin: 12 },
  pagination:  { flexDirection: 'row', justifyContent: 'space-between', padding: 12 },
  pageLink:    { color: '#2196F3', fontSize: 16, fontWeight: '600' },
  fab:         { position: 'absolute', right: 16, bottom: 16 },
  modal:       { backgroundColor: 'white', margin: 24, borderRadius: 8, padding: 20 },
  modalTitle:  { marginBottom: 16, fontWeight: '700' },
  input:       { marginBottom: 10 },
  modalActions:{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8 },
});