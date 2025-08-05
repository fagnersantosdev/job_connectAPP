import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Image, KeyboardAvoidingView, ScrollView, Platform, Keyboard, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Importa a URL base do backend
import { BASE_URL } from './api_config';

const logo = require('../assets/images/logo-Jobconnect.png');

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const trocarDetela = () => {
    router.push('/cadastro');
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      // Usa a BASE_URL do arquivo de configuração para montar a URL completa
      const response = await fetch(`${BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Login bem-sucedido!', data);
        // Salvar token e redirecionar
        router.push('/home');
      } else {
        console.error('Erro de login:', data.message);
        setError(data.message || 'Erro ao fazer login. Verifique suas credenciais.');
      }
    } catch (err) {
      console.error('Erro de rede:', err);
      setError('Não foi possível conectar ao servidor. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoiding}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={keyboardVisible}
        scrollEnabled={keyboardVisible}
      >
        <View style={styles.container}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image source={logo} style={styles.logoImage} />
          </View>

          {/* Formulário */}
          <View style={styles.formContainer}>
            {/* Campo de E-mail */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Digite seu e-mail"
                value={email}
                onChangeText={setEmail}
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Campo de senha com olhinho */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Senha"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                placeholderTextColor="#999"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.icon}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color="gray"
                />
              </TouchableOpacity>
            </View>

            {/* Exibe mensagem de erro */}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Esqueceu a senha */}
            <TouchableOpacity>
              <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
            </TouchableOpacity>

            {/* Botão Entrar */}
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.loginButtonText}>Entrar</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.orText}>ou</Text>

            {/* Cadastre-se */}
            <TouchableOpacity onPress={trocarDetela}>
              <Text style={styles.registerText}>Cadastre-se</Text>
            </TouchableOpacity>

            <Text style={styles.politica}>
                        Ao continuar, você concorda com nossos{' '}
                        <Text style={styles.link}>Termos de Serviço</Text> e{' '}
                        <Text style={styles.link}>Política de Privacidade</Text>
                      </Text>
                    </View>
            

          {/* Rodapé */}
          <Text style={styles.footerText}>
            "JobConnect – Conectando serviços,{'\n'}facilitando sua vida!"
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoiding: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingVertical: 35,
    paddingHorizontal:25,
  },
  container: {
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoImage: {
    width: 250,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 0,
    marginTop: 20,
  },
  formContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    elevation: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    height: 50,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  icon: {
    paddingLeft: 10,
  },
  forgotPasswordText: {
    color: '#2563EB',
    textAlign: 'right',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#FFD233',
    borderRadius: 30,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  loginButtonText: {
    color: '#003A6F',
    fontWeight: 'bold',
    fontSize: 18,
  },
  orText: {
    textAlign: 'center',
    marginVertical: 8,
    color: '#64748B',
    marginBottom: 15,
    fontSize: 16,
  },
  registerText: {
    color: '#2563EB',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
    fontSize: 18,
  },
  loginLink: {
    color: '#2563EB',
    fontWeight: '600',
  },
  politica: {
    textAlign: 'center',
    fontSize: 12,
    color: '#555',
    marginTop: 15,
  },
  footerText: {
    textAlign: 'center',
    color: '#f5f5f5ff',
    fontSize: 13,
    marginBottom: 40,
    marginTop: 40,
  },
  errorText: {
    color: '#FF0000',
    textAlign: 'center',
    marginBottom: 10,
  },
});