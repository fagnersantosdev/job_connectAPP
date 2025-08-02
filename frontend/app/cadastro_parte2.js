import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Image, ScrollView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

export default function CadastroPrestador() {
  const [areaAtuacao, setAreaAtuacao] = useState('');
  const [cep, setCep] = useState('');
  const [descricao, setDescricao] = useState('');
  const [foto, setFoto] = useState(null);

  const router = useRouter(); // ✅ agora router está disponível

  const trocarDetela = () => {
    router.push('/boas_vindas'); // ✅ Navega para tela de boas-vindas
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

  const handleCadastro = () => {
    console.log({
      areaAtuacao,
      cep,
      descricao,
      foto
    });

    trocarDetela(); // ✅ chama função ao cadastrar
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.container} 
      showsVerticalScrollIndicator={false}
    >
      {/* Logo */}
      <Image 
        source={require('../assets/images/logo-Jobconnect.png')} 
        style={styles.logo} 
        resizeMode="contain"
      />

      {/* Card branco envolvendo os elementos */}
      <View style={styles.card}>
        <Text style={styles.titulo}>Cadastro</Text>
        <Text style={styles.subtitulo}>Segunda Parte</Text>

        {/* Inputs */}
        <TextInput
          style={styles.input}
          placeholder="Área de Atuação"
          value={areaAtuacao}
          onChangeText={setAreaAtuacao}
        />
        <TextInput
          style={styles.input}
          placeholder="Cep"
          value={cep}
          onChangeText={setCep}
          keyboardType="numeric"
        />
        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Descrição do Serviço"
          value={descricao}
          onChangeText={setDescricao}
          multiline
        />

        {/* Upload de Foto */}
        <TouchableOpacity style={styles.uploadButton} onPress={escolherFoto}>
          <Text style={{ color: '#555' }}>
            {foto ? 'Alterar Foto' : 'Upload de Foto'}
          </Text>
        </TouchableOpacity>

        {/* Preview da Foto */}
        {foto && (
          <Image 
            source={{ uri: foto }} 
            style={styles.previewFoto} 
            resizeMode="cover"
          />
        )}

        {/* Botão Cadastrar */}
        <TouchableOpacity style={styles.botao} onPress={handleCadastro}>
          <Text style={styles.botaoTexto}>Cadastrar</Text>
        </TouchableOpacity>

        {/* Texto de Login */}
        <Text style={styles.loginTexto}>
          Já tem uma conta? <Text style={{ color: '#007BFF' }}>Faça login</Text>
        </Text>

        {/* Termos */}
        <Text style={styles.termos}>
          Ao cadastrar, você concorda com nossos Termos de Serviço e Política de Privacidade
        </Text>
      </View>

      {/* Footer com espaço extra */}
      <Text style={styles.footer}>
        “JobConnect” – Conectando serviços,{'\n'} facilitando sua vida!
      </Text>
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
    marginTop: 0,
    marginBottom: -15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 5,
  },
  subtitulo: {
    fontSize: 14,
    color: '#555',
    marginBottom: 20,
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
    fontSize: 16,
  },
  loginTexto: {
    fontSize: 14,
    marginBottom: 10,
  },
  termos: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
    marginBottom: 10,
  },
  footer: {
    fontSize: 13,
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 50,
  },
});
