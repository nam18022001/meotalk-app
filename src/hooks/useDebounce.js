import { useState, useEffect } from 'react';

function useDebounce(value, delay) {
  const [debounce, setDebounce] = useState(value);
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebounce(value);
    }, delay);

    return () => clearTimeout(handle);
  }, [value]);

  return debounce;
}

export default useDebounce;
