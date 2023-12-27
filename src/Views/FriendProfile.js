import firestore from '@react-native-firebase/firestore';
import { Avatar } from '@react-native-material/core';
import { StyleSheet, Text, TouchableNativeFeedback, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { useEffect, useState } from 'react';
import GlobalStyles from '../Components/GlobalStyles';
import useAuthContext from '../hooks/useAuthContext';

function ButtonStatus({ children, onPress, iconName }) {
  return (
    <TouchableNativeFeedback background={TouchableNativeFeedback.Ripple('#123944', true)} onPress={onPress}>
      <View style={styles.action}>
        <Text style={{ fontFamily: GlobalStyles.fonts.fontAudiowide, color: '#404258', fontSize: 20 }}>{children}</Text>
        <Ionicons style={{ marginLeft: 5 }} name={iconName} color="#404258" size={22} />
      </View>
    </TouchableNativeFeedback>
  );
}

function FriendProfile({ navigation, route }) {
  const { infoFriend, from, state } = route.params;
  const currentUser = useAuthContext();

  const [makeFriendsDoc, setMakeFriendsDoc] = useState();
  const [senderFriendDoc, setSenderFriendDoc] = useState();
  const [recieveFriendDoc, setRecieveFriendDoc] = useState();

  const [numFr, setNumFr] = useState(0);
  const [photoFriends, setPhotoFriends] = useState([]);

  useEffect(() => {
    if (from === 'search' || from === 'myFriends') {
      setMakeFriendsDoc(firestore().collection('makeFriends').doc(`${currentUser.uid}_${infoFriend.uid}`));
      setSenderFriendDoc(firestore().collection('makeFriends').doc(`${currentUser.uid}_${infoFriend.uid}`));
      setRecieveFriendDoc(firestore().collection('makeFriends').doc(`${infoFriend.uid}_${currentUser.uid}`));
      firestore()
        .collection('users')
        .doc(infoFriend.uid)
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
    } else if (from === 'request') {
      const recieveFriendDoc = firestore().collection('makeFriends').doc(`${infoFriend.sender}_${currentUser.uid}`);
      const senderFriendDoc = firestore().collection('makeFriends').doc(`${currentUser.uid}_${infoFriend.reciever}`);

      setMakeFriendsDoc();
      setRecieveFriendDoc(recieveFriendDoc);
      setSenderFriendDoc(senderFriendDoc);
      if (state.addSent) {
        firestore()
          .collection('users')
          .doc(infoFriend.reciever)
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
      } else if (state.isRecieveRequest) {
        firestore()
          .collection('users')
          .doc(infoFriend.sender)
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
      }
    }
  }, []);

  const handleAdd = () => {
    makeFriendsDoc.set({
      emailSender: currentUser.email,
      photoSender: currentUser.photoURL,
      nameSender: currentUser.displayName,
      sender: currentUser.uid,
      reciever: infoFriend.uid,
      emailReciever: infoFriend.email,
      photoReciever: infoFriend.photoURL,
      nameReciever: infoFriend.displayName,
    });
    return navigation.goBack();
  };
  const handleMessage = async () => {
    const checkDoc = [`${currentUser.uid}_${infoFriend.uid}`, `${infoFriend.uid}_${currentUser.uid}`];
    let hasMessage = false;
    for (let i = 0; i < checkDoc.length; i++) {
      const getChatRoom = await firestore().collection('ChatRoom').where('chatRoomID', '==', checkDoc[i]).get();

      if (!getChatRoom.empty) {
        const chatGet = getChatRoom.docs[0].data();
        hasMessage = true;
        return navigation.navigate('Chat', {
          dataRoom: chatGet,
          infoFriend: [infoFriend],
        });
      }
    }

    if (!hasMessage) {
      firestore()
        .collection('ChatRoom')
        .doc(`${currentUser.uid}_${infoFriend.uid}`)
        .set({
          chatRoomID: `${currentUser.uid}_${infoFriend.uid}`,
          isGroup: false,
          time: Date.now(),
          usersEmail: [currentUser.email, infoFriend.email],
          usersUid: [currentUser.uid, infoFriend.uid],
        })
        .then(() => {
          return navigation.navigate('Chat', {
            dataRoom: {
              chatRoomID: `${currentUser.uid}_${infoFriend.uid}`,
              isGroup: false,
              time: Date.now(),
              usersEmail: [currentUser.email, infoFriend.email],
              usersUid: [currentUser.uid, infoFriend.uid],
            },
            infoFriend: [infoFriend],
          });
        });
    }
    return toastError('Have some Error!', "Let's report to us!");
  };

  const handleCancel = () => {
    senderFriendDoc.delete();
    return navigation.goBack();
  };
  const handleRefuse = () => {
    recieveFriendDoc.delete();
    return navigation.goBack();
  };
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <TouchableNativeFeedback
          background={TouchableNativeFeedback.Ripple('#123944', true)}
          onPress={() => navigation.goBack()}
        >
          <View style={styles.btnBack}>
            <Ionicons size={25} name="arrow-back" color={GlobalStyles.colors.primary} />
          </View>
        </TouchableNativeFeedback>
        <View style={styles.wrapBasic}>
          <View style={styles.avatar}>
            <Avatar
              size={130}
              image={{
                uri:
                  from === 'request'
                    ? state.addSent
                      ? infoFriend.photoReciever
                      : state.isRecieveRequest && infoFriend.photoSender
                    : infoFriend.photoURL,
                cache: 'force-cache',
              }}
            />
          </View>
          <View style={styles.info}>
            <View>
              <Text numberOfLines={1} style={{ fontFamily: GlobalStyles.fonts.fontBold, color: '#fff', fontSize: 20 }}>
                {from === 'request'
                  ? state.addSent
                    ? infoFriend.nameReciever
                    : state.isRecieveRequest && infoFriend.nameSender
                  : infoFriend.displayName}
              </Text>
              <Text
                numberOfLines={1}
                style={{ marginTop: 5, fontFamily: GlobalStyles.fonts.fontRegular, color: '#fff', fontSize: 14 }}
              >
                {from === 'request'
                  ? state.addSent
                    ? infoFriend.emailReciever
                    : state.isRecieveRequest && infoFriend.emailSender
                  : infoFriend.email}
              </Text>
            </View>
            <View style={styles.wrapaction}>
              {from === 'myFriends' ? (
                <ButtonStatus onPress={handleMessage} iconName={'ios-chatbox'}>
                  Message
                </ButtonStatus>
              ) : (
                from === 'search' &&
                (state.isFriend === false ? (
                  state.isRecieveRequest === false ? (
                    state.addSent === false ? (
                      <ButtonStatus onPress={handleAdd} iconName={'ios-heart-circle'}>
                        Add
                      </ButtonStatus>
                    ) : (
                      <ButtonStatus onPress={handleCancel} iconName={'ios-heart-dislike-circle'}>
                        Cancel
                      </ButtonStatus>
                    )
                  ) : (
                    <ButtonStatus onPress={handleRefuse} iconName={'ios-heart-dislike-circle'}>
                      Refuse
                    </ButtonStatus>
                  )
                ) : (
                  <ButtonStatus onPress={handleMessage} iconName={'ios-chatbox'}>
                    Message
                  </ButtonStatus>
                ))
              )}
              {from === 'request' &&
                (state.addSent ? (
                  <ButtonStatus onPress={handleCancel} iconName={'ios-heart-dislike-circle'}>
                    Cancel
                  </ButtonStatus>
                ) : (
                  state.isRecieveRequest && (
                    <ButtonStatus onPress={handleRefuse} iconName={'ios-heart-dislike-circle'}>
                      Refuse
                    </ButtonStatus>
                  )
                ))}
            </View>
          </View>
        </View>

        <View style={styles.spec}></View>

        <View style={styles.wrapAddvance}>
          <View style={styles.viewAddvance}>
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
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    height: '100%',
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
    backgroundColor: '#B9E0FF',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 50,
    borderColor: '#3F4E4F',
    borderWidth: 1,
    marginVertical: 5,
    paddingHorizontal: 12,
    backgroundColor: '#FFE7BF',
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
export default FriendProfile;
