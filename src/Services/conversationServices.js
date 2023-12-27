import { collectChats, docUsers } from './generalFirestoreServices';

export const usersInfo = async ({ data, currentUser }) => {
  let infoUsers = [];
  for (let i = 0; i < data.usersUid.length; i++) {
    if (data.usersUid[i] !== currentUser.uid) {
      const uid = data.usersUid[i];
      const getUserDoc = docUsers(uid);
      const getUserInfo = await getUserDoc.get();
      getUserInfo.exists && infoUsers.push(getUserInfo.data());
    }
  }
  return infoUsers;
};
export const getCollectionChatRoom = ({ chatRoomId }) => {
  const getCollectionMess = collectChats(chatRoomId).orderBy('time', 'desc');

  return getCollectionMess;
};
export const addFirstMessage = async ({
  collectChat,
  data,
  currentUser,
  image = false,
  isGroup = false,
  call = false,
  callVideo = false,
  photoSender = '',
}) => {
  return await collectChat.add({
    isRead: isGroup ? [] : false,
    message: data,
    sendBy: currentUser.email,
    stt: 0,
    time: Date.now(),
    type: image ? 'image' : call ? 'call' : callVideo ? 'videoCall' : 'message',
    photoSender: isGroup && photoSender,
  });
};

export const addMessage = async ({
  collectChat,
  data,
  currentUser,
  dataLast,
  image = false,
  call = false,
  isGroup = false,
  callVideo = false,
  photoSender = '',
}) => {
  return await collectChat.add({
    isRead: isGroup ? [] : false,
    message: data,
    sendBy: currentUser.email,
    stt: dataLast.stt + 1,
    time: Date.now(),
    type: image ? 'image' : call ? 'call' : callVideo ? 'videoCall' : 'message',
    photoSender: isGroup && photoSender,
  });
};

export const getlastMessage = async ({ collectChat }) => {
  const orderStt = collectChat.orderBy('stt', 'desc');

  const getOrderStt = await orderStt.get();

  const lastVisible = getOrderStt.docs[0];
  const dataLast = lastVisible.data();

  return dataLast;
};
