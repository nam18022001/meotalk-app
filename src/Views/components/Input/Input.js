import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { IconButton } from '@react-native-material/core';
import * as ImagePicker from 'expo-image-picker';
import { memo, useEffect, useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import GlobalStyles from '../../../Components/GlobalStyles';
import { collectChats } from '../../../Services/generalFirestoreServices';
import { makeNewConversation } from '../../../Services/newChatServices';

import { default as sendNotifiCation, default as useSendNotifiCation } from '../../../hooks/useSendNotification';
import { toastError, toastWarning } from '../../../hooks/useToast';
import useAuthContext from '../../../hooks/useAuthContext';

function Input({ chatRoomId, infoFriend, dataUserNewConver, isGroup, newConversation = false, from = '' }) {
  const currentUser = useAuthContext();

  const [message, setMessage] = useState('');
  const [lastStt, setLastStt] = useState(0);
  const [hasMess, setHasMess] = useState(false);
  const [focusInput, setFocusInput] = useState(false);

  const inputRef = useRef();

  useEffect(() => {
    firestore()
      .collection('ChatRoom')
      .doc(chatRoomId)
      .collection('chats')
      .orderBy('stt', 'desc')
      .onSnapshot((res) => {
        if (!res.empty) {
          setLastStt(res.docs[0].data().stt);
          setHasMess(true);
        } else {
          setLastStt(0);
          setHasMess(false);
        }
      });
  }, [chatRoomId]);

  const handleCameraPick = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status == 'granted') {
      setFocusInput(false);
      let result = await ImagePicker.launchCameraAsync({
        quality: 0.3,
      });

      if (!result.canceled) {
        const fileName = result.assets[0].uri.split('/').pop();
        const time = Date.now();
        await storage().ref(`${chatRoomId}/${currentUser.email}&&${time}&&${fileName}`).putFile(result.assets[0].uri);

        const urlImg = await storage().ref(`${chatRoomId}/${currentUser.email}&&${time}&&${fileName}`).getDownloadURL();
        if (!newConversation) {
          firestore()
            .collection('ChatRoom')
            .doc(chatRoomId)
            .collection('chats')
            .get()
            .then((res) => {
              if (res.empty) {
                if (isGroup) {
                  firestore().collection('ChatRoom').doc(chatRoomId).collection('chats').add({
                    isRead: [],
                    message: urlImg,
                    sendBy: currentUser.email,
                    stt: 0,
                    time: Date.now(),
                    type: 'image',
                    photoSender: currentUser.photoURL,
                  });
                } else {
                  firestore().collection('ChatRoom').doc(chatRoomId).collection('chats').add({
                    isRead: false,
                    message: urlImg,
                    sendBy: currentUser.email,
                    stt: 0,
                    time: Date.now(),
                    type: 'image',
                  });
                }
              } else {
                if (isGroup) {
                  firestore()
                    .collection('ChatRoom')
                    .doc(chatRoomId)
                    .collection('chats')
                    .orderBy('stt', 'desc')
                    .get()
                    .then((res) => {
                      const lastStt = res.docs[0].data().stt;
                      firestore()
                        .collection('ChatRoom')
                        .doc(chatRoomId)
                        .collection('chats')
                        .add({
                          isRead: [],
                          message: urlImg,
                          sendBy: currentUser.email,
                          stt: lastStt + 1,
                          time: Date.now(),
                          type: 'image',
                          photoSender: currentUser.photoURL,
                        });
                    });
                } else {
                  firestore()
                    .collection('ChatRoom')
                    .doc(chatRoomId)
                    .collection('chats')
                    .orderBy('stt', 'desc')
                    .get()
                    .then((res) => {
                      const lastStt = res.docs[0].data().stt;
                      firestore()
                        .collection('ChatRoom')
                        .doc(chatRoomId)
                        .collection('chats')
                        .add({
                          isRead: false,
                          message: urlImg,
                          sendBy: currentUser.email,
                          stt: lastStt + 1,
                          time: Date.now(),
                          type: 'image',
                        });
                    });
                }
              }
            });
          useSendNotifiCation({ currentUser, imageUrl: urlImg, chatRoomId, infoFriend });
        } else {
          let usersEmail = [currentUser.email];
          let usersUid = [currentUser.uid];
          if (isGroup && dataUserNewConver.length > 1) {
            dataUserNewConver.forEach((data) => {
              usersEmail.push(data.email);
              usersUid.push(data.uid);
            });

            makeNewConversation({ chatRoomId, usersEmail, usersUid, isGroup: true }).then(async (res) => {
              const collectChat = collectChats(chatRoomId);
              await collectChat.add({
                isRead: [],
                message: urlImg,
                sendBy: currentUser.email,
                stt: 0,
                time: Date.now(),
                type: 'image',
                photoSender: currentUser.photoURL,
              });
              sendNotifiCation({ currentUser, chatRoomId, infoFriend: dataUserNewConver });
            });
          } else {
            usersEmail.push(dataUserNewConver[0].email);
            usersUid.push(dataUserNewConver[0].uid);
            makeNewConversation({ chatRoomId, usersEmail, usersUid, isGroup: false }).then(async (res) => {
              const collectChat = collectChats(chatRoomId);
              await collectChat.add({
                isRead: false,
                message: urlImg,
                sendBy: currentUser.email,
                stt: 0,
                time: Date.now(),
                type: 'image',
              });
              sendNotifiCation({ currentUser, chatRoomId, infoFriend: dataUserNewConver });
            });
          }
        }
      } else {
        toastWarning('Cancel');
      }
    } else {
      toastError('Turn your permission camera on first!');
    }
  };

  const handleLibraryPick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status == 'granted') {
      setFocusInput(false);
      let result = await ImagePicker.launchImageLibraryAsync({
        quality: 0.3,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });

      if (!result.canceled) {
        const fileName = result.assets[0].uri.split('/').pop();
        const time = Date.now();
        await storage().ref(`${chatRoomId}/${currentUser.email}&&${time}&&${fileName}`).putFile(result.assets[0].uri);

        const urlImg = await storage().ref(`${chatRoomId}/${currentUser.email}&&${time}&&${fileName}`).getDownloadURL();
        if (!newConversation) {
          firestore()
            .collection('ChatRoom')
            .doc(chatRoomId)
            .collection('chats')
            .get()
            .then((res) => {
              if (res.empty) {
                if (isGroup) {
                  firestore().collection('ChatRoom').doc(chatRoomId).collection('chats').add({
                    isRead: [],
                    message: urlImg,
                    sendBy: currentUser.email,
                    stt: 0,
                    time: Date.now(),
                    type: 'image',
                    photoSender: currentUser.photoURL,
                  });
                } else {
                  firestore().collection('ChatRoom').doc(chatRoomId).collection('chats').add({
                    isRead: false,
                    message: urlImg,
                    sendBy: currentUser.email,
                    stt: 0,
                    time: Date.now(),
                    type: 'image',
                  });
                }
              } else {
                if (isGroup) {
                  firestore()
                    .collection('ChatRoom')
                    .doc(chatRoomId)
                    .collection('chats')
                    .add({
                      isRead: [],
                      message: urlImg,
                      sendBy: currentUser.email,
                      stt: lastStt + 1,
                      time: Date.now(),
                      type: 'image',
                      photoSender: currentUser.photoURL,
                    });
                } else {
                  firestore()
                    .collection('ChatRoom')
                    .doc(chatRoomId)
                    .collection('chats')
                    .add({
                      isRead: false,
                      message: urlImg,
                      sendBy: currentUser.email,
                      stt: lastStt + 1,
                      time: Date.now(),
                      type: 'image',
                    });
                }
              }
            });
          useSendNotifiCation({ currentUser, imageUrl: urlImg, chatRoomId, infoFriend });
        } else {
          let usersEmail = [currentUser.email];
          let usersUid = [currentUser.uid];
          if (isGroup && dataUserNewConver.length > 1) {
            dataUserNewConver.forEach((data) => {
              usersEmail.push(data.email);
              usersUid.push(data.uid);
            });

            makeNewConversation({ chatRoomId, usersEmail, usersUid, isGroup: true }).then(async (res) => {
              const collectChat = collectChats(chatRoomId);
              await collectChat.add({
                isRead: [],
                message: urlImg,
                sendBy: currentUser.email,
                stt: 0,
                time: Date.now(),
                type: 'image',
                photoSender: currentUser.photoURL,
              });
              sendNotifiCation({ currentUser, chatRoomId, infoFriend: dataUserNewConver });
            });
          } else {
            usersEmail.push(dataUserNewConver[0].email);
            usersUid.push(dataUserNewConver[0].uid);
            makeNewConversation({ chatRoomId, usersEmail, usersUid, isGroup: false }).then(async (res) => {
              const collectChat = collectChats(chatRoomId);
              await collectChat.add({
                isRead: false,
                message: urlImg,
                sendBy: currentUser.email,
                stt: 0,
                time: Date.now(),
                type: 'image',
              });
              sendNotifiCation({ currentUser, chatRoomId, infoFriend: dataUserNewConver });
            });
          }
        }
      } else {
        toastWarning('Cancel');
      }
    } else {
      toastError('Turn your permission strorage on first!');
    }
  };

  const handleMessageInput = (text) => {
    if (!text.startsWith(' ') && !text.startsWith('\n')) {
      setMessage(text);
    }
  };

  const handleSendMess = async () => {
    if (message.trim()) {
      if (!newConversation) {
        setMessage('');
        inputRef.current.focus();
        if (hasMess === false) {
          if (isGroup) {
            await firestore().collection('ChatRoom').doc(chatRoomId).collection('chats').add({
              isRead: [],
              message: message.trim(),
              sendBy: currentUser.email,
              stt: lastStt,
              time: Date.now(),
              type: 'message',
              photoSender: currentUser.photoURL,
            });
          } else {
            await firestore().collection('ChatRoom').doc(chatRoomId).collection('chats').add({
              isRead: false,
              message: message.trim(),
              sendBy: currentUser.email,
              stt: lastStt,
              time: Date.now(),
              type: 'message',
            });
          }
        } else {
          if (isGroup) {
            firestore()
              .collection('ChatRoom')
              .doc(chatRoomId)
              .collection('chats')
              .add({
                isRead: [],
                message: message.trim(),
                sendBy: currentUser.email,
                stt: lastStt + 1,
                time: Date.now(),
                type: 'message',
                photoSender: currentUser.photoURL,
              });
          } else {
            firestore()
              .collection('ChatRoom')
              .doc(chatRoomId)
              .collection('chats')
              .add({
                isRead: false,
                message: message.trim(),
                sendBy: currentUser.email,
                stt: lastStt + 1,
                time: Date.now(),
                type: 'message',
              });
          }
        }

        firestore().collection('ChatRoom').doc(chatRoomId).update({
          time: Date.now(),
        });
        useSendNotifiCation({ currentUser, chatRoomId, infoFriend });
      } else {
        setMessage('');
        inputRef.current.focus();
        let usersEmail = [currentUser.email];
        let usersUid = [currentUser.uid];
        if (isGroup && dataUserNewConver.length > 1) {
          dataUserNewConver.forEach((data) => {
            usersEmail.push(data.email);
            usersUid.push(data.uid);
          });

          makeNewConversation({ chatRoomId, usersEmail, usersUid, isGroup: true }).then(async (res) => {
            const collectChat = collectChats(chatRoomId);
            await collectChat.add({
              isRead: [],
              message: message.trim(),
              sendBy: currentUser.email,
              stt: 0,
              time: Date.now(),
              type: 'message',
              photoSender: currentUser.photoURL,
            });
            sendNotifiCation({ currentUser, chatRoomId, infoFriend: dataUserNewConver });
          });
        } else {
          usersEmail.push(dataUserNewConver[0].email);
          usersUid.push(dataUserNewConver[0].uid);
          makeNewConversation({ chatRoomId, usersEmail, usersUid, isGroup: false }).then(async (res) => {
            const collectChat = collectChats(chatRoomId);
            await collectChat.add({
              isRead: false,
              message: message.trim(),
              sendBy: currentUser.email,
              stt: 0,
              time: Date.now(),
              type: 'message',
            });
            sendNotifiCation({ currentUser, chatRoomId, infoFriend: dataUserNewConver });
          });
        }
      }
    } else {
      toastError('Your messages are empty!');
    }
  };
  return (
    <View style={styles.wrapper}>
      <View style={styles.actions}>
        <IconButton
          icon={<Ionicons size={25} color={GlobalStyles.colors.primary} name="ios-camera" />}
          onPress={handleCameraPick}
        />
        <IconButton
          icon={<Ionicons size={25} color={GlobalStyles.colors.primary} name="ios-image" />}
          onPress={handleLibraryPick}
        />
      </View>

      <View style={[styles.inptText, focusInput ? { maxHeight: 150 } : { maxHeight: 38 }]}>
        <TextInput
          ref={inputRef}
          multiline
          onFocus={() => setFocusInput(true)}
          onBlur={() => setFocusInput(false)}
          value={message}
          onChangeText={(text) => handleMessageInput(text)}
          style={styles.input}
          autoCapitalize
          autoCorrect
          placeholder="Message"
          cursorColor={GlobalStyles.colors.primary}
        />
      </View>
      <View>
        <IconButton
          icon={<Ionicons size={25} color={GlobalStyles.colors.primary} name="ios-send" />}
          onPress={handleSendMess}
        />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingLeft: 20,
    paddingRight: 20,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inptText: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: GlobalStyles.colors.powderGreyOpacity,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  input: {
    flex: 1,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 15,
    paddingRight: 10,
  },
});
export default memo(Input);
