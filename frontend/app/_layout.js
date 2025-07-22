import { LinearGradient } from 'expo-linear-gradient';
import { Slot } from 'expo-router';

export default function RootLayout() {
  return (
    <LinearGradient
  colors={['#F0F7FD', '#A4CAED', '#4894DB']} 
      locations={[0, 0.7, 1]}  
      start={{ x: 0.5, y: 0 }}  
      end={{ x: 0.5, y: 1 }}     
      style={{ flex: 1 }}
    >
      <Slot />
    </LinearGradient>
  );
}
