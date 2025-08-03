import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';







// Componente para exibir um profissional
function ProfissionalCard({ profissional }) {
  return (
    <View style={styles.card}>
      {/* Se quiser incluir avatar futuramente, só descomentar
      <Image source={{ uri: profissional.avatarUrl }} style={styles.avatar} /> 
      */}
      <View style={styles.cardContent}>
        <Text style={styles.nome}>{profissional.nome}</Text>
        <Text style={styles.profissao}>{profissional.profissao}</Text>
        <Text style={styles.info}>
          ⭐ {profissional.nota ?? 5.0} • {profissional.distancia ?? 'Perto de você'}
        </Text>
      </View>
    </View>
  );
}

export default function HomeScreen({ user }) {
  const [profissionais, setProfissionais] = useState([]);

  useEffect(() => {
    async function carregarProfissionais() {
      try {
        const usersRaw = await AsyncStorage.getItem('users');
        const users = usersRaw ? JSON.parse(usersRaw) : [];

        // Filtra usuários que possuem profissão
        const destaque = users.filter(u => u.profissao);

        setProfissionais(destaque);
      } catch (error) {
        console.error('Erro ao carregar profissionais:', error);
        setProfissionais([]);
      }
    }

    carregarProfissionais();
  }, []);

  return (
    <View style={styles.container}>
      <Header />
      <Text style={styles.sectionTitle}>Profissionais em destaque</Text>

      {profissionais.length > 0 ? (
        <FlatList
          data={profissionais}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => <ProfissionalCard profissional={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <Text style={styles.emptyText}>Nenhum profissional em destaque no momento.</Text>
      )}
    </View>
  );
}

// Componente Header para organização
function Header() {
  return (
    <View style={styles.header}>
      <Image source={require('../assets/images/logo_sozinha.png')} style={styles.logo} />
      <Ionicons
  name="person-circle-outline"
  size={40}
  color="#1D4ED8"
  style={{ marginLeft: 20, marginTop: 10 }}
/>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  logo: {
    width: 140,
    height: 50,
    resizeMode: 'contain',
     marginLeft: -40,
     marginTop: 10
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },

  listContent: {
    paddingBottom: 20,
  },

  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 10,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
  },
  cardContent: {
    flex: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    
  },
  nome: {
    fontSize: 16,
    fontWeight: '600',
  },
  profissao: {
    fontSize: 14,
    color: '#6B7280',
  },
  info: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },

  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#6B7280',
  },
});
