import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

function useAuthContext() {
  const { currentUser } = useContext(AuthContext);
  if (!currentUser) {
    return '';
  }
  return currentUser;
}

export default useAuthContext;
