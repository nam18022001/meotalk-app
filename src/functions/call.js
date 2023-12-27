import CryptoJS from 'crypto-js';
import { addCallMessages, checkCallExist, getTokenCallerAndRevicer } from '../Services/callServices';
import { Alert } from 'react-native';
import { toastError } from '../hooks/useToast';
import sendNotifiCation from '../hooks/useSendNotification';
import config from '../configs';

const handleCallVideo = async ({ chatRoomId, userInfo, currentUser, setPressCall, navigation, groupName }) => {
  const channelCall = CryptoJS.MD5(chatRoomId).toString();
  const channelName = chatRoomId;

  setPressCall(true);
  if (userInfo.length > 1) {
    let parnerInCall = false;
    for (let i = 0; i < userInfo.length; i++) {
      let check;
      const qCall = checkCallExist({ uid: userInfo[i].uid });
      for (let j = 0; j < qCall.length; j++) {
        const abc = await qCall[j].get();
        if (abc.empty === false) {
          if (abc.docs[0].data().isGroup === true) {
            if (abc.docs[0].data().cancelDialled.filter((v) => v === userInfo[i].uid).length === 0) {
              parnerInCall = true;
              check = true;
              break;
            }
          } else if (
            (abc.docs[0].data().isGroup === false || abc.docs[0].data().isGroup === undefined) &&
            typeof abc.docs[0].data().hasDialled === 'boolean'
          ) {
            parnerInCall = true;
            check = true;
            break;
          }
        }
      }
      if (check === true) {
        break;
      }
    }

    if (!parnerInCall) {
      let friendsInfo = [];

      const objToken = await getTokenCallerAndRevicer({
        channelName: channelCall,
        userInfo,
      });
      await addCallMessages({
        chatRoomId,
        uidCaller: objToken.uidCaller,
        uidReciever: objToken.uidReciever,
        currentUser,
        tokenCaller: objToken.tokenCaller,
        tokenReciever: objToken.tokenReciever,
        channelName,
        channelCall,
        userInfo: userInfo,
        isGroup: true,
      });
      for (let u = 0; u < userInfo.length; u++) {
        friendsInfo.push({
          id: objToken.uidReciever[u],
          photoURL: userInfo[u].photoURL,
          displayName: userInfo[u].displayName,
          uid: userInfo[u].uid,
        });
      }
      sendNotifiCation({ call: 'calling', chatRoomId: channelName, infoFriend: userInfo, currentUser });
      setPressCall(false);

      return navigation.navigate(config.routes.videoCallGroup, {
        idCall: channelName,
        channelCall: channelCall,
        token: objToken.tokenCaller,
        uid: objToken.uidCaller,
        friendsInfo,
        groupName,
        reciever: false,
      });
    } else {
      toastError(`Someone in a Call`);
      return setPressCall(false);
    }
  } else {
    let parnerInCall = false;

    const qCall = checkCallExist({ uid: userInfo[0].uid });

    for (let i = 0; i < qCall.length; i++) {
      const abc = await qCall[i].get();
      if (abc.empty === false) {
        if (abc.docs[0].data().isGroup === true) {
          if (abc.docs[0].data().cancelDialled.filter((v) => v === userInfo[0].uid).length === 0) {
            parnerInCall = true;
            check = true;
            break;
          }
        } else if (
          (abc.docs[0].data().isGroup === false || abc.docs[0].data().isGroup === undefined) &&
          typeof abc.docs[0].data().hasDialled === 'boolean'
        ) {
          parnerInCall = true;
          check = true;
          break;
        }
      }
    }
    if (!parnerInCall) {
      const { tokenCaller, tokenReciever, uidCaller, uidReciever } = await getTokenCallerAndRevicer({
        channelName: channelCall,
        userInfo,
      });
      await addCallMessages({
        isGroup: false,
        userInfo,
        channelCall,
        channelName,
        chatRoomId,
        currentUser,
        tokenCaller,
        tokenReciever,
        uidCaller,
        uidReciever,
      });

      sendNotifiCation({ call: 'calling', chatRoomId: channelName, infoFriend: userInfo, currentUser });
      setPressCall(false);
      return navigation.navigate(config.routes.videoCall, {
        idCall: channelName,
        channelCall: channelCall,
        token: tokenCaller,
        uid: uidCaller,
        friendAvatar: userInfo[0].photoURL,
        friendName: userInfo[0].displayName,
        reciever: false,
      });
    } else {
      toastError(`${userInfo[0].displayName} in a Call`);
      return setPressCall(false);
    }
  }
};

export { handleCallVideo };
