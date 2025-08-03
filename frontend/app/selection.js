import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Paleta de cores utilizadas no app
const COLORS = {
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
  logoWidth: 300,
  logoHeight: 200,
  titleFontSize: 25,
  buttonFontSize: 16,
  loginFontSize: 14,
  footerFontSize: 13,
  paddingHorizontal: 20,
  buttonPaddingVertical: 12,
  buttonPaddingHorizontal: 40,
  borderRadius: 12,
  titleMarginVertical: 15,
  buttonMarginVertical: 10,
  loginMarginTop: 15,
  startButtonMarginTop: 20,
  footerMarginTop: 50,
};

// Componente da tela de seleção de perfil
export default function SelectionScreen() {
    // Estado para armazenar o papel selecionado pelo usuário: 'cliente' ou 'prestador'
    const [selectedRole, setSelectedRole] = useState(null);
    const router = useRouter();

    // Função para lidar com o início, navegando para a tela de login/cadastro
    const handleStart = () => {
        // Redireciona para a tela de login/cadastro
        router.push('login_cadastro');
    };

    return (
        <View style={styles.container}>
            {/* Logo do aplicativo */}
            <Image
                source={require('../assets/images/logo-Jobconnect.png')}
                style={styles.logo}
                resizeMode="contain"
            />

            {/* Título de boas-vindas */}
            <Text style={styles.title}>Bem vindo</Text>

            {/* Botão para selecionar o papel de Cliente */}
            <TouchableOpacity
                style={[
                    styles.selectButton,
                    selectedRole === 'cliente' && styles.selectedButton,
                ]}
                onPress={() => setSelectedRole('cliente')}
            >
                <Ionicons name="person" size={24} color={COLORS.primary} />
                <Text style={styles.selectButtonText}>Sou Cliente</Text>
            </TouchableOpacity>

            {/* Botão para selecionar o papel de Prestador */}
            <TouchableOpacity
                style={[
                    styles.selectButton,
                    selectedRole === 'prestador' && styles.selectedButton,
                ]}
                onPress={() => setSelectedRole('prestador')}
            >
                <Ionicons name="construct" size={24} color={COLORS.primary} />
                <Text style={styles.selectButtonText}>Sou Prestador</Text>
            </TouchableOpacity>

            {/* Texto com opção de login */}
            <Text style={styles.loginText}>
                Já tem uma conta? <Text style={styles.loginLink}>Faça Login</Text>
            </Text>

            {/* Botão de começar */}
            <TouchableOpacity onPress={handleStart} style={styles.startButton}>
                <Text style={styles.startButtonText}>Começar</Text>
            </TouchableOpacity>

            {/* Texto de rodapé - CORRIGIDO */}
            <Text style={styles.footerText}>
                JobConnect – Conectando serviços, {'\n'}facilitando sua vida!
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
        resizeMode: 'contain',
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
        fontSize: 18,
    },
    footerText: {
        marginTop: SIZES.footerMarginTop,
        fontSize: SIZES.footerFontSize,
        color: '#ffffff',
        textAlign: 'center',
    },
});
