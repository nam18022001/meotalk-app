import firestore from '@react-native-firebase/firestore';

export const docUsers = (uid) => {
  return firestore().collection('users').doc(uid);
};

export const docChatRoom = (idChatRoom) => {
  return firestore().collection('ChatRoom').doc(idChatRoom);
};
export const collectChats = (chatRoomID) => {
  return firestore().collection('ChatRoom').doc(chatRoomID).collection('chats');
};
