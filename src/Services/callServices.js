import config from '../configs';
import firestore from '@react-native-firebase/firestore';

export const getTokenCallerAndRevicer = async ({ channelName, userInfo }) => {
  const uidCaller = Number(Math.floor(Math.random() * 100000));
  const role = 1;
  const expirationTimeInSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
  let uidReciever = [];
  let tokenReciever = [];

  // build token caller
  const responseCaller = await fetch(
    config.configAgora.serverTokenUrl +
      channelName +
      '/' +
      role +
      '/uid/' +
      uidCaller +
      '/?expiry=' +
      privilegeExpiredTs,
  );
  const dataCaller = await responseCaller.json();
  const tokenCaller = dataCaller.rtcToken;

  // build token reciever
  for (let i = 0; i < userInfo.length; i++) {
    const id = uidCaller + 1000 + i;
    uidReciever.push(id);
    const responseReiever = await fetch(
      config.configAgora.serverTokenUrl + channelName + '/' + role + '/uid/' + id + '/?expiry=' + privilegeExpiredTs,
    );
    const dataReciever = await responseReiever.json();
    tokenReciever.push(dataReciever.rtcToken);
  }

  return { tokenCaller, tokenReciever, uidCaller, uidReciever };
};

export const checkCallExist = ({ uid }) => {
  const collectCall = firestore().collection('call');

  const qCall = [
    collectCall.where('callerUid', '==', uid),
    collectCall.where('recieverUid', '==', uid),
    collectCall.where('recieverUid', 'array-contains', uid),
  ];

  return qCall;
};
export const addCallMessages = async ({
  isGroup = false,
  chatRoomId,
  uidCaller,
  currentUser,
  userInfo,
  channelName,
  channelCall,
  tokenCaller,
  tokenReciever,
  uidReciever,
  voiceCall = false,
}) => {
  if (isGroup) {
    let groupRecieverUid = [];
    let groupReceiverName = [];
    let groupReceiverEmail = [];
    let groupReceiverAvatar = [];

    for (let i = 0; i < userInfo.length; i++) {
      groupRecieverUid.push(userInfo[i].uid);
      groupReceiverName.push(userInfo[i].displayName);
      groupReceiverEmail.push(userInfo[i].email);
      groupReceiverAvatar.push(userInfo[i].photoURL);
    }

    return (
      userInfo.length > 1 &&
      (await firestore()
        .collection('call')
        .doc(chatRoomId)
        .set({
          callerId: uidCaller,
          callerUid: currentUser.uid,
          callerName: currentUser.displayName,
          callerEmail: currentUser.email,
          callerAvatar: currentUser.photoURL,
          recieverId: uidReciever,
          recieverUid: groupRecieverUid,
          receiverName: groupReceiverName,
          receiverEmail: groupReceiverEmail,
          receiverAvatar: groupReceiverAvatar,
          hasDialled: [currentUser.uid],
          cancelDialled: [],
          deleteCall: false,
          channelName: channelName,
          channelCall: channelCall,
          tokenCaller: tokenCaller,
          tokenReciever: tokenReciever,
          type: voiceCall ? 'voice' : 'video',
          isGroup: true,
        }))
    );
  } else {
    return await firestore()
      .collection('call')
      .doc(chatRoomId)
      .set({
        callerId: uidCaller,
        callerUid: currentUser.uid,
        callerEmail: currentUser.email,
        callerName: currentUser.displayName,
        callerAvatar: currentUser.photoURL,
        recieverId: uidReciever[0],
        recieverUid: userInfo[0].uid,
        receiverEmail: userInfo[0].email,
        receiverName: userInfo[0].displayName,
        receiverAvatar: userInfo[0].photoURL,
        hasDialled: false,
        deleteCall: false,
        channelName: channelName,
        channelCall: channelCall,
        tokenCaller: tokenCaller,
        tokenReciever: tokenReciever[0],
        type: voiceCall ? 'voice' : 'video',
        isGroup: false,
      });
  }
};
