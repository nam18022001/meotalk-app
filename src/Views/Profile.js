import { Avatar, Button, IconButton } from '@react-native-material/core';
import { Pressable, RecyclerViewBackedScrollView, StyleSheet, Text, TouchableNativeFeedback, View } from 'react-native';
import auth from '@react-native-firebase/auth';
import Ionicons from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';

import GlobalStyles from '../Components/GlobalStyles';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useEffect, useState } from 'react';
import useAuthContext from '../hooks/useAuthContext';

function Profile({ navigation, route }) {
  const currentUser = useAuthContext();
  const [numFr, setNumFr] = useState(0);
  const [photoFriends, setPhotoFriends] = useState([]);

  useEffect(() => {
    firestore()
      .collection('users')
      .doc(currentUser.uid)
      .collection('friends')
      .onSnapshot((res) => {
        if (!res.empty) {
          setNumFr(res.size);
          let avatarFriends = [];
          res.forEach((resFr) => {
            avatarFriends.push(resFr.data().photoURL);
          });

          setPhotoFriends(avatarFriends.slice(0, 6));
        }
      });
  }, []);
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.wrapBasic}>
          <View style={styles.avatar}>
            <Avatar
              size={130}
              image={{ uri: currentUser.photoURL ? currentUser.photoURL : undefined, cache: 'force-cache' }}
            />
          </View>
          <View style={styles.info}>
            <View>
              <Text numberOfLines={1} style={{ fontFamily: GlobalStyles.fonts.fontBold, color: '#fff', fontSize: 20 }}>
                {currentUser.displayName}
              </Text>
              <Text
                numberOfLines={1}
                style={{ marginTop: 5, fontFamily: GlobalStyles.fonts.fontRegular, color: '#fff', fontSize: 14 }}
              >
                {currentUser.email}
              </Text>
            </View>
            <View style={styles.wrapaction}>
              <TouchableNativeFeedback
                background={TouchableNativeFeedback.Ripple('#123944', true)}
                onPress={async () => {
                  await firestore().collection('users').doc(currentUser.uid).update({
                    fcmToken: '',
                  });
                  await auth().signOut();
                  await GoogleSignin.signOut();
                }}
              >
                <View style={styles.action}>
                  <Text style={{ fontFamily: GlobalStyles.fonts.fontAudiowide, color: '#2192FF', fontSize: 20 }}>
                    LogOut
                  </Text>
                  <Ionicons style={{ marginLeft: 5 }} name="ios-log-out-outline" color="#2192FF" size={22} />
                </View>
              </TouchableNativeFeedback>
            </View>
          </View>
        </View>

        <View style={styles.spec}></View>

        <View style={styles.wrapAddvance}>
          <View style={styles.viewAddvance}>
            <TouchableNativeFeedback
              background={TouchableNativeFeedback.Ripple('#123944', true)}
              onPress={() => navigation.navigate('Friends', { screen: 'MyFriends' })}
            >
              <View style={styles.frNav}>
                <Text style={{ fontFamily: GlobalStyles.fonts.fontAudiowide, color: '#256D85', fontSize: 20 }}>
                  {numFr} Bạn bè
                </Text>
                <View style={styles.avatars}>
                  {photoFriends.length > 0 &&
                    photoFriends.map((result, index) => (
                      <View key={index} style={styles.friendsPhoto}>
                        <Avatar size={32} image={{ uri: result, cache: 'force-cache' }} />
                        {photoFriends.length === 5 && index === photoFriends.length - 1 && (
                          <View
                            style={{
                              position: 'absolute',
                              width: 32,
                              height: 32,
                              borderRadius: 99,
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: GlobalStyles.colors.seenColor,
                            }}
                          >
                            <Ionicons size={10} color="#fff" name="ios-ellipsis-horizontal" />
                          </View>
                        )}
                      </View>
                    ))}
                </View>
              </View>
            </TouchableNativeFeedback>
          </View>
          {/* <View style={styles.viewAddvance}>
            <Text style={{ fontFamily: GlobalStyles.fonts.fontAudiowide, color: '#256D85', fontSize: 20 }}>
              DarkMode
            </Text>
          </View> */}
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    paddingVertical: 20,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'rgba(22, 24, 35, 0.370)',
    borderColor: GlobalStyles.colors.primary,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 20,
  },
  btnBack: {
    width: 30,
    height: 30,
    marginTop: 20,
    marginLeft: 10,
  },
  wrapBasic: {
    flexDirection: 'row',
    flex: 0.3,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatar: {
    borderWidth: 3,
    borderRadius: 80,
    borderColor: '#fff',
  },
  info: {
    flex: 1,
    height: 130,
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingLeft: 20,
  },
  wrapaction: {
    flex: 0.55,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C8FFD4',
    borderRadius: 20,
  },
  action: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spec: {
    height: 1,
    backgroundColor: '#fff',
    marginHorizontal: 40,
  },
  wrapAddvance: {
    flex: 0.7,
    flexDirection: 'column',
    paddingVertical: 20,
  },
  viewAddvance: {
    flex: 0.17,
    borderRadius: 50,
    borderColor: '#3F4E4F',
    borderWidth: 1,
    marginVertical: 5,
    backgroundColor: '#FFE7BF',
  },
  frNav: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatars: {
    flexDirection: 'row',
  },
  friendsPhoto: {
    marginLeft: -12,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#256D85',
    borderRadius: 99,
  },
});
export default Profile;
