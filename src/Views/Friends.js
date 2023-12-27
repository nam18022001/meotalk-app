import { ActivityIndicator, IconButton } from '@react-native-material/core';
import { memo, useEffect, useRef, useState } from 'react';
import { ScrollView, TextInput, StyleSheet, View, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';

import GlobalStyles from '../Components/GlobalStyles';
import useDebounce from '../hooks/useDebounce';
import AccountItem, { AccountItemRequest } from '../Components/AccountItem';

import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import useAuthContext from '../hooks/useAuthContext';

function Search({ navigation }) {
  const currentUser = useAuthContext();

  const [searchValue, setSearchValue] = useState('');
  const [searchRsults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notFound, setNotFound] = useState();
  const debounced = useDebounce(searchValue.toLowerCase(), 500);

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
  return (
    <View style={styles.wrapper}>
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
          <IconButton style={stylesSearch.btnSearch} icon={<Ionicons size={25} name="ios-search" color={'#fff'} />} />
        </View>
      </View>
      <ScrollView style={{ flex: 1, width: '100%', marginTop: 20 }}>
        {searchRsults.length > 0
          ? searchRsults.map(
              (result, index) =>
                result.uid !== currentUser.uid && <AccountItem key={index} navigation={navigation} data={result} />,
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
  );
}

function MyFriends({ navigation }) {
  const currentUser = useAuthContext();
  const [friends, setFriends] = useState([]);
  const [hasConversation, setHasConversation] = useState();

  const friendsDoc = firestore().collection('users').doc(currentUser.uid).collection('friends');
  useEffect(() => {
    friendsDoc.onSnapshot((res) => {
      if (!res.empty) {
        setHasConversation(true);

        const friendsArr = [];
        res.forEach((friend) => {
          friendsArr.push(friend.data());
        });
        setFriends(friendsArr);
      } else {
        setHasConversation(false);
        setFriends([]);
      }
    });
  }, []);

  return (
    <View style={styles.wrapper}>
      <View style={stylesMyFriends.viewTitle}>
        <Ionicons name="ios-people" size={25} color={GlobalStyles.colors.primary} />
      </View>
      <ScrollView style={{ flex: 1, width: '100%', marginTop: 20 }}>
        {hasConversation === false ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontFamily: GlobalStyles.fonts.fontBold, fontSize: 16 }}>You don't have any friends.</Text>
            <Text style={{ fontFamily: GlobalStyles.fonts.fontSemiBold, fontSize: 13 }}>
              Go through the search page and find yourself some friends!
            </Text>
          </View>
        ) : (
          friends.map(
            (result, index) =>
              result.uid !== currentUser.uid && (
                <AccountItem key={index} navigation={navigation} data={result} beFriend />
              ),
          )
        )}
      </ScrollView>
    </View>
  );
}

function FriendsRequest({ navigation }) {
  const currentUser = useAuthContext();
  const [myRequest, setMyRequests] = useState([]);
  const [friendsRequest, setFriendsRequest] = useState([]);

  useEffect(() => {
    const mRequest = firestore().collection('makeFriends').where('sender', '==', currentUser.uid);
    const fRequest = firestore().collection('makeFriends').where('reciever', '==', currentUser.uid);
    mRequest.onSnapshot((request) => {
      if (!request.empty) {
        const requestFr = [];

        request.forEach((res) => {
          requestFr.push(res.data());
        });
        setMyRequests(requestFr);
      } else {
        setMyRequests([]);
      }
    });
    fRequest.onSnapshot((request) => {
      if (!request.empty) {
        const requestFr = [];

        request.forEach((res) => {
          requestFr.push(res.data());
        });
        setFriendsRequest(requestFr);
      } else {
        setFriendsRequest([]);
      }
    });
  }, []);
  return (
    <View style={styles.wrapper}>
      <View style={stylesFriendsRequest.wrapRequest}>
        <Text style={stylesFriendsRequest.textTitle}>Friends Request</Text>
        <ScrollView style={{ flex: 1, width: '100%', marginTop: 20 }}>
          {friendsRequest.length > 0 ? (
            friendsRequest.map((result, index) => (
              <AccountItemRequest key={index} navigation={navigation} data={result} request />
            ))
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontFamily: GlobalStyles.fonts.fontBold, fontSize: 14 }}>
                You don't receive any friend requests!
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
      <View style={stylesFriendsRequest.wrapRequest}>
        <Text style={stylesFriendsRequest.textTitle}>My Requests</Text>
        <ScrollView style={{ flex: 1, width: '100%', marginTop: 20 }}>
          {myRequest.length > 0 ? (
            myRequest.map((result, index) => (
              <AccountItemRequest key={index} navigation={navigation} data={result} sent />
            ))
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontFamily: GlobalStyles.fonts.fontBold, fontSize: 14 }}>
                You haven't requests for anyone!
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}
const Tab = createMaterialTopTabNavigator();

function Friends() {
  return (
    <Tab.Navigator
      initialRouteName="My Friends"
      screenOptions={{
        animationEnabled: true,
        tabBarLabelStyle: { fontSize: 13, fontFamily: GlobalStyles.fonts.fontSemiBold },
        tabBarIndicatorStyle: { backgroundColor: GlobalStyles.colors.primaryOpacity },
        tabBarStyle: { backgroundColor: '#fff', shadowColor: '#fff' },
      }}
    >
      <Tab.Screen name="My Friends" component={MyFriends} />
      <Tab.Screen name="Search" component={Search} />
      <Tab.Screen name="Requests" component={FriendsRequest} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
const stylesMyFriends = StyleSheet.create({
  viewTitle: {
    width: '90%',
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
});

const stylesFriendsRequest = StyleSheet.create({
  wrapRequest: {
    width: '100%',
    flex: 0.5,
    marginTop: 15,
    flexDirection: 'column',
  },
  textTitle: {
    marginLeft: 15,
    fontFamily: GlobalStyles.fonts.fontSemiBold,
    color: GlobalStyles.colors.powderGrey,
    fontSize: 12,
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
export default memo(Friends);
