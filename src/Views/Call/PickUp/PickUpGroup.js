import { Avatar } from '@react-native-material/core';
import { ActivityIndicator, StyleSheet, Text, TouchableNativeFeedback, View } from 'react-native';
import ThreeDotsLoader from 'react-native-three-dots-loader';
import Ionicon from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';

import GlobalStyles from '../../../Components/GlobalStyles';
import useAuthContext from '../../../hooks/useAuthContext';
import config from '../../../configs';
import { useEffect, useState } from 'react';
import usePreLoadContext from '../../../hooks/usePreLoadContext';

function PickUpGroup({ data, navigation }) {
  const currentUser = useAuthContext();
  const chatRoomInfo = usePreLoadContext();

  const [friendsInfo, setFriendsInfo] = useState([]);
  const [groupName, setGroupName] = useState('');

  const [myToken, setMyToken] = useState('');
  const [myId, setMyId] = useState(0);

  useEffect(() => {
    const getRoom = chatRoomInfo.filter((list) => list.chatRoomID === data.channelName);
    if (getRoom.length === 1 && getRoom[0].chatRoomName !== undefined && getRoom[0].chatRoomName.length > 0) {
      setGroupName(getRoom[0].chatRoomName);
    } else {
      setGroupName(data.receiverName.map((v, index) => v + `${index === data.receiverName.length - 1 ? '' : ', '} `));
    }

    const myIndex = data.recieverUid.indexOf(currentUser.uid);
    const callerInfo = {
      id: data.callerId,
      uid: data.callerUid,
      displayName: data.callerName,
      email: data.callerEmail,
      photoURL: data.callerAvatar,
    };
    const recieverInfo = {
      photoURL: data.receiverAvatar.filter((_, index) => index !== myIndex)[0],
      uid: data.recieverUid.filter((_, index) => index !== myIndex)[0],
      id: data.recieverId.filter((_, index) => index !== myIndex)[0],
      displayName: data.receiverName.filter((_, index) => index !== myIndex)[0],
      email: data.receiverEmail.filter((_, index) => index !== myIndex)[0],
    };
    const parner = [callerInfo, recieverInfo];

    setFriendsInfo(parner);
    setMyId(data.recieverId.filter((_, index) => index === myIndex)[0]);
    setMyToken(data.tokenReciever.filter((_, index) => index === myIndex)[0]);
  }, [data]);

  const handlePickOut = async () => {
    let cancelDialled = data.cancelDialled;
    if (cancelDialled.filter((v) => v === currentUser.uid).length === 0) {
      cancelDialled.push(currentUser.uid);
    }
    await firestore().collection('call').doc(data.channelName).update({
      cancelDialled,
    });
  };
  const handlePickUpVideo = async () => {
    let hasDialled = data.hasDialled;
    if (hasDialled.filter((v) => v === currentUser.uid).length === 0) {
      hasDialled.push(currentUser.uid);
      await firestore().collection('call').doc(data.channelName).update({
        hasDialled,
      });
    }
    return navigation.navigate(config.routes.videoCallGroup, {
      idCall: data.channelName,
      channelCall: data.channelCall,
      token: myToken,
      uid: myId,
      friendsInfo,
      groupName,
      reciever: true,
    });
  };
  return (
    <View style={styles.container}>
      {myToken.length > 0 && myId !== 0 ? (
        <View style={styles.wrapper}>
          <View style={styles.borderInfo}>
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
              {friendsInfo.slice(0, 3).map((info, index) => (
                <View key={index} style={{ marginLeft: -25 }}>
                  <Avatar
                    style={{ borderColor: '#fff', borderStyle: 'solid', borderWidth: 2 }}
                    image={{ uri: info.photoURL }}
                    size={100}
                  />
                  {friendsInfo.length > 3 && index === 2 && (
                    <View
                      style={{
                        width: 100,
                        height: 100,
                        borderRadius: 100,
                        backgroundColor: GlobalStyles.colors.seenColor,
                        position: 'absolute',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Entypo name="dots-three-horizontal" size={30} color={'#fff'} />
                    </View>
                  )}
                </View>
              ))}
            </View>
            <Text
              numberOfLines={1}
              style={{ marginVertical: 10, fontSize: 28, fontFamily: GlobalStyles.fonts.fontSemiBold }}
            >
              {groupName}
            </Text>
            <View style={{ flexDirection: 'row' }}>
              <Text style={{ marginRight: 5, fontSize: 25, fontFamily: GlobalStyles.fonts.fontAudiowide }}>
                Incoming
              </Text>
              <ThreeDotsLoader />
            </View>
          </View>
          <View style={styles.actions}>
            <ButtonAction icon={'close'} colorBack={'#E0144C'} colorIcon={'#DEF5E5'} onPress={handlePickOut} />
            {data.type === 'video' ? (
              <ButtonAction
                icon={'ios-videocam'}
                colorBack={'#425F57'}
                colorIcon={'#DEF5E5'}
                onPress={handlePickUpVideo}
              />
            ) : (
              <ButtonAction icon={'ios-call'} colorBack={'#425F57'} colorIcon={'#DEF5E5'} />
            )}
          </View>
        </View>
      ) : (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size={40} />
        </View>
      )}
    </View>
  );
}
function ButtonAction({ icon, onPress, colorIcon, colorBack }) {
  return (
    <View style={[styles.action, { backgroundColor: colorBack }]}>
      <TouchableNativeFeedback background={TouchableNativeFeedback.Ripple('#815B5B', true)} onPress={onPress}>
        <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicon name={icon} size={40} color={colorIcon} />
        </View>
      </TouchableNativeFeedback>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
  },
  wrapper: {
    flex: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#0D4C92',
    marginHorizontal: 20,
    marginVertical: 20,
    backgroundColor: 'rgba(214, 228, 229, 0.4)',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '70%',
    marginBottom: 50,
  },
  borderInfo: {
    flex: 1,
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  action: {
    width: 70,
    height: 70,
    borderRadius: 50,
  },
});
export default PickUpGroup;
