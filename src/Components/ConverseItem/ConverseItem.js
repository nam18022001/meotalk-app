import { Avatar } from '@react-native-material/core';
import { StyleSheet, Text, TouchableNativeFeedback, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import useAuthContext from '../../hooks/useAuthContext';
import GlobalStyles from '../GlobalStyles/GlobalStyles';

function ConverseItem({ navigation }) {
  const currentUser = useAuthContext();

  const handleChatRoom = () => {
    navigation.navigate('Chat', {
      idChatRoom: 'hallo',
    });
  };
  return (
    <TouchableNativeFeedback
      style={styles.button}
      background={TouchableNativeFeedback.Ripple('rgba(34,34,34,0.3)', false)}
      onPress={handleChatRoom}
    >
      <View style={styles.wrapper}>
        <View>
          <Avatar image={{ uri: currentUser.photoURL }} />
        </View>
        <View style={styles.info}>
          <Text>{currentUser.displayName}</Text>
          <Text>{currentUser.email}</Text>
        </View>
        <View style={styles.seen}>
          {/* <Ionicons size={16} name="ios-checkmark-circle" color={GlobalStyles.colors.seenColor} /> */}
          <Avatar size={16} image={{ uri: currentUser.photoURL }} />
        </View>
      </View>
    </TouchableNativeFeedback>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    padding: 20,
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  info: {
    flexDirection: 'column',
    flex: 1,
    marginLeft: 15,
  },
  text: {
    fontFamily: GlobalStyles.fonts.fontRegular,
  },
  seen: {},
});
export default ConverseItem;
