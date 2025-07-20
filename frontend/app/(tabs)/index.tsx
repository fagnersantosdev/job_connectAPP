import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image, ActivityIndicator } from 'react-native';

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulação de carregamento (ex: checar autenticação)
    setTimeout(() => {
      setLoading(false);
    }, 3000);
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Image 
          source={require('../../assets/images/jobconnect_logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <ActivityIndicator size="large" color="#ffffff" style={styles.loading} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={estilos.container}>
        {/* Mensagem de boas-vindas */}
        <Text style={estilos.textoBoasVindas}>Bem vindo</Text>

        {/* Botões de seleção */}
        <TouchableOpacity style={estilos.botao}>
          <Text style={estilos.textoBotao}>Sou Cliente</Text>
        </TouchableOpacity>

        <TouchableOpacity style={estilos.botao}>
          <Text style={estilos.textoBotao}>Sou Prestador</Text>
        </TouchableOpacity>

        {/* Link para login */}
        <View style={estilos.containerLogin}>
          <Text style={estilos.textoLogin}>Já tem uma conta? </Text>
          <TouchableOpacity>
            <Text style={estilos.linkLogin}>Faça Login</Text>
          </TouchableOpacity>
        </View>

        {/* Botão principal */}
        <TouchableOpacity style={estilos.botaoComecar}>
          <Text style={estilos.textoBotaoComecar}>Começar</Text>
        </TouchableOpacity>

        {/* Rodapé */}
        <Text style={estilos.textoRodape}>JobConnect conectando serviços, facilitando a sua vida!</Text>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#65AFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
  loading: {
    marginTop: 30,
  },
});

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center',
    width: '100%',
  },
  textoBoasVindas: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 50,
    color: '#333',
  },
  botao: {
    backgroundColor: '#f0f0f0',
    padding: 18,
    borderRadius: 10,
    marginVertical: 12,
    alignItems: 'center',
  },
  textoBotao: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  containerLogin: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  textoLogin: {
    fontSize: 16,
    color: '#666',
  },
  linkLogin: {
    fontSize: 16,
    color: '#0066cc',
    fontWeight: 'bold',
  },
  botaoComecar: {
    backgroundColor: '#0066cc',
    padding: 18,
    borderRadius: 10,
    marginVertical: 20,
    alignItems: 'center',
  },
  textoBotaoComecar: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  textoRodape: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    marginTop: 30,
  },
});