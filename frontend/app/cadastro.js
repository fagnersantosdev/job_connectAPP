import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Image, Alert, ScrollView, KeyboardAvoidingView,
  Platform, Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function CadastroScreen() {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Função para trocar de tela
  const trocarDetela = () => {
    router.push('/cadastro_parte2');
  };

  const handleCadastro = () => {
    if (senha !== confirmarSenha) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    console.log({ nome, cpf, email, telefone });
    Alert.alert('Sucesso', 'Cadastro realizado com sucesso!');

    // Chama a função para trocar de tela
    trocarDetela();
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoiding}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={keyboardVisible}
        scrollEnabled={keyboardVisible}
        keyboardShouldPersistTaps="handled"
      >
        <Image source={require('../assets/images/logo-Jobconnect.png')} style={styles.logo} />

        <View style={styles.card}>
          <Text style={styles.title}>Cadastro</Text>

          <TextInput
            placeholder="Nome completo"
            value={nome}
            onChangeText={setNome}
            style={styles.input}
          />
          <TextInput
            placeholder="CPF"
            value={cpf}
            onChangeText={setCpf}
            style={styles.input}
            keyboardType="numeric"
          />
          <TextInput
            placeholder="E-mail"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
          />
          <TextInput
            placeholder="Telefone"
            value={telefone}
            onChangeText={setTelefone}
            style={styles.input}
            keyboardType="phone-pad"
          />

          <View style={styles.inputSenhaContainer}>
            <TextInput
              placeholder="Senha"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry={!showSenha}
              style={styles.inputSenha}
            />
            <TouchableOpacity onPress={() => setShowSenha(!showSenha)}>
              <Ionicons name={showSenha ? 'eye-off' : 'eye'} size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputSenhaContainer}>
            <TextInput
              placeholder="Confirmar senha"
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              secureTextEntry={!showConfirmarSenha}
              style={styles.inputSenha}
            />
            <TouchableOpacity onPress={() => setShowConfirmarSenha(!showConfirmarSenha)}>
              <Ionicons name={showConfirmarSenha ? 'eye-off' : 'eye'} size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.botao} onPress={handleCadastro}>
            <Text style={styles.textoBotao}>Cadastrar</Text>
          </TouchableOpacity>

            <Text style={styles.loginText}>
        Já tem uma conta?{' '}
        <Text
          style={styles.loginLink}
          onPress={() => router.replace('/login_cadastro')} // 🔹 vai direto para o login
        >
          Faça Login
        </Text>
      </Text>

          <Text style={styles.politica}>
            Ao continuar, você concorda com nossos{' '}
            <Text style={styles.link}>Termos de Serviço</Text> e{' '}
            <Text style={styles.link}>Política de Privacidade</Text>
          </Text>
        </View>

        <Text style={styles.rodape}>
          "JobConnect – Conectando serviços, {'\n'}facilitando sua vida!"
        </Text>
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
    padding: 20,
    paddingTop: 40,
    justifyContent: 'center',
  },
  logo: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    resizeMode: 'contain',
    marginTop: -50,
    marginBottom: -30,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    fontSize: 24,
    color: '#1D4ED8',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  inputSenhaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  inputSenha: {
    flex: 1,
    paddingVertical: 12,
  },
  botao: {
    backgroundColor: '#FACC15',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  textoBotao: {
    fontWeight: 'bold',
    color: 'black',
    fontSize: 16,
  },
  loginText: {
    textAlign: 'center',
    marginTop: 15,
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
  link: {
    color: '#2563EB',
  },
  rodape: {
    textAlign: 'center',
    fontSize: 13,
    color: '#f8f8f8ff',
    marginTop: 25,
  },
});
