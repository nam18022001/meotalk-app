import { Avatar } from '@react-native-material/core';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useLayoutEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import GlobalStyles from '../../Components/GlobalStyles';

import Friends from '../../Views/Friends';
import Home from '../../Views/Home';
import NotifiCation from '../../Views/Notification';
import Profile from '../../Views/Profile';
import Header from './Header';
import useAuthContext from '../../hooks/useAuthContext';

const Tab = createBottomTabNavigator();
function DefaultLayout() {
  const currentUser = useAuthContext();
  const [show, setShow] = useState();
  const [title, setTitle] = useState('');

  useLayoutEffect(() => {
    if (currentUser) setShow(true);
    if (!currentUser) setShow(false);
  }, [currentUser]);

  return (
    show && (
      <View style={[styles.wrapper, { position: 'relative' }]}>
        <Tab.Navigator
          initialRouteName="Conversation"
          screenOptions={({ route }) => ({
            header: ({ navigation, route }) => {
              return <Header title={route.name} navigation={navigation} />;
            },
            tabBarActiveBackgroundColor: 'rgba(34,34,34,0.15)',
            tabBarLabelStyle: { fontFamily: GlobalStyles.fonts.fontSemiBold },
            tabBarItemStyle: { borderRadius: 10, marginLeft: 5, marginRight: 5 },

            tabBarIcon: ({ color, size }) => {
              let iconName;

              if (route.name === 'Messages') {
                iconName = 'chatbubble-ellipses';
              } else if (route.name === 'Friends') {
                iconName = 'ios-people-sharp';
              } else if (route.name === 'Notification') {
                iconName = 'md-notifications';
              } else if (route.name === 'Profile') {
                iconName = 'ios-settings';
                return currentUser ? (
                  <Avatar
                    size={size}
                    image={{
                      uri: currentUser.photoURL ? currentUser.photoURL : undefined,
                    }}
                  />
                ) : (
                  <Ionicons
                    style={route.name === 'Messages' && { transform: [{ rotateY: '180deg' }] }}
                    name={iconName}
                    size={size}
                    color={color}
                  />
                );
              }

              return (
                <Ionicons
                  style={route.name === 'Messages' && { transform: [{ rotateY: '180deg' }] }}
                  name={iconName}
                  size={size}
                  color={color}
                />
              );
            },

            tabBarActiveTintColor: GlobalStyles.colors.primary,
            tabBarInactiveTintColor: GlobalStyles.colors.powderGrey,
          })}
        >
          <Tab.Screen name="Messages" component={Home} />
          <Tab.Screen name="Friends" component={Friends} />
          <Tab.Screen name="Notification" component={NotifiCation} options={{ tabBarBadge: 5 }} />
          <Tab.Screen name="Profile" component={Profile} />
        </Tab.Navigator>
      </View>
    )
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignContent: 'center',
  },
});

export default DefaultLayout;
