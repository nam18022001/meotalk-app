import { createContext, useState, useEffect } from 'react';
import firestore from '@react-native-firebase/firestore';
import useAuthContext from '../hooks/useAuthContext';
import PickUp from '../Views/Call/PickUp/PickUp';

export const CallContext = createContext();

export const CallContextProvider = ({ children, navigation }) => {
  const [showCallPickUp, setShowCallPickUp] = useState();
  const [dataCall, setDataCall] = useState();

  const currentUser = useAuthContext();

  useEffect(() => {
    firestore()
      .collection('call')
      .where('recieverUid', '==', currentUser.uid)
      .where('hasDialled', '==', false)
      .onSnapshot((res) => {
        if (!res.empty) {
          setDataCall(res.docs[0].data());
          setShowCallPickUp(true);
          if (res.docs[0].data().deleteCall === true) {
            firestore().collection('call').doc(res.docs[0].id).delete();
          }
        } else {
          setShowCallPickUp(false);
        }
      });
  }, []);

  return (
    <CallContext.Provider value={{ dataCall }}>
      {showCallPickUp ? <PickUp data={dataCall} navigation={navigation} /> : children}
    </CallContext.Provider>
  );
};
