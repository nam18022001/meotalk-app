import { createContext, useState, useEffect } from 'react';
import firestore from '@react-native-firebase/firestore';

import PickUp from '../Views/Call/PickUp/PickUp';
import { ActivityIndicator, View } from 'react-native';
import GlobalStyles from '../Components/GlobalStyles';
import useAuthContext from '../hooks/useAuthContext';
import PickUpGroup from '../Views/Call/PickUp/PickUpGroup';

export const CallContext = createContext();

export const CallContextProvider = ({ children, navigation }) => {
  const [pressCall, setPressCall] = useState(false);

  const [showCallPickUp, setShowCallPickUp] = useState();
  const [showGroupCallPickUp, setShowGroupCallPickUp] = useState();
  const [dataCall, setDataCall] = useState();

  const currentUser = useAuthContext();

  useEffect(() => {
    firestore()
      .collection('call')
      .where('recieverUid', '==', currentUser.uid)
      .where('hasDialled', '==', false)
      .where('deleteCall', '==', false)
      .onSnapshot((res) => {
        if (!res.empty) {
          setDataCall(res.docs[0].data());
          setShowCallPickUp(true);
        } else {
          setShowCallPickUp(false);
        }
      });
  }, []);

  useEffect(() => {
    firestore()
      .collection('call')
      .where('recieverUid', 'array-contains', currentUser.uid)
      .where('isGroup', '==', true)
      .onSnapshot((res) => {
        if (!res.empty) {
          if (
            res.docs[0].data().cancelDialled.filter((v) => v === currentUser.uid).length === 0 &&
            res.docs[0].data().hasDialled.filter((v) => v === currentUser.uid).length === 0
          ) {
            setDataCall(res.docs[0].data());
            setShowGroupCallPickUp(true);
          } else {
            setShowGroupCallPickUp(false);
            setDataCall();
          }
          if (res.docs[0].data().deleteCall === true) {
            firestore().collection('call').doc(res.docs[0].id).delete();
          }
        } else {
          setShowGroupCallPickUp(false);
        }
      });
  }, []);

  return (
    <CallContext.Provider value={{ setPressCall }}>
      {pressCall && (
        <View
          style={{
            backgroundColor: '#2b2b2b80',
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 999,
          }}
        >
          <ActivityIndicator size={40} color={GlobalStyles.colors.warningColor} />
        </View>
      )}
      {showCallPickUp ? (
        <PickUp data={dataCall} navigation={navigation} />
      ) : showGroupCallPickUp ? (
        <PickUpGroup data={dataCall} navigation={navigation} />
      ) : (
        children
      )}
    </CallContext.Provider>
  );
};
