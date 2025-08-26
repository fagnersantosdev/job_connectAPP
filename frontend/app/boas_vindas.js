import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

// Constantes para cores e tamanhos
const COLORS = {
  primary: '#0D47A1',
  buttonBackground: '#FFD233',
  buttonText: '#000',
  textDefault: '#333333',
};

const SIZES = {
  paddingHorizontal: 20,
  logoWidth: 200,
  logoHeight: 150,
  logoMarginBottom: 30,
  titleFontSize: 25,
  descriptionFontSize: 15,
  descriptionMarginBottom: 60,
  buttonPaddingVertical: 15,
  buttonPaddingHorizontal: 40,
  borderRadius: 10,
};

// Assumindo que a imagem está em 'assets/images/welcome-illustration.png'
const welcomeIllustration = require('../assets/images/profissional_cliente.png');
const logo = require('../assets/images/hubServicos.png');

export default function TelaInicial() {
  const router = useRouter();

  const handleComecar = () => {
    router.push('/selection');
  };

  return (
    <LinearGradient
      colors={['#F0F7FD', '#A4CAED', '#4894DB']}
      locations={[0, 0.7, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.gradientContainer}
    >
      <View style={styles.container}>
        {/* Logo do aplicativo */}
        <Image
          source={logo}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Ilustração do cliente e prestador */}
        {/* Substitua o placeholder pela sua imagem local, se necessário */}
        <Image
          source={welcomeIllustration}
          style={styles.illustration}
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
          <Text style={styles.startButtonText}>Começar</Text>
        </TouchableOpacity>
      </View>
      
      {/* Rodapé */}
      <Text style={styles.footerText}>
        “HubServiços” – Conectando serviços,{'\n'} facilitando sua vida!
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
    marginTop: 0,
  },
  illustration: {
    width: 300,
    height: 200,
    marginBottom: 20,
    marginTop: -30,
  },
  title: {
    fontSize: SIZES.titleFontSize,
    fontWeight: 'bold',
    color: '#06437e', // Cor ajustada para combinar com a imagem
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 35,
    paddingHorizontal: 30,
  },
  description: {
    fontSize: SIZES.descriptionFontSize,
    color: COLORS.textDefault, // Cor ajustada para combinar com a imagem
    textAlign: 'center',
    marginBottom: SIZES.descriptionMarginBottom,
    paddingHorizontal: 30,
  },
  startButton: {
    backgroundColor: COLORS.buttonBackground,
    paddingVertical: SIZES.buttonPaddingVertical,
    paddingHorizontal: 60, // Ajuste para o botão da imagem
    borderRadius: 30, // Borda mais arredondada para combinar com a imagem
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  startButtonText: {
    color: '#003A6F',
    fontWeight: 'bold',
    fontSize: 18,
  },
  footerText: {
    fontSize: 13,
    color: '#FFF',
    textAlign: 'center',
    position: 'absolute',
    bottom: 60,
  },
});

