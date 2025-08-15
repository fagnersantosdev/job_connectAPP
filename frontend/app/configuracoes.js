import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ConfiguracoesUsuario() {
  const router = useRouter();

  // Estados dos switches
  const [notificacoes, setNotificacoes] = useState(true);
  const [modoEscuro, setModoEscuro] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Sair da Conta',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: () => router.push('/login') }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Configurações</Text>

      {/* Conta */}
      <Text style={styles.sectionTitle}>Conta</Text>
      <TouchableOpacity style={styles.option} onPress={() => router.push('/editar_perfil')}>
        <Ionicons name="person-outline" size={22} color="#333" />
        <Text style={styles.optionText}>Editar Perfil</Text>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.option} onPress={() => router.push('/alterar_senha')}>
        <Ionicons name="lock-closed-outline" size={22} color="#333" />
        <Text style={styles.optionText}>Alterar Senha</Text>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </TouchableOpacity>

      {/* Preferências */}
      <Text style={styles.sectionTitle}>Preferências</Text>
      <View style={styles.option}>
        <Ionicons name="notifications-outline" size={22} color="#333" />
        <Text style={styles.optionText}>Notificações</Text>
        <Switch
          value={notificacoes}
          onValueChange={setNotificacoes}
          trackColor={{ false: '#ccc', true: '#4ade80' }}
        />
      </View>

      <View style={styles.option}>
        <Ionicons name="moon-outline" size={22} color="#333" />
        <Text style={styles.optionText}>Modo Escuro</Text>
        <Switch
          value={modoEscuro}
          onValueChange={setModoEscuro}
          trackColor={{ false: '#ccc', true: '#4ade80' }}
        />
      </View>

      {/* Segurança */}
      <Text style={styles.sectionTitle}>Segurança</Text>
      <TouchableOpacity style={[styles.option, { backgroundColor: '#DC2626' }]} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color="#FFF" />
        <Text style={[styles.optionText, { color: '#FFF' }]}>Sair da Conta</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#06437e',
    marginTop: 15
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6B7280',
    marginTop: 20,
    marginBottom: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 15,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 8,
    elevation: 1,
  },
  optionText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
});
