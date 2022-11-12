import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useContext } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProtectedPrivateRoute, ProtectedPublicRoute } from './src/Components/ProtectedRoute';
import { AuthContext } from './src/contexts/AuthContext';
import DefaultLayout from './src/layouts/DefaultLayout';
import LoginLayout from './src/layouts/LoginLayout';
import Chat from './src/Views/Chat';
import Login from './src/Views/Login';

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
        <Stack.Screen name="Home">
          {(props) => (
            <ProtectedPrivateRoute user={currentUser} navigation={props.navigation}>
              <SafeAreaView>
                <DefaultLayout />
              </SafeAreaView>
            </ProtectedPrivateRoute>
          )}
        </Stack.Screen>
        <Stack.Screen name="Chat">
          {(props) => (
            <ProtectedPrivateRoute user={currentUser} navigation={props.navigation}>
              <SafeAreaView>
                <Chat navigation={props.navigation} route={props.route} />
              </SafeAreaView>
            </ProtectedPrivateRoute>
          )}
        </Stack.Screen>

        <Stack.Screen name="Login">
          {(props) => (
            <ProtectedPublicRoute user={currentUser} navigation={props.navigation}>
              <LoginLayout>
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
