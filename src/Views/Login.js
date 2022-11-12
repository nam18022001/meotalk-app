
import { memo, useEffect, useRef, useState } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import GlobalStyles from '../Components/GlobalStyles/GlobalStyles';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';

function Login() {
  GoogleSignin.configure({
    webClientId: '74157693277-adgcrkofg5pn60tkr34d295ma23o587o.apps.googleusercontent.com',
  });

  const neonLight = useRef(new Animated.Value(0)).current;
  const [press, setPress] = useState(false);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(neonLight, {
          duration: 500,
          toValue: 0,
          useNativeDriver: false,
        }),
        Animated.timing(neonLight, {
          duration: 1000,
          toValue: 1,
          useNativeDriver: false,
        }),
        Animated.timing(neonLight, {
          duration: 1000,
          toValue: 2,
          useNativeDriver: false,
        }),
        Animated.timing(neonLight, {
          duration: 1000,
          toValue: 3,
          useNativeDriver: false,
        }),
        Animated.timing(neonLight, {
          duration: 500,
          toValue: 4,
          useNativeDriver: false,
        }),
      ]),
      {
        iterations: -1,
      },
    ).start();
  }, []);


  const handleLogin = async () => {
    setPress(!press);
        // Check if your device supports Google Play
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        // Get the users ID token
        const { idToken } = await GoogleSignin.signIn();
      
        // Create a Google credential with the token
        const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      
        // Sign-in the user with the credential
        return auth().signInWithCredential(googleCredential);
  };
  return (
    <View style={styles.wrapper}>
      <View style={styles.title}>
        <Animated.Text
          style={[
            styles.textTitle,
            {
              textShadowColor: neonLight.interpolate({
                inputRange: [0, 1, 2, 3, 4],
                outputRange: ['#4C3A51', '#774360', '#B25068', '#E7AB79', '#4C3A51'],
              }),
            },
          ]}
        >
          Meo Talk
        </Animated.Text>
      </View>
      <View style={styles.buttonView}>
        <Pressable
          style={[
            styles.buttonLogin,
            {
              borderColor: press ? GlobalStyles.colors.primary : '#fff',
              backgroundColor: press ? '#fff' : GlobalStyles.colors.primaryOpacity,
            },
          ]}
          onPress={handleLogin}
        >
          <Image style={styles.iconGoogle} source={require('../assets/images/google-icon.png')} />
          <Text style={[styles.textLogin, { color: press ? GlobalStyles.colors.primary : '#fff' }]}>
            {' '}
            Login With Google
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    height: '100%',
  },
  title: {
    height: '20%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  textTitle: {
    textShadowRadius: 20,
    textShadowOffset: { width: 2, height: -2 },
    color: '#fff',
    fontFamily: 'Audiowide',
    fontSize: 50,
  },
  buttonView: {
    height: '80%',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'center',
    marginBottom: '20%',
  },
  buttonLogin: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 3,
    fontSize: 20,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 20,
    paddingRight: 20,
  },
  iconGoogle: {
    marginRight: 10,
    width: 50,
    height: 50,
  },
  textLogin: {
    fontFamily: GlobalStyles.fonts.fontBold,
    fontSize: 20,
  },
});

export default memo(Login);
