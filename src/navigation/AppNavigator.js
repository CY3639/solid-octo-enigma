import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../context/AuthContext';

// screens: placeholder files for now
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import PatientsScreen from '../screens/PatientsScreen';
import PatientDetailScreen from '../screens/PatientDetailScreen';
import MedicationsScreen from '../screens/MedicationsScreen';
import AdminApprovalScreen from '../screens/AdminApprovalScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();


function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}


function PatientsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="PatientsList" component={PatientsScreen} options={{ title: 'Patients' }} />
      <Stack.Screen
        name="PatientDetail"
        component={PatientDetailScreen}
        options={({ route }) => ({ title: route.params?.name || 'Patient' })}
      />
    </Stack.Navigator>
  );
}


function MainTabs() {
  const { isAdmin, logout } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'PatientsTab') iconName = 'account-group';
          else if (route.name === 'MedicationsTab') iconName = 'pill';
          else if (route.name === 'AdminTab') iconName = 'shield-check';
          else if (route.name === 'SettingsTab') iconName = 'cog';
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="PatientsTab"
        component={PatientsStack}
        options={{ tabBarLabel: 'Patients' }}
      />
      <Tab.Screen
        name="MedicationsTab"
        component={MedicationsScreen}
        options={{ tabBarLabel: 'Medications', headerShown: true, title: 'Medications' }}
      />
      {isAdmin && (
        <Tab.Screen
          name="AdminTab"
          component={AdminApprovalScreen}
          options={{ tabBarLabel: 'Approvals', headerShown: true, title: 'Approvals' }}
        />
      )}
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return isLoggedIn ? <MainTabs /> : <AuthStack />;
}