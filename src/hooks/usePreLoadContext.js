import { useContext } from 'react';

import { PreLoadContext } from '../contexts/PreLoadContext';
function usePreLoadContext() {
  const { chatRoomInfo, listPrivateInfo, countUnReadPrivate } = useContext(PreLoadContext);

  return { chatRoomInfo, listPrivateInfo, countUnReadPrivate };
}

export default usePreLoadContext;
