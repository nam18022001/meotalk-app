const sendNotifiCation = ({ currentUser, imageUrl, call, chatRoomId, infoFriend = [] }) => {
  return infoFriend.forEach((info) => {
    fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization:
          'key=AAAAEUQkmV0:APA91bGyV7IVvHGAJrQncLY-T5gD_VbF8CYxlnU5sfioIgRvesZ6YABBZgUsrSmaZx04wZMnod1cGexwx7ZTQJazoWHqn3F3OljUjyCAjhaIM48uTOJrlnZ5Y-2ZfTSgs_afxUYK-dG4',
      },
      body: JSON.stringify({
        to: info.fcmToken,
        notification: {
          body: imageUrl
            ? 'Recieve a image from ' + currentUser.displayName
            : call
            ? currentUser.displayName + ' is calling you'
            : 'Recieve a message from ' + currentUser.displayName,
          title: 'Meo Talk',
          image: imageUrl ? imageUrl : '',
        },
        data: {
          call: call ? call : '',
          chatRoomId,
          info: currentUser,
        },
      }),
    });
  });
};

export default sendNotifiCation;
