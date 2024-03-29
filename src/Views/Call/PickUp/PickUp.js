import { Avatar } from '@react-native-material/core';
import { StyleSheet, Text, TouchableNativeFeedback, View } from 'react-native';
import ThreeDotsLoader from 'react-native-three-dots-loader';
import Ionicon from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';

import GlobalStyles from '../../../Components/GlobalStyles';
import config from '../../../configs';
import { addFirstMessage, addMessage, getlastMessage } from '../../../Services/conversationServices';

function PickUp({ data, navigation }) {
  const handlePickOut = async () => {
    await firestore().collection('call').doc(data.channelName).update({
      deleteCall: true,
    });
    const collectChat = firestore().collection('ChatRoom').doc(data.channelName).collection('chats');
    const chatRoom = firestore().collection('ChatRoom').doc(data.channelName);
    let currentUserAlpha = {
      email: data.callerEmail,
    };
    const getDocChats = await collectChat.get();
    if (getDocChats.empty) {
      await addFirstMessage({
        collectChat,
        currentUser: currentUserAlpha,
        data: 'Cuộc gọi nhỡ',
        callVideo: data.type === 'video' ? true : false,
        call: data.type === 'voice' ? true : false,
        isGroup: false,
      });
    } else {
      const dataLast = await getlastMessage({ collectChat });
      await addMessage({
        collectChat,
        currentUser: currentUserAlpha,
        data: 'Cuộc gọi nhỡ',
        callVideo: data.type === 'video' ? true : false,
        call: data.type === 'voice' ? true : false,
        dataLast,
        isGroup: false,
      });
    }
    await chatRoom.update({
      time: Date.now(),
    });
    await firestore().collection('call').doc(data.channelName).delete();
  };

  const handlePickUpVideo = async () => {
    await firestore().collection('call').doc(data.channelName).update({
      hasDialled: true,
    });
    return navigation.navigate(data.type === 'video' ? config.routes.videoCall : config.routes.voiceCall, {
      idCall: data.channelName,
      token: data.tokenReciever,
      uid: data.recieverId,
      friendAvatar: data.callerAvatar,
      friendName: data.callerName,
      channelCall: data.channelCall,
    });
  };
  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>
        <View style={styles.borderInfo}>
          <Avatar size={150} image={{ uri: data.callerAvatar }} />
          <Text
            numberOfLines={1}
            style={{ marginVertical: 10, fontSize: 28, fontFamily: GlobalStyles.fonts.fontSemiBold }}
          >
            {data.callerName}
          </Text>
          <View style={{ flexDirection: 'row' }}>
            <Text style={{ marginRight: 5, fontSize: 25, fontFamily: GlobalStyles.fonts.fontAudiowide }}>Incoming</Text>
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
            <ButtonAction onPress={handlePickUpVideo} icon={'ios-call'} colorBack={'#425F57'} colorIcon={'#DEF5E5'} />
          )}
        </View>
      </View>
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
export default PickUp;
