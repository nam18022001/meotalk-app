import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

function AvatarSkeleton({ width = 50, height = 50, styleAvatar = {} }) {
  return <View style={[stylesSheet.avatar, { width, height }, styleAvatar]}></View>;
}

const stylesSheet = StyleSheet.create({
  avatar: {
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
  },
});

export default AvatarSkeleton;
