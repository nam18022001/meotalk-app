import firestore from '@react-native-firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

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
      <HeaderChat navigation={navigation} userFriend={infoFriend} />
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
