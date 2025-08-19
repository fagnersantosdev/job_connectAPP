import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Image, KeyboardAvoidingView, ScrollView, Platform, Keyboard,
  ActivityIndicator, Alert, PanResponder
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// 1. Importar o hook 'useLocalSearchParams' para ler os parâmetros da rota
import { useRouter, useLocalSearchParams } from 'expo-router';
import { IP_DO_SERVIDOR } from '../app/api_config';

const logo = require('../assets/images/logo-Jobconnect.png');

export default function LoginScreen() {
  const router = useRouter();
  // 2. Receber o parâmetro 'role' enviado pela tela anterior
  const { role } = useLocalSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // PanResponder para detectar arrastar para esquerda
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 20; // Só ativa se houver movimento horizontal
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -50) { 
          // arrastou para esquerda mais de 50px
          router.push('/home_cliente');
        }
      },
    })
  ).current;

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // 3. Modificar a função para passar o 'role' adiante
  const trocarDetela = () => {
    router.push({
        pathname: '/cadastro',
        params: { role: role } // Passa o 'role' para a tela de cadastro
    });
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro no Login', 'Por favor, preencha todos os campos.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${IP_DO_SERVIDOR}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        // AQUI: Você pode querer adicionar uma lógica para redirecionar
        // o usuário logado com base no 'role' dele também.
        // Por enquanto, mantém o redirecionamento padrão.
        router.push('/home_cliente');
      } else {
        const errorData = await response.json();
        Alert.alert('Erro no Login', errorData.message || 'E-mail ou senha incorretos.');
      }
    } catch (e) {
      Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor.');
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
        {...panResponder.panHandlers} // Adiciona o detector de gesto
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.container, keyboardVisible && styles.containerKeyboardVisible]}>
          <Image source={logo} style={styles.logo} />
          <Text style={styles.title}>Bem-vindo de volta</Text>
          <Text style={styles.subtitle}>Faça login para continuar</Text>

          <View style={styles.formContainer}>
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

            <TouchableOpacity onPress={() => {}}>
              <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.loginButtonText}>Entrar</Text>
              )}
            </TouchableOpacity>

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
  // Estrutura geral
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
  },
  containerKeyboardVisible: {
    justifyContent: 'flex-start',
    paddingTop: 50,
  },

  // Logo e textos
  logo: {
    width: 250,
    height: 100,
    resizeMode: 'contain',
    marginTop: -20,
    marginBottom: 0,
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

  // Formulário
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
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
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

  // Botões e links
  forgotPasswordText: {
    fontSize: 14,
    color: '#2563EB',
    textAlign: 'right',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#FACC15',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
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
    fontWeight: 'bold',
    color: '#2563EB',
  },
});
