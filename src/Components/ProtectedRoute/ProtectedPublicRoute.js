import { memo, useEffect, useLayoutEffect } from 'react';

function ProtectedPublicRoute({ user, children, navigation }) {
  useLayoutEffect(() => {
    if (user) {
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'Home',
          },
        ],
      });
    }
  }, [user]);
  return children;
}

export default memo(ProtectedPublicRoute);
