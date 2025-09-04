import React, { useState, useRef, useEffect, useContext, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  Animated,
  Dimensions,
  ActivityIndicator,
  Keyboard,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AuthContext } from '../app/AuthContext';
import { IP_DO_SERVIDOR } from '../app/api_config';
import debounce from 'lodash.debounce';

const logo = require('../assets/images/logo_hubServicos.png');
const SCREEN_WIDTH = Dimensions.get('window').width;

// --- FUNÇÃO AUXILIAR PARA ÍCONES ---
// Esta função mapeia o nome da categoria para o nome de um ícone específico.
const getIconForCategory = (categoryName) => {
  // CORREÇÃO: Adiciona uma verificação para evitar o erro se categoryName for undefined.
  if (typeof categoryName !== 'string') {
    return 'build-outline'; // Retorna um ícone padrão se o nome não for válido.
  }
  const name = categoryName.toLowerCase();
  if (name.includes('elétrica')) return 'flash-outline';
  if (name.includes('encanamento')) return 'water-outline';
  if (name.includes('limpeza')) return 'sparkles-outline';
  if (name.includes('pintura')) return 'brush-outline';
  if (name.includes('jardinagem')) return 'leaf-outline';
  if (name.includes('mais serviços')) return 'ellipsis-horizontal-circle-outline';
  return 'build-outline'; // Ícone padrão
};


// --- Componentes da UI ---
const CategoryItem = ({ item, onPress }) => (
  <TouchableOpacity style={styles.categoryItem} onPress={() => onPress(item.name)}>
    <View style={styles.categoryIconContainer}>
      {/* Agora usa a função auxiliar para obter o nome do ícone correto */}
      <Ionicons name={getIconForCategory(item.name)} size={30} color="#06437e" />
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
  
  // --- LÓGICA DO PLACEHOLDER ANIMADO ---
  const [placeholder, setPlaceholder] = useState('Busque por "Elétrica"');
  const placeholderSuggestions = useMemo(() => [
    'Instalação de Tomadas',
    'Reparos de Vazamento',
    'Pintura de Apartamento',
    'Limpeza Ar Condicionado',
    'Instalação de Ventilador',
  ], []);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % placeholderSuggestions.length;
      setPlaceholder(`Busque por "${placeholderSuggestions[index]}"`);
    }, 3000); // Muda a cada 3 segundos

    return () => clearInterval(interval); // Limpa o intervalo ao desmontar o componente
  }, [placeholderSuggestions]);


  // --- LÓGICA DE BUSCA E SUGESTÕES ---
  const fetchSugestoes = async (text) => {
    if (text.length < 2) {
      setSugestoes([]);
      return;
    }
    try {
      const response = await fetch(`${IP_DO_SERVIDOR}/servicos-oferecidos/sugestoes?q=${text}`);
      const data = await response.json();
      const filteredData = data.filter(sugestao => sugestao.split(' ').length <= 3);
      setSugestoes(filteredData);

    } catch (error) {
      console.error("Erro ao buscar sugestões:", error);
    }
  };

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
  
  const handleCategoryPress = useCallback((categoryName) => {
    router.push({ pathname: '/resultados_busca', params: { categoria: categoryName } });
  }, [router]);
  
  const handleSuggestionPress = useCallback((tituloServico) => {
    setSearchQuery('');
    setSugestoes([]);
    router.push({ pathname: '/resultados_busca', params: { tituloServico: tituloServico } });
  }, [router]);

  const handleSearchSubmit = useCallback(() => {
    if (searchQuery.trim().length > 0) {
        Keyboard.dismiss();
        setSugestoes([]);
        router.push({ pathname: '/resultados_busca', params: { tituloServico: searchQuery } });
    }
  }, [searchQuery, router]);

  if (!user) {
    return <ActivityIndicator size="large" color="#06437e" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  return (
    <View style={styles.container}>
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

      <View style={styles.searchSection}>
          <Text style={styles.welcomeText}>Olá, {user.nome}!</Text>
          <View style={styles.searchWrapper}>
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={24} color="#555" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder={placeholder}
                placeholderTextColor="#888"
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
                onSubmitEditing={handleSearchSubmit}
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
                keyboardShouldPersistTaps="handled"
              />
            )}
          </View>
      </View>

      {loading ? <ActivityIndicator style={{marginTop: 20}} color="#06437e" /> : (
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
              <Text style={styles.sectionTitle}>Serviços</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesList}>
                  {categories.map((cat, index) => (
                      <CategoryItem key={cat.id || index} item={cat} onPress={handleCategoryPress} />
                  ))}
              </ScrollView>

              <Text style={styles.sectionTitle}>Profissionais em destaque</Text>
              {professionals.map(prof => (
                  <ProfessionalCard key={prof.id} professional={prof} />
              ))}
          </ScrollView>
      )}
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
  logo: { width: 150, height: 100 },
  profileIconContainer: {},
  headerProfileImage: { width: 40, height: 40, borderRadius: 20 },
  searchSection: { paddingHorizontal: 20, zIndex: 10 },
  searchWrapper: { position: 'relative' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 15, elevation: 2, },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 50, fontSize: 16, color: '#333' },
  suggestionsList: { position: 'absolute', top: 55, left: 0, right: 0, backgroundColor: 'white', borderRadius: 10, elevation: 3, maxHeight: 200, },
  suggestionItem: { paddingVertical: 15, paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: '#eee', },
  suggestionText: { fontSize: 16, flexShrink: 1 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#06437e', marginBottom: 15, marginTop: 10 },
  categoriesList: { paddingBottom: 10 },
  categoryItem: { alignItems: 'center', marginRight: 20 },
  categoryIconContainer: { backgroundColor: '#fff', borderRadius: 35, width: 70, height: 70, justifyContent: 'center', alignItems: 'center', elevation: 2, },
  categoryText: { marginTop: 5, fontSize: 12, color: '#333' },
  professionalCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 10, padding: 15, alignItems: 'center', elevation: 2, marginBottom: 15, },
  professionalImage: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
  professionalInfo: { flex: 1, justifyContent: 'center' },
  professionalName: { fontSize: 16, fontWeight: 'bold', color: '#06437e' },
  professionalDistance: { fontSize: 12, color: '#888', marginTop: 5 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 20 },
  menuContainer: { position: 'absolute', top: 0, bottom: 0, left: 0, width: SCREEN_WIDTH * 0.6, backgroundColor: '#fff', padding: 20, elevation: 5, zIndex: 30, },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 2 },
  ratingText: { marginLeft: 5, fontSize: 14, color: '#333' },
});
