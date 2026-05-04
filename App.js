import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { authService } from './src/services/authService';

// to remove before prod
async function testAPI() {
  try {
    const result = await authService.login('admin', 'admin123');
    console.log('Login success:', result);
  } catch (error) {
    console.log('Login failed:', error.message);
  }
}
testAPI();

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
