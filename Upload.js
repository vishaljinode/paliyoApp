import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ImageBackground,
  TouchableOpacity,
  Text,
  TextInput,
  Alert,
} from 'react-native';
import ModalDropdown from 'react-native-modal-dropdown';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNavBar from './BottomNavBar';


const searchIcon = false;

const districts = [
  'Ahmedabad',
  'Amreli',
  'Anand',
  'Aravalli',
  'Banaskantha',
  'Bharuch',
  'Bhavnagar',
  'Botad',
  'Chhota Udaipur',
  'Dahod',
  'Dang',
  'Devbhoomi Dwarka',
  'Gandhinagar',
  'Gir Somnath',
  'Jamnagar',
  'Junagadh',
  'Kheda',
  'Kutch',
  'Mahisagar',
  'Mehsana',
  'Morbi',
  'Narmada',
  'Navsari',
  'Panchmahal',
  'Patan',
  'Porbandar',
  'Rajkot',
  'Sabarkantha',
  'Surat',
  'Surendranagar',
  'Tapi',
  'Vadodara',
  'Valsad',
];

export default function App() {
  const [image, setImage] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');

const selectImage = async () => {
  try {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        'Permission Denied',
        'Please enable access to your photo library in device settings.'
      );
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!pickerResult.cancelled && pickerResult.assets && pickerResult.assets.length > 0) {
      console.log("Picked image URI: ", pickerResult.assets[0].uri);
      setImage(pickerResult.assets[0].uri);
    } else {
      console.log('Image picking cancelled or no assets');
    }
  } catch (error) {
    console.error('Image picker error:', error);
    Alert.alert('Error', 'Failed to pick image. Please try again.');
  }
};



 const getToken = async () => {
    return await AsyncStorage.getItem('userToken');
  };

  
const handleSubmit = async () => {
  try {
    const apiUrl = 'https://mynewapi-9ghe.onrender.com/posts/add';
    const usernameToken = await getToken();
    console.log("Title: ", title);
console.log("Description: ", description);
console.log("Selected District: ", selectedDistrict);
console.log("Image URI: ", image);

    if (!title || !description || !selectedDistrict || !image) {
   Alert.alert('Incomplete Form', 'Please fill in all fields.');
   return;
}

const formData = new FormData();
formData.append('postTitle', title);
formData.append('postDescription', description);
formData.append('postDist', selectedDistrict);
formData.append('file', {
   uri: image,
   type: 'image/jpeg', // adjust according to your image format
   name: 'image.jpg', // you can customize this name based on the image details or a pattern
});



    // Making POST request with authentication token
    const response = await fetch(apiUrl, {
   method: 'POST',
   body: formData,
   headers: {
     'Authorization': `Bearer ${usernameToken}`,
   },
})

    // Checking response status
    if (response.ok) {
      // Reset form fields after successful submission
      setImage(null);
      setTitle('');
      setDescription('');
      setSelectedDistrict('');
      Alert.alert('Post Submitted', 'Your post has been submitted successfully!');
    } else {
      // Handle error response
      Alert.alert('Submission Error', 'Failed to submit post. Please try again later.');
    }
  } catch (error) {
    console.error('Error submitting post:', error);
    Alert.alert('Submission Error', 'Failed to submit post. Please try again later.');
  }
};



  // const handleSubmit = () => {
  //   // Implement post submission logic here
  //   console.log('Title:', title);
  //   console.log('Description:', description);
  //   console.log('Selected District:', selectedDistrict);
  //   // You can perform actions like sending data to server or storing in local storage
  //   // Reset form fields after submission if needed
  //   setImage(null);
  //   setTitle('');
  //   setDescription('');
  //   setSelectedDistrict('');
  //   // Show success message or navigate to another screen
  //   Alert.alert('Post Submitted', 'Your post has been submitted successfully!');
  // };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={image ? { uri: image } : null}
        style={styles.imageBackground}>



        <TouchableOpacity
          style={styles.selectImageButton}
          onPress={selectImage}>
          <Text style={styles.selectImageButtonText}>Select Image</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={[styles.input, { height: 100 }]}
          placeholder="Description"
          multiline={true}
          value={description}
          onChangeText={setDescription}
        />
        <ModalDropdown
          options={districts}
          defaultValue="Select District"
          textStyle={styles.dropdownText}
          dropdownStyle={styles.dropdown}
          onSelect={(index, value) => setSelectedDistrict(value)}
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
       
      </ImageBackground>
      <View style={styles.bottomNavBarContainer}>
     <BottomNavBar searchIcon= {false}/>
  </View>
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

  imageBackground: {
    flex: 1,
    width: '100%',   
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode: 'cover',
  },
bottomNavBarContainer: {
    height: 65, // Or whatever height is suitable
    width: '100%',
    backgroundColor: '#ddd', // Optional: for visual debugging
  },
  selectImageButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 20,
  },
  selectImageButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    width: '80%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  dropdownText: {
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 10,
    color: '#333',
  },
  dropdown: {
    width: 200,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    maxHeight: 150,
    backgroundColor: '#fff',
    alignSelf: 'auto', // Aligns dropdown to the right
    marginRight: 200, // Adds some margin to the right
  },

  submitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
