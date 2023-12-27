import { AppBar, Avatar, IconButton } from '@react-native-material/core';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Faicons from 'react-native-vector-icons/FontAwesome5';
import GlobalStyles from '../../../Components/GlobalStyles';

function HeaderChat({ navigation, userFriend, onPressCallVideo, onChangeNameGroup, isGroup, chatRoomName = '' }) {
  return (
    <AppBar
      titleContentStyle={{ marginLeft: -15 }}
      title={
        <View style={styles.headerInfo}>
          {userFriend.length > 0 &&
            (userFriend.length > 1 ? (
              <View style={styles.groupAvatar}>
                <Avatar
                  style={styles.leftAvatar}
                  image={{ uri: userFriend[0].photoURL ? userFriend[0].photoURL : undefined, cache: 'force-cache' }}
                  size={30}
                />
                <Avatar
                  style={styles.rightAvatar}
                  image={{ uri: userFriend[1].photoURL ? userFriend[1].photoURL : undefined, cache: 'force-cache' }}
                  size={30}
                />
              </View>
            ) : (
              <Avatar
                size={40}
                image={{ uri: userFriend[0].photoURL ? userFriend[0].photoURL : undefined, cache: 'force-cache' }}
              />
            ))}
          {/* <Avatar style={styles.avatarFriend} size={50} image={{ uri: userFriend.photoURL, cache: 'force-cache' }} /> */}
          <Text numberOfLines={1} style={styles.nameFriend}>
            {isGroup
              ? chatRoomName && chatRoomName.length > 0
                ? chatRoomName
                : userFriend.map((info, index) => info.displayName + `${index === userFriend.length - 1 ? '' : ', '} `)
              : userFriend.length > 0 && userFriend[0].displayName}
          </Text>
        </View>
      }
      color="#fff"
      leading={(props) => (
        <IconButton
          icon={(props) => <Ionicons name="arrow-back" {...props} />}
          color={GlobalStyles.colors.primary}
          onPress={() => navigation.goBack()}
        />
      )}
      trailing={(props) => (
        <View style={styles.headerInfo}>
          <IconButton
            style={{ width: 30, height: 30, marginRight: 5 }}
            icon={(props) => <Ionicons name="ios-call" size={20} color={GlobalStyles.colors.primary} />}
            color={GlobalStyles.colors.primary}
          />
          <IconButton
            style={{ width: 30, height: 30, marginRight: 5 }}
            icon={(props) => <Ionicons name="ios-videocam" size={20} color={GlobalStyles.colors.primary} />}
            color={GlobalStyles.colors.primary}
            onPress={onPressCallVideo}
          />
          {isGroup && (
            <IconButton
              style={{ width: 30, height: 30 }}
              icon={(props) => <Faicons name="pen-nib" size={20} color={GlobalStyles.colors.primary} />}
              color={GlobalStyles.colors.primary}
              onPress={onChangeNameGroup}
            />
          )}
        </View>
      )}
    />
  );
}
const styles = StyleSheet.create({
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameFriend: {
    marginLeft: 10,
    fontSize: 18,
    flex: 1,
    fontFamily: GlobalStyles.fonts.fontSemiBold,
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
});
export default HeaderChat;
