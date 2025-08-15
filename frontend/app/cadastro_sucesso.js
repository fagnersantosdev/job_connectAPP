import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient'; // 🔹 Importa o componente de gradiente

// Imagem do logo
const logo = require('../assets/images/logo-Jobconnect.png');

// Paleta de cores para o gradiente
const COLORS = {
  gradientStart: '#E4F0FD', // Azul claro
  gradientEnd: '#2563EB',   // Azul um pouco mais escuro
  titleText: '#333',
  messageText: '#666',
  buttonBackground: '#FFD233',
  buttonText: '#333',
};

/**
 * Tela de Confirmação de Cadastro.
 * Exibe uma mensagem de sucesso e um botão para o usuário prosseguir.
 */
export default function CadastroSucessoScreen() {
  const router = useRouter();
  // Obtém os parâmetros da URL, incluindo o 'role'
  const { role } = useLocalSearchParams();

  // Função para navegar para a tela inicial
  const handleContinue = () => {
    // Valida o 'role' e redireciona para a rota correta
    if (role === 'prestador') {
      router.replace('/home_prestador');
    } else {
      router.replace('/home_clientes');
    }
  };

  return (
    // 🔹 O fundo agora é um gradiente
    <LinearGradient
      colors={[COLORS.gradientStart, COLORS.gradientEnd]}
      style={styles.container}
    >
      <Image source={logo} style={styles.logo} />
      <View style={styles.card}>
        <Ionicons name="checkmark-circle" size={80} color="#22C55E" />
        <Text style={styles.title}>Cadastro realizado com sucesso!</Text>
        <Text style={styles.message}>
          Você agora faz parte da comunidade JobConnect.
        </Text>
        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Prosseguir para a tela inicial</Text>
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
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 20,
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
    fontSize: 16,
  },
});
