import { Button } from '@react-native-material/core';
import { Text, View } from 'react-native';
import auth from '@react-native-firebase/auth';

function Profile() {
  return (
    <View>
      <Text>asd</Text>
      <Button onPress={() => auth().signOut()} title="Sign Out" />
    </View>
  );
}

export default Profile;
