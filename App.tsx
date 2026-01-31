import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Ekran bileşenleri (bunları daha sonra oluşturacağız)
import Login from './src/screens/Login'
import Main from './src/screens/Main';

// Stack tipi (TypeScript için)
export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
};

// Stack Navigator tanımı
const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  // URL'leri istersen .env dosyasına alabiliriz (ileride)
  const LOGIN_URL = '';
  const WEBDEPO_URL = '';

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Main" component={Main} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
