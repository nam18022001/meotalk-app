import { ScrollView, StyleSheet, Text, View } from 'react-native';
import GlobalStyles from '../Components/GlobalStyles/GlobalStyles';

import useAuthContext from '../hooks/useAuthContext';
import HeaderChat from './components/Header';
import Input from './components/Input';
import Message from './components/Message';

function Chat({ navigation, route }) {
  const { idChatRoom } = route.params;
  const currentUser = useAuthContext();
  return (
    <View style={styles.wrapper}>
      <HeaderChat navigation={navigation} userFriend={currentUser} />
      <ScrollView style={styles.messages}>
        <View
          style={{
            flexDirection: 'column-reverse',
          }}
        >
          <Message data="start" own={true} isRead seen />
          <Message />
          <Message own />
          <Message type="image" />
          <Message own />
          <Message data="end" />
        </View>
      </ScrollView>
      <Input />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: '100%',
    backgroundColor: 'white',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  messages: {
    flex: 1,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 20,
  },
});
export default Chat;
