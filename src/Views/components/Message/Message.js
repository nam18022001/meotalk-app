import { ActivityIndicator, Avatar } from '@react-native-material/core';
import { Fragment, useState } from 'react';
import { Button, Dimensions, Image, StyleSheet, Text, TouchableNativeFeedback, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Faicons from 'react-native-vector-icons/FontAwesome5';

import GlobalStyles from '../../../Components/GlobalStyles';
import useAuthContext from '../../../hooks/useAuthContext';

function Message({
  data = 'Error Text message',
  type = 'message',
  own,
  isRead,
  seen,
  seenImg,
  marginBottom,
  seenGroup = [],
  isGroup,
  photoSender = '',
}) {
  const currentUser = useAuthContext();
  const [loadingImg, setLoadingImg] = useState(false);

  return (
    <View
      style={[
        styles.wrapper,
        !isGroup && { justifyContent: own ? 'flex-end' : 'flex-start' },
        isGroup && { alignItems: own ? 'flex-end' : 'flex-start' },
        { flexDirection: isGroup ? 'column' : 'row' },
        marginBottom && { marginBottom: 10 },
      ]}
    >
      {isGroup ? (
        <Fragment>
          <View style={[styles.groupMessage, { justifyContent: own ? 'flex-end' : 'flex-start' }]}>
            {!own && (
              <Avatar
                style={styles.avatarFriend}
                size={28}
                image={{ uri: isGroup ? photoSender : seenImg ? seenImg : undefined, cache: 'force-cache' }}
              />
            )}
            <View
              style={[
                type === 'message'
                  ? styles.content
                  : type === 'image'
                  ? styles.contentImage
                  : type === 'videoCall'
                  ? styles.content
                  : type === 'call' && styles.content,
                own && type === 'message' && styles.contentOwn,
                own && type === 'videoCall' && styles.contentOwn,
                own && type === 'call' && styles.contentOwn,
                !own && type === 'message' && styles.contentFriend,
                !own && type === 'videoCall' && styles.contentFriend,
                !own && type === 'call' && styles.contentFriend,
              ]}
            >
              {type === 'image' ? (
                <View>
                  <Image
                    resizeMode="contain"
                    style={[styles.image, loadingImg && styles.loading]}
                    source={{
                      uri: data,
                      cache: 'force-cache',
                    }}
                    onProgress={() => setLoadingImg(true)}
                    onLoadEnd={() => setLoadingImg(false)}
                  />
                  {loadingImg && (
                    <ActivityIndicator
                      size={50}
                      color={GlobalStyles.colors.primary}
                      style={{
                        position: 'absolute',
                        left: '40%',
                        top: '40%',
                      }}
                    />
                  )}
                </View>
              ) : type === 'videoCall' || type === 'call' ? (
                <View style={styles.misscall}>
                  <Text style={{ fontSize: 16, color: '#fff' }}>{data}</Text>
                  <TouchableNativeFeedback
                    background={TouchableNativeFeedback.Ripple('#000', false)}
                    onPress={() => {}}
                  >
                    <View
                      style={[
                        styles.reCall,
                        { backgroundColor: !own ? 'rgba(130,131,133,0.64)' : 'bg-[rgba(0,0,0,0.55)' },
                      ]}
                    >
                      {type === 'videoCall' ? (
                        data === 'Cuộc gọi nhỡ' ? (
                          <Faicons
                            style={{ color: !own ? GlobalStyles.colors.dangerColor : '#fff', marginRight: 10 }}
                            size={18}
                            name="video-slash"
                          />
                        ) : (
                          <Faicons style={{ marginRight: 10 }} size={18} name="video" color={'#fff'} />
                        )
                      ) : type === 'call' && data === 'Cuộc gọi nhỡ' ? (
                        <Faicons
                          style={{ color: !own ? GlobalStyles.colors.dangerColor : '#fff', marginRight: 10 }}
                          size={18}
                          name="video-slash"
                        />
                      ) : (
                        <Faicons style={{ marginRight: 10 }} size={18} name="phone" color={'#fff'} />
                      )}
                      <Text style={{ color: '#fff' }}>RE CALL</Text>
                    </View>
                  </TouchableNativeFeedback>
                </View>
              ) : (
                <Text style={styles.textMess}>{data}</Text>
              )}
            </View>
          </View>
        </Fragment>
      ) : (
        <Fragment>
          {!own && (
            <Avatar
              style={styles.avatarFriend}
              size={28}
              image={{ uri: isGroup ? photoSender : seenImg ? seenImg : undefined, cache: 'force-cache' }}
            />
          )}
          <View
            style={[
              type === 'message'
                ? styles.content
                : type === 'image'
                ? styles.contentImage
                : type === 'videoCall'
                ? styles.content
                : type === 'call' && styles.content,
              own && type === 'message' && styles.contentOwn,
              own && (type === 'videoCall' || type === 'call') && styles.contentOwn,
              !own && type === 'message' && styles.contentFriend,
              !own && (type === 'videoCall' || type === 'call') && styles.contentFriend,
            ]}
          >
            {type === 'image' ? (
              <View>
                <Image
                  resizeMode="contain"
                  style={[styles.image, loadingImg && styles.loading]}
                  source={{
                    uri: data,
                    cache: 'force-cache',
                  }}
                  onProgress={() => setLoadingImg(true)}
                  onLoadEnd={() => setLoadingImg(false)}
                />
                {loadingImg && (
                  <ActivityIndicator
                    size={50}
                    color={GlobalStyles.colors.primary}
                    style={{
                      position: 'absolute',
                      left: '40%',
                      top: '40%',
                    }}
                  />
                )}
              </View>
            ) : type === 'videoCall' || type === 'call' ? (
              <View style={styles.misscall}>
                <Text style={{ fontSize: 14, color: '#fff', textAlign: 'left', flex: 1 }}>{data}</Text>

                <TouchableNativeFeedback
                  background={TouchableNativeFeedback.Ripple('#000', false)}
                  onPress={() => {
                    type === 'videoCall' ? console.log('re call video') : console.log('re call');
                  }}
                >
                  <View
                    style={[
                      styles.reCall,
                      { backgroundColor: !own ? 'rgba(130,131,133,0.64)' : 'bg-[rgba(0,0,0,0.55)' },
                    ]}
                  >
                    {type === 'videoCall' ? (
                      data === 'Cuộc gọi nhỡ' ? (
                        <Faicons
                          style={{ color: !own ? GlobalStyles.colors.dangerColor : '#fff', marginRight: 10 }}
                          size={18}
                          name="video-slash"
                        />
                      ) : (
                        <Faicons style={{ marginRight: 10 }} color={'#fff'} size={18} name="video" />
                      )
                    ) : type === 'call' ? (
                      data === 'Cuộc gọi nhỡ' ? (
                        <Faicons
                          style={{ color: !own ? GlobalStyles.colors.dangerColor : '#fff', marginRight: 10 }}
                          size={18}
                          name="phone-slash"
                        />
                      ) : (
                        <Faicons style={{ marginRight: 10 }} size={18} name="phone" color={'#fff'} />
                      )
                    ) : (
                      <Faicons style={{ marginRight: 10 }} size={18} name="phone" color={'#fff'} />
                    )}
                    <Text style={{ color: '#fff' }}>RE CALL</Text>
                  </View>
                </TouchableNativeFeedback>
              </View>
            ) : (
              <Text style={styles.textMess}>{data}</Text>
            )}
          </View>
        </Fragment>
      )}

      {!isGroup && (
        <View style={styles.seen}>
          {own ? (
            isRead ? (
              seen && <Avatar size={16} image={{ uri: seenImg ? seenImg : undefined, cache: 'force-cache' }} />
            ) : (
              <Ionicons size={16} name="ios-checkmark-circle" color={GlobalStyles.colors.seenColor} />
            )
          ) : (
            <View></View>
          )}
        </View>
      )}
      {isGroup && (
        <View style={{ width: '100%', display: 'flex', alignItems: 'flex-end', marginTop: 5 }}>
          <View style={[styles.seenGroup, { display: 'flex', flexDirection: 'row' }]}>
            {seen
              ? seenGroup.length > 0 &&
                seenGroup.map(
                  (see, index) =>
                    see.seenBy !== currentUser.email && (
                      <Avatar
                        style={styles.avatarGroupSeen}
                        key={index}
                        size={16}
                        image={{ uri: see.photoURL ? see.photoURL : undefined, cache: 'force-cache' }}
                      />
                    ),
                )
              : !seen &&
                seenGroup.length === 0 &&
                own && <Ionicons size={16} name="ios-checkmark-circle" color={GlobalStyles.colors.seenColor} />}
          </View>
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    marginTop: 10,
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  content: {
    maxWidth: 300,
    overflow: 'hidden',
    backgroundColor: '#3e4042',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  contentImage: {
    maxWidth: 300,
  },

  contentOwn: {
    backgroundColor: GlobalStyles.colors.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 5,
  },
  contentFriend: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 20,
  },
  textMess: {
    fontFamily: GlobalStyles.fonts.fontRegular,
    fontSize: 16,
    color: '#fff',
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  avatarFriend: {
    marginRight: 8,
  },
  seen: {
    width: 16,
    marginLeft: 8,
  },
  loading: {
    backgroundColor: GlobalStyles.colors.powderGreyOpacity,
  },
  seenGroup: {
    minWidth: 20,
    maxWidth: 250,
  },
  avatarGroupSeen: {
    marginLeft: 1,
  },
  groupMessage: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  misscall: {
    width: 150,
    height: 70,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reCall: {
    width: '100%',
    marginTop: 10,
    borderRadius: 5,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
});
export default Message;
