import { memo, useLayoutEffect } from 'react';

function ProtectedPrivateRoute({ user, children, navigation }) {
  useLayoutEffect(() => {
    if (!user) {
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'Login',
          },
        ],
      });
    }
  }, [user]);
  return children;
}

export default memo(ProtectedPrivateRoute);
