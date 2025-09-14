import React, { useState, useEffect, useContext, useMemo, useRef } from "react";
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
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import debounce from "lodash.debounce";
import { AuthContext } from "../context/AuthContext"; // Caminho corrigido
import { IP_DO_SERVIDOR } from "../config/api_config"; // Caminho corrigido

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const logo = require("../assets/images/logo_hubServicos.png");

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

// --- LateralMenu ---
const LateralMenu = ({ visible, setVisible, logout, router }) => {
  const anim = useRef(new Animated.Value(-SCREEN_WIDTH)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: visible ? 0 : -SCREEN_WIDTH,
      duration: 300,
      useNativeDriver: true, // Usar transform é compatível com o driver nativo
    }).start();
  }, [visible, anim]);

  const navigateAndClose = (path) => {
    router.push(path);
    setVisible(false);
  }

  return (
    <>
        {visible && <TouchableOpacity style={styles.overlay} onPress={() => setVisible(false)} />}
        <Animated.View style={[styles.lateralMenu, { transform: [{ translateX: anim }] }]}>
            <ScrollView>
                <TouchableOpacity onPress={() => setVisible(false)} style={styles.closeButton}>
                    <Ionicons name="close-outline" size={36} color="#06437e" />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigateAndClose("/")} style={styles.menuItem}>
                    <Text style={styles.menuText}>Início</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigateAndClose("/profile")} style={styles.menuItem}>
                    <Text style={styles.menuText}>Perfil</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={logout} style={styles.menuItem}>
                    <Text style={[styles.menuText, {color: '#c0392b'}]}>Sair</Text>
                </TouchableOpacity>
            </ScrollView>
        </Animated.View>
    </>
  );
};

// --- CategoryItem (CORRIGIDO) ---
const CategoryItem = ({ item, onPress }) => (
  <TouchableOpacity style={styles.categoryItem} onPress={() => onPress(item.nome)}>
    <View style={styles.categoryIconContainer}>
      <Ionicons name={getIconForCategory(item.nome)} size={30} color="#06437e" />
    </View>
    <Text style={styles.categoryText}>{item.nome}</Text>
  </TouchableOpacity>
);

