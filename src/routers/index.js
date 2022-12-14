// Routes Config

import config from '../configs';

//Pages
import FriendProfile from '../Views/FriendProfile';
import DefaultLayout from '../layouts/DefaultLayout';
import Chat from '../Views/Chat';
import VideoCall from '../Views/Call/VideoCall';

//Layout

//Public Routes
// const publicRoutes = [{ path: config.routes.login, component: Login }];

//Private Routes
const privateRoutes = [
  { path: config.routes.home, component: DefaultLayout },
  { path: config.routes.chat, component: Chat },
  { path: config.routes.videoCall, component: VideoCall },
  { path: config.routes.profileFriends, component: FriendProfile },
];

export { privateRoutes };
