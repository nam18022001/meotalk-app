import { memo, useEffect } from 'react';

function ProtectedPublicRoute({ user, children, navigation }) {
  // return !user ? children : <Navigate to={config.routes.home} />;

  useEffect(() => {
    if (user) {
      navigation.navigate('Home');
    }
  }, [user]);
  return children;
}

export default memo(ProtectedPublicRoute);
