import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Image, ScrollView, Modal
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

// Imagem do logo
const logo = require('../assets/images/logo_hubServicos.png');

export default function CadastroPrestador() {
  const [areaAtuacao, setAreaAtuacao] = useState('');
  // const [cep, setCep] = useState('');
  const [descricao, setDescricao] = useState('');
  const [foto, setFoto] = useState(null);
  // Novo estado para o modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');

  const router = useRouter();

  // Função para exibir o modal
  const showAlert = (title, message) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const escolherFoto = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setFoto(result.assets[0].uri);
    }
  };

  const handleCadastro = async () => {
    // Validação de campos
    if (!areaAtuacao || !descricao) {
        showAlert('Erro', 'Por favor, preencha todos os campos.');
        return;
    }
    
    // Validação de CEP
    // if (cep.length !== 8) {
    //   showAlert('Erro', 'O CEP deve ter 8 dígitos.');
    //   return;
    // }

    // Simulação de chamada de API para enviar dados do prestador
    try {
        console.log({ areaAtuacao, descricao, foto });
        showAlert('Sucesso', 'Cadastro do prestador concluído com sucesso!');
        setTimeout(() => {
            setModalVisible(false);
            router.push('/home_prestador'); // Redireciona para a home
        }, 2000);
    } catch (error) {
        showAlert('Erro', 'Ocorreu um erro ao finalizar o cadastro.');
        console.error(error);
    }
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.container} 
      showsVerticalScrollIndicator={false}
    >
      <Image 
        source={logo} 
        style={styles.logo} 
        resizeMode="contain"
      />
      <View style={styles.card}>
        <Text style={styles.titulo}>Cadastro</Text>
        <Text style={styles.subtitulo}>Segunda Parte</Text>
        <TextInput
          style={styles.input}
          placeholder="Área de Atuação"
          value={areaAtuacao}
          onChangeText={setAreaAtuacao}
        />
        {/* <TextInput
          style={styles.input}
          placeholder="Cep"
          value={cep}
          onChangeText={setCep}
          keyboardType="numeric"
          maxLength={8}
        /> */}
        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Descrição do Serviço"
          value={descricao}
          onChangeText={setDescricao}
          multiline
        />
        <TouchableOpacity style={styles.uploadButton} onPress={escolherFoto}>
          <Text style={{ color: '#555' }}>
            {foto ? 'Alterar Foto' : 'Upload de Foto'}
          </Text>
        </TouchableOpacity>
        {foto && (
          <Image 
            source={{ uri: foto }} 
            style={styles.previewFoto} 
            resizeMode="cover"
          />
        )}
        <TouchableOpacity style={styles.botao} onPress={handleCadastro}>
          <Text style={styles.botaoTexto}>Cadastrar</Text>
        </TouchableOpacity>
        <Text style={styles.loginLink}>
          Já tem uma conta?{' '}
          <Text
            style={{ color: '#2563EB' }}
            onPress={() => router.replace('/login_cadastro')}
          >
            Faça login
          </Text>
        </Text>
        <Text style={styles.termos}>
          Ao continuar, você concorda com nossos{' '}
            <Text style={styles.link}>Termos de Serviço</Text> e{' '}
            <Text style={styles.link}>Política de Privacidade</Text>
        </Text>
      </View>
      <Text style={styles.footer}>
        “HubServiços” – Conectando serviços,{'\n'} facilitando sua vida!
      </Text>

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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'transparent',
    paddingBottom: 50,
  },
  logo: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    resizeMode: 'contain',
    marginTop: 10,
    marginBottom: -15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#1D4ED8',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 5,
    color: '#1D4ED8',
  },
  subtitulo: {
    fontSize: 14,
    marginBottom: 20,
    color: '#1D4ED8',
  },
  input: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  uploadButton: {
    width: '90%',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  previewFoto: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginBottom: 20,
  },
  botao: {
    width: '90%',
    backgroundColor: '#FFD233',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  botaoTexto: {
    fontWeight: 'bold',
    color: '#000',
    fontSize: 17,
  },
  termos: {
    textAlign: 'center',
    fontSize: 13,
    color: '#555',
    marginTop: 15,
  },
  link: {
    color: '#2563EB',
  },
  footer: {
    fontSize: 13,
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 50,
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
});
