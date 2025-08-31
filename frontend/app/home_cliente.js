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
import { AuthContext } from "../app/AuthContext";
import { IP_DO_SERVIDOR } from "../app/api_config";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const logo = require("../assets/images/logo_hubServicos.png");

// --- LateralMenu ---
const LateralMenu = ({ visible, setVisible, logout, router }) => {
  const anim = useRef(new Animated.Value(-SCREEN_WIDTH)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: visible ? 0 : -SCREEN_WIDTH,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [visible]);

  return (
    <Animated.View style={[styles.lateralMenu, { left: anim }]}>
      <ScrollView>
        <TouchableOpacity onPress={() => setVisible(false)} style={styles.closeButton}>
          <Ionicons name="close-outline" size={36} color="#06437e" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/")} style={styles.menuItem}>
          <Text style={styles.menuText}>Início</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/perfil")} style={styles.menuItem}>
          <Text style={styles.menuText}>Perfil</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => logout()} style={styles.menuItem}>
          <Text style={styles.menuText}>Sair</Text>
        </TouchableOpacity>
      </ScrollView>
    </Animated.View>
  );
};

// --- CategoryItem ---
const CategoryItem = ({ item, onPress }) => (
  <TouchableOpacity style={styles.categoryItem} onPress={() => onPress(item.name)}>
    <View style={styles.categoryIconContainer}>
      <Ionicons name="build-outline" size={30} color="#06437e" />
    </View>
    <Text style={styles.categoryText}>{item.name}</Text>
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
const HomeCliente = () => {
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
      "Instalação de Tomadas",
      "Reparos de Vazamento",
      "Pintura de Parede",
      "Limpeza de Apartamento",
      "Corte de Grama",
      "Montagem de Móveis",
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
      const data = await res.json();
      setSugestoes(data.filter(item => item.split(" ").length <= 3));
    } catch (e) {
      console.error(e);
    }
  };
  const debouncedFetchSugestoes = useMemo(() => debounce(fetchSugestoes, 300), []);
  useEffect(() => debouncedFetchSugestoes(searchQuery), [searchQuery]);

  // Buscar dados iniciais
  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const catRes = await fetch(`${IP_DO_SERVIDOR}/categorias`);
        const catJson = await catRes.json();
        const catData = catJson.data || catJson;
        setCategories([...(Array.isArray(catData) ? catData : [catData]), { id: "mais", name: "Mais Serviços..." }]);

        const profRes = await fetch(`${IP_DO_SERVIDOR}/prestadores/proximos?clienteId=${user.id}`);
        const profJson = await profRes.json();
        const profData = profJson.data || profJson;
        setProfessionals(Array.isArray(profData) ? profData : [profData]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (!user) return <ActivityIndicator size="large" color="#06437e" style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setMenuOpen(true)} style={styles.button}>
          <Ionicons name="menu-outline" size={32} color="#06437e" />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
        </View>
        <TouchableOpacity onPress={() => logout()} style={styles.menuButton}>
          <Ionicons name="log-out-outline" size={32} color="#06437e" />
        </TouchableOpacity>
      </View>

      {/* Menu lateral */}
      <LateralMenu visible={menuOpen} setVisible={setMenuOpen} logout={logout} router={router} />

      {/* Corpo */}
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <Text style={styles.welcomeText}>Olá, {user.nome}!</Text>

        {/* Busca */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={24} color="#555" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={animatedPlaceholder}
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => router.push({ pathname: "/resultados-busca", params: { tituloServico: searchQuery } })}
            />
          </View>
          {sugestoes.length > 0 && (
            <FlatList
              data={sugestoes}
              keyExtractor={(item, i) => i.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => router.push({ pathname: "/resultados-busca", params: { tituloServico: item } })}>
                  <Text style={styles.suggestionItem}>{item}</Text>
                </TouchableOpacity>
              )}
              style={styles.suggestionsList}
            />
          )}
        </View>

        {/* Categorias */}
        <Text style={styles.sectionTitle}>Serviços</Text>
        <FlatList
          data={categories}
          renderItem={({ item }) => <CategoryItem item={item} onPress={name => router.push({ pathname: "/resultados-busca", params: { categoria: name } })} />}
          keyExtractor={(item, i) => item.id ? item.id.toString() : i.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />

        {/* Profissionais */}
        <Text style={styles.sectionTitle}>Profissionais em destaque</Text>
        {loading ? (
          <ActivityIndicator color="#06437e" />
        ) : (
          professionals.map((prof, i) => <ProfessionalCard key={prof.id || i} professional={prof} />)
        )}
      </ScrollView>
    </View>
  );
};

export default HomeCliente;

// ===== Styles =====
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent", paddingTop: 50 },
  scrollView: { paddingHorizontal: 20 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 10 },
  menuButton: { padding: 5 },
  logoContainer: { flex: 1, alignItems: "center" },
  logo: { width: 150, height: 100 },
  button: { padding: 5 },
  welcomeText: { fontSize: 24, fontWeight: "600", color: "#06437e", marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#06437e", marginBottom: 15 },
  searchContainer: { marginBottom: 20, zIndex: 1 },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 10, paddingHorizontal: 15, elevation: 2 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 50, fontSize: 16, color: "#333" },
  suggestionsList: { position: "absolute", top: 55, left: 0, right: 0, backgroundColor: "white", borderRadius: 10, elevation: 3, maxHeight: 200, borderWidth: 1, borderColor: "#eee" },
  suggestionItem: { padding: 12, fontSize: 16, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  categoriesList: { paddingBottom: 25 },
  categoryItem: { alignItems: "center", marginRight: 20, width: 80 },
  categoryIconContainer: { backgroundColor: "#fff", borderRadius: 20, width: 70, height: 70, justifyContent: "center", alignItems: "center", elevation: 2, marginBottom: 5 },
  categoryText: { fontSize: 12, color: "#333", textAlign: "center" },
  professionalCard: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 10, padding: 15, alignItems: "center", elevation: 2, marginBottom: 15 },
  professionalImage: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
  professionalInfo: { flex: 1, justifyContent: "center" },
  professionalName: { fontSize: 16, fontWeight: "bold", color: "#06437e" },
  professionalDistance: { fontSize: 12, color: "#888", marginTop: 5 },
  lateralMenu: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: SCREEN_WIDTH * 0.75,
    backgroundColor: "#fff",
    elevation: 5,
    zIndex: 20,
    paddingTop: 50,
  },
  closeButton: { padding: 10, alignItems: "flex-end" },
  menuItem: { paddingVertical: 20, paddingHorizontal: 20 },
  menuText: { fontSize: 18, color: "#06437e" },
});
