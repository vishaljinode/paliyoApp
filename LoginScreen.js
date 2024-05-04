import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { signup, signin } from './MyAPI'; // Adjust this import path as necessary


const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [otp, setotp] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isUserOTP, setIsUserOTP] = useState(false);
  const [isForgotOTP, setIsForgotOTP] = useState(false);
  const [resetBoxes, setResetBoxes] = useState(false);
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');

  const handleSignUp = async () => {
    try {
      const data = await signup(username, email, password);
      if (data.Token) {
        await AsyncStorage.setItem('userSignUpToken', data.Token);
        setIsUserOTP(true);
      } else {
        Alert.alert('Signup Failed', 'No token received');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleSignIn = async () => {
    try {
      const data = await signin(email, password);
     
      if (data.Token) {
        await AsyncStorage.setItem('userToken', data.Token);
        const userDataString = JSON.stringify(data.User);
        await AsyncStorage.setItem('user', userDataString);

        navigation.navigate('Home');
      } else {
        Alert.alert('Signin Failed', 'Something Went Wrong!');
      }
    } catch (error) {
      Alert.alert('Invalid Credentials', 'Please Check Email Or Password !');
    }
  };

  const toggleSignUp = () => {
    setIsSignUp(!isSignUp);
    setIsForgotOTP(false);
    setIsForgotPassword(false);
    setIsUserOTP(false);
    setUsername('');
    setEmail('');
    setPassword(''); // Optionally reset the username when toggling
  };

  const toggleForgotPassword = () => {
    setIsForgotPassword(!isForgotPassword);
    setIsForgotOTP(false);
    setIsUserOTP(false);

    setEmail(''); // Clear email input when toggling
  };

  const toggleUserOTP = async () => {
    await AsyncStorage.removeItem('userSignUpToken'); // Replace 'userToken' with your actual key
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('NewToken');
    await AsyncStorage.removeItem('newForgotPassUser');
    await AsyncStorage.removeItem('userToken');
    if (isUserOTP) {
      setIsForgotPassword(false);
      setIsForgotOTP(false);
      setIsUserOTP(false);
      setResetBoxes(false);
      setIsSignUp(true);
      setEmail('');
    } else {
      setIsForgotPassword(false);
      setIsForgotOTP(false);
      setIsUserOTP(false);
      setIsSignUp(false);
      setResetBoxes(false);
      setEmail('');
    }
  };

  const handleForgotPassword = async () => {
    setIsForgotOTP(true);
  

    try {
      const response = await fetch(
        'https://mynewapi-9ghe.onrender.com/users/forgotPassOTP',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json(); // Parses the JSON response
      

      if (response.ok) {
       
        setIsForgotPassword(true);
        setIsForgotOTP(true);
      } else {
        console.error('User OTP verification Error: ', data);
      }
    } catch (error) {
      // Catch and log any errors that occur during the fetch operation
      console.error('User OTP verification Error:', error);
      throw error; // Optionally re-throwing error if you want further error handling upstream
    }
  };

  const getUserSignupToken = async () => {
    return await AsyncStorage.getItem('userSignUpToken');
  };

  const handleVerifyOtp = async () => {
    const userSignupToken = await getUserSignupToken(); 

    try {
      // await forgotPassword(email);
      if (isUserOTP) {
        try {
          const response = await fetch(
            'https://mynewapi-9ghe.onrender.com/users/verifyUserOTP',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userSignupToken}`,
              },
              body: JSON.stringify({ email, otp }),
            }
          );

          const data = await response.json(); // Fetches and parses the JSON response

          if (response.ok) {            
            await AsyncStorage.setItem('userToken', data.Token);
            const userDataString = JSON.stringify(data.User);
            await AsyncStorage.setItem('user', userDataString);
            navigation.navigate('Home');
          } else {
           
            console.error('User OTP verification Error: ', data);
          }
        } catch (error) {
        
          console.error('User OTP verification Error:', error);
          throw error; 
        }
      }

      if (isForgotOTP) {
        try {
          const response = await fetch(
            'https://mynewapi-9ghe.onrender.com/users/verifyForgotPass',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ email, otp }),
            }
          );
      
          const data = await response.json(); // Parses the JSON response    

         
          
          if (response.ok) {
    
            await AsyncStorage.setItem('NewToken', data.Token);          

            const userDataString = JSON.stringify(data.forgetPassUser);
            await AsyncStorage.setItem('newForgotPassUser', userDataString);


            setIsForgotOTP(false); 
            setIsForgotPassword(false); 
            setResetBoxes(true); 
          } else {           
            console.error('Forget password OTP verification Error:', data);
            alert('OTP verification failed. Please try again.'); // User-friendly error message
          }
        } catch (error) {
          // Handle errors in fetching the data
          console.error('Forget password OTP verification Error:', error);
          alert('An error occurred during OTP verification. Please check your connection and try again.'); // User-friendly error message
          throw error; // Optionally re-throw if you handle errors higher up as well
        }
      }
      
     
      // Alert.alert("Password Reset", "Check your email for instructions to reset your password.");
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  // const getForgotPassToken = async () => {
  //   return 
  // };

  const handleResetPassword = async () => {
    const forgotPassToken = await AsyncStorage.getItem('NewToken');
    if (password1 !== password2) {
      Alert.alert('Password does not match ! please enter same password');
    }
    if (password1 === password2) {
      try {
        const response = await fetch(
          'https://mynewapi-9ghe.onrender.com/users/resetPassword',
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${forgotPassToken}`,
            },

            body: JSON.stringify({ password1, password2 }),
          }
        );

        const data = await response.json();


        if (response.ok) {
          if (data.Token) {
            await AsyncStorage.setItem('userToken', data.Token);
            const userDataString = JSON.stringify(data.User);
            await AsyncStorage.setItem('user', userDataString);
            Alert.alert('Password reset successfully');

            navigation.navigate('Home');
          } else {
            Alert.alert('Signin Failed', 'Something Went Wrong!');
          }
        } else {
          console.error('Forget password OTP verificarion Error');
        }
      } catch (e) {
        Alert.alert('Error', e.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Paliyo</Text>
      {isSignUp && !isUserOTP && (
        <View style={styles.inputView}>
          <TextInput
            style={styles.inputText}
            placeholder="Username..."
            placeholderTextColor="#fff"
            onChangeText={setUsername}
          />
        </View>
      )}
      {!isForgotPassword && !isUserOTP && !resetBoxes && (
        <View style={styles.inputView}>
          <TextInput
            style={styles.inputText}
            placeholder="Email..."
            placeholderTextColor="#fff"
            onChangeText={setEmail}
          />
        </View>
      )}

      {isForgotPassword && !isUserOTP && !resetBoxes && (
        <View style={styles.inputView}>
          <TextInput
            style={styles.inputText}
            placeholder="Email..."
            placeholderTextColor="#fff"
            onChangeText={setEmail}
            editable={!isForgotOTP}
          />
        </View>
      )}

      {!isForgotPassword && !isUserOTP && !resetBoxes && (
        <View style={styles.inputView}>
          <TextInput
            secureTextEntry
            style={styles.inputText}
            placeholder="Password..."
            placeholderTextColor="#fff"
            onChangeText={setPassword}
          />
        </View>
      )}

      {isForgotPassword && !isUserOTP && isForgotOTP && !resetBoxes && (
        <View style={styles.inputView}>
          <TextInput
            secureTextEntry
            style={styles.inputText}
            placeholder="Veify OTP"
            placeholderTextColor="#fff"
            onChangeText={setotp}
          />
        </View>
      )}
      {!isForgotPassword && !isUserOTP && !resetBoxes && (
        <TouchableOpacity
          onPress={isSignUp ? toggleSignUp : toggleForgotPassword}>
          <Text style={styles.forgot}>
            {isSignUp ? 'Already signed up?' : 'Forgot Password?'}
          </Text>
        </TouchableOpacity>
      )}
      {!isForgotPassword && !isUserOTP && !resetBoxes && (
        <TouchableOpacity
          style={styles.loginBtn}
          onPress={isSignUp ? handleSignUp : handleSignIn}>
          <Text style={styles.loginText}>{isSignUp ? 'SIGNUP' : 'LOGIN'}</Text>
        </TouchableOpacity>
      )}
      {!isForgotPassword && !isUserOTP && !resetBoxes && (
        <TouchableOpacity onPress={toggleSignUp}>
          <Text style={styles.loginText}>{isSignUp ? 'LOGIN' : 'SIGNUP'}</Text>
        </TouchableOpacity>
      )}

      {isForgotPassword && !isUserOTP && !isForgotOTP && (
        <TouchableOpacity
          style={styles.loginBtn}
          onPress={handleForgotPassword}>
          <Text style={styles.loginText}>{'Forgot Password'}</Text>
        </TouchableOpacity>
      )}

      {isForgotPassword && !isUserOTP && !isForgotOTP && (
        <TouchableOpacity onPress={toggleForgotPassword}>
          <Text style={styles.loginText}>{'Cancel'}</Text>
        </TouchableOpacity>
      )}

      {isUserOTP && (
        <View style={styles.inputView}>
          <TextInput
            style={styles.inputText}
            placeholder="Verify OTP..."
            placeholderTextColor="#fff"
            onChangeText={setotp}
          />
        </View>
      )}

      {(isUserOTP || isForgotOTP) && (
        <TouchableOpacity style={styles.loginBtn} onPress={handleVerifyOtp}>
          <Text style={styles.loginText}>{'Verify OTP'}</Text>
        </TouchableOpacity>
      )}

      {(isUserOTP || isForgotOTP) && (
        <TouchableOpacity onPress={toggleUserOTP}>
          <Text style={styles.loginText}>{'Cancel'}</Text>
        </TouchableOpacity>
      )}

      {resetBoxes && (
        <View style={styles.inputView}>
          <TextInput
            style={styles.inputText}
            placeholder="Enter New Password..."
            placeholderTextColor="#fff"
            onChangeText={setPassword1}
          />
        </View>
      )}

      {resetBoxes && (
        <View style={styles.inputView}>
          <TextInput
            style={styles.inputText}
            placeholder="Re-Enter New Password..."
            placeholderTextColor="#fff"
            onChangeText={setPassword2}
          />
        </View>
      )}

      {resetBoxes && (
        <TouchableOpacity style={styles.loginBtn} onPress={handleResetPassword}>
          <Text style={styles.loginText}>{'Reset Password'}</Text>
        </TouchableOpacity>
      )}

      {resetBoxes && (
        <TouchableOpacity onPress={toggleUserOTP}>
          <Text style={styles.loginText}>{'Cancel'}</Text>
        </TouchableOpacity>
      )}
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
    fontWeight: 'bold',
    fontSize: 50,
    color: '#fb5b5a',
    marginBottom: 40,
  },
  inputView: {
    width: '80%',
    backgroundColor: '#465881',
    borderRadius: 25,
    height: 50,
    marginBottom: 20,
    justifyContent: 'center',
    padding: 20,
  },
  inputText: {
    height: 50,
    color: 'white',
  },
  forgot: {
    color: 'white',
    fontSize: 11,
  },
  loginBtn: {
    width: '80%',
    backgroundColor: '#fb5b5a',
    borderRadius: 25,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    marginBottom: 10,
  },
  loginText: {
    color: 'white',
  },
});

export default LoginScreen;
