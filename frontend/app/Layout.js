import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';

export default function Layout({ children }) {
  return <SafeAreaView style={styles.container}>{children}</SafeAreaView>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e4f0fd',
    paddingHorizontal: 20,
  },
});
