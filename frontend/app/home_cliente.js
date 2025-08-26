import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  FlatList,
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AuthContext } from '../app/AuthContext'; // 1. Importar o AuthContext
import { IP_DO_SERVIDOR } from '../app/api_config'; // Importar a URL da API

const logo = require('../assets/images/hubServicos.png');

const SCREEN_WIDTH = Dimensions.get('window').width;

const CategoryItem = ({ item }) => (
  <View style={styles.categoryItem}>
    <View style={styles.categoryIconContainer}>
      <Ionicons name={item.icon} size={30} color="#06437e" />
    </View>
    <Text style={styles.categoryText}>{item.name}</Text>
  </View>
);

const ProfessionalCard = ({ professional }) => (
  <View style={styles.professionalCard}>
    <Image source={{ uri: professional.image || 'https://placehold.co/100x100/png?text=User' }} style={styles.professionalImage} />
    <View style={styles.professionalInfo}>
      <Text style={styles.professionalName}>{professional.name}</Text>
      <View style={styles.ratingContainer}>
        <Ionicons name="star" size={16} color="#FFD233" />
        <Text style={styles.ratingText}>{professional.rating || 'N/A'}</Text>
      </View>
      <Text style={styles.professionalJob}>{professional.job}</Text>
      <Text style={styles.professionalDistance}>{professional.distance} de distância</Text>
    </View>
  </View>
);

export default function HomeCliente() {
  const { user, logout } = useContext(AuthContext); // 2. Obter dados e funções do contexto
  const [searchQuery, setSearchQuery] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [categories, setCategories] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const slideAnim = useRef(new Animated.Value(-SCREEN_WIDTH * 0.6)).current;
  const router = useRouter();

  useEffect(() => {
    // Busca os dados da API quando o componente é montado
    const fetchData = async () => {
        try {
            // Busca categorias de serviços
            const catResponse = await fetch(`${IP_DO_SERVIDOR}/categorias`);
            const catData = await catResponse.json();
            setCategories([...catData, { id: 'mais', name: 'Mais Serviços...', icon: 'ellipsis-horizontal-circle-outline' }]);

            // Busca profissionais em destaque
            const profResponse = await fetch(`${IP_DO_SERVIDOR}/prestadores?destaque=true`); // Exemplo de endpoint
            const profData = await profResponse.json();
            setProfessionals(profData);
        } catch (error) {
            console.error("Erro ao buscar dados da API:", error);
        } finally {
            setLoading(false);
        }
    };

    fetchData();
  }, []);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: menuVisible ? 0 : -SCREEN_WIDTH * 0.6,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [menuVisible, slideAnim]); // CORREÇÃO: Adicionada a dependência 'slideAnim'

  const handleLogout = () => {
    logout(); // Limpa os dados do usuário do contexto
    router.replace('/'); // Redireciona para a tela inicial (use 'replace' para não poder voltar)
  };

  // Mostra um indicador de carregamento enquanto os dados do usuário não estão disponíveis
  if (!user) {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#A4CAED' }}>
            <ActivityIndicator size="large" color="#06437e" />
        </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Menu Lateral */}
      <Animated.View style={[styles.menuContainer, { transform: [{ translateX: slideAnim }] }]}>
        <Text style={styles.menuTitle}>Menu</Text>
        <TouchableOpacity onPress={() => { router.push('/profile'); setMenuVisible(false); }}>
          <Text style={styles.menuItem}>Perfil</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { router.push('/configuracoes'); setMenuVisible(false); }}>
          <Text style={styles.menuItem}>Configurações</Text>
        </TouchableOpacity>
        {/* 3. Botão de Sair agora funciona */}
        <TouchableOpacity onPress={handleLogout}>
          <Text style={[styles.menuItem, { color: 'red' }]}>Sair</Text>
        </TouchableOpacity>
      </Animated.View>

      {menuVisible && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        />
      )}

      {/* Cabeçalho */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={() => setMenuVisible(true)}>
          <Ionicons name="menu-outline" size={32} color="#06437e" />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
        </View>
        <TouchableOpacity style={styles.profileIconContainer} onPress={() => router.push('/profile')}>
            {/* Exibe a imagem do usuário se disponível */}
            {user.imagem ? (
                <Image source={{ uri: user.imagem }} style={styles.headerProfileImage} />
            ) : (
                <Ionicons name="person-circle-outline" size={40} color="#06437e" />
            )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 4. Mensagem de boas-vindas dinâmica */}
        <Text style={styles.welcomeText}>Olá, {user.nome}!</Text>
        
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={24} color="#555" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="O que você precisa hoje?"
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {loading ? <ActivityIndicator color="#06437e" /> : (
            <>
                <Text style={styles.sectionTitle}>Serviços</Text>
                <FlatList
                  data={categories}
                  renderItem={({ item }) => <CategoryItem item={item} />}
                  keyExtractor={item => item.id.toString()}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.categoriesList}
                />

                <View style={styles.featuredProfessionalsContainer}>
                  <Text style={styles.sectionTitle}>Profissionais em destaque</Text>
                  <TouchableOpacity onPress={() => router.push('/services')}>
                    <Text style={styles.seeAllText}>Mais Serviços...</Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={professionals}
                  renderItem={({ item }) => <ProfessionalCard professional={item} />}
                  keyExtractor={item => item.id.toString()}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.professionalsList}
                />
            </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Layout principal
  container: { flex: 1, backgroundColor: 'transparent', paddingTop: 50 },
  scrollView: { paddingHorizontal: 20 },
  welcomeText: { fontSize: 22, fontWeight: '600', color: '#06437e', marginBottom: 15 },

  // Cabeçalho
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, marginBottom: 10 },
  menuButton: { padding: 5, justifyContent: 'center', alignItems: 'center' },
  logoContainer: { flex: 1, alignItems: 'center' },
  logo: { width: 120, height: 60 },
  profileIconContainer: { marginLeft: 'auto' },
  headerProfileImage: { width: 40, height: 40, borderRadius: 20 },

  // Barra de pesquisa
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    elevation: 2,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 50, fontSize: 16, color: '#333' },

  // Seções
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#06437e', marginBottom: 10 },

  // Lista de categorias
  categoriesList: { marginBottom: 20 },
  categoryItem: { alignItems: 'center', marginRight: 20 },
  categoryIconContainer: {
    backgroundColor: '#fff',
    borderRadius: 35,
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  categoryText: { marginTop: 5, fontSize: 12, color: '#333' },

  // Profissionais em destaque
  featuredProfessionalsContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  seeAllText: { color: '#06437e', fontWeight: 'bold', fontSize: 14 },
  professionalsList: { paddingBottom: 20 },

  // Cards de profissionais
  professionalCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginRight: 15,
    alignItems: 'center',
    elevation: 2,
    width: 250,
  },
  professionalImage: { width: 80, height: 80, borderRadius: 40, marginRight: 15 },
  professionalInfo: { flex: 1, justifyContent: 'center' },
  professionalName: { fontSize: 16, fontWeight: 'bold', color: '#06437e' },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 5 },
  ratingText: { marginLeft: 5, fontSize: 14, color: '#333' },
  professionalJob: { fontSize: 14, color: '#555' },
  professionalDistance: { fontSize: 12, color: '#888', marginTop: 5 },

  // Overlay do menu
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 10 },

  // Menu lateral
  menuContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: SCREEN_WIDTH * 0.6,
    backgroundColor: '#fff',
    padding: 20,
    elevation: 5,
    zIndex: 20,
  },
  menuTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 , marginTop: 20 },
  menuItem: { fontSize: 16, marginBottom: 15 },
});
