import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const BottomNavBar = ({ toggleSearchInput,searchIcon }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity style={styles.navIcon} onPress={() => navigation.navigate('Home')}>
        <FontAwesome name="home" size={24} color="black" />
      </TouchableOpacity>
      {searchIcon &&<TouchableOpacity style={styles.navIcon} onPress={toggleSearchInput}>
        <FontAwesome name="search" size={24} color="black" />
      </TouchableOpacity>}
      <TouchableOpacity style={styles.navIcon} onPress={() => navigation.navigate('Upload')}>
        <FontAwesome name="plus-square-o" size={24} color="black" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.navIcon} onPress={() => navigation.navigate('Profile')}>
        <FontAwesome name="user-o" size={24} color="black" />
      </TouchableOpacity>
    </View>
  );
};

const styles = {
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#dedede',
    backgroundColor: '#f8f8f8'
  },
  navIcon: {
    padding: 10,
  }
};

export default BottomNavBar;
