import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

// Paleta de cores utilizada no app
const COLORS = {
  background: '#e4f0fd',
  primary: '#06437e',
  buttonBackground: '#f5b700',
  buttonText: '#ffffff',
  textDefault: '#333333',
};

// Tamanhos, margens e espaçamentos padronizados para a tela
const SIZES = {
  logoWidth: 300,
  logoHeight: 200,
  titleFontSize: 28,
  descriptionFontSize: 16,
  buttonFontSize: 16,
  paddingHorizontal: 20,
  buttonPaddingVertical: 15,
  buttonPaddingHorizontal: 60,
  borderRadius: 12,
  logoMarginBottom: 30,
  descriptionMarginBottom: 40,
};

// Componente da tela de boas-vindas
export default function BoasVindasScreen() {
    const router = useRouter();

    // Função para navegar para a próxima tela (a tela de seleção de perfil)
    const handleStart = () => {
        // Redireciona para a tela de seleção de perfil
        router.push('selection');
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
            <TouchableOpacity style={styles.startButton} onPress={handleStart}>
                <Text style={styles.startButtonText}>Vamos Começar</Text>
            </TouchableOpacity>
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
