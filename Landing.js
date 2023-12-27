import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useContext } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import { StatusBar as StatusBarExpo } from 'expo-status-bar';

import { ProtectedPrivateRoute, ProtectedPublicRoute } from './src/Components/ProtectedRoute';
import { AuthContext } from './src/contexts/AuthContext';
import DefaultLayout from './src/layouts/DefaultLayout';
import LoginLayout from './src/layouts/LoginLayout';
import Chat from './src/Views/Chat';
import Login from './src/Views/Login';
import GlobalStyles from './src/Components/GlobalStyles';
import { privateRoutes } from './src/routers';
import { CallContextProvider } from './src/contexts/CallContext';

const Stack = createNativeStackNavigator();

function Landing() {
  const { currentUser } = useContext(AuthContext);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
        }}
      >
        {privateRoutes.map((route, index) => {
          let Screen = route.component;
          return (
            <Stack.Screen key={index} name={route.path}>
              {(props) => (
                <ProtectedPrivateRoute user={currentUser} navigation={props.navigation}>
                  <SafeAreaView>
                    <StatusBar barStyle={'dark-content'} backgroundColor="#fff" />
                    <CallContextProvider navigation={props.navigation}>
                      <Screen navigation={props.navigation} route={props.route} />
                    </CallContextProvider>
                  </SafeAreaView>
                </ProtectedPrivateRoute>
              )}
            </Stack.Screen>
          );
        })}

        <Stack.Screen name="Login">
          {(props) => (
            <ProtectedPublicRoute user={currentUser} navigation={props.navigation}>
              <LoginLayout>
                <StatusBarExpo translucent />
                <Login navigation={props} />
              </LoginLayout>
            </ProtectedPublicRoute>
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default Landing;
