import { AppBar, HStack, IconButton } from '@react-native-material/core';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { memo } from 'react';
import { View } from 'react-native';
import GlobalStyles from '../../../Components/GlobalStyles/GlobalStyles';

function Header({ title, navigation }) {
  return (
    <View>
      <AppBar
        color="#55aac0"
        tintColor="#222041"
        title={title}
        trailing={(props) => (
          <HStack>
            <IconButton
              style={{ width: 40, height: 40, backgroundColor: GlobalStyles.colors.powderGreyOpacity }}
              icon={(props) => <FontAwesome5 size={20} name="pen" />}
              onPress={() => {
                navigation.navigate('');
              }}
            />
          </HStack>
        )}
      />
    </View>
  );
}

export default memo(Header);
