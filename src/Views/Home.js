import firestore from '@react-native-firebase/firestore';
import { memo, useEffect, useState } from 'react';
import { ScrollView } from 'react-native';

import ConverseItem from '../Components/ConverseItem';
import useAuthContext from '../hooks/useAuthContext';

function Home({ navigation }) {
  const currentUser = useAuthContext();

  const [chatRoomInfo, setChatRoomInfo] = useState([]);

  useEffect(() => {
    const subscriber = firestore()
      .collection('ChatRoom')
      .where('usersEmail', 'array-contains', currentUser.email)
      .orderBy('time', 'desc')
      .onSnapshot((snapChatRoom) => {
        const chatRoom = [];
        if (!snapChatRoom.empty) {
          snapChatRoom.forEach((res) => {
            chatRoom.push(res.data());
          });
          setChatRoomInfo(chatRoom);
        }
      });

    return () => subscriber();
  }, []);
  return (
    <ScrollView style={{ backgroundColor: 'white', flex: 1, paddingTop: 10 }}>
      {chatRoomInfo.map((infoRoom, index) => (
        <ConverseItem key={index} data={infoRoom} navigation={navigation} />
      ))}
    </ScrollView>
  );
}

export default memo(Home);
