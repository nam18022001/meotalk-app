// Routes Config

import config from '../configs';

//Pages

import Home from '../Views/Home';
import Profile from '../Views/Profile';
// import Login from './';

//Layout

//Public Routes
// const publicRoutes = [{ path: config.routes.login, component: Login }];

//Private Routes
const privateRoutes = [
  { path: config.routes.home, component: <Home /> },
  { path: config.routes.profile, component: <Profile /> },
  // { path: config.routes.conversation, component: ConverseBox },
  // { path: config.routes.profile, component: Profile },
  // { path: config.routes.callvideo, component: VideoCall, layout: CallLayout },
];

export { privateRoutes };
