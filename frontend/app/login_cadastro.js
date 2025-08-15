import React, { useState, useEffect } from 'react';
import { IP_DO_SERVIDOR } from '../app/api_config';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Image, KeyboardAvoidingView, ScrollView, Platform, Keyboard,
  ActivityIndicator, Alert // Importei o componente Alert para exibir mensagens de erro
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Carrega o logo localmente
const logo = require('../assets/images/logo-Jobconnect.png');

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
      Alert.alert('Erro no Login', 'Por favor, preencha todos os campos.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${IP_DO_SERVIDOR}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

      // Se a resposta for bem-sucedida
      if (response.ok) {
        // ... Lógica para processar a resposta, por exemplo, salvar um token
        // const data = await response.json();
        // console.log('Login bem-sucedido:', data);

        //Alert.alert('Sucesso!', 'Login bem-sucedido!');
        router.push('/home_cliente');
      } else {
        // Se a resposta não for ok, exibe a mensagem de erro do backend
        const errorData = await response.json();
        Alert.alert('Erro no Login', errorData.message || 'E-mail ou senha incorretos.');
      }
    } catch (e) {
      // Captura erros de rede (sem conexão, URL incorreta, etc.)
      Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor. Verifique sua conexão e o firewall.');
      console.error('Login error:', e);
    } finally {
      // Finaliza o estado de carregamento
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
                placeholderTextColor="#8d9096ff"
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
                placeholderTextColor="#8d9096ff"
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
    backgroundColor: 'transparent',
  },
  containerKeyboardVisible: {
    justifyContent: 'flex-start',
    paddingTop: 50,
  },
  logo: {
    width: 250,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 0,
    marginTop: -20,
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
    fontSize: 16,
    color: '#333',
  },
  registerLinkText: {
    color: '#2563EB',
    fontWeight: 'bold',
  },
});
