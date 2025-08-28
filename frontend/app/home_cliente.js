import React, { useState, useRef, useEffect, useContext, useMemo } from 'react';
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
import { AuthContext } from '../app/AuthContext';
import { IP_DO_SERVIDOR } from '../app/api_config';
import debounce from 'lodash.debounce'; // Importa a função debounce

const logo = require('../assets/images/logo_hubServicos.png');
const SCREEN_WIDTH = Dimensions.get('window').width;

// --- Componentes da UI ---
const CategoryItem = ({ item, onPress }) => (
  <TouchableOpacity style={styles.categoryItem} onPress={() => onPress(item.name)}>
    <View style={styles.categoryIconContainer}>
      <Ionicons name={item.icon || item.icone_url || 'build-outline'} size={30} color="#06437e" />
    </View>
    <Text style={styles.categoryText}>{item.name}</Text>
  </TouchableOpacity>
);

const ProfessionalCard = ({ professional }) => (
    <TouchableOpacity style={styles.professionalCard}>
        <Image source={{ uri: professional.foto || 'https://placehold.co/100x100/png?text=User' }} style={styles.professionalImage} />
        <View style={styles.professionalInfo}>
            <Text style={styles.professionalName}>{professional.nome}</Text>
            {professional.distancia_km && (
                <Text style={styles.professionalDistance}>
                    {parseFloat(professional.distancia_km).toFixed(1)} km de distância
                </Text>
            )}
        </View>
    </TouchableOpacity>
);

