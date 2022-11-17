import { ActivityIndicator, Avatar } from '@react-native-material/core';
import { useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import GlobalStyles from '../../../Components/GlobalStyles';

function Message({ data = 'Error Text message', type = 'message', own, isRead, seen, seenImg, marginBottom }) {
  const [loadingImg, setLoadingImg] = useState(false);

  return (
    <View
      style={[
        styles.wrapper,
        { justifyContent: own ? 'flex-end' : 'flex-start' },
        marginBottom && { marginBottom: 10 },
      ]}
    >
      {!own && <Avatar style={styles.avatarFriend} size={28} image={{ uri: seenImg, cache: 'force-cache' }} />}
      <View
        style={[
          type === 'message' ? styles.content : styles.contentImage,
          own && type === 'message' && styles.contentOwn,
          !own && type === 'message' && styles.contentFriend,
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
        ) : (
          <Text style={styles.textMess}>{data}</Text>
        )}
      </View>
      <View style={styles.seen}>
        {own ? (
          isRead ? (
            seen && <Avatar size={16} image={{ uri: seenImg, cache: 'force-cache' }} />
          ) : (
            <Ionicons size={16} name="ios-checkmark-circle" color={GlobalStyles.colors.seenColor} />
          )
        ) : (
          <View></View>
        )}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    marginTop: 10,
    flex: 1,
    flexDirection: 'row',
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
});
export default Message;
