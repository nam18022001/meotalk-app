import firestore from '@react-native-firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';

import sendNotifiCation from '../hooks/useSendNotification';
import HeaderChat from './components/Header';
import Input from './components/Input';
import Message from './components/Message';
import ModelInput from '../Components/Modal/ModalInput';
import { toastError, toastWarning } from '../hooks/useToast';
import { handleCallVideo, handleCallVoice } from '../functions/call';
import useAuthContext from '../hooks/useAuthContext';
import useCallContext from '../hooks/useCallContext';

function Chat({ navigation, route }) {
  const { dataRoom, infoFriend } = route.params;
  const currentUser = useAuthContext();
  const { setPressCall } = useCallContext();

  const [lastSttRead, setLastSttRead] = useState(0);
  const [lastStt, setLastStt] = useState(0);
  const [messages, setMessages] = useState([]);
  const [sizeMess, setSizeMess] = useState(0);
  const [checkFriendInCall, setCheckFriendInCall] = useState();

  const [valueChangeNameGroup, setValueChangeNameGroup] = useState('');
  const [chatRoomName, setChatRoomName] = useState('');

  const [isModalVisible, setModalVisible] = useState(false);
  useEffect(() => {
    const getMess = async () => {
      firestore()
        .collection('ChatRoom')
        .doc(dataRoom.chatRoomID)
        .collection('chats')
        .orderBy('stt', 'desc')
        .onSnapshot((snapGetMessage) => {
          if (snapGetMessage.size > 0) {
            setSizeMess(snapGetMessage.size);
          }
          if (!snapGetMessage.empty) {
            if (dataRoom.isGroup !== undefined && dataRoom.isGroup === false) {
              let chats = [];
              let lastSttRead = [];
              snapGetMessage.forEach((res) => {
                if (res.data().isRead === true) {
                  lastSttRead.push(res.data().stt);
                }
                chats.push(res.data());
              });
              setLastSttRead(lastSttRead[0]);
              setLastStt(chats[0].stt);
              setMessages(chats);
            } else {
              let chats = [];
              let lastSttRead = [];
              snapGetMessage.forEach((res) => {
                if (res.data().isRead.length > 0) {
                  lastSttRead.push(res.data());
                }
                chats.push(res.data());
              });

              setLastStt(lastSttRead.length > 0 ? (lastSttRead[0].stt !== undefined ? lastSttRead[0].stt : 0) : 0);
              setLastSttRead(lastSttRead[0]);
              setMessages(chats);
            }
          } else {
            setMessages([]);
          }
        });
    };

    getMess();
  }, [dataRoom]);

  useFocusEffect(
    useCallback(() => {
      const readMessage = () => {
        if (infoFriend.length > 0) {
          if (infoFriend.length > 1 && dataRoom.isGroup !== undefined && dataRoom.isGroup === true) {
            firestore()
              .collection('ChatRoom')
              .doc(dataRoom.chatRoomID)
              .collection('chats')
              .where('sendBy', '!=', currentUser.email)
              .get()
              .then((unReadGroup) => {
                if (!unReadGroup.empty) {
                  unReadGroup.forEach((res) => {
                    if (res.data().isRead.filter((read) => read.seenBy === currentUser.email).length === 0) {
                      firestore()
                        .collection('ChatRoom')
                        .doc(dataRoom.chatRoomID)
                        .collection('chats')
                        .doc(res.id)
                        .update({
                          isRead: [
                            ...res.data().isRead,
                            {
                              seenBy: currentUser.email,
                              photoURL: currentUser.photoURL,
                            },
                          ],
                        });
                    }
                  });
                }
              });
          } else {
            firestore()
              .collection('ChatRoom')
              .doc(dataRoom.chatRoomID)
              .collection('chats')
              .where('sendBy', '!=', currentUser.email)
              .get()
              .then((allUnRead) => {
                allUnRead.forEach((res) => {
                  firestore().collection('ChatRoom').doc(dataRoom.chatRoomID).collection('chats').doc(res.id).update({
                    isRead: true,
                  });
                });
              });
          }
        }
      };
      return () => readMessage();
    }, [sizeMess, dataRoom, infoFriend]),
  );

  useEffect(() => {
    if (dataRoom.isGroup !== undefined && !dataRoom.isGroup) {
      firestore()
        .collection('call')
        .where('callerUid', '==', infoFriend[0].uid)
        .onSnapshot((resFriendCall) => {
          if (resFriendCall.empty) {
            setCheckFriendInCall(false);
          } else {
            setCheckFriendInCall(true);
          }
        });
      firestore()
        .collection('call')
        .where('recieverUid', '==', infoFriend[0].uid)
        .onSnapshot((resFriendCall) => {
          if (resFriendCall.empty) {
            setCheckFriendInCall(false);
          } else {
            setCheckFriendInCall(true);
          }
        });
    } else {
    }
  }, [dataRoom]);

  useEffect(() => {
    async function _getname() {
      if (Object.keys(dataRoom).length > 0) {
        firestore()
          .collection('ChatRoom')
          .doc(dataRoom.chatRoomID)
          .onSnapshot((res) => {
            if (res.exists) {
              if (res.data().isGroup === true) {
                setChatRoomName(res.data().chatRoomName);
              } else {
                setChatRoomName('');
              }
            }
          });
      }
    }
    _getname();
  }, [dataRoom]);

  const handleClickRenameGroup = async () => {
    if (valueChangeNameGroup.trim()) {
      if (valueChangeNameGroup.trim().length > 7) {
        await firestore().collection('ChatRoom').doc(dataRoom.chatRoomID).update({
          chatRoomName: valueChangeNameGroup.trim(),
        });
        setValueChangeNameGroup('');
        setModalVisible(false);
      } else {
        toastWarning('Name must be greater than 6 characters');
      }
    } else {
      toastError('Name is INVALID');
    }
  };
  const handleClickCancelRenameGroup = () => {
    setValueChangeNameGroup('');
    setModalVisible(false);
  };

  const handleClickRemovenameGroup = async () => {
    await firestore().collection('ChatRoom').doc(dataRoom.chatRoomID).update({
      chatRoomName: '',
    });
    setValueChangeNameGroup('');
    setModalVisible(false);
  };

  const renderItem = ({ item }) => {
    if (dataRoom.isGroup !== undefined && !dataRoom.isGroup) {
      return (
        <Message
          data={item.message}
          own={item.sendBy === currentUser.email ? true : false}
          type={item.type}
          seenImg={infoFriend[0].photoURL}
          seen={item.stt === lastStt ? true : false}
          isRead={item.isRead}
          marginBottom={item.stt === lastStt ? true : false}
        />
      );
    } else {
      return (
        <Message
          data={item.message}
          isGroup={true}
          own={item.sendBy === currentUser.email ? true : false}
          type={item.type}
          seenGroup={item.isRead}
          seen={item.stt === lastStt ? true : false}
          isRead={item.isRead}
          photoSender={item.photoSender}
          marginBottom={item.stt === lastStt ? true : false}
        />
      );
    }
  };
  return (
    <View style={styles.wrapper}>
      <HeaderChat
        navigation={navigation}
        userFriend={infoFriend}
        onPressCallVoice={() =>
          handleCallVoice({
            chatRoomId: dataRoom.chatRoomID,
            userInfo: infoFriend,
            currentUser,
            setPressCall: setPressCall,
            navigation,
            groupName:
              chatRoomName && chatRoomName.length > 0
                ? chatRoomName
                : infoFriend.map((info, index) => info.displayName + `${index === infoFriend.length - 1 ? '' : ', '} `),
          })
        }
        onPressCallVideo={() =>
          handleCallVideo({
            chatRoomId: dataRoom.chatRoomID,
            userInfo: infoFriend,
            currentUser,
            setPressCall: setPressCall,
            navigation,
            groupName:
              chatRoomName && chatRoomName.length > 0
                ? chatRoomName
                : infoFriend.map((info, index) => info.displayName + `${index === infoFriend.length - 1 ? '' : ', '} `),
          })
        }
        isGroup={dataRoom.isGroup !== undefined ? dataRoom.isGroup : false}
        chatRoomName={chatRoomName}
        onChangeNameGroup={() => setModalVisible(true)}
      />
      <View style={styles.messages}>
        <FlatList inverted data={messages} renderItem={renderItem} keyExtractor={(item) => item.time} />
      </View>

      <Input
        chatRoomId={dataRoom.chatRoomID}
        infoFriend={infoFriend}
        isGroup={dataRoom.isGroup !== undefined ? dataRoom.isGroup : false}
      />
      {dataRoom.isGroup && (
        <ModelInput
          modalTitle={"Change Group's Name"}
          nameInput={"Group's Name"}
          isModalVisible={isModalVisible}
          setModalVisible={setModalVisible}
          inputValue={valueChangeNameGroup}
          setInputValue={setValueChangeNameGroup}
          handleModalClose={handleClickCancelRenameGroup}
          onClickRemove={handleClickRemovenameGroup}
          onClickSend={handleClickRenameGroup}
        />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    height: '100%',
    backgroundColor: 'white',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  messages: {
    flex: 1,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 10,
  },
});
export default Chat;
