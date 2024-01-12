import firestore from '@react-native-firebase/firestore';

export const makeNewConversation = async ({ usersEmail, usersUid, chatRoomId, isGroup = false }) => {
  return await firestore()
    .collection('ChatRoom')
    .doc(chatRoomId)
    .set({
      chatRoomID: `${chatRoomId}`,
      chatRoomName: isGroup && '',
      time: Date.now(),
      isGroup: isGroup,
      usersEmail: usersEmail,
      usersUid: usersUid,
    });
};
export const makeNewConversationPrivate = async ({
  usersEmail,
  usersUid,
  usersPhoto,
  usersDisplayName,
  chatRoomId,
  sender,
  reciever,
  key,
}) => {
  return await firestore()
    .collection('ChatPrivate')
    .doc(chatRoomId)
    .set({
      chatRoomID: `${chatRoomId}`,
      time: Date.now(),
      isGroup: false,
      usersEmail: usersEmail,
      usersUid: usersUid,
      usersPhoto,
      usersDisplayName,
      isAccepted: false,
      sender,
      reciever,
      key,
      unSeenReciever: 1,
      unSeenSender: 0,
    });
};
