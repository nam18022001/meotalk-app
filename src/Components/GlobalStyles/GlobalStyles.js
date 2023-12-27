import fontsLoaded from './mainFont';

function GlobalStyles() {
  return {
    fonts: {
      fontRegular: 'font-regular',
      fontBlack: 'font-black',
      fontBold: 'font-bold',
      fontExtraLight: 'font-extralight',
      fontLight: 'font-light',
      fontSemiBold: 'font-semibold',
      fontAudiowide: 'Audiowide',
    },
    colors: {
      primary: '#4d9ac0',
      primaryOpacity: '#4d9ac0a2',
      powderGrey: 'rgba(22, 24, 35, 0.5)',
      powderGreyOpacity: 'rgba(22, 24, 35, 0.1)',
      seenColor: 'rgba(22, 24, 35, 0.441)',
      successColor: '#84ca93',
      dangerColor: '#f75a5b',
      warningColor: '#FFA902',
    },
  };
}
export { fontsLoaded };
export default GlobalStyles();
