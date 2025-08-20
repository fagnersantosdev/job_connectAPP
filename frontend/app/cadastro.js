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
  const [cpfCnpj, setCpfCnpj] = useState('');
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

  const [senhaError, setSenhaError] = useState('');
  const [confirmarSenhaError, setConfirmarSenhaError] = useState('');

  const router = useRouter();
  // Obtém os parâmetros da rota
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

  /**
   * Função para aplicar a máscara de CPF ou CNPJ.
   * @param {string} value - O valor digitado no campo.
   * @returns {void}
   */
  const handleCpfCnpjChange = (value) => {
    const cleanedValue = value.replace(/\D/g, '');
    let formattedValue = '';
    if (cleanedValue.length <= 11) {
      formattedValue = cleanedValue
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
    } else {
      formattedValue = cleanedValue
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
    }
    setCpfCnpj(formattedValue);
  };

  /**
   * Função para aplicar a máscara do CEP.
   * @param {string} value - O valor digitado no campo.
   * @returns {void}
   */
  const handleCepChange = (value) => {
    const cleanedValue = value.replace(/\D/g, '');
    let formattedValue = cleanedValue
      .replace(/^(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{3})\d+?$/, '$1');
    setCep(formattedValue);
  };

  /**
   * Função para aplicar a máscara do telefone.
   * @param {string} value - O valor digitado no campo.
   * @returns {void}
   */
  const handleTelefoneChange = (value) => {
    const cleanedValue = value.replace(/\D/g, '');
    let formattedValue = '';

    if (cleanedValue.length > 2) {
      formattedValue += `(${cleanedValue.substring(0, 2)}`;
      if (cleanedValue.length > 2) {
        formattedValue += `) ${cleanedValue.substring(2, 6)}`;
      }
      if (cleanedValue.length > 6) {
        formattedValue += `-${cleanedValue.substring(6, 10)}`;
      }
      if (cleanedValue.length > 10) {
        formattedValue = `(${cleanedValue.substring(0, 2)}) ${cleanedValue.substring(2, 7)}-${cleanedValue.substring(7, 11)}`;
      }
    } else {
      formattedValue = cleanedValue;
    }
    
    setTelefone(formattedValue);
  };

  /**
   * Função para validar a senha em tempo real.
   * @param {string} value - O valor da senha digitada.
   * @returns {void}
   */
  const handleSenhaChange = (value) => {
    setSenha(value);
    if (value.length > 0 && value.length < 8) {
      setSenhaError('A senha deve ter pelo menos 8 caracteres.');
    } else {
      setSenhaError('');
    }
  };

  /**
   * Função para validar a confirmação da senha.
   * @param {string} value - O valor da confirmação da senha.
   * @returns {void}
   */
  const handleConfirmarSenhaChange = (value) => {
    setConfirmarSenha(value);
    if (value.length > 0 && value !== senha) {
      setConfirmarSenhaError('As senhas não coincidem.');
    } else {
      setConfirmarSenhaError('');
    }
  };

  /**
   * Função para lidar com o cadastro.
   * Agora com logs para depuração e melhor tratamento de erros.
   */
  const handleCadastro = async () => {
    const cleanedCpf = cpfCnpj.replace(/\D/g, '');
    const cleanedCep = cep.replace(/\D/g, '');
    const cleanedTelefone = telefone.replace(/\D/g, '');

    if (!nome || !cleanedCpf || !email || !cleanedTelefone || !senha || !confirmarSenha || !cleanedCep) {
      showAlert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    if (cleanedCpf.length !== 11 && cleanedCpf.length !== 14) {
      showAlert('Erro', 'O CPF/CNPJ deve conter 11 (CPF) ou 14 (CNPJ) dígitos.');
      return;
    }

    if (senha.length < 8) {
        showAlert('Erro', 'A senha deve ter pelo menos 8 caracteres.');
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
      
      console.log('--- Iniciando requisição de cadastro ---');
      console.log('Payload:', {
        nome,
        cpf_cnpj: cleanedCpf,
        email,
        telefone: cleanedTelefone,
        role,
        cep: cleanedCep,
      });
      console.log('Role recebido via useLocalSearchParams:', role);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome,
          cpf_cnpj: cleanedCpf,
          email,
          telefone: cleanedTelefone,
          senha,
          role,
          cep: cleanedCep,
        }),
      });

      console.log('Status da resposta:', response.status);
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.indexOf('application/json') !== -1) {
        const data = await response.json();
        
        if (response.ok) {
          console.log('Cadastro bem-sucedido. Role:', role);
          if (role === 'prestador') {
            // Alterado para 'replace' para substituir a tela no histórico de navegação
            router.replace('/cadastro_parte2');
          } else {
            router.replace({ pathname: '/cadastro_sucesso', params: { role } });
          }
        } else {
          console.log('Erro no servidor:', data.message);
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
            placeholder="CPF ou CNPJ"
            value={cpfCnpj}
            onChangeText={handleCpfCnpjChange}
            style={styles.input}
            keyboardType="numeric"
            maxLength={18}
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
            onChangeText={handleTelefoneChange}
            style={styles.input}
            keyboardType="phone-pad"
            maxLength={15}
          />
          <TextInput
            placeholder="CEP"
            value={cep}
            onChangeText={handleCepChange}
            style={styles.input}
            keyboardType="numeric"
            maxLength={9}
          />

          <View style={styles.inputSenhaContainer}>
            <TextInput
              placeholder="Senha"
              value={senha}
              onChangeText={handleSenhaChange}
              secureTextEntry={!showSenha}
              style={styles.inputSenha}
            />
            <TouchableOpacity onPress={() => setShowSenha(!showSenha)}>
              <Ionicons name={showSenha ? 'eye-off' : 'eye'} size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          {senhaError ? <Text style={styles.errorText}>{senhaError}</Text> : null}

          <View style={styles.inputSenhaContainer}>
            <TextInput
              placeholder="Confirmar senha"
              value={confirmarSenha}
              onChangeText={handleConfirmarSenhaChange}
              secureTextEntry={!showConfirmarSenha}
              style={styles.inputSenha}
            />
            <TouchableOpacity onPress={() => setShowConfirmarSenha(!showConfirmarSenha)}>
              <Ionicons name={showConfirmarSenha ? 'eye-off' : 'eye'} size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          {confirmarSenhaError ? <Text style={styles.errorText}>{confirmarSenhaError}</Text> : null}

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
    flexGrow: 1,
    justifyContent: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    resizeMode: 'contain',
    marginTop: -40,
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
    marginBottom: 10,
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
  errorText: {
    color: 'red',
    fontSize: 12,
    textAlign: 'left',
    width: '100%',
    marginTop: -5,
    marginBottom: 5,
    marginLeft: 15,
  },
});
