import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signup, signin } from './MyAPI'; // Adjust this import path as necessary

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSignUp = async () => {
    try {
      const data = await signup(username, email, password);
      if (data.Token) {
        await AsyncStorage.setItem('userToken', data.Token);
        navigation.navigate('Home');
      } else {
        Alert.alert("Signup Failed", "No token received");
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const handleSignIn = async () => {
    try {
      const data = await signin(email, password);
     // console.log('data aayo',data)
      if (data.Token) {
        await AsyncStorage.setItem('userToken', data.Token);
      const userDataString = JSON.stringify(data.User);
      await AsyncStorage.setItem('user', userDataString);

        navigation.navigate('Home');
      } else {
        Alert.alert("Signin Failed", "Something Went Wrong!");
      }
    } catch (error) {
      Alert.alert("Invalid Credentials", "Please Check Email Or Password !");
    }
  };

  const toggleSignUp = () => {
    setIsSignUp(!isSignUp);
    setUsername(''); // Optionally reset the username when toggling
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>ads</Text>
      {isSignUp && (
        <View style={styles.inputView}>
          <TextInput
            style={styles.inputText}
            placeholder="Username..."
            placeholderTextColor="#003f5c"
            onChangeText={setUsername}
          />
        </View>
      )}
      <View style={styles.inputView}>
        <TextInput
          style={styles.inputText}
          placeholder="Email..."
          placeholderTextColor="#003f5c"
          onChangeText={setEmail}
        />
      </View>
      <View style={styles.inputView}>
        <TextInput
          secureTextEntry
          style={styles.inputText}
          placeholder="Password..."
          placeholderTextColor="#003f5c"
          onChangeText={setPassword}
        />
      </View>
      <TouchableOpacity onPress={toggleSignUp}>
        <Text style={styles.forgot}>{isSignUp ? "Already signed up?" : "Forgot Password?"}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.loginBtn} onPress={isSignUp ? handleSignUp : handleSignIn}>
        <Text style={styles.loginText}>{isSignUp ? "SIGNUP" : "LOGIN"}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={toggleSignUp}>
        <Text style={styles.loginText}>{isSignUp ? "Login" : "Signup"}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#003f5c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontWeight: "bold",
    fontSize: 50,
    color: "#fb5b5a",
    marginBottom: 40,
  },
  inputView: {
    width: "80%",
    backgroundColor: "#465881",
    borderRadius: 25,
    height: 50,
    marginBottom: 20,
    justifyContent: "center",
    padding: 20
  },
  inputText: {
    height: 50,
    color: "white"
  },
  forgot: {
    color: "white",
    fontSize: 11
  },
  loginBtn: {
    width: "80%",
    backgroundColor: "#fb5b5a",
    borderRadius: 25,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    marginBottom: 10
  },
  loginText: {
    color: "white"
  }
});

export default LoginScreen;
