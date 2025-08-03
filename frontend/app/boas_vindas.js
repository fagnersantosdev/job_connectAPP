import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';


export default function TelaInicial() {
  const router = useRouter();

  const handleComecar = () => {
    router.push('/home');  // Navega para a rota /home
  };


  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={require('../assets/images/logo-Jobconnect.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Ilustração principal */}
      <Image
        source={require('../assets/images/image-removebg-2.png')}
        style={styles.ilustracao}
        resizeMode="contain"
      />

      {/* Título */}
      <Text style={styles.titulo}>
        Conectando você ao  profissional ideal
      </Text>

      {/* Descrição */}
      <Text style={[styles.descricao,{fontWeight:"bold"}]}>
        Encontre prestadores de serviço de forma rápida, prática e segura 
        direto pelo seu celular
      </Text>

      {/* Botão Começar */}
      <TouchableOpacity style={styles.botao} onPress={handleComecar}>
        <Text style={styles.textoBotao}>Começar</Text>
      </TouchableOpacity>

      {/* Footer */}
      <Text style={styles.footer}>
        “JobConnect” – Conectando serviços,{'\n'} facilitando sua vida!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  alignItems: 'center',      // Centraliza na horizontal
  justifyContent: 'center',  // Centraliza na vertical
  paddingHorizontal: 20,     // Mantém só um respiro lateral
  backgroundColor: 'transparent', // Fundo vem do _layout.js
  },
  logo: {
    width: 300,
    height: 200,
    alignSelf: 'center',
    resizeMode: 'contain',
    marginTop: 0,
    marginBottom: -60,
  },
  ilustracao: {
    width: '80%',
    height: 220,
    marginVertical: 30,
    marginBottom: 10,
    
  },
  titulo: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#0D47A1',
    textAlign: 'center',
    marginBottom: 30,
     lineHeight: 35,
    paddingHorizontal: 30

  },
  descricao: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 30,
    color: '#fff',
      lineHeight: 25,
  },
  botao: {
    backgroundColor: '#FFD233',
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  textoBotao: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    fontSize: 13,
    color: '#fff',
    textAlign: 'center',
    marginTop: 10,
     marginBottom: 30,
  },
});
