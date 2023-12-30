import { FirebaseStorageTypes } from '@react-native-firebase/storage';
import { Avatar, IconButton } from '@react-native-material/core';
import React, { Fragment, useEffect, useRef, useState } from 'react';
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
import Entypo from 'react-native-vector-icons/Entypo';
import firestore from '@react-native-firebase/firestore';
import Ionicon from 'react-native-vector-icons/Ionicons';

import GlobalStyles from '../../Components/GlobalStyles';
import config from '../../configs';
import useAuthContext from '../../hooks/useAuthContext';
import { addFirstMessage, addMessage, getlastMessage } from '../../Services/conversationServices';
import useCallContext from '../../hooks/useCallContext';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';

function VideoCallGroup({ navigation, route }) {
  const { idCall, token, uid, channelCall, friendsInfo, groupName, reciever } = route.params;

  const currentUser = useAuthContext();
  const { setPressCall } = useCallContext();

  const [show, setShow] = useState(false);
  const [hasDialled, setHasDialled] = useState(false);
  const [isJoined, setIsJoined] = useState(false);

  const [remoteUid, setRemoteUid] = useState([]);
  const [videoRemoteStatus, setVideoRemoteStatus] = useState([]);

  const [secondCall, setSecondCall] = useState(0);
  const [minuteCall, setMinuteCall] = useState(0);

  const [muteStatus, setMuteStatus] = useState(true);
  const [videoStatus, setVideoStatus] = useState(true);

  const [dataCall, setDataCall] = useState();

  const agoraEngineRef = useRef();

  useEffect(() => {
    // Initialize Agora engine when the app starts
    async function prepare() {
      await setupVideoSDKEngine();
      await join();
      setShow(true);
    }
    prepare();

    const snapCallInfo = firestore()
      .collection('call')
      .doc(idCall)
      .onSnapshot(async (res) => {
        if (res.exists) {
          setDataCall(res.data());
          if (res.data().hasDialled.length > 0 && !reciever) {
            const has = res.data().hasDialled.filter((v) => v !== currentUser.uid).length > 0 ? true : false;
            setHasDialled(has);
          } else if (res.data().hasDialled.length > 0 && reciever) {
            const has = res.data().hasDialled.filter((v) => v === currentUser.uid).length > 0 ? true : false;
            setHasDialled(has);
          }
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
      backHandler.remove();
      snapCallInfo();
    };
  }, []);

  useEffect(() => {
    if (
      typeof dataCall === 'object' &&
      Object.keys(dataCall).length > 0 &&
      dataCall.cancelDialled.length === dataCall.recieverId.length
    ) {
      try {
        leave(true);
      } catch (error) {}
    }
  }, [dataCall, secondCall, minuteCall]);

  useEffect(() => {
    function createIncreament() {
      if (secondCall !== -1 && hasDialled && remoteUid.length > 0) {
        if (secondCall === 59) {
          setSecondCall(0);
          setMinuteCall(minuteCall + 1);
        } else {
          setSecondCall(secondCall + 1);
        }
      }
    }

    let countCalltime = setTimeout(createIncreament, 1000);
    if (secondCall === -1) {
      clearTimeout(countCalltime);
    }
    return () => {
      clearTimeout(countCalltime);
    };
  }, [secondCall, hasDialled, remoteUid]);

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
          console.log('Successfully joined the channel ' + channelCall);
          setIsJoined(true);
        },
        onUserJoined: (_connection, Uid) => {
          console.log('Remote user joined with uid ' + Uid, _connection);
          setRemoteUid((prevUsers) => {
            if (prevUsers.filter((v) => v === Uid).length === 0) {
              return [...prevUsers, Uid];
            } else {
              return [...prevUsers];
            }
          });
        },
        onUserOffline: (_connection, Uid) => {
          console.log('Remote user left the channel. uid: ' + Uid);
          setRemoteUid((prevUsers) => prevUsers.filter((v) => v !== Uid));
          setVideoRemoteStatus((prevUsers) => prevUsers.filter((v) => v.Uid !== Uid));
        },
        onRemoteVideoStateChanged: (_connection, Uid, state) => {
          setVideoRemoteStatus((prevUsers) => {
            if (prevUsers.filter((v) => v.Uid === Uid).length === 0) {
              return [...prevUsers, { Uid, state }];
            } else {
              return [...prevUsers.filter((v) => v.Uid !== Uid), { Uid, state }];
            }
          });
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
      agoraEngineRef.current?.joinChannel(token, channelCall, uid, {
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
      });
    } catch (e) {
      console.log(e);
    }
  };

  const setLeave = async (last = false) => {
    const channelName = idCall;
    setPressCall(true);
    if (last) {
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
          callVideo: true,
          isGroup: true,
          photoSender: dataCall.callerAvatar,
        });
      } else {
        const dataLast = await getlastMessage({ collectChat });

        await addMessage({
          collectChat,
          currentUser: currentUserAlpha,
          data: `Cuộc gọi thoại\n${`${minuteCall === 0 ? '00' : minuteCall < 10 ? '0' + minuteCall : minuteCall}:${
            secondCall === 0 ? '00' : secondCall < 10 ? '0' + secondCall : secondCall
          }`}`,
          callVideo: true,
          dataLast,
          isGroup: true,
          photoSender: dataCall.callerAvatar,
        });
      }
      await chatRoom.update({
        time: Date.now(),
      });
      await firestore().collection('call').doc(idCall).delete();
      return setPressCall(false);
    } else {
      let cancelDialled = dataCall.cancelDialled;
      if (cancelDialled.filter((v) => v === currentUser.uid).length === 0) {
        cancelDialled.push(currentUser.uid);
      }
      await firestore().collection('call').doc(idCall).update({
        cancelDialled,
      });
      return setPressCall(false);
    }
  };

  const leave = async (auto = false) => {
    try {
      agoraEngineRef.current?.enableLocalAudio();
      agoraEngineRef.current?.disableVideo();
      agoraEngineRef.current?.leaveChannel();
      if (auto === true) {
        await setLeave(true);
      } else if (auto === false) {
        if (remoteUid.length > 0 && hasDialled) {
          await setLeave();
        } else if (remoteUid.length === 0 && hasDialled) {
          await setLeave(true);
        } else if (hasDialled === false) {
          await handleMissCall();
        } else {
          await firestore().collection('call').doc(idCall).delete();
        }
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
  const video = () => {
    agoraEngineRef.current?.enableLocalVideo(!videoStatus);
    setVideoStatus(!videoStatus);
  };
  const switchCamera = () => {
    agoraEngineRef.current?.switchCamera();
  };

  const handleCompelteCallOut = async () => {
    if (hasDialled === false) {
      await leave(false);
    }
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
        callVideo: true,
        isGroup: true,
        photoSender: dataCall.callerAvatar,
      });
    } else {
      const dataLast = await getlastMessage({ collectChat });

      await addMessage({
        collectChat,
        currentUser: currentUserAlpha,
        data: 'Cuộc gọi nhỡ',
        callVideo: true,
        dataLast,
        isGroup: true,
        photoSender: dataCall.callerAvatar,
      });
    }
    await chatRoom.update({
      time: Date.now(),
    });
    await firestore().collection('call').doc(idCall).delete();
    setPressCall(false);
  };
  return (
    <View style={styles.main}>
      <View style={styles.wrapper}>
        {isJoined && remoteUid.length > 0 && (
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
            {remoteUid.length > 0 && hasDialled === true ? (
              remoteUid.map((id, index) => {
                const videoRemoteState = videoRemoteStatus.filter((v) => v.Uid === id)[0];
                const infoRemote = friendsInfo.filter((v) => v.id === id)[0];

                if (reciever === false) {
                  if (
                    videoRemoteState !== undefined &&
                    typeof videoRemoteState === 'object' &&
                    videoRemoteStatus.length > 0 &&
                    videoRemoteState.state !== undefined &&
                    videoRemoteState['state'] !== 0
                  ) {
                    return (
                      <View
                        key={index}
                        style={{
                          borderColor: '#fff',
                          borderStyle: 'solid',
                          borderTopWidth: 1,
                          borderEndWidth: 1,
                          flex: 1,
                        }}
                      >
                        <RtcSurfaceView
                          canvas={{ uid: id }}
                          style={{
                            flex: 1,
                          }}
                        />
                      </View>
                    );
                  } else {
                    return (
                      <View key={index} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Avatar image={{ uri: infoRemote.photoURL }} size={100} />
                        <Text style={{ fontFamily: GlobalStyles.fonts.fontSemiBold, fontSize: 16, marginTop: 10 }}>
                          Camera {infoRemote.displayName} đang tắt
                        </Text>
                      </View>
                    );
                  }
                } else if (reciever === true) {
                  if (
                    typeof videoRemoteState === 'object' &&
                    videoRemoteState.state !== undefined &&
                    videoRemoteState !== undefined &&
                    videoRemoteStatus.length > 0 &&
                    videoRemoteState['state'] !== 0
                  ) {
                    return (
                      <View
                        key={index}
                        style={{
                          borderColor: '#fff',
                          borderStyle: 'solid',
                          borderTopWidth: 1,
                          borderEndWidth: 1,
                          flex: 1,
                        }}
                      >
                        <RtcSurfaceView
                          canvas={{ uid: id }}
                          style={{
                            flex: 1,
                          }}
                        />
                      </View>
                    );
                  } else if (
                    typeof videoRemoteState === 'object' &&
                    videoRemoteState.state !== undefined &&
                    videoRemoteState !== undefined &&
                    videoRemoteStatus.length > 0 &&
                    videoRemoteState['state'] === 0
                  ) {
                    return (
                      <View key={index} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Avatar image={{ uri: infoRemote.photoURL }} size={100} />
                        <Text style={{ fontFamily: GlobalStyles.fonts.fontSemiBold, fontSize: 16, marginTop: 10 }}>
                          Camera {infoRemote.displayName} đang tắt
                        </Text>
                      </View>
                    );
                  } else if (remoteUid.length > 0 && videoRemoteStatus.length < remoteUid.length) {
                    if (
                      typeof videoRemoteState === 'object' &&
                      videoRemoteState !== undefined &&
                      videoRemoteState.state !== undefined &&
                      videoRemoteStatus.length > 0 &&
                      videoRemoteState['state'] !== 0
                    ) {
                      return (
                        <View
                          key={index}
                          style={{
                            borderColor: '#fff',
                            borderStyle: 'solid',
                            borderTopWidth: 1,
                            borderEndWidth: 1,
                            flex: 1,
                          }}
                        >
                          <RtcSurfaceView
                            canvas={{ uid: id }}
                            style={{
                              flex: 1,
                            }}
                          />
                        </View>
                      );
                    } else {
                      return (
                        <View key={index} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                          <Avatar image={{ uri: infoRemote.photoURL }} size={100} />
                          <Text style={{ fontFamily: GlobalStyles.fonts.fontSemiBold, fontSize: 16, marginTop: 10 }}>
                            Camera {infoRemote.displayName} đang tắt
                          </Text>
                        </View>
                      );
                    }
                  } else return null;
                } else return null;
              })
            ) : hasDialled === false ? (
              <View style={styles.wattingFriend}>
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                  {friendsInfo.slice(0, 3).map((info, index) => (
                    <View key={index} style={{ marginLeft: -25 }}>
                      <Avatar
                        style={{ borderColor: '#fff', borderStyle: 'solid', borderWidth: 2 }}
                        image={{ uri: info.photoURL }}
                        size={80}
                      />
                      {friendsInfo.length > 3 && index === 2 && (
                        <View
                          style={{
                            width: 80,
                            height: 80,
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
                <Text style={{ fontFamily: GlobalStyles.fonts.fontSemiBold, fontSize: 20, marginVertical: 10 }}>
                  {groupName}
                </Text>
                <View style={{ flexDirection: 'row', marginTop: 20, alignItems: 'center' }}>
                  <CountdownCircleTimer
                    isPlaying
                    duration={60}
                    colors={['#004777', '#F7B801', '#A30000', '#A30000']}
                    colorsTime={[60, 40, 20, 0]}
                    onComplete={handleCompelteCallOut}
                    size={42}
                    strokeWidth={3}
                  >
                    {({ remainingTime }) => <Text style={{ fontSize: 12 }}>{remainingTime}s</Text>}
                  </CountdownCircleTimer>
                  <Text style={{ fontFamily: GlobalStyles.fonts.fontSemiBold, fontSize: 25, marginHorizontal: 10 }}>
                    Dialling
                  </Text>
                  <Loader />
                </View>
              </View>
            ) : (
              <View style={styles.wattingFriend}>
                <View style={{ flexDirection: 'row', marginTop: 20 }}>
                  <Text style={{ fontFamily: GlobalStyles.fonts.fontSemiBold, fontSize: 25, marginRight: 10 }}>
                    Waiting for others
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
          <ButtonAction icon={'ios-call'} onPress={() => leave(false)} colorIcon="red" />
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
function ButtonAction({ icon, onPress, fontawe, colorIcon }) {
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
    zIndex: 999,
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
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
export default VideoCallGroup;
