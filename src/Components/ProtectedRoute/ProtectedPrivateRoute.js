import { memo, useLayoutEffect } from 'react';

function ProtectedPrivateRoute({ user, children, navigation }) {
  useLayoutEffect(() => {
    if (!user) {
      navigation.navigate('Login');
    }
  }, [user]);
  // return !user ? <Navigate to={config.routes.login} /> : children;
  return children;
}

export default memo(ProtectedPrivateRoute);
