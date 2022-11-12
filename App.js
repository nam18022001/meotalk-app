import 'expo-dev-client';
import { IconComponentProvider } from '@react-native-material/core';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as SplashScreen from 'expo-splash-screen';
import React, { useCallback, useEffect } from 'react';
import { Dimensions, StyleSheet } from 'react-native';

import { View } from 'react-native';
import Landing from './Landing';
import fontsLoaded from './src/Components/GlobalStyles/mainFont';
import { AuthContextProvider } from './src/contexts/AuthContext';
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
          <Landing />
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
