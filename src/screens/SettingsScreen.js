import { View, StyleSheet } from 'react-native';
import { Text, Button, Divider, List } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

export default function SettingsScreen() {
  const { user, logout, isPharmacist } = useAuth();

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.container}>
        <List.Section>
          <List.Subheader>Account</List.Subheader>
          <List.Item
            title={user?.username || 'User'}
            description={isPharmacist ? 'Pharmacist' : 'Pharmacy Assistant'}
            left={(props) => <List.Icon {...props} icon="account-circle" />}
          />
        </List.Section>

        <Divider />

        <View style={styles.logoutContainer}>
          <Button
            mode="outlined"
            icon="logout"
            onPress={logout}
            textColor="red"
            style={styles.logoutButton}
          >
            Sign Out
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 16 },
  logoutContainer: { marginTop: 32, paddingHorizontal: 16 },
  logoutButton: { borderColor: 'red' },
});