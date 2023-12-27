import firestore from '@react-native-firebase/firestore';
import { Avatar } from '@react-native-material/core';
import moment from 'moment';
import { memo, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableNativeFeedback, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { useIsFocused } from '@react-navigation/native';
import { usersInfo } from '../../Services/conversationServices';

import GlobalStyles from '../GlobalStyles';
import AvatarSkeleton from '../Skeleton/AvatarSkeleton';
import LineSkeleton from '../Skeleton/LineSkeleton';
import useAuthContext from '../../hooks/useAuthContext';

function ConverseItem({ navigation, data }) {
  const currentUser = useAuthContext();

  const [userInfo, setUserInfo] = useState([]);

  const [isMine, setIsMine] = useState(false);
  const [seen, setSeen] = useState(false);
  const [noMessage, setNoMessages] = useState(false);

  const [time, setTime] = useState('');
  const [dataContent, setDataContent] = useState('');
  const focusScreen = useIsFocused();

  const [avatarSeenFirstGroup, setAvatarSeenFirstGroup] = useState('');

  const [loadingItem, setLoadingitem] = useState(true);

  useEffect(() => {
    const startTime = moment(new Date(data.time).toISOString());
    setTime(startTime.fromNow());

    const getUserInfo = async () => {
      const info = await usersInfo({ data: data, currentUser: currentUser });
      setUserInfo(info);
    };
    const getLastContent = () => {
      firestore()
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
              if (data.isGroup === false) {
                if (dataLast.isRead === false) {
                  setSeen(false);
                  if (dataLast.type === 'image') {
                    setDataContent('Recieve a image');
                  } else {
                    setDataContent(dataLast.message);
                  }
                } else {
                  setSeen(true);
                  if (dataLast.type === 'image') {
                    setDataContent('Recieve a image');
                  } else {
                    setDataContent(dataLast.message);
                  }
                }
              } else {
                if (dataLast.isRead.filter((read) => read.seenBy === currentUser.email).length === 0) {
                  setSeen(false);
                  if (dataLast.type === 'image') {
                    setDataContent('Recieve a image');
                  } else {
                    setDataContent(dataLast.message);
                  }
                } else {
                  setSeen(true);
                  if (dataLast.type === 'image') {
                    setDataContent('Recieve a image');
                  } else {
                    setDataContent(dataLast.message);
                  }
                }
              }
            } else {
              setIsMine(true);

              if (data.isGroup === false) {
                if (dataLast.isRead === true) {
                  setSeen(true);
                  if (dataLast.type === 'image') {
                    setDataContent('You: Send a image');
                  } else {
                    setDataContent(`You: ${dataLast.message}`);
                  }
                } else {
                  setSeen(false);
                  if (dataLast.type === 'image') {
                    setDataContent('You: Send a image');
                  } else {
                    setDataContent(`You: ${dataLast.message}`);
                  }
                }
              } else {
                for (let i = 0; i < userInfo.length; i++) {
                  if (dataLast.isRead.filter((read) => read.seenBy === userInfo[i].email).length > 0) {
                    setSeen(true);
                    setAvatarSeenFirstGroup(userInfo[i].photoURL);
                    if (dataLast.type === 'image') {
                      setDataContent('You: Send a image');
                    } else {
                      setDataContent(`You: ${dataLast.message}`);
                    }
                    break;
                  } else {
                    setSeen(false);
                    if (dataLast.type === 'image') {
                      setDataContent('You: Send a image');
                    } else {
                      setDataContent(`You: ${dataLast.message}`);
                    }
                  }
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
      await getUserInfo();
      getLastContent();
    };

    handle();
    return handle;
  }, [data, focusScreen]);

  useEffect(() => {
    if (userInfo.length > 0 && dataContent.length > 0) {
      setLoadingitem(false);
    } else if (userInfo.length > 0 && dataContent.length === 0) {
      setDataContent('...');
      setLoadingitem(false);
    } else {
      setLoadingitem(true);
    }
  }, [dataContent, userInfo, data]);

  const handleChatRoom = () => {
    navigation.navigate('Chat', {
      dataRoom: data,
      infoFriend: userInfo,
    });
  };
  return loadingItem ? (
    <View style={styles.wrapper}>
      <AvatarSkeleton />
      <View style={styles.info}>
        <LineSkeleton styles={{ marginBottom: 5 }} />
        <LineSkeleton width="80%" height={15} />
      </View>
    </View>
  ) : (
    <TouchableNativeFeedback
      style={styles.button}
      background={TouchableNativeFeedback.Ripple('rgba(34,34,34,0.3)', false)}
      onPress={handleChatRoom}
    >
      <View style={styles.wrapper}>
        {userInfo.length > 0 &&
          (userInfo.length > 1 ? (
            <View style={styles.groupAvatar}>
              <Avatar
                style={styles.leftAvatar}
                image={{ uri: userInfo.length > 1 ? userInfo[0].photoURL : undefined, cache: 'force-cache' }}
                size={30}
              />
              <Avatar
                style={styles.rightAvatar}
                image={{ uri: userInfo.length > 1 ? userInfo[1].photoURL : undefined, cache: 'force-cache' }}
                size={30}
              />
            </View>
          ) : (
            <Avatar
              size={50}
              image={{ uri: userInfo[0].photoURL ? userInfo[0].photoURL : undefined, cache: 'force-cache' }}
            />
          ))}
        <View style={styles.info}>
          <Text style={styles.chatRoomName} numberOfLines={1}>
            {userInfo.length > 0 &&
              (userInfo.length > 1
                ? data.chatRoomName && data.chatRoomName.length > 0
                  ? data.chatRoomName
                  : userInfo.map((info, index) => info.displayName + `${index === userInfo.length - 1 ? '' : ', '} `)
                : userInfo.length > 0 && userInfo[0].displayName)}
          </Text>
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
                userInfo.length > 0 &&
                (userInfo.length > 1 ? (
                  <Avatar size={16} image={{ uri: avatarSeenFirstGroup ? avatarSeenFirstGroup : undefined }} />
                ) : (
                  <Avatar size={16} image={{ uri: userInfo.length > 0 ? userInfo[0].photoURL : undefined }} />
                  // <View></View>
                ))
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
    flex: 1,
    flexDirection: 'column',
    marginLeft: 15,
    paddingRight: 10,
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
  groupAvatar: {
    overflow: 'hidden',
    position: 'relative',
    width: 50,
    height: 50,
  },
  leftAvatar: {
    position: 'absolute',
    bottom: 5,
    left: 0,
  },
  rightAvatar: {
    position: 'absolute',
    right: 5,
    top: 0,
  },
  chatRoomName: {
    fontFamily: GlobalStyles.fonts.fontSemiBold,
    fontSize: 16,
  },
});
export default memo(ConverseItem);
