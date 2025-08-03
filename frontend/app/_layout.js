import { Slot } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';

// Este layout simplesmente fornece o gradiente como fundo
// para todas as telas, usando o Slot para renderizar a rota atual.
export default function RootLayout() {
  return (
    <LinearGradient
      colors={['#F0F7FD', '#A4CAED', '#4894DB']}
      locations={[0, 0.7, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <Slot />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
