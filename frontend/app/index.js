import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Importa o logo localmente
const logo = require('../assets/images/logo-Jobconnect.png');

//Função pra mudar de página
const router = useRouter();

function handleStart() {
  router.push('/login_cadastro');
}


// Paleta de cores utilizadas no app
const COLORS = {
  background: '#e4f0fd',
  primary: '#06437e',
  buttonBackground: '#f5b700',
  buttonText: '#ffffff',
  buttonSelectedBorder: '#f5b700',
  buttonSelectedBackground: '#f5f5f5',
  buttonDefaultBorder: '#cccccc',
  textDefault: '#333333',
};

// Tamanhos, margens e espaçamentos padronizados para a tela
const SIZES = {
  // Largura do logo exibido na tela
  logoWidth: 300,

  // Altura do logo exibido na tela
  logoHeight: 200,

  // Tamanho da fonte do título principal
  titleFontSize: 40,

  // Tamanho da fonte dos botões de seleção (Cliente / Prestador)
  buttonFontSize: 16,

  // Tamanho da fonte do texto de login
  loginFontSize: 14,

  // Tamanho da fonte do texto no rodapé
  footerFontSize: 13,

  // Espaçamento horizontal geral da tela
  paddingHorizontal: 20,

  // Espaçamento vertical interno dos botões
  buttonPaddingVertical: 12,

  // Espaçamento horizontal interno dos botões
  buttonPaddingHorizontal: 40,

  // Arredondamento das bordas dos botões
  borderRadius: 12,

  // Espaçamento vertical padrão entre elementos
  spacingVertical: 10,

  // Margem inferior abaixo do título
  marginBottomTitle: 100,

  // Margem superior acima do texto de login
  marginTopLogin: 100,

  // Margem superior acima do botão "Começar"
  marginTopStartButton: 20,

  // Margem superior acima do rodapé
  marginTopFooter: 30,

  // Margem superior acima do logo
  logoMarginTop: 20,

  // Margem inferior abaixo do logo
  logoMarginBottom: 10,

  // Margem vertical do título (acima e abaixo)
  titleMarginVertical: 15,

  // Margem vertical dos botões de seleção
  buttonMarginVertical: 10,

  // Margem superior acima do texto de login
  loginMarginTop: 15,

  // Margem superior acima do botão "Começar"
  startButtonMarginTop: 20,

  // Margem superior acima do rodapé
  footerMarginTop: 50,
};

// Componente principal da tela de boas-vindas
export default function WelcomeScreen() {
  // Estado para armazenar o papel selecionado pelo usuário: 'cliente' ou 'prestador'
  const [selectedRole, setSelectedRole] = useState(null);

  return (
    <View style={styles.container}>
      {/* Logo do aplicativo */}
      <Image source={logo} style={styles.logo} />

      {/* Título de boas-vindas */}
      <Text style={styles.title}>Bem vindo</Text>

      {/* Botão para selecionar o papel de Cliente */}
      <TouchableOpacity
        style={[
          styles.selectButton,
          selectedRole === 'cliente' && styles.selectedButton, // Aplica estilo de selecionado se o papel for 'cliente'
        ]}
        onPress={() => setSelectedRole('cliente')} // Define o papel como cliente
      >
        <Ionicons name="person" size={24} color={COLORS.primary} />
        <Text style={styles.selectButtonText}>Sou Cliente</Text>
      </TouchableOpacity>

      {/* Botão para selecionar o papel de Prestador */}
      <TouchableOpacity
        style={[
          styles.selectButton,
          selectedRole === 'prestador' && styles.selectedButton, // Aplica estilo de selecionado se o papel for 'prestador'
        ]}
        onPress={() => setSelectedRole('prestador')} // Define o papel como prestador
      >
        <Ionicons name="construct" size={24} color={COLORS.primary} />
        <Text style={styles.selectButtonText}>Sou Prestador</Text>
      </TouchableOpacity>

      {/* Texto com opção de login */}
      <Text style={styles.loginText}>
        Já tem uma conta? <Text style={styles.loginLink}>Faça Login</Text>
      </Text>

      {/* Botão de começar */}
      <TouchableOpacity  onPress={handleStart} style={styles.startButton}>
        <Text style={styles.startButtonText}>Começar</Text>
      </TouchableOpacity>

      {/* Texto de rodapé */}
      <Text style={styles.footerText}>
        "JobConnect – Conectando serviços, {'\n'}facilitando sua vida!"
      </Text>
    </View>
  );
}

// Estilos visuais aplicados na tela
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SIZES.paddingHorizontal,
  
  },
  logo: {
    width: SIZES.logoWidth,
    height: SIZES.logoHeight,
    marginTop: SIZES.logoMarginTop,
    marginBottom: SIZES.logoMarginBottom,
    resizeMode: 'contain', // Mantém proporção da imagem
  },
  title: {
    fontSize: SIZES.titleFontSize,
    fontWeight: '600',
    color: COLORS.primary,
    marginVertical: SIZES.titleMarginVertical,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: SIZES.buttonPaddingVertical,
    borderRadius: SIZES.borderRadius,
    marginVertical: SIZES.buttonMarginVertical,
    width: '80%',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.buttonDefaultBorder,
  },
  selectedButton: {
    borderColor: COLORS.buttonSelectedBorder,
    backgroundColor: COLORS.buttonSelectedBackground,
  },
  selectButtonText: {
    marginLeft: 10,
    fontSize: SIZES.buttonFontSize,
    color: COLORS.primary,
    fontWeight: '500',
  },
  loginText: {
    marginTop: SIZES.loginMarginTop,
    fontSize: SIZES.loginFontSize,
    color: COLORS.textDefault,
  },
  loginLink: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  startButton: {
    backgroundColor: COLORS.buttonBackground,
    paddingVertical: SIZES.buttonPaddingVertical,
    paddingHorizontal: SIZES.buttonPaddingHorizontal,
    borderRadius: SIZES.borderRadius,
    marginTop: SIZES.startButtonMarginTop,
  },
  startButtonText: {
    color: COLORS.buttonText,
    fontWeight: 'bold',
    fontSize: SIZES.buttonFontSize,
  },
  footerText: {
    marginTop: SIZES.footerMarginTop,
  fontSize: SIZES.footerFontSize,
  color: '#ffffff',
  textAlign: 'center',
  },
});
