import { memo, useEffect, useLayoutEffect } from 'react';

function ProtectedPublicRoute({ user, children, navigation }) {
  // return !user ? children : <Navigate to={config.routes.home} />;

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
