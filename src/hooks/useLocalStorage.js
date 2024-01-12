import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';
import config from '../configs';
import { decryptAES } from '../functions/hash';

const setLocalStorageKey = async (value, channel) => {
  try {
    const abc = await AsyncStorage.getItem('l-k-p');
    if (abc !== undefined && abc !== null) {
      const getListKeyPrivate = JSON.parse(abc.toString());
      getListKeyPrivate[CryptoJS.MD5(channel).toString()] = value;

      return await AsyncStorage.setItem('l-k-p', JSON.stringify(getListKeyPrivate));
    } else {
      const md5HasChannel = CryptoJS.MD5(channel).toString();
      const has = {};
      has[md5HasChannel] = value;
      return await AsyncStorage.setItem('l-k-p', JSON.stringify(has));
    }
  } catch (error) {
    console.error('Lỗi khi lưu dữ liệu: ', error);
  }
};

const getKeyChoosenPrivate = async (channel) => {
  try {
    const abc = await AsyncStorage.getItem('l-k-p');
    if (abc !== undefined && abc !== null) {
      const getListKeyPrivate = JSON.parse(abc);
      const keyChoosen = getListKeyPrivate[CryptoJS.MD5(channel).toString()];
      const keyValue = decryptAES(keyChoosen, config.constant.keyPrivate);
      if (keyValue && typeof keyValue === 'string') {
        return keyValue;
      } else if (keyValue === null) {
        return null;
      } else {
        return null;
      }
    } else {
      return null;
    }
  } catch (error) {
    console.error('Lỗi khi đọc dữ liệu: ', error);
    return null;
  }
};

export { setLocalStorageKey, getKeyChoosenPrivate };
