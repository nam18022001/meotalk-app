import { Avatar } from '@react-native-material/core';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableNativeFeedback, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import firestore from '@react-native-firebase/firestore';

import useAuthContext from '../../hooks/useAuthContext';
import GlobalStyles from '../GlobalStyles';
import { useIsFocused } from '@react-navigation/native';

function ConverseItem({ navigation, data }) {
  const currentUser = useAuthContext();

  const [isMine, setIsMine] = useState(false);
  const [seen, setSeen] = useState(false);
  const [noMessage, setNoMessages] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const [time, setTime] = useState('');
  const [dataContent, setDataContent] = useState('');
  const focusScreen = useIsFocused();

  useEffect(() => {
    const startTime = moment(new Date(data.time).toISOString());
    setTime(startTime.fromNow());

    const userInfo = async () => {
      let uid;
      for (let i = 0; i < data.usersUid.length; i++) {
        if (data.usersUid[i] !== currentUser.uid) {
          uid = data.usersUid[i];
        }
      }
      const getUserInfo = await firestore().collection('users').doc(uid).get();

      getUserInfo.exists && setUserInfo(getUserInfo.data());
    };

    const getLastContent = async () => {
      await firestore()
        .collection('ChatRoom')
        .doc(data.chatRoomID)
        .collection('chats')
        .orderBy('stt')

        .onSnapshot((snapQChat) => {
          if (!snapQChat.empty) {
            setNoMessages(false);
            const lastVisible = snapQChat.docs[snapQChat.docs.length - 1];

            const dataLast = lastVisible.data();

            // check read message
            if (dataLast.sendBy !== currentUser.email) {
              setIsMine(false);
              if (dataLast.isRead === false) {
                setSeen(false);
                if (dataLast.type === 'image') {
                  setDataContent(' Nhận một hình ảnh');
                } else {
                  setDataContent(dataLast.message);
                }
              } else {
                setSeen(true);
                if (dataLast.type === 'image') {
                  setDataContent('Nhận một hình ảnh');
                } else {
                  setDataContent(dataLast.message);
                }
              }
            } else {
              setIsMine(true);
              if (dataLast.isRead === true) {
                setSeen(true);
                if (dataLast.type === 'image') {
                  setDataContent('Gửi một hình ảnh');
                } else {
                  setDataContent(`Bạn: ${dataLast.message}`);
                }
              } else {
                setSeen(false);
                if (dataLast.type === 'image') {
                  setDataContent('Gửi một hình ảnh');
                } else {
                  setDataContent(`Bạn: ${dataLast.message}`);
                }
              }
            }
          } else {
            setNoMessages(true);
            setDataContent('No Messages');
          }
        });
    };
    const handle = async () => {
      userInfo();
      getLastContent();
    };

    handle();
    return handle;
  }, [data, focusScreen]);

  const handleChatRoom = () => {
    navigation.navigate('Chat', {
      idChatRoom: data.chatRoomID,
      infoFriend: userInfo,
    });
  };
  return (
    <TouchableNativeFeedback
      style={styles.button}
      background={TouchableNativeFeedback.Ripple('rgba(34,34,34,0.3)', false)}
      onPress={handleChatRoom}
    >
      <View style={styles.wrapper}>
        <Avatar image={{ uri: userInfo.photoUrl }} />
        <View style={styles.info}>
          <Text style={{ fontFamily: GlobalStyles.fonts.fontSemiBold, fontSize: 16 }}>{userInfo.displayName}</Text>
          <View style={styles.converseInbox}>
            {!noMessage ? (
              <View style={styles.preLastMess}>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.text,
                    seen === false && isMine === false && { fontFamily: GlobalStyles.fonts.fontBold },
                  ]}
                >
                  {dataContent}
                </Text>
                <Text style={styles.text}>
                  <Text style={{ fontWeight: '900' }}> {'\u00B7'} </Text>
                  {time}
                </Text>
              </View>
            ) : (
              <View style={styles.preLastMess}>
                <Text numberOfLines={1} style={[styles.text, { fontFamily: GlobalStyles.fonts.fontBold }]}>
                  {dataContent}
                </Text>
              </View>
            )}
          </View>
        </View>
        {!noMessage && (
          <View style={styles.seen}>
            {isMine &&
              (!seen ? (
                <Ionicons size={16} name="ios-checkmark-circle" color={GlobalStyles.colors.seenColor} />
              ) : (
                <Avatar size={16} image={{ uri: userInfo.photoUrl }} />
              ))}
          </View>
        )}
      </View>
    </TouchableNativeFeedback>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    padding: 20,
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  info: {
    flexDirection: 'column',
    flex: 1,
    marginLeft: 15,
  },
  converseInbox: {
    flexDirection: 'row',
  },
  preLastMess: {
    flexDirection: 'row',
    flex: 0.65,
  },
  text: {
    fontFamily: GlobalStyles.fonts.fontRegular,
    fontSize: 13,
  },
});
export default ConverseItem;
