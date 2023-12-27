import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import messaging from '@react-native-firebase/messaging';
import { IconComponentProvider } from '@react-native-material/core';
import 'expo-dev-client';
import * as SplashScreen from 'expo-splash-screen';
import React, { useCallback, useEffect } from 'react';
import { Dimensions, LogBox, StyleSheet } from 'react-native';

import { View } from 'react-native';
import Landing from './Landing';
import fontsLoaded from './src/Components/GlobalStyles/mainFont';
import { AuthContextProvider } from './src/contexts/AuthContext';
import { LogContextProvider } from './src/contexts/LogContext';
import { PreLoadContextProvider } from './src/contexts/PreLoadContext';

LogBox.ignoreLogs(['Remote debugger']);
// Register background handler
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  // console.log('Message handled in the background!', remoteMessage);
});

export default function App() {
  const loadedFont = fontsLoaded();

  useEffect(() => {
    async function prepare() {
      await SplashScreen.preventAutoHideAsync();
    }
    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (loadedFont) {
      await SplashScreen.hideAsync();
    }
  }, [loadedFont]);

  if (!loadedFont) {
    return null;
  }

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <IconComponentProvider IconComponent={MaterialCommunityIcons}>
        <AuthContextProvider>
          <PreLoadContextProvider>
            <LogContextProvider>
              <Landing />
            </LogContextProvider>
          </PreLoadContextProvider>
        </AuthContextProvider>
      </IconComponentProvider>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    height: Dimensions.get('screen').height,
  },
});
