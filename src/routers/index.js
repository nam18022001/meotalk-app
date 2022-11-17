// Routes Config

import config from '../configs';

//Pages
import FriendProfile from '../Views/FriendProfile';
import DefaultLayout from '../layouts/DefaultLayout';
import Chat from '../Views/Chat';

//Layout

//Public Routes
// const publicRoutes = [{ path: config.routes.login, component: Login }];

//Private Routes
const privateRoutes = [
  { path: config.routes.home, component: DefaultLayout },
  { path: config.routes.chat, component: Chat },
  { path: config.routes.profileFriends, component: FriendProfile },
];

export { privateRoutes };
