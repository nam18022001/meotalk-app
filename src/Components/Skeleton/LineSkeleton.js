import React from 'react';
import { StyleSheet, View } from 'react-native';
function LineSkeleton({ width = '100%', height = 20, styles = {} }) {
  return <View style={[stylesSheet.namePlaceholder, { width, height }, styles]} />;
}
const stylesSheet = StyleSheet.create({
  namePlaceholder: {
    backgroundColor: '#f0f0f0',
  },
});
export default LineSkeleton;
