import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';

// Importa o logo localmente
const logo = require('../assets/images/logo-Jobconnect.png');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      {/* Logo  */}
      <View style={styles.logoContainer}>
        <Image source={logo} style={styles.logoImage} />
    
      </View>

      {/* Formulário */}
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Digite seu e-mail"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="**********"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity>
          <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton}>
          <Text style={styles.loginButtonText}>Entrar</Text>
        </TouchableOpacity>

        <Text style={styles.orText}>ou</Text>

        <TouchableOpacity>
          <Text style={styles.registerText}>Cadastre-se</Text>
        </TouchableOpacity>

        <Text style={styles.termsText}>
          Ao continuar você concorda com os nossos{'\n'}
          Termos de Serviço e Política de Privacidade
        </Text>
      </View>

      <Text style={styles.footerText}>
        "JobConnect – Conectando serviços,{'\n'}facilitando sua vida!"
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    paddingVertical: 40,
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
    marginTop: 20
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  formContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    elevation: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
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
  },
  registerText: {
    color: '#2563EB',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  termsText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#64748B',
  },
  footerText: {
    textAlign: 'center',
    color: '#64748B',
    fontSize: 12,
  },
});
