import { FirebaseStorageTypes } from '@react-native-firebase/storage';
import { Avatar, IconButton } from '@react-native-material/core';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  BackHandler,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableNativeFeedback,
  View,
} from 'react-native';
import { ChannelProfileType, ClientRoleType, createAgoraRtcEngine, RtcSurfaceView } from 'react-native-agora';
import Loader from 'react-native-three-dots-loader';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import firestore from '@react-native-firebase/firestore';
import Ionicon from 'react-native-vector-icons/Ionicons';

import GlobalStyles from '../../Components/GlobalStyles';
import config from '../../configs';
import useAuthContext from '../../hooks/useAuthContext';
import { addFirstMessage, addMessage, getlastMessage } from '../../Services/conversationServices';
import useCallContext from '../../hooks/useCallContext';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';

function VoiceCall({ navigation, route }) {
  const { idCall, token, uid, friendAvatar, friendName, channelCall } = route.params;

  const currentUser = useAuthContext();
  const { setPressCall } = useCallContext();

  const agoraEngineRef = useRef();

  const [show, setShow] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [muteStatus, setMuteStatus] = useState(true);

  const [remoteUid, setRemoteUid] = useState(0);

  const [secondCall, setSecondCall] = useState(0);
  const [minuteCall, setMinuteCall] = useState(0);

  const [hasDialled, setHasDialled] = useState(false);
  const [dataCall, setDataCall] = useState();

  useEffect(() => {
    // Initialize Agora engine when the app starts
    async function prepare() {
      await setupVideoSDKEngine();
      await join();
      setShow(true);
    }

    prepare();

    const checkPuckOut = firestore()
      .collection('call')
      .doc(idCall)
      .onSnapshot((res) => {
        if (res.exists) {
          setHasDialled(res.data().hasDialled);
          setDataCall(res.data());
        } else {
          agoraEngineRef.current?.disableAudio();
          agoraEngineRef.current?.leaveChannel();
          return navigation.goBack();
        }
      });
    const backAction = () => {
      Alert.alert('Hold on!', 'If you wanna go back, you must end this call', [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel',
        },
        { text: 'YES', onPress: () => leave() },
      ]);
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => {
      checkPuckOut();
      backHandler.remove();
    };
  }, []);

  useEffect(() => {
    function createIncreament() {
      if (remoteUid !== 0) {
        if (secondCall === 59) {
          setSecondCall(0);
          setMinuteCall(minuteCall + 1);
        } else {
          setSecondCall(secondCall + 1);
        }
      }
    }

    let countCalltime = setTimeout(createIncreament, 1000);

    return () => {
      clearTimeout(countCalltime);
    };
  }, [secondCall, remoteUid]);

  useEffect(() => {}, []);

  const setupVideoSDKEngine = async () => {
    try {
      // use the helper function to get permissions
      if (Platform.OS === 'android') {
        await getPermission();
      }
      agoraEngineRef.current = createAgoraRtcEngine();
      const agoraEngine = agoraEngineRef.current;
      agoraEngine.enableAudioVolumeIndication();
      agoraEngineRef.current?.setDefaultAudioRouteToSpeakerphone(false);
      // agoraEngineRef.current?.setEnableSpeakerphone(speakerPhone);
      agoraEngine.registerEventHandler({
        onJoinChannelSuccess: () => {
          console.log('Successfully joined the channel ' + channelCall);
          setIsJoined(true);
        },
        onUserJoined: (_connection, Uid) => {
          console.log('Remote user joined with uid ' + Uid);
          setRemoteUid(Uid);
        },
        onUserOffline: (_connection, Uid) => {
          console.log('Remote user left the channel. uid: ' + Uid);
          agoraEngineRef.current?.disableAudio();
          agoraEngineRef.current?.leaveChannel();
          setRemoteUid(0);
          firestore().collection('call').doc(idCall).delete();
        },
        onAudioVolumeIndication: (_connection, volumes) => {
          console.log(_connection, volumes);
        },
      });
      agoraEngine.initialize({
        appId: config.configAgora.appId,
        channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
      });
      agoraEngine.enableAudio();
    } catch (e) {
      console.log(e);
    }
  };
  const join = async () => {
    if (isJoined) {
      return;
    }
    try {
      agoraEngineRef.current?.setChannelProfile(ChannelProfileType.ChannelProfileCommunication);

      agoraEngineRef.current?.joinChannel(token, channelCall, uid, {
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
      });
    } catch (e) {
      console.log(e);
    }
  };
  const getPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([PermissionsAndroid.PERMISSIONS.RECORD_AUDIO]);
        if (granted['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('You can use the mic');
        } else {
          console.log('Permission denied');
        }
      } catch (error) {}
    }
  };

  const setLeave = async () => {
    const channelName = idCall;
    setPressCall(true);
    await firestore().collection('call').doc(idCall).update({
      deleteCall: true,
    });
    const collectChat = firestore().collection('ChatRoom').doc(channelName).collection('chats');
    const chatRoom = firestore().collection('ChatRoom').doc(channelName);
    let currentUserAlpha = {
      email: dataCall.callerEmail,
    };
    const getDocChats = await collectChat.get();
    if (getDocChats.empty) {
      await addFirstMessage({
        collectChat,
        currentUser: currentUserAlpha,
        data: `Cuộc gọi thoại\n${`${minuteCall === 0 ? '00' : minuteCall < 10 ? '0' + minuteCall : minuteCall}:${
          secondCall === 0 ? '00' : secondCall < 10 ? '0' + secondCall : secondCall
        }`}`,
        call: true,
        isGroup: false,
      });
    } else {
      const dataLast = await getlastMessage({ collectChat });
      await addMessage({
        collectChat,
        currentUser: currentUserAlpha,
        data: `Cuộc gọi thoại\n${`${minuteCall === 0 ? '00' : minuteCall < 10 ? '0' + minuteCall : minuteCall}:${
          secondCall === 0 ? '00' : secondCall < 10 ? '0' + secondCall : secondCall
        }`}`,
        call: true,
        dataLast,
        isGroup: false,
      });
    }
    await chatRoom.update({
      time: Date.now(),
    });
    await firestore().collection('call').doc(idCall).delete();
    return setPressCall(false);
  };

  const handleMissCall = async () => {
    setPressCall(true);
    await firestore().collection('call').doc(idCall).update({
      deleteCall: true,
    });
    const collectChat = firestore().collection('ChatRoom').doc(idCall).collection('chats');
    const chatRoom = firestore().collection('ChatRoom').doc(idCall);
    let currentUserAlpha = {
      email: dataCall.callerEmail,
    };
    const getDocChats = await collectChat.get();
    if (getDocChats.empty) {
      await addFirstMessage({
        collectChat,
        currentUser: currentUserAlpha,
        data: 'Cuộc gọi nhỡ',
        call: true,
        isGroup: false,
      });
    } else {
      const dataLast = await getlastMessage({ collectChat });

      await addMessage({
        collectChat,
        currentUser: currentUserAlpha,
        data: 'Cuộc gọi nhỡ',
        call: true,
        dataLast,
        isGroup: false,
      });
    }
    await chatRoom.update({
      time: Date.now(),
    });
    await firestore().collection('call').doc(idCall).delete();
    setPressCall(false);
  };

  const leave = async () => {
    try {
      agoraEngineRef.current?.disableAudio();
      agoraEngineRef.current?.leaveChannel();

      if (hasDialled === true) {
        await setLeave();
      } else if (hasDialled === false) {
        await handleMissCall();
      } else {
        await firestore().collection('call').doc(idCall).delete();
      }
    } catch (e) {
      console.log(e);
    }
    return navigation.goBack();
  };
  const mute = () => {
    agoraEngineRef.current?.enableLocalAudio(!muteStatus);
    setMuteStatus(!muteStatus);
  };
  const switchSpeaker = () => {
    agoraEngineRef.current?.setEnableSpeakerphone(!agoraEngineRef.current.isSpeakerphoneEnabled());
  };
  const handleCompelteCallOut = async () => {
    if (hasDialled === false) {
      await leave();
      return navigation.goBack();
    }
  };
  return (
    <View style={styles.main}>
      <View style={styles.wrapper}>
        <View style={styles.videos}>
          {hasDialled ? (
            <Avatar size={130} image={{ uri: friendAvatar }} />
          ) : (
            <CountdownCircleTimer
              isPlaying
              duration={60}
              colors={['#004777', '#F7B801', '#A30000', '#A30000']}
              colorsTime={[60, 40, 20, 0]}
              onComplete={handleCompelteCallOut}
              size={130}
              strokeWidth={5}
            >
              {() => <Avatar image={{ uri: friendAvatar }} size={120} />}
            </CountdownCircleTimer>
          )}
          <Text style={{ fontSize: 20, fontFamily: GlobalStyles.fonts.fontSemiBold, marginVertical: 10 }}>
            {friendName}
          </Text>
          {hasDialled ? (
            isJoined &&
            remoteUid !== 0 && (
              <Text style={{ fontFamily: GlobalStyles.fonts.fontAudiowide, fontSize: 16, color: '#829460' }}>
                {minuteCall === 0 ? '00' : minuteCall < 10 ? '0' + minuteCall : minuteCall}
                {' : '}
                {secondCall === 0 ? '00' : secondCall < 10 ? '0' + secondCall : secondCall}
              </Text>
            )
          ) : (
            <View style={{ flexDirection: 'row', marginTop: 30 }}>
              <Text style={{ fontFamily: GlobalStyles.fonts.fontSemiBold, fontSize: 25, marginRight: 10 }}>
                Dialling
              </Text>
              <Loader />
            </View>
          )}
        </View>
        <View style={styles.actions}>
          <ButtonAction
            icon={muteStatus ? 'ios-mic' : 'ios-mic-off'}
            colorIcon={!muteStatus ? '#F65A83' : '#38E54D'}
            onPress={mute}
          />
          <ButtonAction icon={'ios-call'} onPress={leave} colorIcon="red" />
          <ButtonAction
            icon={
              agoraEngineRef !== undefined &&
              agoraEngineRef.current !== undefined &&
              Object.keys(agoraEngineRef.current).length > 0 &&
              agoraEngineRef.current.isSpeakerphoneEnabled()
                ? 'volume-up'
                : 'volume-off'
            }
            colorIcon={
              agoraEngineRef !== undefined &&
              agoraEngineRef.current !== undefined &&
              Object.keys(agoraEngineRef.current).length > 0 &&
              agoraEngineRef.current.isSpeakerphoneEnabled()
                ? '#38E54D'
                : '#FFF'
            }
            onPress={switchSpeaker}
            fontawe={true}
          />
        </View>
      </View>
    </View>
  );
}

function ButtonAction({ children, icon, onPress, fontawe, colorIcon }) {
  return (
    <View style={styles.action}>
      <TouchableNativeFeedback background={TouchableNativeFeedback.Ripple('#000', true)} onPress={onPress}>
        <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
          {!fontawe ? (
            <Ionicon name={icon} size={30} color={colorIcon} />
          ) : (
            <FontAwesome5 name={icon} size={30} color={colorIcon} />
          )}
        </View>
      </TouchableNativeFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    backgroundColor: '#fff',
    height: '100%',
    width: '100%',
  },
  wrapper: {
    flex: 1,
    height: '100%',
    justifyContent: 'space-between',
  },
  videos: {
    flex: 1,
    position: 'relative',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    bottom: 0,
    width: '100%',
    padding: 20,
  },
  action: {
    width: 65,
    height: 65,
    borderRadius: 50,
    backgroundColor: '#2C3639',
  },
  status: {
    position: 'absolute',
    width: '100%',
    bottom: 5,
    zIndex: 50,
  },
  wattingFriend: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default VoiceCall;
