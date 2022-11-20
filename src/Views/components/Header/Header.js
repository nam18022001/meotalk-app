import { AppBar, Avatar, IconButton } from '@react-native-material/core';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import GlobalStyles from '../../../Components/GlobalStyles';

function HeaderChat({ navigation, userFriend, onPressCallVideo }) {
  return (
    <AppBar
      titleContentStyle={{ marginLeft: -15 }}
      title={
        <View style={styles.headerInfo}>
          <Avatar style={styles.avatarFriend} size={50} image={{ uri: userFriend.photoUrl }} />
          <Text numberOfLines={1} style={styles.nameFriend}>
            {userFriend.displayName}
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
          <IconButton icon={(props) => <Ionicons name="ios-call" {...props} />} color={GlobalStyles.colors.primary} />
          <IconButton
            icon={(props) => <Ionicons name="ios-videocam" {...props} />}
            color={GlobalStyles.colors.primary}
            onPress={onPressCallVideo}
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
    fontSize: 20,
    flex: 1,
    fontFamily: GlobalStyles.fonts.fontSemiBold,
  },
});
export default HeaderChat;
