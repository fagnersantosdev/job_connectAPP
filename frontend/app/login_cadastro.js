import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Image, KeyboardAvoidingView, ScrollView, Platform, Keyboard,
  ActivityIndicator, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

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
    // Validação básica para evitar requisição vazia
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setIsLoading(true);
    setError('');

    // ** Lógica de login com chamada de API real (substituindo a simulação) **
    try {
      const response = await fetch('http://192.168.101.95:3000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      // Se a resposta for bem-sucedida (código 200, 201, etc.)
      if (response.ok) {
        // Você pode processar a resposta do servidor aqui, por exemplo,
        // salvando um token de autenticação.
        // const data = await response.json();
        // console.log('Login bem-sucedido:', data);

        // Se o login for bem-sucedido, navega para a tela home
        router.push('/home_cliente');
      } else {
        // Se a resposta não for ok, exibe a mensagem de erro do backend
        const errorData = await response.json();
        setError(errorData.message || 'E-mail ou senha incorretos.');
      }
    } catch (e) {
      // Captura erros de rede (sem conexão, URL incorreta, etc.)
      setError('Não foi possível conectar ao servidor. Verifique sua conexão.');
      console.error('Login error:', e);
    } finally {
      // Finaliza o estado de carregamento, independentemente do sucesso ou falha
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
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.container, keyboardVisible && styles.containerKeyboardVisible]}>
          {/* Logo do aplicativo */}
          <Image source={logo} style={styles.logo} />

          {/* Título */}
          <Text style={styles.title}>Bem-vindo de volta</Text>

          {/* Subtítulo */}
          <Text style={styles.subtitle}>Faça login para continuar</Text>

          {/* Container do formulário */}
          <View style={styles.formContainer}>
            {/* Campo de e-mail */}
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#6B7280" />
              <TextInput
                style={styles.input}
                placeholder="E-mail"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Campo de senha */}
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
              <TextInput
                style={styles.input}
                placeholder="Senha"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.icon}>
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>

            {/* Texto de erro (adicionado) */}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Esqueceu a senha */}
            <TouchableOpacity onPress={() => {}}>
              <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
            </TouchableOpacity>

            {/* Botão de login */}
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.loginButtonText}>Entrar</Text>
              )}
            </TouchableOpacity>

            {/* Link para cadastro */}
            <TouchableOpacity onPress={trocarDetela} style={styles.registerLink}>
              <Text style={styles.registerText}>
                Não tem uma conta? <Text style={styles.registerLinkText}>Cadastre-se</Text>
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoiding: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 20,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#e4f0fd',
  },
  containerKeyboardVisible: {
    justifyContent: 'flex-start',
    paddingTop: 50,
  },
  logo: {
    width: 300,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 0,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#06437e',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
  },
  formContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    elevation: 4,
    width: '100%',
    maxWidth: 400,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
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
    marginLeft: 10,
  },
  icon: {
    paddingLeft: 10,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: -5,
  },
  forgotPasswordText: {
    color: '#2563EB',
    textAlign: 'right',
    marginBottom: 20,
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#FACC15',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  loginButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 18,
  },
  registerLink: {
    alignItems: 'center',
    marginTop: 10,
  },
  registerText: {
    fontSize: 14,
    color: '#333',
  },
  registerLinkText: {
    color: '#06437e',
    fontWeight: 'bold',
  },
});
