import { Avatar } from '@react-native-material/core';
import { Image, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import GlobalStyles from '../../../Components/GlobalStyles/GlobalStyles';
import useAuthContext from '../../../hooks/useAuthContext';

function Message({ data = 'Error Text message', type = 'message', own, isRead, seen, seenImg }) {
  const currentUser = useAuthContext();
  return (
    <View style={[styles.wrapper, { justifyContent: own ? 'flex-end' : 'flex-start' }]}>
      {!own && <Avatar style={styles.avatarFriend} size={28} image={{ uri: currentUser.photoURL }} />}
      <View
        style={[
          type === 'message' ? styles.content : styles.contentImage,
          own && type === 'message' && styles.contentOwn,
          !own && type === 'message' && styles.contentFriend,
        ]}
      >
        {type === 'image' ? (
          <Image
            resizeMode="contain"
            size
            style={styles.image}
            source={{
              uri: 'https://reactjs.org/logo-og.png',
            }}
          />
        ) : (
          <Text style={styles.textMess}>{data}</Text>
        )}
      </View>
      <View style={styles.seen}>
        {own &&
          (isRead ? (
            seen && <Avatar size={16} image={{ uri: currentUser.photoURL }} />
          ) : (
            <Ionicons size={16} name="ios-checkmark-circle" color={GlobalStyles.colors.seenColor} />
          ))}
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
});
export default Message;
