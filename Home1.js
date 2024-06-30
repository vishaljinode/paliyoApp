import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  Share,
  BackHandler,
  ActivityIndicator,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNavBar from './BottomNavBar';
import UserImage from './assets/icon.png';
import { useFocusEffect } from '@react-navigation/native';
import { API_BASE_URL } from './APIUrl';
import { RefreshControl } from 'react-native';


export default function HomeScreen() {
  const [posts, setPosts] = useState([]);
  const [likes, setLikes] = useState({});
  const [showCommentInput, setShowCommentInput] = useState({});
  const [comments, setComments] = useState({});
  const [showComments, setShowComments] = useState({});
  const [savedPosts, setSavedPosts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [commentTexts, setCommentTexts] = useState({});
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);


  useEffect(() => {
    fetchPosts();
  }, []);


const onRefresh = async () => {
  setRefreshing(true);
  try {
    await fetchPosts(); // your function to fetch posts
  } catch (error) {
    console.error('Failed to refresh:', error);
  }
  setRefreshing(false);
};



  const toggleSearchInput = () => {
    setShowSearchInput((prev) => !prev); // Toggle the visibility of the search input
  };
  
  

  const filteredPosts = posts.filter(
    (post) =>
      post.postTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.postDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.postDist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.postedBy.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleReadMore = (postId) => {
    // If there is an expanded post other than the current one, collapse its description
    Object.keys(expandedDescriptions).forEach((id) => {
      if (id !== postId && expandedDescriptions[id]) {
        setExpandedDescriptions((prev) => ({
          ...prev,
          [id]: false,
        }));
      }
    });

    // Toggle the description of the current post
    setExpandedDescriptions((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const toggleCommentBox = (postId) => {
    setShowCommentInput((prev) => ({
      ...prev,

      [postId]: !prev[postId], // Toggle the state between true and false
    }));
  };

  const submitComment = async (postId) => {
    const token = await getToken();

    const comment = commentTexts[postId];

    if (!comment) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/posts/commentPost`,

        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({ postId, comment }),
        }
      );

      const json = await response.json();

      if (response.ok) {
        setComments((prev) => ({ ...prev, [postId]: json.comments }));

        setCommentTexts((prev) => ({ ...prev, [postId]: '' })); // Clear input after posting

        setShowCommentInput((prev) => ({ ...prev, [postId]: false })); // Hide the comment input box

        fetchComments(postId);

        toggleCommentBox(postId);
      } else {
        throw new Error(json.message || 'Failed to post comment');
      }
    } catch (error) {
      console.error('Failed to submit comment:', error);
    }
  };

  const fetchComments = async (postId) => {
    const token = await getToken();

    try {
      const response = await fetch(
        `${API_BASE_URL}/posts/getComments/${postId}`,

        {
          method: 'GET',

          headers: {
            'Content-Type': 'application/json',

            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await response.json();

      if (response.ok) {
        setComments((prev) => ({ ...prev, [postId]: json.comments }));

        setShowComments((prev) => ({ ...prev, [postId]: true }));
      } else {
        throw new Error(json.message || 'Failed to fetch comments');
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        const openCommentPostIds = Object.keys(showCommentInput).filter(
          (postId) => showCommentInput[postId]
        );

        if (showSearchInput) {
          setShowSearchInput(false);
          setSearchQuery('')
          fetchPosts();
          return true; // Prevent default back behavior
        }

        if (openCommentPostIds.length > 0) {
          const postId = openCommentPostIds[0];
          setShowCommentInput((prev) => ({
            ...prev,
            [postId]: false,
          }));

          // Hide the comment list as well
          setShowComments((prev) => ({
            ...prev,
            [postId]: false,
          }));

          return true; // Prevent default back behavior
        }

        return false; // Allow default back behavior
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [
      showCommentInput,
      setShowCommentInput,
      setShowComments,
      showSearchInput,
      setShowSearchInput,
    ])
  );

  const handleShare = async (post) => {
    try {
      await Share.share({
        message: `${post.postImages.mediaUrl} \n \n ${post.postTitle}\n \n ભારતની સૌ પ્રથમ શૌર્યતાનો ઈતિહાસ સાચવતી એપ્પ આજે જ આ લિંક પરથી ડાઉનલોડ કરો :`,
      });
    } catch (error) {
      alert(error.message);
    }
  };

  const getToken = async () => {
    return await AsyncStorage.getItem('userToken');
  };

  const getUser = async () => {
    const userJson = await AsyncStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  };

  const fetchPosts = async () => {
    setIsLoading(true);
    const token = await getToken();
    const user = await getUser(); // Ensure user details are loaded here

    if (!token || !user) {
      console.log(
        'No token found or unable to fetch user details, user might need to login'
      );
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        API_BASE_URL+'/posts/getAllPosts',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const json = await response.json();
      if (response.ok) {
        setPosts(json.post);
        const newLikes = {};
        const newSavedPosts = {};
        json.post.forEach((post) => {
          // Check if the current user's ID is in the post's postLikes array
          newLikes[post._id] = post.postLikes.some(
            (like) => like.likedBy._id == user._id
          );

          newSavedPosts[post._id] = post.postBookmarks.some(
            (save) => save.bookmarkedBy._id == user._id
          );
        });


        setLikes(newLikes); // Update the likes state
        setSavedPosts(newSavedPosts);
      } else {
        throw new Error(json.message || 'Failed to fetch posts');
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const toggleLike = async (postId) => {
    const token = await getToken();
    const isLiked = likes[postId];
    const url = isLiked
      ? API_BASE_URL+'/posts/unlikePost'
      : API_BASE_URL+'/posts/likePost';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId }),
      });
      const json = await response.json();
      if (response.ok) {
        setLikes((prev) => ({
          ...prev,
          [postId]: !prev[postId], // Toggle the like state
        }));
      } else {
        throw new Error(json.message || 'Failed to update like status');
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const toggleSavePost = async (postId) => {
    const token = await getToken();
    const isSaved = savedPosts[postId]; // Check if post is already saved
    const url = isSaved
      ? API_BASE_URL+'/posts/unsavePost'
      : API_BASE_URL+'/posts/savePost';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId }),
      });
      const json = await response.json();
      if (response.ok) {
        setSavedPosts((prev) => ({
          ...prev,
          [postId]: !prev[postId], // Toggle the save state
        }));
      } else {
        throw new Error(json.message || 'Failed to update save status');
      }
    } catch (error) {
      console.error('Failed to toggle save:', error);
    }
  };
  // Other methods remain unchanged...

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showSearchInput && (
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          autoFocus={true}
        />
      )}

      <FlatList
        data={filteredPosts}
        renderItem={({ item }) => (
          <View style={styles.postContainer}>
            <View style={styles.userHeader}>
              <Image source={UserImage} style={styles.userIcon} />
              <Text style={styles.username}>{item.postedBy.username}</Text>
            </View>
            <Image
              source={{ uri: item.postImages.mediaUrl }}
              style={styles.postImage}
            />
            <Text style={styles.postTitle}>{item.postTitle}</Text>
            {expandedDescriptions[item._id] ? (
              <View>
                <Text style={styles.postText}>{item.postDescription}</Text>

                <TouchableOpacity onPress={() => handleReadMore(item._id)}>
                  <Text style={styles.readMore}>Read less</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text
                  numberOfLines={2}
                  ellipsizeMode="tail"
                  style={styles.postText}>
                  {item.postDescription}
                </Text>
              </View>
            )}

            {!expandedDescriptions[item._id] && (
              <TouchableOpacity onPress={() => handleReadMore(item._id)}>
                <Text style={styles.readMore}>Read more</Text>
              </TouchableOpacity>
            )}
            <View style={styles.iconRow}>
              <TouchableOpacity
                onPress={() => toggleLike(item._id)}
                style={styles.iconTouch}>
                <FontAwesome
                  name={likes[item._id] ? 'heart' : 'heart-o'}
                  size={24}
                  color={likes[item._id] ? 'red' : 'black'}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconTouch}
                onPress={() => {
                  // Close the comment box and hide comments of the previously opened post
                  Object.keys(showCommentInput).forEach((postId) => {
                    if (postId !== item._id && showCommentInput[postId]) {
                      setShowCommentInput((prev) => ({
                        ...prev,
                        [postId]: false,
                      }));
                      setShowComments((prev) => ({
                        ...prev,
                        [postId]: false,
                      }));
                    }
                  });

                  // Toggle the comment box of the clicked post
                  toggleCommentBox(item._id);

                  // Toggle the visibility of comments for the clicked post
                  setShowComments((prev) => ({
                    ...prev,
                    [item._id]: !prev[item._id],
                  }));

                  // Fetch comments only if not already fetched
                  if (!showComments[item._id]) {
                    fetchComments(item._id);
                  }
                }}>
                <FontAwesome name="comment-o" size={24} color="black" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconTouch}
                onPress={() => handleShare(item)}>
                <FontAwesome name="share" size={24} color="black" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => toggleSavePost(item._id)}
                style={styles.iconTouch}>
                <FontAwesome
                  name={savedPosts[item._id] ? 'bookmark' : 'bookmark-o'}
                  size={24}
                  color={savedPosts[item._id] ? 'red' : 'black'}
                />
              </TouchableOpacity>
            </View>

            {showCommentInput[item._id] && (
              <View style={styles.commentBox}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Write a comment..."
                  value={commentTexts[item._id] || ''}
                  onChangeText={(text) =>
                    setCommentTexts((prev) => ({
                      ...prev,
                      [item._id]: text,
                    }))
                  }
                  onSubmitEditing={() => submitComment(item._id)} // Handle posting comment when submit button on keyboard is pressed
                />

               
              </View>
            )}

            {showComments[item._id] && (
              <View style={styles.commentsContainer}>
                {comments[item._id] ? (
                  comments[item._id].map((comment, index) => (
                    <Text key={index} style={styles.commentText}>
                      {comment.comment} - {comment.commentedBy.username}
                    </Text>
                  ))
                ) : (
                  <Text>Loading...</Text>
                )}
              </View>
            )}
          </View>
        )}
         keyExtractor={item => item._id} 
         refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#9Bd35A', '#689F38']}  // Optional: customize the colors used
        />
      }
      />
      <BottomNavBar toggleSearchInput={toggleSearchInput} searchIcon= {true}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40,
  },
  searchInput: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
  postContainer: {
    marginVertical: 8,
    paddingHorizontal: 12,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  username: {
    marginLeft: 8,
    fontSize: 16,
  },
  postImage: {
    width: '100%',
    height: 300,
    marginTop: 10,
  },
  postText: {
    marginVertical: 10,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  iconTouch: {
    padding: 10,
  },
  commentBox: {
    flexDirection: 'row', // Set children in a row

    alignItems: 'center', // Center children vertically

    padding: 10,
  },

  commentInput: {
    flex: 1, // Take up all available space

    marginRight: 10, // Add some space between the input and the button
  },

  // submitButton: {
  //   padding: 10,

  //   backgroundColor: '#007bff',

  //   borderRadius: 5,
  // },

  commentsContainer: {
    padding: 10,
  },

  commentText: {
    fontSize: 14,
    color: 'gray',
  },
  readMore: {
    color: 'blue',
    marginBottom: 10,
  },
});
