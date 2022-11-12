import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';

function loadFont() {
  const [loaded, setLoaded] = useState(false);
  const [fontsLoaded, error] = useFonts({
    'font-regular': require('../../assets/fonts/SourceSansPro-Regular.ttf'),
    'font-black': require('../../assets/fonts/SourceSansPro-Black.ttf'),
    'font-extralight': require('../../assets/fonts/SourceSansPro-ExtraLight.ttf'),
    'font-light': require('../../assets/fonts/SourceSansPro-Light.ttf'),
    'font-semibold': require('../../assets/fonts/SourceSansPro-SemiBold.ttf'),
    'font-bold': require('../../assets/fonts/SourceSansPro-Bold.ttf'),
    Audiowide: require('../../assets/fonts/Audiowide-Regular.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      setLoaded(true);
    } else {
      setLoaded(false);
    }
    if (error) {
      setLoaded(false);
    }
  }, [fontsLoaded]);

  return loaded;
}

export default loadFont;
