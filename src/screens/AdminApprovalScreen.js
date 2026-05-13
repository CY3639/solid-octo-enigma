import { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, Alert, RefreshControl } from 'react-native';
import {
  Card,
  Text,
  Button,
  ActivityIndicator,
  Badge,
  Snackbar,
} from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../services/api';

export default function AdminApprovalScreen() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [error, setError]               = useState('');
  const [actioningId, setActioningId]   = useState(null); // tracks which card's buttons are loading
  const [snackbar, setSnackbar]         = useState('');   // success feedback

  // data fetching

  const fetchPending = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/users/pending');
      setPendingUsers(data);
      setError('');
    } catch (e) {
      setError('Failed to load pending users.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // refresh every time the admin navigates to this tab
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchPending();
    }, [fetchPending])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPending();
  };

  // Actions

  const handleApprove = async (userId, username) => {
    setActioningId(userId);
    try {
      await api.put(`/auth/users/${userId}/approve`);
      // Optimistic local removal — no need to re-fetch
      setPendingUsers((prev) => prev.filter((u) => u._id !== userId));
      setSnackbar(`${username} approved.`);
    } catch {
      Alert.alert('Error', 'Could not approve user. Try again.');
    } finally {
      setActioningId(null);
    }
  };

  const handleDecline = (userId, username) => {
    // always confirm on mobile before a delete for decline
    Alert.alert(
      'Decline Registration',
      `This will permanently remove ${username}'s account. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            setActioningId(userId);
            try {
              await api.delete(`/auth/users/${userId}/decline`);
              setPendingUsers((prev) => prev.filter((u) => u._id !== userId));
              setSnackbar(`${username} declined and removed.`);
            } catch {
              Alert.alert('Error', 'Could not decline user. Try again.');
            } finally {
              setActioningId(null);
            }
          },
        },
      ]
    );
  };

  // render helpers

  const renderUser = ({ item }) => {
    const isActioning = actioningId === item._id;

    return (
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          {/* User info — left side */}
          <View style={styles.userInfo}>
            <Text variant="titleSmall" style={styles.username}>{item.username}</Text>
            <Badge
              style={[
                styles.badge,
                { backgroundColor: item.isPharmacist ? '#00897B' : '#1E88E5' },
              ]}
            >
              {item.userRole || (item.isPharmacist ? 'Pharmacist' : 'Assistant')}
            </Badge>
          </View>

          {/* Action buttons — right side */}
          <View style={styles.actions}>
            <Button
              mode="contained"
              compact
              loading={isActioning}
              disabled={isActioning}
              onPress={() => handleApprove(item._id, item.username)}
              style={styles.approveButton}
              labelStyle={styles.buttonLabel}
            >
              Approve
            </Button>
            <Button
              mode="outlined"
              compact
              loading={isActioning}
              disabled={isActioning}
              onPress={() => handleDecline(item._id, item.username)}
              textColor="red"
              style={styles.declineButton}
              labelStyle={styles.buttonLabel}
            >
              Decline
            </Button>
          </View>
        </Card.Content>
      </Card>
    );
  };

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
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={pendingUsers}
        renderItem={renderUser}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        contentContainerStyle={pendingUsers.length === 0 ? styles.centered : styles.list}
        ListHeaderComponent={
          pendingUsers.length > 0
            ? <Text style={styles.header}>Users awaiting access to the system</Text>
            : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>✓</Text>
            <Text style={styles.empty}>No pending approvals.</Text>
            <Text style={styles.emptySubtext}>All registrations are up to date.</Text>
          </View>
        }
      />

      {/* Success feedback toast */}
      <Snackbar
        visible={!!snackbar}
        onDismiss={() => setSnackbar('')}
        duration={3000}
      >
        {snackbar}
      </Snackbar>
    </View>
  );
}

// styles

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#f5f5f5' },
  centered:       { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list:           { padding: 12 },
  header:         { color: '#555', marginBottom: 8, fontSize: 13 },

  card:           { marginBottom: 8 },
  cardContent:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  userInfo:       { flex: 1, gap: 6 },
  username:       { fontWeight: '700' },
  badge:          { alignSelf: 'flex-start', color: 'white' },

  actions:        { flexDirection: 'column', gap: 6, marginLeft: 12 },
  approveButton:  { minWidth: 90 },
  declineButton:  { minWidth: 90, borderColor: 'red' },
  buttonLabel:    { fontSize: 12 },

  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyIcon:      { fontSize: 40, color: '#4CAF50', marginBottom: 8 },
  empty:          { color: '#333', fontSize: 16, fontWeight: '600' },
  emptySubtext:   { color: '#888', marginTop: 4 },

  error:          { textAlign: 'center', color: 'red', margin: 12 },
});