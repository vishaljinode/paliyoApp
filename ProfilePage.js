import React ,{ useState,useEffect }from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNavBar from './BottomNavBar';



const Profile = ({ navigation }) => {

  const [usename,setUsername] = useState('Loading');
  


useEffect(() => {
  const fetchUser = async () => {
    const userJson = await AsyncStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;
    if (user) {
      console.log(user);
      setUsername(user.username); // Now setting the username after data is fetched
    }
  };

  fetchUser(); // Call the async function
}, []);
  
    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('userToken'); // Replace 'userToken' with your actual key
            await AsyncStorage.removeItem('user'); 
            console.log('Token removed, user logged out');
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            });
        } catch (error) {
            console.error('Failed to remove the token', error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Hello , {usename}</Text>
                <Button
                    title="Logout"
                    onPress={handleLogout}
                />
            </View>
            <View style={styles.bottomNavBarContainer}>
                <BottomNavBar searchIcon={false} toggleSearchInput={undefined}/>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        flex: 1, // This makes the content container take all the space except for the navbar
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        marginBottom: 20,
    },
    bottomNavBarContainer: {
        height: 65, // Or whatever height is suitable
        width: '100%',
        backgroundColor: '#ddd', // Optional: for visual debugging
    },
});

export default Profile;
