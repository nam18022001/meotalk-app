import { Avatar } from '@react-native-material/core';
import moment from 'moment';
import { memo } from 'react';
import { FlatList, StyleSheet, Text, TouchableNativeFeedback, View } from 'react-native';
import Foundation from 'react-native-vector-icons/Foundation';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import GlobalStyles from '../Components/GlobalStyles';
import config from '../configs';
import useAuthContext from '../hooks/useAuthContext';
import usePreLoadContext from '../hooks/usePreLoadContext';

function HomePrivate({ navigation }) {
  const { listPrivateInfo } = usePreLoadContext();
  const currentUser = useAuthContext();

  const handleChatRoom = (item) => {
    navigation.navigate(config.routes.chatPrivate, {
      dataRoom: item,
    });
  };

  const renderItem = ({ item }) => {
    return (
      Object.keys(item).length > 0 && (
        <TouchableNativeFeedback
          background={TouchableNativeFeedback.Ripple('rgba(34,34,34,0.3)', false)}
          onPress={() => handleChatRoom(item)}
        >
          <View style={styles.wrapper}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {item.sender === currentUser.uid && item.isAccepted === true && (
                <MaterialCommunityIcons
                  name="account-key"
                  size={25}
                  style={{ marginRight: 5 }}
                  color={GlobalStyles.colors.successColor}
                />
              )}
              {item.sender === currentUser.uid && item.isAccepted === false && (
                <Ionicons
                  name="hourglass-outline"
                  size={25}
                  style={{ marginRight: 5 }}
                  color={GlobalStyles.colors.warningColor}
                />
              )}
              {item.reciever === currentUser.uid && item.isAccepted === false && (
                <Foundation
                  name="burst-new"
                  size={25}
                  style={{ marginRight: 5 }}
                  color={GlobalStyles.colors.warningColor}
                />
              )}
              <Avatar
                size={50}
                image={{
                  uri:
                    Object.keys(item).length > 0
                      ? item.usersPhoto.filter((v) => v !== currentUser.photoURL)[0]
                      : undefined,
                  cache: 'force-cache',
                }}
              />
            </View>
            <View style={styles.info}>
              <Text style={styles.chatRoomName} numberOfLines={1}>
                {item.usersDisplayName.filter((v) => v !== currentUser.displayName)[0]}
              </Text>
              <View style={styles.converseInbox}>
                <View style={styles.preLastMess}>
                  <Text numberOfLines={1} style={styles.text}>
                    {item.usersEmail.filter((v) => v !== currentUser.email)[0]}
                  </Text>
                  <Text style={styles.text}>
                    <Text style={{ fontWeight: '900' }}> {'\u00B7'} </Text>
                    {moment(new Date(item.time).toISOString()).fromNow()}
                  </Text>
                </View>
              </View>
            </View>
            {item.sender === currentUser.uid
              ? item.unSeenSender > 0 && (
                  <View
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: 18,
                      height: 18,
                      borderRadius: 99,

                      backgroundColor: GlobalStyles.colors.dangerColor,
                    }}
                  >
                    <Text numberOfLines={1} style={{ color: '#fff', textAlign: 'center', fontSize: 12 }}>
                      {item.unSeenSender > 9 ? '9+' : item.unSeenSender}
                    </Text>
                  </View>
                )
              : item.unSeenReciever > 0 && (
                  <View
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: 18,
                      height: 18,
                      borderRadius: 99,

                      backgroundColor: GlobalStyles.colors.dangerColor,
                    }}
                  >
                    <Text numberOfLines={1} style={{ color: '#fff', textAlign: 'center', fontSize: 12 }}>
                      {item.unSeenReciever > 9 ? '9+' : item.unSeenReciever}
                    </Text>
                  </View>
                )}
          </View>
        </TouchableNativeFeedback>
      )
    );
  };
  return (
    <View style={{ backgroundColor: 'white', flex: 1, paddingTop: 10 }}>
      <FlatList data={listPrivateInfo} renderItem={renderItem} keyExtractor={(_, i) => i} />
    </View>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    padding: 10,
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  info: {
    flex: 1,
    flexDirection: 'column',
    marginLeft: 15,
    paddingRight: 10,
  },
  converseInbox: {
    flexDirection: 'row',
  },
  preLastMess: {
    flexDirection: 'row',
    flex: 1,
  },
  text: {
    fontFamily: GlobalStyles.fonts.fontRegular,
    fontSize: 13,
  },
});
export default memo(HomePrivate);
