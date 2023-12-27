import Toast from 'react-native-toast-message';

export const toastError = (string, sub) => {
  return Toast.show({ text1: string, text2: sub, position: 'top', visibilityTime: 3000, type: 'error' });
};
export const toastSuccess = (string, sub) => {
  return Toast.show({ text1: string, text2: sub, position: 'top', visibilityTime: 3000, type: 'success' });
};
export const toastWarning = (string, sub) => {
  return Toast.show({ text1: string, text2: sub, position: 'top', visibilityTime: 3000, type: 'warning' });
};
