import { AppBar, Avatar, IconButton } from '@react-native-material/core';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Faicons from 'react-native-vector-icons/FontAwesome5';
import GlobalStyles from '../../../Components/GlobalStyles';
import AvatarSkeleton from '../../../Components/Skeleton/AvatarSkeleton';
import LineSkeleton from '../../../Components/Skeleton/LineSkeleton';

function HeaderPrivate({ navigation, name, avatar, loadingConversation }) {
  return (
    <AppBar
      titleContentStyle={{ marginLeft: -15 }}
      title={
        <View style={styles.headerInfo}>
          {loadingConversation ? (
            <AvatarSkeleton width={40} height={40} />
          ) : (
            <Avatar size={40} image={{ uri: avatar ? avatar : undefined, cache: 'force-cache' }} />
          )}

          {loadingConversation ? (
            <LineSkeleton width={'80%'} styles={{ marginLeft: 10 }} />
          ) : (
            <Text numberOfLines={1} style={styles.nameFriend}>
              {name}
            </Text>
          )}
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
            icon={(props) => <Ionicons name="information-circle" size={20} color={GlobalStyles.colors.primary} />}
            color={GlobalStyles.colors.primary}
            onPress={() => {}}
          />
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
export default HeaderPrivate;
