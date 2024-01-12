import firestore from '@react-native-firebase/firestore';
import { ActivityIndicator } from '@react-native-material/core';
import { useFocusEffect } from '@react-navigation/native';
import { Fragment, useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Octicons from 'react-native-vector-icons/Octicons';

import GlobalStyles from '../Components/GlobalStyles';
import config from '../configs';
import { decryptAES, encryptAES } from '../functions/hash';
import useAuthContext from '../hooks/useAuthContext';
import { getKeyChoosenPrivate, setLocalStorageKey } from '../hooks/useLocalStorage';
import { toastError } from '../hooks/useToast';
import AcceptConversation from './components/Private/AcceptConversation';
import HeaderPrivate from './components/Private/HeaderPrivate';
import InputPrivate from './components/Private/InputPrivate';
import MessagePrivate from './components/Private/MessagePrivate';

function PrivateChat({ navigation, route }) {
  const { dataRoom } = route.params;
  const currentUser = useAuthContext();
  const [loadingConversation, setLoadingConversation] = useState(true);

  const [isWatingAccept, setIsWatingAccept] = useState(false);
  const [recieverAccept, setRecieverAccept] = useState(false);

  const [hashMessages, sethashMessages] = useState([]);
  const [messages, setMessages] = useState([]);
  const [lastTimeSeen, setLastTimeSeen] = useState(0);

  const [lockRoom, setLockRoom] = useState(false);
  const [lockPass, setLockPass] = useState('');

  const [infoRoom, setInfoRoom] = useState({});

  useEffect(() => {
    if (Object.keys(dataRoom).length > 0) {
      firestore()
        .collection('ChatPrivate')
        .doc(dataRoom.chatRoomID)
        .onSnapshot((snap) => {
          if (snap.exists) {
            setInfoRoom(snap.data());
          } else {
            setInfoRoom({});
          }
        });
    }
  }, [dataRoom]);

  useEffect(() => {
    if (Object.keys(dataRoom).length > 0) {
      firestore()
        .collection('ChatPrivate')
        .doc(dataRoom.chatRoomID)
        .collection('chats')
        .orderBy('time', 'desc')
        .onSnapshot((snap) => {
          if (!snap.empty) {
            let mess = [];
            snap.docs.map((v) => {
              mess.push(v.data());
            });
            sethashMessages(mess);
          } else {
            sethashMessages([]);
          }
        });
    }
  }, [infoRoom]);

  useEffect(() => {
    if (Object.keys(infoRoom).length > 0) {
      setIsWatingAccept(infoRoom.sender === currentUser.uid && infoRoom.isAccepted === false ? true : false);
      setRecieverAccept(infoRoom.reciever === currentUser.uid && infoRoom.isAccepted === false ? true : false);
    }
  }, [infoRoom]);

  useEffect(() => {
    if (hashMessages.length > 0 && Object.keys(infoRoom).length > 0) {
      getKeyChoosenPrivate(infoRoom.chatRoomID).then((enPass) => {
        if (enPass !== null && typeof enPass === 'string') {
          setLockRoom(false);
          let contents = [];
          let timeSeen = [];
          hashMessages.map((mess) => {
            let a = mess;
            a.message = decryptAES(mess.message, enPass);
            if (mess.isRead === true) {
              timeSeen.push(mess.time);
            }

            setLastTimeSeen(timeSeen[0]);
            return contents.push(a);
          });
          setMessages(contents);
        } else {
          setLockRoom(true);
        }
      });
    } else {
      setLockRoom(false);
    }
  }, [hashMessages, infoRoom, lockRoom]);

  useEffect(() => {
    if (messages.length > 0) {
      setLoadingConversation(false);
    }
  }, [messages]);

  useFocusEffect(
    useCallback(() => {
      const readMessage = () => {
        if (Object.keys(infoRoom).length > 0) {
          firestore()
            .collection('ChatPrivate')
            .doc(infoRoom.chatRoomID)
            .update({
              unSeenSender: infoRoom.sender === currentUser.uid ? 0 : infoRoom.unSeenSender,
              unSeenReciever: infoRoom.reciever === currentUser.uid ? 0 : infoRoom.unSeenReciever,
            });
          firestore()
            .collection('ChatPrivate')
            .doc(infoRoom.chatRoomID)
            .collection('chats')
            .where('sendBy', '!=', currentUser.email)
            .get()
            .then((allUnRead) => {
              allUnRead.forEach((res) => {
                firestore().collection('ChatPrivate').doc(infoRoom.chatRoomID).collection('chats').doc(res.id).update({
                  isRead: true,
                });
              });
            });
        }
      };
      return () => readMessage();
    }, [messages, infoRoom]),
  );

  const handleInputLockPass = (text) => {
    const value = text;
    setLockPass(value);
  };

  const handleEnterRoom = async () => {
    if (lockRoom && lockPass.length > 0) {
      const message = hashMessages[0].message;
      const checkMessage = decryptAES(message, lockPass);

      if (typeof checkMessage === 'string' && checkMessage !== null) {
        const encryptedPassword = encryptAES(lockPass, config.constant.keyPrivate);
        await setLocalStorageKey(encryptedPassword, infoRoom.chatRoomID);
        setLockRoom(false);
      } else {
        toastError('Wrong password!');
      }
    } else {
      toastError('Password is required!');
    }
  };

  const renderItem = ({ item }) => {
    if (Object.keys(item).length > 0 && Object.keys(dataRoom).length > 0) {
      return (
        <MessagePrivate
          data={item.message}
          own={item.sendBy === currentUser.email ? true : false}
          type={item.type}
          seenImg={infoRoom.usersPhoto.filter((v) => v !== currentUser.photoURL)[0]}
          seen={item.time === lastTimeSeen ? true : false}
          isRead={item.isRead}
          marginBottom={item.time === lastTimeSeen ? true : false}
          loadingMessage={item.message !== null ? false : true}
        />
      );
    }
  };
  return (
    <View style={styles.wrapper}>
      {Object.keys(infoRoom).length > 0 ? (
        <Fragment>
          <HeaderPrivate
            navigation={navigation}
            loadingConversation={loadingConversation}
            name={infoRoom.usersDisplayName.filter((v) => v !== currentUser.displayName)[0]}
            avatar={infoRoom.usersPhoto.filter((v) => v !== currentUser.photoURL)[0]}
          />
          {isWatingAccept ? (
            <View
              style={[styles.messages, { flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }]}
            >
              <Ionicons
                name="hourglass-outline"
                size={50}
                style={{ marginRight: 5 }}
                color={GlobalStyles.colors.warningColor}
              />
              <Text
                style={{
                  textTransform: 'uppercase',
                  fontFamily: GlobalStyles.fonts.fontSemiBold,
                  fontSize: 18,
                  marginTop: 10,
                }}
              >
                Waiting for acceptance
              </Text>
            </View>
          ) : recieverAccept ? (
            <AcceptConversation infoConversation={infoRoom} navigation={navigation} />
          ) : lockRoom ? (
            <View
              style={[styles.messages, { flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }]}
            >
              <Octicons name="shield-lock" size={50} color={GlobalStyles.colors.successColor} />
              <View
                style={{
                  flexDirection: 'row',
                  width: '80%',
                  backgroundColor: GlobalStyles.colors.powderGreyOpacity,
                  borderRadius: 10,
                  marginTop: 30,
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 10,
                }}
              >
                <TextInput
                  style={{
                    flex: 1,
                    paddingHorizontal: 15,
                    paddingVertical: 5,
                  }}
                  secureTextEntry={true}
                  placeholder="Enter password"
                  autoCorrect={false}
                  autoCapitalize="none"
                  onChangeText={handleInputLockPass}
                  value={lockPass}
                  returnKeyType="join"
                  onSubmitEditing={handleEnterRoom}
                />
                <TouchableWithoutFeedback onPress={handleEnterRoom}>
                  <View>
                    <FontAwesome5 name="long-arrow-alt-right" size={20} color={GlobalStyles.colors.successColor} />
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </View>
          ) : (
            <View style={styles.messages}>
              <FlatList inverted data={messages} renderItem={renderItem} keyExtractor={(item) => item.time} />
            </View>
          )}
          <InputPrivate
            chatRoomId={infoRoom.chatRoomID}
            isSender={infoRoom.sender === currentUser.uid ? true : false}
            loadingConversation={loadingConversation}
            roomData={infoRoom}
          />
        </Fragment>
      ) : (
        <View style={{ height: '100%', justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size={50} color={GlobalStyles.colors.primary} />
        </View>
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
export default PrivateChat;
