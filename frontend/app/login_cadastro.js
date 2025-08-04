import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Image, KeyboardAvoidingView, ScrollView, Platform, Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const logo = require('../assets/images/logo-Jobconnect.png');

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false); // <- NOVO

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

            {/* Esqueceu a senha */}
            <TouchableOpacity>
              <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
            </TouchableOpacity>

            {/* Botão Entrar */}
            <TouchableOpacity style={styles.loginButton}>
              <Text style={styles.loginButtonText}>Entrar</Text>
            </TouchableOpacity>

            <Text style={styles.orText}>ou</Text>

            {/* Cadastre-se */}
            <TouchableOpacity onPress={trocarDetela}>
              <Text style={styles.registerText}>Cadastre-se</Text>
            </TouchableOpacity>

            {/* Termos */}
            <Text style={styles.termsText}>
              Ao continuar você concorda com os nossos{'\n'}
              Termos de Serviço e Política de Privacidade
            </Text>
          </View>

          {/* Rodapé */}
          <Text style={styles.footerText}>
            JobConnect – Conectando serviços,{'\n'}facilitando sua vida!
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoiding: {
    flex: 1,
    backgroundColor: 'transparent', // pode ajustar conforme o fundo desejado
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  container: {
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoImage: {
    width: 300,
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
    flexDirection: 'row', // lado a lado para senha, e pra e-mail funciona igual
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
    backgroundColor: '#FACC15',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  loginButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
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
  termsText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#64748B',
  },
  footerText: {
    textAlign: 'center',
    color: '#f5f5f5ff',
    fontSize: 13,
    marginBottom: 40,
    marginTop: 40,
  },
});
