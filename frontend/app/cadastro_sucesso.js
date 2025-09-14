import React, { useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../context/AuthContext';

// Imagem do logo
const logo = require('../assets/images/logo_hubServicos.png');

// Paleta de cores para o gradiente
const COLORS = {
  gradientStart: '#E4F0FD',
  gradientEnd: '#4894DB',
  titleText: '#333',
  messageText: '#666',
  buttonBackground: '#FFD233',
  buttonText: '#333',
};

export default function CadastroSucessoScreen() {
  const router = useRouter();
  const { login } = useContext(AuthContext);

  // Agora recebemos também os dados do usuário
  const { role, id, nome, email } = useLocalSearchParams();

  const handleContinue = () => {
    // Salva o usuário no contexto
    login({
      id,
      nome,
      email,
      role,
    });

    // Redireciona de acordo com o tipo
    if (role?.toLowerCase() === 'prestador') {
      router.replace('/home_prestador');
    } else {
      router.replace('/home_cliente');
    }
  };

  return (
    <LinearGradient
      colors={[COLORS.gradientStart, COLORS.gradientEnd]}
      style={styles.container}
    >
      <Image source={logo} style={styles.logo} />
      <View style={styles.card}>
        <Ionicons name="checkmark-circle" size={80} color="#22C55E" />
        <Text style={styles.title}>Cadastro realizado com sucesso!</Text>
        <Text style={styles.message}>
          Você agora faz parte da comunidade HubServiços.
        </Text>
        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Prosseguir</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 200,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 5,
    marginTop: -60,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: COLORS.titleText,
    marginTop: 20,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: COLORS.messageText,
    marginTop: 10,
    marginBottom: 30,
  },
  button: {
    backgroundColor: COLORS.buttonBackground,
    padding: 15,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: 'bold',
    color: COLORS.buttonText,
    fontSize: 18,
  },
});
