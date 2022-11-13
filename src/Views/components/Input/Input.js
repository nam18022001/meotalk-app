import { useState } from 'react';
import { IconButton } from '@react-native-material/core';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import storage from '@react-native-firebase/storage';
import { utils } from '@react-native-firebase/app';
import * as ImagePicker from 'expo-image-picker';

import GlobalStyles from '../../../Components/GlobalStyles/GlobalStyles';

function Input() {
  const [image, setImage] = useState();

  const handleCameraPick = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status == 'granted') {
      let result = await ImagePicker.launchCameraAsync({
        quality: 0.3,
      });

      if (!result.canceled) {
        console.log(result.assets);
      } else {
        setImage();
      }
    }
  };

  const handleLibraryPick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status == 'granted') {
      let result = await ImagePicker.launchImageLibraryAsync({
        quality: 0.3,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });

      if (!result.canceled) {
        console.log(result.assets[0].uri);
        const filename = result.assets[0].uri.substring(result.assets[0].uri.lastIndexOf('/') + 1);
        const reference = storage().ref(`/images/${filename}`);
        await reference.putFile(result.assets[0].uri);
        setImage(result.assets);
      } else {
        setImage();
      }
    }
  };
  return (
    <View style={styles.wrapper}>
      <View style={styles.actions}>
        <IconButton
          icon={<Ionicons size={25} color={GlobalStyles.colors.primary} name="ios-camera" />}
          onPress={handleCameraPick}
        />
        <IconButton
          icon={<Ionicons size={25} color={GlobalStyles.colors.primary} name="ios-image" />}
          onPress={handleLibraryPick}
        />
        {/* <IconButton icon={<Ionicons size={25} color={GlobalStyles.colors.primary} name="ios-mic" />} /> */}
      </View>
      <View style={styles.inptText}>
        <TextInput
          multiline
          style={styles.input}
          autoCapitalize
          autoCorrect
          placeholder="Message"
          cursorColor={GlobalStyles.colors.primary}
        />
      </View>
      <View>
        <IconButton icon={<Ionicons size={25} color={GlobalStyles.colors.primary} name="ios-send" />} />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    paddingLeft: 20,
    paddingRight: 20,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inptText: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: GlobalStyles.colors.powderGreyOpacity,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 15,
    paddingRight: 10,
  },
});
export default Input;
