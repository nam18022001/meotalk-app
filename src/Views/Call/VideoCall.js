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

function VideoCall({ navigation, route }) {
  const { idCall, token, uid, friendAvatar, friendName } = route.params;

  const currentUser = useAuthContext();

  const agoraEngineRef = useRef();

  const [show, setShow] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [muteStatus, setMuteStatus] = useState(true);
  const [videoStatus, setVideoStatus] = useState(true);
  const [videoRemoteStatus, setVideoRemoteStatus] = useState(1);
  const [remoteUid, setRemoteUid] = useState(0);
  const [message, setMessage] = useState('');
  const [caller, setCaller] = useState({});
  const [secondCall, setSecondCall] = useState(0);
  const [minuteCall, setMinuteCall] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Initialize Agora engine when the app starts
    async function prepare() {
      await setupVideoSDKEngine();
      join();
      setShow(true);
    }

    // firestore().collection('call').where()
    // return () => {
    //   setupVideoSDKEngine();
    //   join();

    // };
    prepare();

    const checkPuckOut = firestore()
      .collection('call')
      .where('channelName', '==', idCall)
      // .where()
      .onSnapshot((res) => {
        if (res.empty) {
          agoraEngineRef.current?.enableLocalAudio();
          agoraEngineRef.current?.disableVideo();
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

  const setupVideoSDKEngine = async () => {
    try {
      // use the helper function to get permissions
      if (Platform.OS === 'android') {
        await getPermission();
      }
      agoraEngineRef.current = createAgoraRtcEngine();
      const agoraEngine = agoraEngineRef.current;

      agoraEngine.registerEventHandler({
        onJoinChannelSuccess: () => {
          showMessage('Successfully joined the channel ' + idCall);
          setIsJoined(true);
        },
        onUserJoined: (_connection, Uid) => {
          showMessage('Remote user joined with uid ' + Uid);
          setRemoteUid(Uid);
        },
        onUserOffline: (_connection, Uid) => {
          showMessage('Remote user left the channel. uid: ' + Uid);
          agoraEngineRef.current?.enableLocalAudio();
          agoraEngineRef.current?.disableVideo();
          agoraEngineRef.current?.leaveChannel();
          setRemoteUid(0);
          firestore().collection('call').doc(idCall).delete();
        },
        onRemoteVideoStateChanged: (_connection, Uid, state) => {
          setVideoRemoteStatus(state);
        },
      });
      agoraEngine.initialize({
        appId: config.configAgora.appId,
        channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
      });
      agoraEngine.enableVideo();
      agoraEngine.enableAudio();
    } catch (e) {
      console.log(e);
    }
  };
  function showMessage(msg) {
    setMessage(msg);
  }
  const getPermission = async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.CAMERA,
      ]);
    }
  };
  const join = async () => {
    if (isJoined) {
      return;
    }
    try {
      agoraEngineRef.current?.setChannelProfile(ChannelProfileType.ChannelProfileCommunication);
      agoraEngineRef.current?.startPreview();
      agoraEngineRef.current?.joinChannel(token, idCall, uid, {
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
      });
    } catch (e) {
      console.log(e);
    }
  };
  const leave = () => {
    try {
      agoraEngineRef.current?.enableLocalAudio();
      agoraEngineRef.current?.disableVideo();
      agoraEngineRef.current?.leaveChannel();
      firestore().collection('call').doc(idCall).delete();
    } catch (e) {
      console.log(e);
    }
    return navigation.goBack();
  };
  const mute = () => {
    agoraEngineRef.current?.enableLocalAudio(!muteStatus);
    setMuteStatus(!muteStatus);
  };
  const video = () => {
    agoraEngineRef.current?.enableLocalVideo(!videoStatus);
    setVideoStatus(!videoStatus);
  };
  const switchCamera = () => {
    agoraEngineRef.current?.switchCamera();
  };
  return (
    <View style={styles.main}>
      <View style={styles.wrapper}>
        {isJoined && remoteUid !== 0 && (
          <View
            style={{
              position: 'absolute',
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              top: 20,
              zIndex: 99,
            }}
          >
            <Text style={{ fontFamily: GlobalStyles.fonts.fontAudiowide, fontSize: 16, color: '#829460' }}>
              {minuteCall === 0 ? '00' : minuteCall < 10 ? '0' + minuteCall : minuteCall}
              {' : '}
              {secondCall === 0 ? '00' : secondCall < 10 ? '0' + secondCall : secondCall}
            </Text>
          </View>
        )}
        <View style={styles.videos}>
          <View key={1} style={styles.videoRemoteView}>
            {remoteUid !== 0 ? (
              videoRemoteStatus === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <Avatar image={{ uri: friendAvatar }} size={130} />
                  <Text style={{ fontFamily: GlobalStyles.fonts.fontSemiBold, fontSize: 16, marginTop: 10 }}>
                    Camera {friendName} đang tắt
                  </Text>
                </View>
              ) : (
                <RtcSurfaceView canvas={{ uid: remoteUid }} style={{ flex: 1 }} />
              )
            ) : (
              <View style={styles.wattingFriend}>
                <Avatar image={{ uri: friendAvatar }} size={130} />
                <View style={{ flexDirection: 'row', marginTop: 30 }}>
                  <Text style={{ fontFamily: GlobalStyles.fonts.fontSemiBold, fontSize: 25, marginRight: 10 }}>
                    Dialling
                  </Text>
                  <Loader />
                </View>
              </View>
            )}
          </View>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <IconButton onPress={switchCamera} icon={<Ionicon name="ios-sync-circle" size={30} />} />
            <View style={styles.myVideoView} key={remoteUid + 100}>
              {show &&
                (videoStatus ? (
                  <RtcSurfaceView
                    canvas={{ uid: 0 }}
                    style={{
                      position: 'absolute',
                      height: '100%',
                      width: '100%',
                      zIndex: 50,
                    }}
                  />
                ) : (
                  <View
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: GlobalStyles.colors.powderGrey,
                    }}
                  >
                    <Avatar image={{ uri: currentUser.photoURL, cache: 'force-cache' }} size={70} />
                  </View>
                ))}
              <View style={styles.status}>
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-evenly' }}>
                  {videoStatus ? (
                    <FontAwesome5 name={'video'} size={15} color="#2C3639" />
                  ) : (
                    <FontAwesome5 name={'video-slash'} size={15} color="#2C3639" />
                  )}
                  <View style={{ width: 1, height: '100%', backgroundColor: '#2C3639' }}></View>
                  {muteStatus ? (
                    <Ionicon name={'ios-mic'} size={15} color="#2C3639" />
                  ) : (
                    <Ionicon name={'ios-mic-off'} size={15} color="#2C3639" />
                  )}
                </View>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.actions}>
          <ButtonAction
            icon={muteStatus ? 'ios-mic' : 'ios-mic-off'}
            colorIcon={!muteStatus ? '#F65A83' : '#38E54D'}
            onPress={mute}
          />
          <ButtonAction icon={'ios-call'} onPress={leave} colorIcon="red" />
          <ButtonAction
            icon={videoStatus ? 'video' : 'video-slash'}
            colorIcon={!videoStatus ? '#F65A83' : '#38E54D'}
            fontawe
            onPress={video}
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
    flexDirection: 'row',
  },
  myVideoView: {
    justifyContent: 'flex-end',
    height: 180,
    width: 140,
    zIndex: 99999999,
  },
  videoRemoteView: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
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
export default VideoCall;
