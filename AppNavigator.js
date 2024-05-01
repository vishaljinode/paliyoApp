import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './LoginScreen'; // This will be your existing App component renamed
import HomeScreen from './Home';
import UploadScreen from './Upload' 
import Profile from './ProfilePage'   // Your Home screen component

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
         <Stack.Screen name="Upload" component={UploadScreen} options={{ headerShown: false }} />
         <Stack.Screen name="Profile" component={Profile} options={{ headerShown: false }} />

       
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
