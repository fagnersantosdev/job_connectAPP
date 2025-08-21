import { Slot } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';
import { AuthProvider } from '../app/AuthContext'; // 1. Importe o AuthProvider

export default function RootLayout() {
  return (
    // 2. Envolva tudo com o AuthProvider
    <AuthProvider>
      <LinearGradient
        colors={['#F0F7FD', '#A4CAED', '#4894DB']}
        locations={[0, 0.7, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.container}
      >
        {/* O Slot renderiza a tela atual, que agora terá acesso ao contexto */}
        <Slot />
      </LinearGradient>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
