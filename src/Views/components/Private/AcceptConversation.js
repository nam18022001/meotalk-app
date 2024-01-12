import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableNativeFeedback,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { decryptAES, encryptAES } from '../../../functions/hash';
import { useState } from 'react';
import GlobalStyles from '../../../Components/GlobalStyles';
import config from '../../../configs';
import firestore from '@react-native-firebase/firestore';
import { toastError } from '../../../hooks/useToast';
import { setLocalStorageKey } from '../../../hooks/useLocalStorage';

function AcceptConversation({ infoConversation, navigation }) {
  const [showPassWord, setShowPassWord] = useState(false);
  const [pass, setPass] = useState('');
  const [inputPassWord, setInputPassWord] = useState({ data: '', show: false });

  const handleShowPassWord = () => {
    const p = decryptAES(infoConversation.key, config.constant.keyPrivate);
    setPass(p);
    return setShowPassWord(true);
  };
  const handleInputPassWord = (text) => {
    const value = text;
    setInputPassWord((pre) => ({ data: value, show: pre.show }));
  };

  const handleAgreeandAccept = async () => {
    if (inputPassWord.data.length > 0) {
      if (inputPassWord.data === pass) {
        try {
          await firestore().collection('ChatPrivate').doc(infoConversation.chatRoomID).update({
            isAccepted: true,
            key: firestore.FieldValue.delete(),
          });
          const encryptedPassword = encryptAES(pass, config.constant.keyPrivate);
          setLocalStorageKey(encryptedPassword, infoConversation.chatRoomID);
        } catch (error) {
          toastError('Error!');
        }
      } else {
        toastError('Password incorrect!');
      }
    } else {
      toastError('Entering a password is mandatory.');
    }
  };
  const handleRefuse = () => {
    Alert.alert(
      'Decline this conversation?',
      '',
      [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel',
        },
        {
          text: 'YES',
          onPress: async () => {
            await firestore().collection('ChatPrivate').doc(infoConversation.chatRoomID).delete();
            return navigation.goBack();
          },
        },
      ],
      {
        cancelable: true,
        onDismiss: () => null,
      },
    );
  };

  return (
    <View style={styles.wrapper}>
      <View
        style={{
          flexDirection: 'column',
        }}
      >
        <Text
          style={{
            textDecorationLine: 'underline',
            fontSize: 20,
            fontFamily: GlobalStyles.fonts.fontBold,
            color: GlobalStyles.colors.dangerColor,
          }}
        >
          Important Notes:
        </Text>
        <Text style={{ fontSize: 14, marginTop: 10, fontFamily: GlobalStyles.fonts.fontRegular }}>
          1. The password is displayed only once when you are on this page. If forgotten or lost, please contact the
          room creator.
        </Text>
        <Text style={{ fontSize: 14, marginTop: 5, fontFamily: GlobalStyles.fonts.fontRegular }}>
          2. You must enter the correct password in the password input field.
        </Text>
        <Text style={{ fontSize: 14, marginTop: 5, fontFamily: GlobalStyles.fonts.fontRegular }}>
          3. Once you confirm agreement, the password will be permanently deleted and will not be displayed again.
        </Text>
        <Text style={{ fontSize: 14, marginTop: 5, fontFamily: GlobalStyles.fonts.fontRegular }}>
          4. By pressing the <Text style={{ fontFamily: GlobalStyles.fonts.fontBold }}>'Agree and Accept'</Text> button,
          you acknowledge reading these notes.
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
          <Text
            style={{
              textDecorationLine: 'underline',
              fontSize: 16,
              fontFamily: GlobalStyles.fonts.fontBold,
              color: GlobalStyles.colors.successColor,
            }}
          >
            Password:
          </Text>
          <View
            style={{
              width: '30%',
              height: 25,
              backgroundColor: showPassWord ? GlobalStyles.colors.powderGreyOpacity : GlobalStyles.colors.powderGrey,
              marginLeft: 10,
              borderRadius: 5,
            }}
          >
            <TouchableWithoutFeedback onPress={handleShowPassWord}>
              <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 15 }}>{showPassWord ? pass : null}</Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </View>
      </View>
      <View
        style={{
          width: '80%',
          flexDirection: 'column',
          alignItems: 'center',
          marginTop: 30,
          flex: 1,
        }}
      >
        <View
          style={{
            width: '100%',
            height: 40,
            backgroundColor: GlobalStyles.colors.powderGreyOpacity,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 10,
          }}
        >
          <TextInput
            style={{ flex: 1, paddingHorizontal: 15, paddingVertical: 5 }}
            secureTextEntry={inputPassWord.show ? false : true}
            placeholder="Enter password"
            autoCorrect={false}
            autoCapitalize="none"
            onChangeText={handleInputPassWord}
            value={inputPassWord.data}
            onSubmitEditing={handleAgreeandAccept}
            returnKeyType="join"
          />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
          <View
            style={{
              marginHorizontal: 5,
              flex: 1,

              paddingVertical: 10,
              borderWidth: 2,
              borderColor: GlobalStyles.colors.dangerColor,

              borderRadius: 20,
            }}
          >
            <TouchableNativeFeedback
              background={TouchableNativeFeedback.Ripple('#123944', true)}
              onPress={handleRefuse}
            >
              <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontFamily: GlobalStyles.fonts.fontSemiBold, color: GlobalStyles.colors.dangerColor }}>
                  Decline
                </Text>
              </View>
            </TouchableNativeFeedback>
          </View>
          <View
            style={{
              marginHorizontal: 5,
              flex: 1,

              paddingVertical: 10,
              borderWidth: 2,
              borderColor: GlobalStyles.colors.successColor,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 20,
            }}
          >
            <TouchableNativeFeedback
              background={TouchableNativeFeedback.Ripple('#123944', true)}
              onPress={handleAgreeandAccept}
            >
              <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontFamily: GlobalStyles.fonts.fontSemiBold, color: GlobalStyles.colors.successColor }}>
                  Agree and Accept
                </Text>
              </View>
            </TouchableNativeFeedback>
          </View>
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: 'white',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
});
export default AcceptConversation;
