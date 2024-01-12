import firestore from '@react-native-firebase/firestore';
import { createContext, useEffect, useState } from 'react';
import useAuthContext from '../hooks/useAuthContext';

export const PreLoadContext = createContext();

export const PreLoadContextProvider = ({ children }) => {
  const currentUser = useAuthContext();

  const [chatRoomInfo, setChatRoomInfo] = useState([]);
  const [listPrivateInfo, setListPrivateInfo] = useState([]);
  const [countUnReadPrivate, setCountUnReadPrivate] = useState(0);

  useEffect(() => {
    if (Object.keys(currentUser).length > 0) {
      firestore()
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
    }
  }, [currentUser]);

  useEffect(() => {
    if (Object.keys(currentUser).length > 0) {
      firestore()
        .collection('ChatPrivate')
        .where('usersEmail', 'array-contains', currentUser.email)
        .orderBy('time', 'desc')
        .onSnapshot((snapChatRoom) => {
          const chatRoom = [];
          let countUnseen = 0;
          if (!snapChatRoom.empty) {
            snapChatRoom.docs.map((res) => {
              chatRoom.push(res.data());
              if (res.data().sender === currentUser.uid) {
                countUnseen = countUnseen + res.data().unSeenSender;
              } else if (res.data().reciever === currentUser.uid) {
                countUnseen = countUnseen + res.data().unSeenReciever;
              } else {
                countUnseen = 0;
              }
            });
            setCountUnReadPrivate(countUnseen);
            setListPrivateInfo(chatRoom);
          }
        });
    }
  }, [currentUser]);

  return (
    <PreLoadContext.Provider value={{ chatRoomInfo, listPrivateInfo, countUnReadPrivate }}>
      {children}
    </PreLoadContext.Provider>
  );
};
