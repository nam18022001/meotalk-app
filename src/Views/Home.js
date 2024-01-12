import messaging from '@react-native-firebase/messaging';
import { memo, useEffect } from 'react';
import { FlatList, View } from 'react-native';

import ConverseItem from '../Components/ConverseItem';
import usePreLoadContext from '../hooks/usePreLoadContext';

function Home({ navigation }) {
  const { chatRoomInfo } = usePreLoadContext();
  useEffect(() => {
    messaging().onNotificationOpenedApp((remoteMessage) => {
      if (remoteMessage.data.call === '') {
        // hander later
        // navigation.navigate('Chat', {
        //   idChatRoom: remoteMessage.data.chatRoomId,
        //   infoFriend: JSON.parse(remoteMessage.data.infoFriend),
        // });
      }
    });
  }, []);
  const renderItem = ({ item }) => {
    return <ConverseItem data={item} navigation={navigation} />;
  };
  return (
    <View style={{ backgroundColor: 'white', flex: 1, paddingTop: 10 }}>
      <FlatList data={chatRoomInfo} renderItem={renderItem} keyExtractor={(_, i) => i} />
    </View>
  );
}

export default memo(Home);
