import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Image, ScrollView, FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Imagem do logo (assumindo que o logo é o mesmo)
const logo = require('../assets/images/logo-Jobconnect.png');

// Dados de exemplo para as categorias
const serviceCategories = [
  { id: '1', name: 'Pedreiro', icon: 'hammer-outline' },
  { id: '2', name: 'Encanamento', icon: 'water-outline' },
  { id: '3', name: 'Limpeza', icon: 'basket-outline' },
  { id: '4', name: 'Elétrica', icon: 'flash-outline' },
  { id: '5', name: 'Mais Serviços...', icon: 'ellipsis-horizontal-circle-outline' },
];

// Dados de exemplo para os profissionais
const featuredProfessionals = [
  { id: '1', name: 'Carlos Silva', job: 'Eletricista', rating: 4.8, distance: '3km', image: 'https://placehold.co/100x100/png?text=CS' },
  { id: '2', name: 'Ana Ferreira', job: 'Faxineira', rating: 4.5, distance: '5km', image: 'https://placehold.co/100x100/png?text=AF' },
  { id: '3', name: 'Robson Souza', job: 'Pintor', rating: 4.7, distance: '4km', image: 'https://placehold.co/100x100/png?text=RS' },
  { id: '4', name: 'Cristiano Martins', job: 'Encanador', rating: 4.6, distance: '1km', image: 'https://placehold.co/100x100/png?text=CM' },
];

// Componente para renderizar cada item de categoria
const CategoryItem = ({ item }) => (
  <View style={styles.categoryItem}>
    <View style={styles.categoryIconContainer}>
      <Ionicons name={item.icon} size={30} color="#06437e" />
    </View>
    <Text style={styles.categoryText}>{item.name}</Text>
  </View>
);

// Componente para renderizar cada card de profissional
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
  const router = useRouter();

  // A função de navegação foi adicionada ao botão "Mais Serviços..."
  const handleSeeAllServices = () => {
    router.push('/services'); // Navega para a tela de todos os serviços
  };

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
        </View>
        <TouchableOpacity style={styles.profileIconContainer}>
          <Ionicons name="person-circle-outline" size={40} color="#06437e" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Barra de Pesquisa */}
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

        {/* Profissionais em Destaque */}
        <View style={styles.featuredProfessionalsContainer}>
          <Text style={styles.sectionTitle}>Profissionais em destaque</Text>
          {/* O onPress foi adicionado aqui para usar a variável 'router' */}
          <TouchableOpacity onPress={handleSeeAllServices}>
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
  container: {
    flex: 1,
    backgroundColor: '#e4f0fd',
    paddingTop: 50,
  },
  scrollView: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    width: 120,
    height:60,
  },
  profileIconContainer: {
    marginLeft: 'auto',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#06437e',
    marginBottom: 10,
  },
  categoriesList: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 20,
  },
  categoryIconContainer: {
    backgroundColor: '#fff',
    borderRadius: 35,
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryText: {
    marginTop: 5,
    fontSize: 12,
    color: '#333',
  },
  featuredProfessionalsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  seeAllText: {
    color: '#06437e',
    fontWeight: 'bold',
    fontSize: 14,
  },
  professionalsList: {
    paddingBottom: 20,
  },
  professionalCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginRight: 15,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    width: 250, // Ajuste para o card ter uma largura fixa
  },
  professionalImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  professionalInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  professionalName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#06437e',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#333',
  },
  professionalJob: {
    fontSize: 14,
    color: '#555',
  },
  professionalDistance: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
});
