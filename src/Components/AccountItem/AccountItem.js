import { ActivityIndicator, Avatar, Button } from '@react-native-material/core';
import { useEffect, useLayoutEffect, useState } from 'react';
import { StyleSheet, Text, TouchableNativeFeedback, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';

import GlobalStyles from '../GlobalStyles';
import { toastError } from '../../hooks/useToast';
import useAuthContext from '../../hooks/useAuthContext';

function MyButton(text, onPress) {
  return (
    <TouchableNativeFeedback background={TouchableNativeFeedback.Ripple('#123944', true)} onPress={onPress}>
      <View style={styles.btn}>
        <Text style={[styles.textBtn, { textDecorationLine: 'underline' }]}>{text}</Text>
      </View>
    </TouchableNativeFeedback>
  );
}

function AccountItem({ navigation, data, beFriend = false }) {
  const currentUser = useAuthContext();
  const [addSent, setAddSent] = useState();
  const [isRecieveRequest, setIsRecieveRequest] = useState();
  const [isFriend, setIsFriend] = useState();

  const [show, setShow] = useState(false);

  // Doc

  const friendsDoc = firestore().collection('users').doc(currentUser.uid).collection('friends').doc(data.uid);
  const makeFriendsDoc = firestore().collection('makeFriends').doc(`${currentUser.uid}_${data.uid}`);
  const recieveFriendDoc = firestore().collection('makeFriends').doc(`${data.uid}_${currentUser.uid}`);
  useLayoutEffect(() => {
    if (!beFriend) {
      setShow(false);
      const friend = async () => {
        // check is friend
        const docSnap = await friendsDoc.get();
        if (docSnap.exists) {
          setIsFriend(true);
        } else {
          setIsFriend(false);
        }

        // check is send request friend

        makeFriendsDoc.onSnapshot((friendSnap) => {
          friendSnap.exists ? setAddSent(true) : setAddSent(false);
        });

        firestore()
          .collection('makeFriends')
          .where('reciever', '==', currentUser.uid)
          .where('sender', '==', data.uid ? data.uid : '')
          .onSnapshot((requestSnap) => {
            !requestSnap.empty ? setIsRecieveRequest(true) : setIsRecieveRequest(false);
          });
      };
      // let timeout;
      async function handle() {
        await friend();
        setShow(true);
        // timeout = setTimeout(() => {}, 200);
      }
      handle();
    } else {
      setIsFriend(true);
      setShow(true);
    }
  }, [data]);

  const handleAdd = () => {
    setAddSent(true);
    makeFriendsDoc.set({
      emailSender: currentUser.email,
      photoSender: currentUser.photoURL,
      nameSender: currentUser.displayName,
      sender: currentUser.uid,
      reciever: data.uid,
      emailReciever: data.email,
      photoReciever: data.photoURL,
      nameReciever: data.displayName,
    });
  };
  const handleAccept = async () => {
    setIsFriend(true);
    friendsDoc.set({
      uid: data.uid,
      displayName: data.displayName,
      email: data.email,
      photoURL: data.photoURL,
    });
    firestore().collection('users').doc(data.uid).collection('friends').doc(currentUser.uid).set({
      uid: currentUser.uid,
      displayName: currentUser.displayName,
      email: currentUser.email,
      photoURL: currentUser.photoURL,
    });
    recieveFriendDoc.delete();
  };
  const handleMessage = async () => {
    const checkDoc = [`${currentUser.uid}_${data.uid}`, `${data.uid}_${currentUser.uid}`];
    let hasMessage = false;
    for (let i = 0; i < checkDoc.length; i++) {
      const getChatRoom = await firestore().collection('ChatRoom').where('chatRoomID', '==', checkDoc[i]).get();

      if (!getChatRoom.empty) {
        const chatGet = getChatRoom.docs[0].data();

        hasMessage = true;

        return navigation.navigate('Chat', {
          dataRoom: chatGet,
          infoFriend: [data],
        });
      }
    }

    if (!hasMessage) {
      firestore()
        .collection('ChatRoom')
        .doc(`${currentUser.uid}_${data.uid}`)
        .set({
          chatRoomID: `${currentUser.uid}_${data.uid}`,
          isGroup: false,
          time: Date.now(),
          usersEmail: [currentUser.email, data.email],
          usersUid: [currentUser.uid, data.uid],
        })
        .then(() => {
          return navigation.navigate('Chat', {
            dataRoom: {
              chatRoomID: `${currentUser.uid}_${data.uid}`,
              isGroup: false,
              time: Date.now(),
              usersEmail: [currentUser.email, data.email],
              usersUid: [currentUser.uid, data.uid],
            },
            infoFriend: [data],
          });
        });
    }
    return toastError('Have some Error!', "Let's report to us!");
  };

  const handleGotoProfile = () => {
    return navigation.navigate('ProfileFriend', {
      infoFriend: data,
      from: beFriend === false ? 'search' : 'myFriends',
      state: {
        addSent: addSent,
        isFriend: isFriend,
        isRecieveRequest: isRecieveRequest,
      },
    });
  };
  return show ? (
    <TouchableNativeFeedback
      background={TouchableNativeFeedback.Ripple('rgba(34,34,34,0.3)', false)}
      onPress={handleGotoProfile}
    >
      <View style={styles.wrapper}>
        <Avatar image={{ uri: data.photoURL ? data.photoURL : undefined }} />
        <View style={styles.info}>
          <Text numberOfLines={1} style={{ fontFamily: GlobalStyles.fonts.fontSemiBold, fontSize: 16 }}>
            {data.displayName}
          </Text>
          <Text numberOfLines={1} style={{ fontFamily: GlobalStyles.fonts.fontRegular, fontSize: 13 }}>
            {data.email}
          </Text>
        </View>

        <View style={styles.actions}>
          {isFriend === false ? (
            isRecieveRequest === false ? (
              addSent === false ? (
                <View style={styles.wrapActions}>
                  <TouchableNativeFeedback
                    background={TouchableNativeFeedback.Ripple('#123944', true)}
                    onPress={handleAdd}
                  >
                    <View style={styles.btn}>
                      <Text style={[styles.textBtn, { color: '#fff' }]}>Add</Text>
                    </View>
                  </TouchableNativeFeedback>
                </View>
              ) : (
                <View style={[styles.btn, { flex: 1 }]}>
                  <Ionicons size={30} name="checkmark-circle" color="#7ac142" />
                </View>
              )
            ) : (
              MyButton('Accept', handleAccept)
            )
          ) : (
            MyButton('Message', handleMessage)
          )}
        </View>
      </View>
    </TouchableNativeFeedback>
  ) : (
    <ActivityIndicator
      style={[styles.wrapper, { justifyContent: 'center', alignItems: 'center' }]}
      size={30}
      color={GlobalStyles.colors.primary}
    />
  );
}

function AccountItemRequest({ navigation, data, sent = false, request = false }) {
  const currentUser = useAuthContext();
  const friendsDoc = firestore().collection('users').doc(currentUser.uid).collection('friends').doc(data.sender);
  const recieveFriendDoc = firestore().collection('makeFriends').doc(`${data.sender}_${currentUser.uid}`);
  const handleAccept = () => {
    friendsDoc.set({
      uid: data.sender,
      displayName: data.nameSender,
      email: data.emailSender,
      photoURL: data.photoSender,
    });
    firestore().collection('users').doc(data.sender).collection('friends').doc(currentUser.uid).set({
      uid: currentUser.uid,
      displayName: currentUser.displayName,
      email: currentUser.email,
      photoURL: currentUser.photoURL,
    });
    recieveFriendDoc.delete();
  };
  const handleGotoProfile = () => {
    return navigation.navigate('ProfileFriend', {
      infoFriend: data,
      from: 'request',
      state: {
        addSent: sent,
        // isFriend: '',
        isRecieveRequest: request,
      },
    });
  };

  return (
    <TouchableNativeFeedback
      background={TouchableNativeFeedback.Ripple('rgba(34,34,34,0.3)', false)}
      onPress={handleGotoProfile}
    >
      <View style={styles.wrapper}>
        <Avatar image={{ uri: request ? data.photoSender : data.photoReciever }} />
        <View style={styles.info}>
          <Text numberOfLines={1} style={{ fontFamily: GlobalStyles.fonts.fontSemiBold, fontSize: 16 }}>
            {request ? data.nameSender : data.nameReciever}
          </Text>
          <Text numberOfLines={1} style={{ fontFamily: GlobalStyles.fonts.fontRegular, fontSize: 13 }}>
            {request ? data.emailSender : data.emailReciever}
          </Text>
        </View>

        <View style={styles.actions}>
          {request === false ? (
            <View style={[styles.btn, { flex: 1 }]}>
              <Ionicons size={30} name="checkmark-circle" color="#7ac142" />
            </View>
          ) : (
            MyButton('Accept', handleAccept)
          )}
        </View>
      </View>
    </TouchableNativeFeedback>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    padding: 20,
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  info: {
    flexDirection: 'column',
    flex: 1,
    marginLeft: 15,
  },
  converseInbox: {
    flexDirection: 'row',
  },
  preLastMess: {
    flexDirection: 'row',
    flex: 0.65,
  },
  text: {
    fontFamily: GlobalStyles.fonts.fontRegular,
    fontSize: 13,
  },
  actions: {
    flex: 0.5,
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  wrapActions: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: GlobalStyles.colors.primary,
  },
  textBtn: {
    fontFamily: GlobalStyles.fonts.fontSemiBold,
    fontSize: 16,
  },
});
export { AccountItemRequest };
export default AccountItem;
