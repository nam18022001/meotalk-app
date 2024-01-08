// Routes Config

import config from '../configs';

//Pages
import FriendProfile from '../Views/FriendProfile';
import DefaultLayout from '../layouts/DefaultLayout';
import Chat from '../Views/Chat';
import VideoCall from '../Views/Call/VideoCall';
import NewChat from '../Views/NewChat';
import VideoCallGroup from '../Views/Call/VideoCallGroup';
import VoiceCall from '../Views/Call/VoiceCall';
import VoiceCallGroup from '../Views/Call/VoiceCallGroup';

//Layout

//Public Routes
// const publicRoutes = [{ path: config.routes.login, component: Login }];

//Private Routes
const privateRoutes = [
  { path: config.routes.home, component: DefaultLayout },
  { path: config.routes.newChat, component: NewChat },
  { path: config.routes.chat, component: Chat },
  { path: config.routes.videoCall, component: VideoCall },
  { path: config.routes.voiceCall, component: VoiceCall },
  { path: config.routes.videoCallGroup, component: VideoCallGroup },
  { path: config.routes.voiceCallGroup, component: VoiceCallGroup },
  { path: config.routes.profileFriends, component: FriendProfile },
];

export { privateRoutes };
