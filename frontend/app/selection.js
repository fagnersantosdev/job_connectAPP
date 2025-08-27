import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Paleta de cores utilizadas no app
const COLORS = {
  primary: '#06437e',
  buttonBackground: '#FFD233',
  buttonText: '#003A6F',
  buttonSelectedBorder: '#FFD233',
  buttonSelectedBackground: '#f5f5f5',
  buttonDefaultBorder: '#cccccc',
  textDefault: '#333333',
  errorText: '#ff0000', // Cor para o texto de erro
};

// Tamanhos, margens e espaçamentos padronizados para a tela
const SIZES = {
  logoWidth: 250,
  logoHeight: 200,
  titleFontSize: 25,
  buttonFontSize: 16,
  loginFontSize: 16,
  footerFontSize: 13,
  paddingHorizontal: 20,
  buttonPaddingVertical: 15,
  buttonPaddingHorizontal: 45,
  borderRadius: 20,
  titleMarginVertical: 15,
  buttonMarginVertical: 10,
  loginMarginTop: 15,
  startButtonMarginTop: 20,
  footerMarginTop: 50,
};

// Componente da tela de seleção de perfil
export default function SelectionScreen() {
    const [selectedRole, setSelectedRole] = useState(null);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleStart = () => {
        if (!selectedRole) {
            setError('Por favor, selecione se você é cliente ou prestador de serviços.');
            return;
        }

        setError(''); // Limpa a mensagem de erro
        // Redireciona para a tela de login/cadastro, passando o papel selecionado como parâmetro
        router.push({
            pathname: 'login_cadastro',
            params: { role: selectedRole }
        });
    };

    const handleRoleSelection = (role) => {
        setSelectedRole(role);
        setError('');
    };

    return (
        <View style={styles.container}>
            <Image
                source={require('../assets/images/logo_hubServicos.png')}
                style={styles.logo}
                resizeMode="contain"
            />
            <Text style={styles.title}>Bem vindo</Text>
            <Text style={styles.description}>
                Selecione se você é cliente ou prestador de serviços.
            </Text>
            <TouchableOpacity
                style={[
                    styles.selectButton,
                    selectedRole === 'cliente' && styles.selectedButton,
                ]}
                onPress={() => handleRoleSelection('cliente')}
            >
                <Ionicons name="person" size={24} color={COLORS.primary} />
                <Text style={styles.selectButtonText}>Sou Cliente</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[
                    styles.selectButton,
                    selectedRole === 'prestador' && styles.selectedButton,
                ]}
                onPress={() => handleRoleSelection('prestador')}
            >
                <Ionicons name="construct" size={24} color={COLORS.primary} />
                <Text style={styles.selectButtonText}>Sou Prestador</Text>
            </TouchableOpacity>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <Text style={styles.loginText}>
                Já tem uma conta? <Text style={styles.loginLink}>Faça Login</Text>
            </Text>
            <TouchableOpacity onPress={handleStart} style={styles.startButton}>
                <Text style={styles.startButtonText}>Começar</Text>
            </TouchableOpacity>
            <Text style={styles.footerText}>
                “HubServiços” – Conectando serviços, {'\n'}facilitando sua vida!
            </Text>
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
    errorText: {
        color: COLORS.errorText,
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 5,
        fontSize: 14,
    },
    loginText: {
        marginTop: SIZES.loginMarginTop,
        fontSize: SIZES.loginFontSize,
        color: '#FFF',
    },
    loginLink: {
        color: '#1748A1',
        fontWeight: 'bold',
    },
    startButton: {
        backgroundColor: COLORS.buttonBackground,
        paddingVertical: SIZES.buttonPaddingVertical,
        paddingHorizontal: SIZES.buttonPaddingHorizontal,
        borderRadius: SIZES.borderRadius,
        marginTop: SIZES.startButtonMarginTop,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
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
    description: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
        marginBottom: 10,
        paddingHorizontal: 30,

    }
});
