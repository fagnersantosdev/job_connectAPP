
import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthContext } from '../context/AuthContext';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, logout } = useContext(AuthContext);

  // Rotas organizadas por categoria
  const rotasAutenticacao = [
    { nome: 'Login/Cadastro', path: '/login_cadastro' },
    { nome: 'Cadastro', path: '/cadastro' },
    { nome: 'Cadastro Parte 2', path: '/cadastro_parte2' },
    { nome: 'Cadastro Sucesso', path: '/cadastro_sucesso' },
  ];

  const rotasPrincipais = [
    { nome: 'Boas-vindas', path: '/boas_vindas' },
    { nome: 'Seleção', path: '/selection' },
    { nome: 'Home Cliente', path: '/home_cliente' },
    { nome: 'Home Prestador', path: '/home_prestador' },
  ];

  const rotasSistema = [
    { nome: 'Configurações', path: '/configuracoes' },
    { nome: 'Index', path: '/index' },
  ];

  const rotasAdmin = [
    { nome: 'Serviços', path: '/servicos' },
    { nome: 'Clientes', path: '/clientes' },
    { nome: 'Prestadores', path: '/prestadores' },
    { nome: 'Solicitações', path: '/solicitacoes' },
    { nome: 'Avaliações', path: '/avaliacoes' },
    { nome: 'Mensagens', path: '/mensagens' },
    { nome: 'Planos de Assinatura', path: '/planos' },
    { nome: 'Transações', path: '/transacoes' },
  ];

  const renderizarSecao = (titulo, rotas) => (
    <View style={styles.secao}>
      <Text style={styles.tituloSecao}>{titulo}</Text>
      {rotas.map((rota, index) => (
        <View key={index} style={styles.buttonContainer}>
          <Button title={rota.nome} onPress={() => router.push(rota.path)} />
        </View>
      ))}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Painel do Admin</Text>
      <Text style={styles.subtitle}>Bem-vindo, {user?.nome || 'Administrador'}</Text>

      {renderizarSecao('Autenticação', rotasAutenticacao)}
      {renderizarSecao('Telas Principais', rotasPrincipais)}
      {renderizarSecao('Sistema', rotasSistema)}
      {renderizarSecao('Administração', rotasAdmin)}

      <View style={styles.buttonContainer}>
        <Button title="Sair" color="#FF3B30" onPress={logout} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F0F7FD',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#06437E',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
    color: '#333',
  },
  secao: {
    width: '100%',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#CCC',
    paddingBottom: 10,
  },
  tituloSecao: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#06437E',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    marginVertical: 5,
  },
});