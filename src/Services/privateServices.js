import firestore from '@react-native-firebase/firestore';

const addPrivateMessage = async ({ chatRoomID, data, currentUser, image = false, notification = false }) => {
  return await firestore()
    .collection('ChatPrivate')
    .doc(chatRoomID)
    .collection('chats')
    .add({
      isRead: false,
      message: data,
      sendBy: currentUser.email,
      time: Date.now(),
      type: image ? 'image' : notification ? 'notification' : 'message',
    });
};
export { addPrivateMessage };
