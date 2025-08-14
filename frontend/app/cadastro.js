import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Image, ScrollView, KeyboardAvoidingView,
  Platform, Keyboard, Modal, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { IP_DO_SERVIDOR } from '../app/api_config';

// Imagem do logo
const logo = require('../assets/images/logo-Jobconnect.png');

export default function CadastroScreen() {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [cep, setCep] = useState('');
  
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { role } = useLocalSearchParams();

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const showAlert = (title, message) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const handleCadastro = async () => {
    // Validação de campos obrigatórios
    if (!nome || !cpf || !email || !telefone || !senha || !confirmarSenha || !cep) {
      showAlert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    // Validação de CPF/CNPJ
    const cleanedCpf = cpf.replace(/\D/g, ''); // Remove todos os caracteres não numéricos
    // 🔹 Nova validação para aceitar 11 (CPF) ou 14 (CNPJ) dígitos
    if (cleanedCpf.length !== 11 && cleanedCpf.length !== 14) {
      showAlert('Erro', 'O CPF/CNPJ deve conter 11 (CPF) ou 14 (CNPJ) dígitos.');
      return;
    }

    if (senha !== confirmarSenha) {
      showAlert('Erro', 'As senhas não coincidem.');
      return;
    }

    setIsLoading(true);

    try {
      const serverIp = IP_DO_SERVIDOR || (Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000');
      const apiUrl = `${serverIp}/api/register`;

      console.log('Tentando conectar ao endpoint:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome,
          cpf,
          email,
          telefone,
          senha,
          role,
          cep,
        }),
      });

      console.log('Status da resposta:', response.status);

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.indexOf('application/json') !== -1) {
        const data = await response.json();
        
        if (response.ok) {
          console.log('Cadastro bem-sucedido!', data);
          if (role === 'prestador') {
            // Ação para prestador
            showAlert('Sucesso', 'Seu cadastro foi realizado com sucesso! Prossiga para a próxima etapa.');
            router.push('/cadastro_parte2');
          } else {
            // Ação para cliente
            showAlert('Sucesso', 'Seu cadastro foi realizado com sucesso!');
            router.push('/home');
          }
        } else {
          showAlert('Erro', data.message || 'Ocorreu um erro no cadastro. Tente novamente.');
        }
      } else {
        const textResponse = await response.text();
        console.error('A resposta do servidor não é JSON. Resposta completa:', textResponse);
        showAlert(
          'Erro do Servidor',
          'Ocorreu um erro inesperado no servidor. A resposta não foi em JSON.'
        );
      }
    } catch (error) {
      console.error('Erro ao conectar com o servidor:', error);
      showAlert(
        'Erro de Conexão',
        'Não foi possível conectar ao servidor. Por favor, verifique se o backend está em execução.'
      );
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
        showsVerticalScrollIndicator={keyboardVisible}
        scrollEnabled={keyboardVisible}
        keyboardShouldPersistTaps="handled"
      >
        <Image source={logo} style={styles.logo} />

        <View style={styles.card}>
          <Text style={styles.title}>Cadastro</Text>
          {role === 'prestador' && <Text style={styles.subtitulo}>Dados Pessoais</Text>}

          <TextInput
            placeholder="Nome completo"
            value={nome}
            onChangeText={setNome}
            style={styles.input}
          />
          <TextInput
            // 🔹 Placeholder atualizado para CNPJ
            placeholder="CPF ou CNPJ (apenas números)"
            value={cpf}
            onChangeText={setCpf}
            style={styles.input}
            keyboardType="numeric"
            // 🔹 Removido o maxLength para permitir CNPJ
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
          <TextInput
            placeholder="CEP (apenas números)"
            value={cep}
            onChangeText={setCep}
            style={styles.input}
            keyboardType="numeric"
            maxLength={8}
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

          <TouchableOpacity style={styles.botao} onPress={handleCadastro} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator size="small" color="black" />
            ) : (
              <Text style={styles.textoBotao}>
                {role === 'prestador' ? 'Continuar' : 'Cadastrar'}
              </Text>
            )}
          </TouchableOpacity>

          <Text style={styles.loginText}>
            Já tem uma conta?{' '}
            <Text
              style={styles.loginLink}
              onPress={() => router.replace('/login_cadastro')}
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
          JobConnect – Conectando serviços, {'\n'}facilitando sua vida!
        </Text>
      </ScrollView>

        <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <Text style={styles.modalText}>{modalMessage}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(!modalVisible)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    marginTop: -30,
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
  subtitulo: {
    textAlign: 'center',
    fontSize: 16,
    color: '#1D4ED8',
    marginBottom: 10,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: 20,
    padding: 12,
    marginBottom: 10,
  },
  inputSenhaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  inputSenha: {
    flex: 1,
    paddingVertical: 12,
  },
  botao: {
    backgroundColor: '#FFD233',
    padding: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  textoBotao: {
    fontWeight: 'bold',
    color: 'black',
    fontSize: 18,
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
  // Estilos para o modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: 300,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#FACC15',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    width: '50%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
