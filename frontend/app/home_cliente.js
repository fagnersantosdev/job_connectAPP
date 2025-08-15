import React, { useState, useRef, useEffect } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const logo = require('../assets/images/logo-Jobconnect.png');

const serviceCategories = [
  { id: '1', name: 'Pedreiro', icon: 'hammer-outline' },
  { id: '2', name: 'Encanamento', icon: 'water-outline' },
  { id: '3', name: 'Limpeza', icon: 'basket-outline' },
  { id: '4', name: 'Elétrica', icon: 'flash-outline' },
  { id: '5', name: 'Mais Serviços...', icon: 'ellipsis-horizontal-circle-outline' },
];

const featuredProfessionals = [
  { id: '1', name: 'Carlos Silva', job: 'Eletricista', rating: 4.8, distance: '3km', image: 'https://placehold.co/100x100/png?text=CS' },
  { id: '2', name: 'Ana Ferreira', job: 'Faxineira', rating: 4.5, distance: '5km', image: 'https://placehold.co/100x100/png?text=AF' },
  { id: '3', name: 'Robson Souza', job: 'Pintor', rating: 4.7, distance: '4km', image: 'https://placehold.co/100x100/png?text=RS' },
  { id: '4', name: 'Cristiano Martins', job: 'Encanador', rating: 4.6, distance: '1km', image: 'https://placehold.co/100x100/png?text=CM' },
];

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
    <Image source={{ uri: professional.image }} style={styles.professionalImage} />
    <View style={styles.professionalInfo}>
      <Text style={styles.professionalName}>{professional.name}</Text>
      <View style={styles.ratingContainer}>
        <Ionicons name="star" size={16} color="#FFD233" />
        <Text style={styles.ratingText}>{professional.rating}</Text>
      </View>
      <Text style={styles.professionalJob}>{professional.job}</Text>
      <Text style={styles.professionalDistance}>{professional.distance} de distância</Text>
    </View>
  </View>
);

export default function HomeCliente() {
  const [searchQuery, setSearchQuery] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-SCREEN_WIDTH * 0.6)).current;
  const router = useRouter();

  // Animação do menu lateral
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: menuVisible ? 0 : -SCREEN_WIDTH * 0.6,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [menuVisible]);

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

        <TouchableOpacity onPress={() => setMenuVisible(false)}>
          <Text style={[styles.menuItem, { color: 'red' }]}>Sair</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Overlay */}
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

        <TouchableOpacity style={styles.profileIconContainer}>
          <Ionicons name="person-circle-outline" size={40} color="#06437e" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Barra de pesquisa */}
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

        {/* Categorias */}
        <Text style={styles.sectionTitle}>Serviços</Text>
        <FlatList
          data={serviceCategories}
          renderItem={({ item }) => <CategoryItem item={item} />}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />

        {/* Profissionais */}
        <View style={styles.featuredProfessionalsContainer}>
          <Text style={styles.sectionTitle}>Profissionais em destaque</Text>
          <TouchableOpacity onPress={() => router.push('/services')}>
            <Text style={styles.seeAllText}>Mais Serviços...</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={featuredProfessionals}
          renderItem={({ item }) => <ProfessionalCard professional={item} />}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.professionalsList}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Layout principal
  container: { flex: 1, backgroundColor: 'transparent', paddingTop: 50 },
  scrollView: { paddingHorizontal: 20 },

  // Cabeçalho
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, marginBottom: 10 },
  menuButton: { padding: 5, justifyContent: 'center', alignItems: 'center' },
  logoContainer: { flex: 1, alignItems: 'center' },
  logo: { width: 120, height: 60 },
  profileIconContainer: { marginLeft: 'auto' },

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

