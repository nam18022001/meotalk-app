import firestore from '@react-native-firebase/firestore';
import { createContext, useEffect, useState } from 'react';
import useAuthContext from '../hooks/useAuthContext';

export const PreLoadContext = createContext();

export const PreLoadContextProvider = ({ children }) => {
  const currentUser = useAuthContext();

  const [chatRoomInfo, setChatRoomInfo] = useState([]);

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

  return <PreLoadContext.Provider value={{ chatRoomInfo }}>{children}</PreLoadContext.Provider>;
};
