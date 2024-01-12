import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { IconButton } from '@react-native-material/core';
import * as ImagePicker from 'expo-image-picker';
import { memo, useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import GlobalStyles from '../../../Components/GlobalStyles';

import { addPrivateMessage } from '../../../Services/privateServices';
import { encryptAES } from '../../../functions/hash';
import useAuthContext from '../../../hooks/useAuthContext';
import { getKeyChoosenPrivate } from '../../../hooks/useLocalStorage';
import { toastError, toastWarning } from '../../../hooks/useToast';

function InputPrivate({ chatRoomId, loadingConversation, roomData, isSender }) {
  const currentUser = useAuthContext();

  const [message, setMessage] = useState('');

  const [focusInput, setFocusInput] = useState(false);

  const inputRef = useRef();

  const handleCameraPick = async () => {
    if (!loadingConversation) {
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

          const urlImg = await storage()
            .ref(`${chatRoomId}/${currentUser.email}&&${time}&&${fileName}`)
            .getDownloadURL();

          const passWord = await getKeyChoosenPrivate(chatRoomId);
          if (passWord !== null) {
            try {
              const data = encryptAES(urlImg, passWord);
              await addPrivateMessage({ chatRoomID: chatRoomId, currentUser, data, image: true });
              await updateunSeen();
            } catch (error) {
              toastError('There has been an error.');
            }
          } else {
            toastError('Losing password!');
          }
        } else {
          toastWarning('Cancel');
        }
      } else {
        toastError('Turn your permission camera on first!');
      }
    }
  };

  const handleLibraryPick = async () => {
    if (!loadingConversation) {
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

          const urlImg = await storage()
            .ref(`${chatRoomId}/${currentUser.email}&&${time}&&${fileName}`)
            .getDownloadURL();

          const passWord = await getKeyChoosenPrivate(chatRoomId);
          if (passWord !== null) {
            try {
              const data = encryptAES(urlImg, passWord);
              await addPrivateMessage({ chatRoomID: chatRoomId, currentUser, data, image: true });
              await updateunSeen();
            } catch (error) {
              toastError('There has been an error.');
            }
          } else {
            toastError('Losing password!');
          }
        } else {
          toastWarning('Cancel');
        }
      } else {
        toastError('Turn your permission strorage on first!');
      }
    }
  };

  const handleMessageInput = (text) => {
    if (!text.startsWith(' ') && !text.startsWith('\n')) {
      setMessage(text);
    }
  };

  const handleSendMess = async () => {
    if (!loadingConversation) {
      if (message.trim()) {
        setMessage('');
        inputRef.current.focus();

        const passWord = await getKeyChoosenPrivate(chatRoomId);
        if (passWord !== null) {
          try {
            const data = encryptAES(message, passWord);
            await addPrivateMessage({ chatRoomID: chatRoomId, currentUser, data });
            await updateunSeen();
          } catch (error) {
            toastError('There has been an error.');
          }
        } else {
          toastError('Losing password!');
        }
      } else {
        toastError('Your messages are empty!');
      }
    }
  };

  const updateunSeen = async () => {
    if (isSender) {
      return await firestore()
        .collection('ChatPrivate')
        .doc(chatRoomId)
        .update({
          time: Date.now(),
          unSeenReciever: roomData.unSeenReciever + 1,
        });
    } else {
      return await firestore()
        .collection('ChatPrivate')
        .doc(chatRoomId)
        .update({
          time: Date.now(),
          unSeenSender: roomData.unSeenSender + 1,
        });
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
export default memo(InputPrivate);
