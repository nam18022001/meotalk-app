import { useContext } from 'react';
import { CallContext } from '../contexts/CallContext';

function useCallContext() {
  const { setPressCall } = useContext(CallContext);

  return { setPressCall };
}

export default useCallContext;
