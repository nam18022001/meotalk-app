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
