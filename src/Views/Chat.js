import { Button } from '@react-native-material/core';
import { Text, View } from 'react-native';

function Chat({ navigation, route }) {
  const { idChatRoom } = route.params;
  return (
    <View>
      <Text>{idChatRoom}</Text>
      <Button title="Go Back" onPress={() => navigation.goBack()} />
    </View>
  );
}

export default Chat;
