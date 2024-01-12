import { ActivityIndicator, AppBar, Avatar, IconButton } from '@react-native-material/core';
import { Fragment, useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableNativeFeedback, View } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5.js';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons.js';
import GlobalStyles from '../Components/GlobalStyles';

import useAuthContext from '../hooks/useAuthContext.js';
import useDebounce from '../hooks/useDebounce.js';
import usePreLoadContext from '../hooks/usePreLoadContext.js';

import firestore from '@react-native-firebase/firestore';
import { TouchableWithoutFeedback } from 'react-native';
import { makeNewConversationPrivate } from '../Services/newChatServices.js';
import config from '../configs/index.js';
import { encryptAES } from '../functions/hash.js';
import { setLocalStorageKey } from '../hooks/useLocalStorage.js';
import generatePermutation from '../hooks/usePermutation.js';
import { toastError, toastWarning } from '../hooks/useToast.js';

function NewChatPrivate({ navigation }) {
  const currentUser = useAuthContext();
  const { listPrivateInfo } = usePreLoadContext();

  const [searchValue, setSearchValue] = useState('');
  const [searchRsults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notFound, setNotFound] = useState();
  const debounced = useDebounce(searchValue.toLowerCase(), 500);

  const [selected, setSelected] = useState({ data: {}, show: false });
  const [inputPass, setInputPass] = useState({ data: '', show: false });

  const inputref = useRef();

  useEffect(() => {
    if (!debounced.trim()) {
      setSearchResults([]);
      return;
    }
    let timeID;
    const search = () => {
      setIsLoading(true);
      firestore()
        .collection('users')
        .where('keyWord', 'array-contains', debounced)
        .onSnapshot((querySnapshot) => {
          if (!querySnapshot.empty) {
            setNotFound(false);
            const user = [];
            querySnapshot.forEach((res) => {
              user.push(res.data());
            });

            timeID = setTimeout(() => {
              setSearchResults(user);
              setIsLoading(false);
            }, 500);
          } else {
            setIsLoading(true);
            setNotFound(true);
          }
        });
    };
    search();
    return () => clearTimeout(timeID);
  }, [debounced]);
  const handleClickClear = () => {
    setSearchValue('');
    inputref.current.focus();
  };
  const handleInput = (text) => {
    if (!text.startsWith(' ')) {
      setSearchValue(text);
    } else {
      setSearchValue('');
    }
  };
  const handleSelected = (value) => {
    const arr = [currentUser.email, value.email];
    const permutaion = generatePermutation(arr);

    let havRoom = false;
    for (let i = 0; i < permutaion.length; i++) {
      let has = false;
      for (let l = 0; l < listPrivateInfo.length; l++) {
        if (JSON.stringify(listPrivateInfo[l].usersEmail) === JSON.stringify(permutaion[i])) {
          has = true;
          break;
        }
      }
      if (has === true) {
        havRoom = true;
        break;
      }
    }

    if (havRoom === false) {
      setSelected({ data: value, show: true });
    } else {
      setSelected({ data: {}, show: false });
      toastWarning('Existed!');
    }
  };

  const handleInputPass = (text) => {
    if (!text.startsWith(' ')) {
      setInputPass((pre) => ({ data: text, show: pre.show }));
    } else {
      setInputPass((pre) => ({ data: '', show: pre.show }));
    }
  };

  const handleMakeConver = async () => {
    if (inputPass.data.length > 3 && inputPass.data.length <= 10) {
      const hasSpace = /\s/.test(inputPass.data);
      if (!hasSpace) {
        if (selected.data !== undefined && Object.keys(selected.data).length > 0) {
        }
        const encryptedPassword = encryptAES(inputPass.data, config.constant.keyPrivate);
        const chatRoomId = `${currentUser.uid}_${selected.data.uid}`;
        let usersEmail = [currentUser.email];
        let usersUid = [currentUser.uid];
        let usersPhoto = [currentUser.photoURL];
        let usersDisplayName = [currentUser.displayName];
        usersEmail.push(selected.data.email);
        usersUid.push(selected.data.uid);
        usersPhoto.push(selected.data.photoURL);
        usersDisplayName.push(selected.data.displayName);

        await makeNewConversationPrivate({
          chatRoomId,
          usersEmail,
          usersUid,
          usersPhoto,
          usersDisplayName,
          reciever: selected.data.uid,
          sender: currentUser.uid,
          key: encryptedPassword,
        }).then(async (_) => {
          await firestore()
            .collection('ChatPrivate')
            .doc(chatRoomId)
            .collection('chats')
            .add({
              isRead: false,
              message: encryptAES(`${currentUser.displayName} has created this room.`, inputPass.data),
              sendBy: currentUser.email,
              time: Date.now(),
              type: 'notification',
            });
        });
        await setLocalStorageKey(encryptedPassword, chatRoomId);
        setSelected({ data: {}, show: false });
        setInputPass({ data: '', show: false });
        return navigation.goBack();
      } else {
        toastError('The password must not contain any whitespace characters');
      }
    } else {
      toastError('The password must be longer than and shorter than or equal to 10 characters');
    }
  };

  return (
    <View style={styles.wrapper}>
      {selected.show === true ? (
        <Fragment>
          <AppBar
            style={{ backgroundColor: GlobalStyles.colors.primary }}
            titleContentStyle={{ marginLeft: -15 }}
            titleStyle={{ fontFamily: GlobalStyles.fonts.fontAudiowide, color: '#fff' }}
            title="Read intructions and input password"
            color="#fff"
            leading={(_) => (
              <IconButton
                icon={(props) => <Ionicons name="arrow-back" {...props} />}
                color={'#fff'}
                onPress={() => {
                  setSelected({ data: {}, show: false });
                  setInputPass({ data: '', show: false });
                }}
              />
            )}
          />
          <View
            style={{
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',

              flex: 1,
              padding: 10,
            }}
          >
            <View>
              <Text
                style={{
                  textDecorationLine: 'underline',
                  fontSize: 20,
                  fontFamily: GlobalStyles.fonts.fontBold,
                  color: GlobalStyles.colors.dangerColor,
                }}
              >
                Important Notes:
              </Text>
              <Text style={{ fontSize: 16, marginTop: 10, fontFamily: GlobalStyles.fonts.fontRegular }}>
                1. The password for this conversation is secure; you need to keep it stored to access the chat. If you
                forget or lose the password, there is no way to recover it, and even MeoTalk cannot assist you in
                retrieving it.
              </Text>
              <Text style={{ fontSize: 16, marginTop: 5, fontFamily: GlobalStyles.fonts.fontRegular }}>
                2. Apart from those in this conversation, you are not allowed to provide the password to anyone,
                including MeoTalk.
              </Text>
            </View>
            <View
              style={{
                width: '70%',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
              }}
            >
              <View
                style={{
                  width: '100%',
                  height: 40,
                  backgroundColor: GlobalStyles.colors.powderGreyOpacity,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 10,
                }}
              >
                <TextInput
                  style={{ flex: 1, paddingHorizontal: 15, paddingVertical: 5 }}
                  secureTextEntry={inputPass.show ? false : true}
                  placeholder="Enter password"
                  autoCorrect={false}
                  autoCapitalize="none"
                  onChangeText={handleInputPass}
                  value={inputPass.data}
                  returnKeyType="join"
                  onSubmitEditing={handleMakeConver}
                />
                <TouchableWithoutFeedback onPress={() => setInputPass((pre) => ({ data: pre.data, show: !pre.show }))}>
                  <View style={{ marginRight: 10 }}>
                    <FontAwesome5 name={inputPass.show ? 'eye-slash' : 'eye'} size={16} />
                  </View>
                </TouchableWithoutFeedback>
              </View>
              <View
                style={{
                  width: '100%',
                  height: 40,
                  paddingVertical: 5,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 99,
                  borderWidth: 2,
                  borderColor: GlobalStyles.colors.successColor,
                  marginTop: 10,
                }}
              >
                <TouchableNativeFeedback
                  background={TouchableNativeFeedback.Ripple(GlobalStyles.colors.successColor, true)}
                  onPress={handleMakeConver}
                >
                  <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                    <Text
                      style={{
                        textTransform: 'uppercase',
                        fontFamily: GlobalStyles.fonts.fontSemiBold,
                        fontSize: 16,
                        color: GlobalStyles.colors.successColor,
                      }}
                    >
                      Create conversation
                    </Text>
                  </View>
                </TouchableNativeFeedback>
              </View>
            </View>
            <View>
              <Text style={{ color: GlobalStyles.colors.warningColor }}>
                The password accepts all characters except spaces, must be longer than 3 characters, and shorter than or
                equal to 10 characters.
              </Text>
            </View>
          </View>
        </Fragment>
      ) : (
        <Fragment>
          <AppBar
            style={{ backgroundColor: GlobalStyles.colors.primary }}
            titleContentStyle={{ marginLeft: -15 }}
            titleStyle={{ fontFamily: GlobalStyles.fonts.fontAudiowide, color: '#fff' }}
            title="New Secured Conversation"
            color="#fff"
            leading={(_) => (
              <IconButton
                icon={(props) => <Ionicons name="arrow-back" {...props} />}
                color={'#fff'}
                onPress={() => navigation.goBack()}
              />
            )}
          />
          <View style={{ flexDirection: 'column', flex: 1, alignItems: 'center', width: '100%' }}>
            <View style={stylesSearch.viewInput}>
              <TextInput
                ref={inputref}
                value={searchValue}
                onChangeText={(text) => handleInput(text)}
                textContentType="emailAddress"
                style={stylesSearch.inputSearch}
                placeholder="Find your friends by email"
                cursorColor={GlobalStyles.colors.primary}
                returnKeyType="search"
                placeholderTextColor="#fff"
              />
              {!!searchValue && !isLoading && (
                <Ionicons name="close-circle" size={20} style={stylesSearch.actions} onPress={handleClickClear} />
              )}
              {isLoading && searchValue && <ActivityIndicator size={20} color="#fff" style={stylesSearch.actions} />}
              <View style={{ flexDirection: 'row' }}>
                <IconButton
                  style={stylesSearch.btnSearch}
                  icon={<Ionicons size={25} name="ios-search" color={'#fff'} />}
                />
              </View>
            </View>
            <ScrollView style={{ flex: 1, width: '100%', marginTop: 20 }}>
              {searchRsults.length > 0
                ? searchRsults.map(
                    (result, index) =>
                      result.uid !== currentUser.uid && (
                        <TouchableNativeFeedback
                          key={index}
                          background={TouchableNativeFeedback.Ripple('#123944', false)}
                          onPress={() => handleSelected(result)}
                        >
                          <View style={stylesAccountItems.wrapper}>
                            <Avatar image={{ uri: result.photoURL ? result.photoURL : undefined }} />
                            <View style={stylesAccountItems.info}>
                              <Text
                                numberOfLines={1}
                                style={{ fontFamily: GlobalStyles.fonts.fontSemiBold, fontSize: 16 }}
                              >
                                {result.displayName}
                              </Text>
                              <Text
                                numberOfLines={1}
                                style={{ fontFamily: GlobalStyles.fonts.fontRegular, fontSize: 13 }}
                              >
                                {result.email}
                              </Text>
                            </View>

                            <View style={stylesAccountItems.actions}>
                              <MaterialCommunityIcons
                                name="message-lock"
                                size={25}
                                color={GlobalStyles.colors.primary}
                              />
                            </View>
                          </View>
                        </TouchableNativeFeedback>
                      ),
                  )
                : debounced &&
                  notFound === true && (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                      <Text style={{ fontFamily: GlobalStyles.fonts.fontBold, fontSize: 16 }}>
                        Doesn't exist with this email
                      </Text>
                    </View>
                  )}
            </ScrollView>
          </View>
        </Fragment>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    height: '100%',
    backgroundColor: 'white',
    flexDirection: 'column',
    justifyContent: 'center',
  },
});

const stylesSearch = StyleSheet.create({
  viewInput: {
    marginTop: 15,

    flexDirection: 'row',
    width: '90%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderRadius: 50,
    backgroundColor: GlobalStyles.colors.powderGrey,
  },
  inputSearch: {
    fontSize: 18,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flex: 1,
    paddingRight: 40,
    height: 50,
    color: '#fff',
    fontFamily: GlobalStyles.fonts.fontRegular,
  },
  actions: {
    position: 'absolute',
    right: 55,
    padding: 5,
  },
  btnSearch: {
    justifyContent: 'flex-end',
  },
});

const stylesAccountItems = StyleSheet.create({
  wrapper: {
    padding: 20,
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  info: {
    flexDirection: 'column',
    flex: 1,
    marginLeft: 15,
  },
  converseInbox: {
    flexDirection: 'row',
  },
  preLastMess: {
    flexDirection: 'row',
    flex: 0.65,
  },
  text: {
    fontFamily: GlobalStyles.fonts.fontRegular,
    fontSize: 13,
  },
  actions: {
    flex: 0.3,
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  wrapActions: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: GlobalStyles.colors.primary,
  },
  textBtn: {
    fontFamily: GlobalStyles.fonts.fontSemiBold,
    fontSize: 16,
  },
});
export default NewChatPrivate;
