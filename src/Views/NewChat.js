import { AppBar, Avatar, IconButton } from '@react-native-material/core';
import { Fragment, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableNativeFeedback,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import Ionicons from 'react-native-vector-icons/Ionicons';
import GlobalStyles from '../Components/GlobalStyles';
import { getCollectionChatRoom } from '../Services/conversationServices.js';
import { docChatRoom } from '../Services/generalFirestoreServices.js';
import { searchUser } from '../Services/searchServices';

import generatePermutation from '../hooks/usePermutation.js';
import usePreLoadContext from '../hooks/usePreLoadContext.js';
import { toastError, toastWarning } from '../hooks/useToast.js';
import Input from './components/Input/Input.js';
import Message from './components/Message/Message.js';
import useAuthContext from '../hooks/useAuthContext.js';

const screenHeight = Dimensions.get('window').height;

function NewChat({ navigation }) {
  const currentUser = useAuthContext();
  const chatRoomInfo = usePreLoadContext();

  const [searchValue, setSearchValue] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchRsults, setSearchResults] = useState([]);
  const [addUser, setAddUser] = useState([]);

  const [loading, setLoading] = useState(false);
  const [permutaion, setPermutation] = useState([]);
  const [hasConver, setHasConver] = useState({});
  const [chatRoomId, setChatRoomId] = useState('');
  const [lastStt, setLastStt] = useState(0);
  const [lastSeenGroup, setLastSeenGroup] = useState([]);
  const [messages, setMessages] = useState([]);

  const [focusInput, setFocusInput] = useState(false);
  const inputRef = useRef();
  const scrollViewRef = useRef();
  const [scrollViewHeight, setScrollViewHeight] = useState(0);
  const [heightAppbar, setHeightAppbar] = useState(0);

  useEffect(() => {
    const search = async () => {
      const usersa = searchUser(searchValue);
      usersa.onSnapshot((querySnapshot) => {
        if (!querySnapshot.empty) {
          const user = [];
          querySnapshot.forEach((res) => {
            user.push(res.data());
          });
          setSearchResults(user);
        } else {
          setSearchResults([]);
        }
      });
    };
    search();
  }, [searchValue]);

  useEffect(() => {
    if (addUser.length > 0) {
      setLoading(true);
      let userEmail = [];
      userEmail.push(currentUser.email);
      for (let i = 0; i < addUser.length; i++) {
        userEmail.push(addUser[i].email);
      }
      const finalPermutedArray = generatePermutation(userEmail);
      setPermutation(finalPermutedArray);
    } else {
      setLoading(false);
      setPermutation([]);
      setHasConver({});
    }
  }, [addUser]);

  useEffect(() => {
    if (permutaion.length > 1) {
      for (let i = 0; i < permutaion.length; i++) {
        let has = false;
        for (let l = 0; l < chatRoomInfo.length; l++) {
          if (JSON.stringify(chatRoomInfo[l].usersEmail) === JSON.stringify(permutaion[i])) {
            setHasConver(chatRoomInfo[l]);
            setChatRoomId(chatRoomInfo[l].chatRoomID);
            has = true;
            break;
          }
        }
        if (has === true) {
          break;
        } else {
          setHasConver({});
        }
      }
    }
  }, [permutaion, chatRoomInfo]);

  useEffect(() => {
    const check = async () => {
      if (Object.keys(hasConver).length !== 0) {
        const a = await docChatRoom(hasConver.chatRoomID).get();
        if (a.exists) {
          getCollectionChatRoom({ chatRoomId: hasConver.chatRoomID }).onSnapshot((snapGetMessage) => {
            if (hasConver.isGroup === false) {
              let chats = [];
              let lastSttRead = [];
              snapGetMessage.forEach((res) => {
                if (res.data().isRead === true) {
                  lastSttRead.push(res.data().stt);
                }
                chats.push(res.data());
              });
              setLastStt(lastSttRead[0]);
              setMessages(chats);
              setLoading(false);
            } else {
              let chats = [];
              let lastSttRead = [];
              snapGetMessage.forEach((res) => {
                if (res.data().isRead.length > 0) {
                  lastSttRead.push(res.data());
                }
                chats.push(res.data());
              });
              setLastSeenGroup(lastSttRead[0]);
              setLastStt(lastSttRead.length > 0 && lastSttRead[0].stt);

              setMessages(chats);
              setLoading(false);
            }
          });
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setMessages([]);
        setLastStt(0);
      }
    };
    check();
  }, [hasConver]);

  useEffect(() => {
    if (addUser.length > 0 && Object.keys(hasConver).length === 0) {
      let userId = [currentUser.uid];
      addUser.forEach((id) => userId.push(id.uid));
      setChatRoomId(userId.join('_'));
    } else if (addUser.length === 0 && Object.keys(hasConver).length === 0) {
      setChatRoomId('');
    }
  }, [hasConver, addUser]);

  const handleInput = (text) => {
    if (!text.startsWith(' ') && !text.startsWith('\n')) {
      const textValue = text.toLowerCase().trim();
      setSearchValue(textValue);
    } else {
      setSearchValue('');
      setSearchResults([]);
    }
  };

  const handleClearUser = (value) => {
    if (addUser.filter((abc) => abc.email === value.email).length === 1) {
      setAddUser((pre) => pre.filter((abc) => abc.email !== value.email));
    }
  };
  const handleClickAddUser = (value) => {
    if (addUser.filter((abc) => abc.email === value.email).length === 0) {
      if (addUser.length < 5) {
        setAddUser((pre) => [...pre, value]);
        scrollViewRef.current.scrollToEnd({ animated: true });
      } else {
        toastWarning('The number of users has reached the limit!');
      }
      setSearchValue('');
      setShowSearch(false);
      setSearchResults([]);
    } else {
      toastWarning('Friend Existed!');
    }
  };

  const handleContentSizeChange = (contentWidth, contentHeight) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.measure((x, y, width, height) => {
        setScrollViewHeight(height);
      });
    }
  };

  const renderItem = ({ item }) => {
    if (Object.keys(hasConver).length !== 0 && messages.length > 0) {
      if (hasConver.isGroup === false) {
        return (
          <Message
            data={item.message}
            own={item.sendBy === currentUser.email ? true : false}
            type={item.type}
            seenImg={addUser.length > 0 ? addUser[0].photoURL : undefined}
            seen={item.stt === lastStt ? true : false}
            isRead={item.isRead}
            marginBottom={item.stt === lastStt ? true : false}
          />
        );
      } else {
        return (
          <Message
            data={item.message}
            isGroup={true}
            own={item.sendBy === currentUser.email ? true : false}
            type={item.type}
            seenGroup={item.isRead}
            seen={item.stt === lastStt ? true : false}
            isRead={item.isRead}
            photoSender={item.photoSender}
            marginBottom={item.stt === lastStt ? true : false}
          />
        );
      }
    }
  };

  return (
    <Fragment>
      <View style={styles.wrapper}>
        <View style={{ flexDirection: 'column' }}>
          <AppBar
            onLayout={(e) => setHeightAppbar(e.nativeEvent.layout.height)}
            style={{ backgroundColor: GlobalStyles.colors.primary }}
            titleContentStyle={{ marginLeft: -15 }}
            titleStyle={{ fontFamily: GlobalStyles.fonts.fontAudiowide, color: '#fff' }}
            title="New Conversation"
            color="#fff"
            leading={(_) => (
              <IconButton
                icon={(props) => <Ionicons name="arrow-back" {...props} />}
                color={'#fff'}
                onPress={() => navigation.goBack()}
              />
            )}
          />
          <ScrollView
            style={{ maxHeight: 150, marginVertical: 10 }}
            ref={scrollViewRef}
            onContentSizeChange={handleContentSizeChange}
          >
            <View style={styles.search}>
              <Text style={{ fontSize: 16, fontWeight: '500' }}>To:&nbsp;</Text>
              {addUser.length > 0 &&
                addUser.map((result, i) => (
                  <View
                    key={i}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 3,
                      marginLeft: 10,
                      marginBottom: 5,
                      backgroundColor: GlobalStyles.colors.powderGrey,
                      paddingHorizontal: 5,
                      borderRadius: 99,
                    }}
                  >
                    <Text style={{ fontSize: 12, marginRight: 3, color: '#fff' }}>{result.email}</Text>
                    <TouchableNativeFeedback onPress={() => handleClearUser(result)}>
                      <Ionicons style={{ color: GlobalStyles.colors.dangerColor }} name="close-circle" />
                    </TouchableNativeFeedback>
                  </View>
                ))}
              <TextInput
                style={styles.input}
                ref={inputRef}
                numberOfLines={1}
                placeholder="Find your friends with their email"
                cursorColor={GlobalStyles.colors.primary}
                onFocus={() => setFocusInput(true)}
                onBlur={() => setFocusInput(false)}
                value={searchValue}
                autoFocus
                onChangeText={(text) => handleInput(text)}
              />
            </View>
          </ScrollView>
        </View>
        <View style={styles.bodyMessages}>
          {loading ? (
            <View
              style={{
                width: '100%',
                height: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ActivityIndicator size={'large'} />
            </View>
          ) : (
            addUser.length > 0 &&
            (Object.keys(hasConver).length !== 0 && messages.length > 0 ? (
              <FlatList inverted data={messages} renderItem={renderItem} keyExtractor={(item) => item.stt} />
            ) : (
              <View
                style={{
                  width: '100%',
                  height: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <View style={{ flexDirection: 'column' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    {addUser.map((user, i) => (
                      <Avatar
                        key={i}
                        style={{
                          marginLeft: addUser.length > 1 ? -15 : 0,
                          borderWidth: 2,
                          borderColor: '#fff',
                        }}
                        size={55}
                        image={{ uri: user.photoURL ? user.photoURL : undefined }}
                      />
                    ))}
                  </View>
                  <Text
                    numberOfLines={3}
                    style={{
                      marginTop: 10,
                      paddingHorizontal: 30,

                      fontSize: 16,
                    }}
                  >
                    Tin nhắn mới tới&nbsp;
                    {addUser.map((user, index) => (
                      <Text key={index} style={{ fontFamily: GlobalStyles.fonts.fontSemiBold }}>
                        {index !== addUser.length - 1 ? user.displayName + ', ' : user.displayName}
                      </Text>
                    ))}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
        {addUser.length > 0 && (
          <Input
            chatRoomId={Object.keys(hasConver).length !== 0 ? hasConver.chatRoomID : chatRoomId}
            dataUserNewConver={addUser}
            infoFriend={addUser}
            isGroup={Object.keys(hasConver).length !== 0 ? hasConver.isGroup : addUser.length > 1 ? true : false}
            newConversation={Object.keys(hasConver).length === 0 && addUser.length > 0 ? true : false}
            from="new"
          />
        )}
      </View>
      {searchRsults.length > 0 && (
        <ScrollView
          style={[
            styles.resultSearch,
            { height: screenHeight - scrollViewHeight, top: scrollViewHeight + heightAppbar },
          ]}
        >
          {searchRsults.map((value, i) => (
            <TouchableNativeFeedback key={i} onPress={() => handleClickAddUser(value)}>
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 2,
                }}
              >
                <Avatar size={35} image={{ uri: value.photoURL }} />
                <View style={{ flexDirection: 'column', marginLeft: 10 }}>
                  <Text style={{ fontWeight: '600' }} numberOfLines={1}>
                    {value.displayName}
                  </Text>
                  <Text style={{ fontSize: 12 }} numberOfLines={1}>
                    {value.email}
                  </Text>
                </View>
              </View>
            </TouchableNativeFeedback>
          ))}
        </ScrollView>
      )}
    </Fragment>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: '100%',
    backgroundColor: 'white',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  search: {
    paddingHorizontal: 10,
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  input: {
    flex: 1,
    minWidth: 100,
    maxWidth: '100%',
    paddingLeft: 10,
    paddingRight: 10,
  },
  resultSearch: {
    width: '100%',
    marginTop: 10,
    position: 'absolute',
    zIndex: 999,
    backgroundColor: '#fff',
  },
  bodyMessages: {
    flex: 1,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 10,
  },
});

export default NewChat;
