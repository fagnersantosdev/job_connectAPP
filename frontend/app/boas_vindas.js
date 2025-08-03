import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

// 🔹 Constantes para cores e tamanhos
const COLORS = {
  primary: '#0D47A1',
  buttonBackground: '#FFD233',
  buttonText: '#000',
};

const SIZES = {
  paddingHorizontal: 20,
  logoWidth: 200,
  logoHeight: 150,
  logoMarginBottom: 30,
  titleFontSize: 25,
  descriptionFontSize: 15,
  descriptionMarginBottom: 30,
  buttonPaddingVertical: 15,
  buttonPaddingHorizontal: 40,
  borderRadius: 10,
};

export default function TelaInicial() {
  const handleComecar = () => {
    console.log('Botão "Começar" pressionado');
  };

  return (
    <View style={styles.container}>
      {/* Logo do aplicativo */}
      <Image
        source={require('../assets/images/logo-Jobconnect.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Título principal */}
      <Text style={styles.title}>Conectando você ao profissional ideal</Text>

      {/* Descrição */}
      <Text style={styles.description}>
        Encontre prestadores de serviço de forma rápida, prática e segura direto pelo seu celular.
      </Text>

      {/* Botão para começar a usar */}
      <TouchableOpacity style={styles.startButton} onPress={handleComecar}>
        <Text style={styles.startButtonText}>Vamos Começar</Text>
      </TouchableOpacity>
    </View>
  );
}

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
    marginBottom: SIZES.logoMarginBottom,
  },
  title: {
    fontSize: SIZES.titleFontSize,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 35,
    paddingHorizontal: 30,
  },
  description: {
    fontSize: SIZES.descriptionFontSize,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SIZES.descriptionMarginBottom,
    paddingHorizontal: 30,
  },
  startButton: {
    backgroundColor: COLORS.buttonBackground,
    paddingVertical: SIZES.buttonPaddingVertical,
    paddingHorizontal: SIZES.buttonPaddingHorizontal,
    borderRadius: SIZES.borderRadius,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  startButtonText: {
    color: COLORS.buttonText,
    fontWeight: 'bold',
    fontSize: 18,
  },
});
