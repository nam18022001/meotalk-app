import { useContext } from 'react';

import { PreLoadContext } from '../contexts/PreLoadContext';
function usePreLoadContext() {
  const { chatRoomInfo } = useContext(PreLoadContext);

  return chatRoomInfo;
}

export default usePreLoadContext;
