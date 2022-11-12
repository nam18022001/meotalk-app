import { ScrollView, Text, View } from 'react-native';
import ConverseItem from '../Components/ConverseItem/ConverseItem';

function Home({ navigation }) {
  return (
    <ScrollView style={{ backgroundColor: 'white', flex: 1, paddingTop: 10 }}>
      <ConverseItem navigation={navigation} />
      <ConverseItem navigation={navigation} />
      <ConverseItem navigation={navigation} />
      <ConverseItem navigation={navigation} />
    </ScrollView>
  );
}

export default Home;
