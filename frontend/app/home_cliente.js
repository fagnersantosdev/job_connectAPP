import React, { useState, useEffect, useContext, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AuthContext } from '../app/AuthContext';
import { IP_DO_SERVIDOR } from '../app/api_config';
import debounce from 'lodash.debounce';

const logo = require('../assets/images/logo_hubServicos.png');

// --- Função Auxiliar para Mapear Nomes de Categoria para Ícones ---
const getIconForCategory = (categoryName) => {
    if (!categoryName) {
        return 'build-outline';
    }
    const name = categoryName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    switch (name) {
        case 'eletrica':
            return 'flash-outline';
        case 'encanamento':
            return 'water-outline';
        case 'pintura':
            return 'brush-outline';
        case 'limpeza':
            return 'sparkles-outline';
        case 'jardinagem':
            return 'leaf-outline';
        case 'mais servicos...':
            return 'ellipsis-horizontal-circle-outline';
        default:
            return 'build-outline';
    }
};


// --- Componentes da UI ---
const CategoryItem = ({ item, onPress }) => (
  <TouchableOpacity style={styles.categoryItem} onPress={() => onPress(item.name)}>
    <View style={styles.categoryIconContainer}>
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
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sugestoes, setSugestoes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState('O que você precisa hoje?');
  
  useEffect(() => {
    const suggestions = [
      "Instalação de Tomadas", "Reparos de Vazamento", "Pintura de Parede", "Limpeza de Apartamento", "Corte de Grama", "Montagem de Móveis"
    ];
    let index = 0;
    const interval = setInterval(() => {
      if (searchQuery === '') {
        index = (index + 1) % suggestions.length;
        setAnimatedPlaceholder(suggestions[index]);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [searchQuery]);


  const fetchSugestoes = async (text) => {
    if (text.length < 2) {
      setSugestoes([]);
      return;
    }
    try {
      const response = await fetch(`${IP_DO_SERVIDOR}/servicos-oferecidos/sugestoes?q=${text}`);
      const data = await response.json();
      const filteredData = data.filter(item => item.split(' ').length <= 3);
      setSugestoes(filteredData);
    } catch (error) {
      console.error("Erro ao buscar sugestões:", error);
    }
  };

  const debouncedFetchSugestoes = useMemo(() => debounce(fetchSugestoes, 300), []);

  useEffect(() => {
    debouncedFetchSugestoes(searchQuery);
  }, [searchQuery, debouncedFetchSugestoes]);

  // --- LÓGICA DE DADOS INICIAIS (CORRIGIDA) ---
  useEffect(() => {
    if (user) {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Busca de categorias
                const catResponse = await fetch(`${IP_DO_SERVIDOR}/categorias`);
                const catJson = await catResponse.json();
                // CORREÇÃO: Extrai a lista de dentro da propriedade 'data'
                const catData = catJson.data || catJson; 
                setCategories([...(Array.isArray(catData) ? catData : [catData]), { id: 'mais', name: 'Mais Serviços...' }]);

                // Busca de profissionais
                const profResponse = await fetch(`${IP_DO_SERVIDOR}/prestadores/proximos?clienteId=${user.id}`);
                const profJson = await profResponse.json();
                // CORREÇÃO: Extrai a lista de dentro da propriedade 'data'
                const profData = profJson.data || profJson;
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

  // --- NAVEGAÇÃO E AÇÕES ---
  const handleLogout = () => {
    logout();
    router.replace('/');
  };
  
  const handleCategoryPress = (categoryName) => {
    router.push({ pathname: '/resultados-busca', params: { categoria: categoryName } });
  };
  
  const handleSuggestionPress = (tituloServico) => {
    setSearchQuery('');
    setSugestoes([]);
    router.push({ pathname: '/resultados-busca', params: { tituloServico: tituloServico } });
  };

  const handleSearchSubmit = () => {
      if(searchQuery.length > 1){
        setSugestoes([]);
        router.push({ pathname: '/resultados-busca', params: { tituloServico: searchQuery } });
      }
  }

  if (!user) {
    return <ActivityIndicator size="large" color="#06437e" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.profileIconContainer} onPress={() => router.push('/profile')}>
            {user.imagem ? (<Image source={{ uri: user.imagem }} style={styles.headerProfileImage} />) : (<Ionicons name="person-circle-outline" size={40} color="#06437e" />)}
        </TouchableOpacity>
        <View style={styles.logoContainer}><Image source={logo} style={styles.logo} resizeMode="contain" /></View>
        <TouchableOpacity style={styles.menuButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={32} color="#06437e" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.welcomeText}>Olá, {user.nome}!</Text>
        
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={24} color="#555" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={animatedPlaceholder}
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
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
                {professionals.map((prof, index) => (
                    <ProfessionalCard key={prof.id || index} professional={prof} />
                ))}
            </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F7FD', paddingTop: 50 },
  scrollView: { paddingHorizontal: 20 },
  welcomeText: { fontSize: 24, fontWeight: '600', color: '#06437e', marginBottom: 15 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 10 },
  menuButton: { padding: 5 },
  logoContainer: { flex: 1, alignItems: 'center' },
  logo: { width: 150, height: 60 },
  profileIconContainer: {},
  headerProfileImage: { width: 40, height: 40, borderRadius: 20 },
  searchContainer: { marginBottom: 20, zIndex: 1 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 15, elevation: 2, },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 50, fontSize: 16, color: '#333' },
  suggestionsList: { position: 'absolute', top: 55, left: 0, right: 0, backgroundColor: 'white', borderRadius: 10, elevation: 3, maxHeight: 200, borderWidth: 1, borderColor: '#eee' },
  suggestionItem: { paddingVertical: 12, paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0',},
  suggestionText: { fontSize: 16, flexWrap: 'wrap' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#06437e', marginBottom: 15 },
  categoriesList: { paddingBottom: 25 },
  categoryItem: { alignItems: 'center', marginRight: 20, width: 80 },
  categoryIconContainer: { backgroundColor: '#fff', borderRadius: 20, width: 70, height: 70, justifyContent: 'center', alignItems: 'center', elevation: 2, marginBottom: 5 },
  categoryText: { fontSize: 12, color: '#333', textAlign: 'center' },
  professionalCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 10, padding: 15, alignItems: 'center', elevation: 2, marginBottom: 15, },
  professionalImage: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
  professionalInfo: { flex: 1, justifyContent: 'center' },
  professionalName: { fontSize: 16, fontWeight: 'bold', color: '#06437e' },
  professionalDistance: { fontSize: 12, color: '#888', marginTop: 5 },
});