// --- ProfessionalCard ---
const ProfessionalCard = ({ professional }) => (
  <TouchableOpacity style={styles.professionalCard}>
    <Image
      source={{ uri: professional.foto || "https://placehold.co/100x100/png?text=User" }}
      style={styles.professionalImage}
    />
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

// --- HomeCliente ---
  export default function HomeCliente () {
  const { user, logout } = useContext(AuthContext);
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState("O que você precisa hoje?");
  const [sugestoes, setSugestoes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Placeholder animado
  useEffect(() => {
    const suggestions = [
      "Instalação de Tomadas", "Reparos de Vazamento", "Pintura de Parede",
      "Limpeza de Apartamento", "Corte de Grama", "Montagem de Móveis",
    ];
    let index = 0;
    const interval = setInterval(() => {
      if (searchQuery === "") {
        index = (index + 1) % suggestions.length;
        setAnimatedPlaceholder(suggestions[index]);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [searchQuery]);

  // Buscar sugestões
  const fetchSugestoes = async (text) => {
    if (text.length < 2) return setSugestoes([]);
    try {
      const res = await fetch(`${IP_DO_SERVIDOR}/servicos-oferecidos/sugestoes?q=${text}`);
      if(res.ok) {
        const data = await res.json();
        setSugestoes(data.filter(item => item.split(" ").length <= 4));
      }
    } catch (e) {
      console.error("Erro ao buscar sugestões:", e);
    }
  };
  const debouncedFetchSugestoes = useMemo(() => debounce(fetchSugestoes, 300), []);
  useEffect(() => { debouncedFetchSugestoes(searchQuery) }, [searchQuery, debouncedFetchSugestoes]);

  // Buscar dados iniciais
useEffect(() => {
  if (!user) return;

  const fetchData = async () => {
    setLoading(true);
    try {
      // --- Buscar categorias ---
      const catRes = await fetch(`${IP_DO_SERVIDOR}/categorias`);
      if (catRes.ok) {
        const catJson = await catRes.json();
        const catData = catJson.data || [];
        setCategories([
          ...(Array.isArray(catData) ? catData : [catData]),
          { id: "mais", nome: "Mais Serviços..." },
        ]);
      } else {
        console.error("Falha ao buscar categorias:", catRes.status);
        setCategories([{ id: "mais", nome: "Mais Serviços..." }]);
      }

      // --- Buscar profissionais (só se o cliente tiver endereço/lat/lng) ---
      if (user?.cep || (user?.latitude && user?.longitude)) {
        try {
          const profRes = await fetch(
            `${IP_DO_SERVIDOR}/prestadores/proximos?clienteId=${user.id}`
          );
          if (profRes.ok) {
            const profJson = await profRes.json();
            const profData = profJson.data || [];
            setProfessionals(Array.isArray(profData) ? profData : [profData]);
          } else {
            console.error("Falha ao buscar profissionais:", profRes.status);
            setProfessionals([]);
          }
        } catch (e) {
          console.error("Erro de rede ao buscar profissionais:", e);
          setProfessionals([]);
        }
      } else {
        console.log("Cliente sem endereço/geo definido. Não buscando profissionais próximos.");
        setProfessionals([]);
      }
    } catch (e) {
      console.error("Erro de rede ao buscar dados iniciais:", e);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
  }, [user]);

  if (!user) return <ActivityIndicator size="large" color="#06437e" style={{ flex: 1, justifyContent: 'center' }} />;

  const handleSuggestionPress = (titulo) => {
      setSearchQuery('');
      setSugestoes([]);
      router.push({ pathname: "/resultados_busca", params: { tituloServico: titulo } });
  }

  const handleCategoryPress = (categoria) => {
      router.push({ pathname: "/resultados_busca", params: { categoria: categoria } })
  }

  return (
    <View style={styles.container}>
      <LateralMenu visible={menuOpen} setVisible={setMenuOpen} logout={logout} router={router} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => setMenuOpen(true)} style={styles.button}>
          <Ionicons name="menu-outline" size={32} color="#06437e" />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
        </View>
        <TouchableOpacity onPress={() => router.push('/profile')} style={styles.button}>
            {user.imagem ? 
                <Image source={{uri: user.imagem}} style={styles.headerProfileImage} /> : 
                <Ionicons name="person-circle-outline" size={32} color="#06437e" />
            }
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
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
              onSubmitEditing={() => router.push({ pathname: "/resultados_busca", params: { tituloServico: searchQuery } })}
            />
          </View>
          {sugestoes.length > 0 && (
            <FlatList
              data={sugestoes}
              keyExtractor={(item, i) => i.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleSuggestionPress(item)}>
                  <Text style={styles.suggestionItem}>{item}</Text>
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
                    keyExtractor={(item, i) => item.id ? item.id.toString() : i.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesList}
                />

                <Text style={styles.sectionTitle}>Profissionais em destaque</Text>
                    {professionals.length > 0 ? ( professionals.map((prof, i) => (
                    <ProfessionalCard key={prof.id || i} professional={prof} />))
                    ) : (
                    <Text style={styles.emptyMessage}>Complete seu endereço no perfil para ver profissionais próximos.</Text>
                    )}
            </>
        )}
      </ScrollView>
    </View>
  );
};

// ===== Styles =====
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent", paddingTop: 50 },
  scrollView: { paddingHorizontal: 20 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 15, marginBottom: 10 },
  logoContainer: { flex: 1, alignItems: "center" },
  logo: { width: 150, height: 60 },
  button: { padding: 5 },
  headerProfileImage: { width: 34, height: 34, borderRadius: 17 },
  welcomeText: { fontSize: 24, fontWeight: "600", color: "#06437e", marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#06437e", marginBottom: 15 },
  searchContainer: { marginBottom: 20, zIndex: 10 },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 10, paddingHorizontal: 15, elevation: 2 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 50, fontSize: 16, color: "#333" },
  suggestionsList: { position: "absolute", top: 55, left: 0, right: 0, backgroundColor: "white", borderRadius: 10, elevation: 3, maxHeight: 200, borderWidth: 1, borderColor: "#eee" },
  suggestionItem: { padding: 12, fontSize: 16, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  categoriesList: { paddingBottom: 25 },
  categoryItem: { alignItems: "center", marginRight: 15, width: 85 },
  categoryIconContainer: { backgroundColor: "#fff", borderRadius: 25, width: 70, height: 70, justifyContent: "center", alignItems: "center", elevation: 2, marginBottom: 8 },
  categoryText: { fontSize: 12, color: "#333", textAlign: "center" },
  professionalCard: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 10, padding: 15, alignItems: "center", elevation: 2, marginBottom: 15 },
  professionalImage: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
  professionalInfo: { flex: 1, justifyContent: "center" },
  professionalName: { fontSize: 16, fontWeight: "bold", color: "#06437e" },
  professionalDistance: { fontSize: 12, color: "#888", marginTop: 5 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 15 },
  lateralMenu: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: SCREEN_WIDTH * 0.7,
    backgroundColor: "#f0f7fd",
    elevation: 10,
    zIndex: 20,
    paddingTop: 50,
    borderRightWidth: 1,
    borderColor: '#ddd',
    transform: [{ translateX: -SCREEN_WIDTH }] // Inicia fora do ecrã
  },
  closeButton: { padding: 15, alignItems: "flex-end", marginBottom: 10 },
  menuItem: { paddingVertical: 15, paddingHorizontal: 20, borderBottomWidth: 1, borderColor: '#e0e0e0' },
  menuText: { fontSize: 18, color: "#06437e", fontWeight: '500' 
  },
  emptyMessage: {
  fontSize: 14,
  color: "#666",
  fontStyle: "italic",
  textAlign: "center",
  marginTop: 10,
  marginBottom: 20,
  },

});
// export default HomeCliente;

