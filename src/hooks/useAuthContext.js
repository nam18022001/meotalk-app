import { useContext } from 'react';

import { AuthContext } from '../contexts/AuthContext';
function useAuthContext() {
  const { currentUser } = useContext(AuthContext);
  return currentUser;
}

export default useAuthContext;
