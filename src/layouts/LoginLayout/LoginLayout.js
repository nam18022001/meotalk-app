import { LinearGradient } from 'expo-linear-gradient';
import { Platform, SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import GlobalStyles from '../../Components/GlobalStyles';

function LoginLayout({ children }) {
  return (
    <LinearGradient style={styles.wrapper} colors={['rgba(60, 132, 206, 1) 38%', 'rgba(48, 238, 226, 1) 68%']}>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    height: '100%',
  },
  text: {
    fontFamily: GlobalStyles.fonts.fontRegular,
  },
});
export default LoginLayout;
