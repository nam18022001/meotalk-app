import firestore from '@react-native-firebase/firestore';

export const searchUser = (value) => {
  return firestore().collection('users').where('keyWord', 'array-contains', value);
};
