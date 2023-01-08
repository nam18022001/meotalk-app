import firestore from '@react-native-firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';

import useAuthContext from '../hooks/useAuthContext';
import HeaderChat from './components/Header';
import Input from './components/Input';
import Message from './components/Message';

function Chat({ navigation, route }) {
  const { idChatRoom, infoFriend } = route.params;
  const currentUser = useAuthContext();

  const [lastSttRead, setLastSttRead] = useState(0);
  const [lastStt, setLastStt] = useState(0);
  const [messages, setMessages] = useState([]);
  const [sizeMess, setSizeMess] = useState(0);
  const [checkFriendInCall, setCheckFriendInCall] = useState();
  // const [checkImInCall, setCheckImInCall] = useState();

  useEffect(() => {
    firestore()
      .collection('ChatRoom')
      .doc(idChatRoom)
      .collection('chats')
      .orderBy('stt', 'desc')
      .onSnapshot((snapGetMessage) => {
        if (snapGetMessage.size > 0) {
          setSizeMess(snapGetMessage.size);
        }
        if (!snapGetMessage.empty) {
          const chats = [];
          const lastSttRead = [];
          snapGetMessage.forEach((res) => {
            if (res.data().isRead === true) {
              lastSttRead.push(res.data().stt);
            }
            chats.push(res.data());
          });
          setLastSttRead(lastSttRead[0]);
          setLastStt(chats[0].stt);
          setMessages(chats);
        } else {
          setMessages([]);
        }
      });
  }, [idChatRoom]);

  useFocusEffect(
    useCallback(() => {
      const readMessage = () =>
        firestore()
          .collection('ChatRoom')
          .doc(idChatRoom)
          .collection('chats')
          .where('sendBy', '!=', currentUser.email)
          .get()
          .then((allUnRead) => {
            allUnRead.forEach((res) => {
              firestore().collection('ChatRoom').doc(idChatRoom).collection('chats').doc(res.id).update({
                isRead: true,
              });
            });
          });

      return () => readMessage();
    }, [sizeMess]),
  );

  useEffect(() => {
    firestore()
      .collection('call')
      .where('callerUid', '==', infoFriend.uid)
      .onSnapshot((resFriendCall) => {
        if (resFriendCall.empty) {
          setCheckFriendInCall(false);
        } else {
          setCheckFriendInCall(true);
        }
      });
    firestore()
      .collection('call')
      .where('recieverUid', '==', infoFriend.uid)
      .onSnapshot((resFriendCall) => {
        if (resFriendCall.empty) {
          setCheckFriendInCall(false);
        } else {
          setCheckFriendInCall(true);
        }
      });
  }, []);

  const handleCallVideo = async () => {
    if (checkFriendInCall === false) {
      // set up config token
      const channelName = idChatRoom;

      const uidCaller = Math.floor(Math.random() * 100000);
      const uidReciever = uidCaller + 1000;
      const role = 1;
      const expirationTimeInSeconds = 3600;
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

      // build token caller
      let serverUrl = 'https://meotalk-token-agora.vercel.app/rtc/';
      const responseCaller = await fetch(
        serverUrl + channelName + '/' + role + '/uid/' + uidCaller + '/?expiry=' + privilegeExpiredTs,
      );
      const dataCaller = await responseCaller.json();
      const tokenCaller = dataCaller.rtcToken;

      // build token reciever

      const responseReiever = await fetch(
        serverUrl + channelName + '/' + role + '/uid/' + uidReciever + '/?expiry=' + privilegeExpiredTs,
      );
      const dataReciever = await responseReiever.json();
      const tokenReciever = dataReciever.rtcToken;
      console.log(uidCaller + ': ' + tokenCaller);
      console.log(uidReciever + ': ' + tokenReciever);

      firestore().collection('call').doc(idChatRoom).set({
        callerId: uidCaller,
        callerUid: currentUser.uid,
        callerName: currentUser.displayName,
        callerAvatar: currentUser.photoURL,
        recieverId: uidReciever,
        recieverUid: infoFriend.uid,
        receiverName: infoFriend.displayName,
        receiverAvatar: infoFriend.photoUrl,

        hasDialled: false,
        deleteCall: false,
        channelName: channelName,
        tokenCaller: tokenCaller,
        tokenReciever: tokenReciever,
        type: 'video',
      });
      return navigation.navigate('VideoCall', {
        idCall: channelName,
        token: tokenCaller,
        uid: uidCaller,
        friendAvatar: infoFriend.photoUrl,
        friendName: infoFriend.displayName,
      });
    } else {
      return Alert.alert('Wait a minute', 'Your Friend is in a Call please try again later', [
        { text: 'OK', onPress: () => {}, style: 'cancel' },
      ]);
    }
  };

  const renderItem = ({ item }) => (
    <Message
      data={item.message}
      own={item.sendBy === currentUser.email ? true : false}
      type={item.type}
      seenImg={infoFriend.photoUrl}
      seen={item.stt === lastSttRead ? true : false}
      isRead={item.isRead}
      marginBottom={item.stt === lastStt ? true : false}
    />
  );
  return (
    <View style={styles.wrapper}>
      {/* {videoCall ? <AgoraUIKit rtcProps={connectionData} callbacks={callbacks} /> : null} */}
      <HeaderChat navigation={navigation} userFriend={infoFriend} onPressCallVideo={handleCallVideo} />
      <View style={styles.messages}>
        <FlatList inverted data={messages} renderItem={renderItem} keyExtractor={(item) => item.stt} />
      </View>

      <Input chatRoomId={idChatRoom} />
    </View>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    height: '100%',
    backgroundColor: 'white',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  messages: {
    flex: 1,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 10,
  },
});
export default Chat;