export default function HomeCliente() {
  const { user, logout } = useContext(AuthContext);
  const router = useRouter();
  
  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [sugestoes, setSugestoes] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [categories, setCategories] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const slideAnim = useRef(new Animated.Value(-SCREEN_WIDTH * 0.6)).current;

  // --- LÓGICA DE BUSCA E SUGESTÕES ---
  const fetchSugestoes = async (text) => {
    if (text.length < 2) {
      setSugestoes([]);
      return;
    }
    try {
      const response = await fetch(`${IP_DO_SERVIDOR}/servicos-oferecidos/sugestoes?q=${text}`);
      const data = await response.json();
      setSugestoes(data);
    } catch (error) {
      console.error("Erro ao buscar sugestões:", error);
    }
  };

  // CORREÇÃO: useMemo é mais apropriado para memoizar o valor da função debounced.
  const debouncedFetchSugestoes = useMemo(() => debounce(fetchSugestoes, 300), []);

  useEffect(() => {
    debouncedFetchSugestoes(searchQuery);
  }, [searchQuery, debouncedFetchSugestoes]);

  // --- LÓGICA DE DADOS INICIAIS ---
  useEffect(() => {
    if (user) {
        const fetchData = async () => {
            setLoading(true);
            try {
                const catResponse = await fetch(`${IP_DO_SERVIDOR}/categorias`);
                const catData = await catResponse.json();
                setCategories([...(Array.isArray(catData) ? catData : [catData]), { id: 'mais', name: 'Mais Serviços...', icon: 'ellipsis-horizontal-circle-outline' }]);

                const profResponse = await fetch(`${IP_DO_SERVIDOR}/prestadores/proximos?clienteId=${user.id}`);
                const profData = await profResponse.json();
                setProfessionals(Array.isArray(profData) ? profData : [profData]);
            } catch (error) {
                console.error("Erro ao buscar dados da API:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }
  }, [user]);

  // --- ANIMAÇÃO E NAVEGAÇÃO ---
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: menuVisible ? 0 : -SCREEN_WIDTH * 0.6,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [menuVisible, slideAnim]);

  const handleLogout = () => {
    logout();
    router.replace('/');
  };
  
  const handleCategoryPress = (categoryName) => {
    router.push({ pathname: '/resultados_busca', params: { categoria: categoryName } });
  };
  
  const handleSuggestionPress = (tituloServico) => {
    setSearchQuery('');
    setSugestoes([]);
    router.push({ pathname: '/resultados_busca', params: { tituloServico: tituloServico } });
  };

  if (!user) {
    return <ActivityIndicator size="large" color="#06437e" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  return (
    <View style={styles.container}>
      {/* ... (código do menu lateral sem alterações) ... */}
      <Animated.View style={[styles.menuContainer, { transform: [{ translateX: slideAnim }] }]}>
        <Text style={styles.menuTitle}>Menu</Text>
        <TouchableOpacity onPress={() => { router.push('/profile'); setMenuVisible(false); }}><Text style={styles.menuItem}>Perfil</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => { router.push('/configuracoes'); setMenuVisible(false); }}><Text style={styles.menuItem}>Configurações</Text></TouchableOpacity>
        <TouchableOpacity onPress={handleLogout}><Text style={[styles.menuItem, { color: 'red' }]}>Sair</Text></TouchableOpacity>
      </Animated.View>
      {menuVisible && (<TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setMenuVisible(false)}/>)}

      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={() => setMenuVisible(true)}><Ionicons name="menu-outline" size={32} color="#06437e" /></TouchableOpacity>
        <View style={styles.logoContainer}><Image source={logo} style={styles.logo} resizeMode="contain" /></View>
        <TouchableOpacity style={styles.profileIconContainer} onPress={() => router.push('/profile')}>
            {user.imagem ? (<Image source={{ uri: user.imagem }} style={styles.headerProfileImage} />) : (<Ionicons name="person-circle-outline" size={40} color="#06437e" />)}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.welcomeText}>Olá, {user.nome}!</Text>
        
        <View style={styles.searchContainer}>
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
          {sugestoes.length > 0 && (
            <FlatList
              data={sugestoes}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.suggestionItem} onPress={() => handleSuggestionPress(item)}>
                  <Text style={styles.suggestionText}>{item}</Text>
                </TouchableOpacity>
              )}
              style={styles.suggestionsList}
            />
          )}
        </View>

        {loading ? <ActivityIndicator color="#06437e" /> : (
            <>
                <Text style={styles.sectionTitle}>Serviços</Text>
                <FlatList
                  data={categories}
                  renderItem={({ item }) => <CategoryItem item={item} onPress={handleCategoryPress} />}
                  keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.categoriesList}
                />

                <Text style={styles.sectionTitle}>Profissionais em destaque</Text>
                <FlatList
                  data={professionals}
                  renderItem={({ item }) => <ProfessionalCard professional={item} />}
                  keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.professionalsList}
                  scrollEnabled={false}
                />
            </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent', paddingTop: 50 },
  scrollView: { paddingHorizontal: 20 },
  welcomeText: { fontSize: 22, fontWeight: '600', color: '#06437e', marginBottom: 15 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, marginBottom: 10 },
  menuButton: { padding: 5, justifyContent: 'center', alignItems: 'center' },
  logoContainer: { flex: 1, alignItems: 'center' },
  logo: { width: 120, height: 60 },
  profileIconContainer: { marginLeft: 'auto' },
  headerProfileImage: { width: 40, height: 40, borderRadius: 20 },
  searchContainer: { position: 'relative', marginBottom: 20, zIndex: 1 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 15, elevation: 2, },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 50, fontSize: 16, color: '#333' },
  suggestionsList: { position: 'absolute', top: 55, left: 0, right: 0, backgroundColor: 'white', borderRadius: 10, elevation: 3, maxHeight: 150, },
  suggestionItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee', },
  suggestionText: { fontSize: 16, },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#06437e', marginBottom: 10 },
  categoriesList: { paddingBottom: 20 },
  categoryItem: { alignItems: 'center', marginRight: 20 },
  categoryIconContainer: { backgroundColor: '#fff', borderRadius: 35, width: 70, height: 70, justifyContent: 'center', alignItems: 'center', elevation: 2, },
  categoryText: { marginTop: 5, fontSize: 12, color: '#333' },
  professionalsList: { paddingBottom: 20 },
  professionalCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 10, padding: 15, alignItems: 'center', elevation: 2, marginBottom: 15, },
  professionalImage: { width: 80, height: 80, borderRadius: 40, marginRight: 15 },
  professionalInfo: { flex: 1, justifyContent: 'center' },
  professionalName: { fontSize: 16, fontWeight: 'bold', color: '#06437e' },
  professionalDistance: { fontSize: 12, color: '#888', marginTop: 5 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 10 },
  menuContainer: { position: 'absolute', top: 0, bottom: 0, left: 0, width: SCREEN_WIDTH * 0.6, backgroundColor: '#fff', padding: 20, elevation: 5, zIndex: 20, },
  menuTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 , marginTop: 20 },
  menuItem: { fontSize: 16, marginBottom: 15 },
});
