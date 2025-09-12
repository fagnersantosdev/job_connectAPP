import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { IP_DO_SERVIDOR } from '../config/api_config';

const PrestadorCard = ({ prestador }) => (
    <TouchableOpacity style={styles.card}>
        <Image source={{ uri: prestador.foto || 'https://placehold.co/100x100/png?text=User' }} style={styles.image} />
        <View style={styles.infoContainer}>
            <Text style={styles.name}>{prestador.nome}</Text>
            <Text style={styles.distance}>{parseFloat(prestador.distancia_km).toFixed(1)} km de distância</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#B0B0B0" />
    </TouchableOpacity>
);

export default function ResultadosBuscaScreen() {
    const { user } = useContext(AuthContext);
    const params = useLocalSearchParams();
    const { categoria, tituloServico } = params; // Agora pode receber um ou outro
    const router = useRouter();

    const [prestadores, setPrestadores] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && (categoria || tituloServico)) {
            const fetchPrestadoresProximos = async () => {
                // Constrói a URL da API dinamicamente com os filtros
                let apiUrl = `${IP_DO_SERVIDOR}/prestadores/proximos?clienteId=${user.id}`;
                if (categoria) {
                    apiUrl += `&categoria=${categoria}`;
                }
                if (tituloServico) {
                    apiUrl += `&tituloServico=${tituloServico}`;
                }

                try {
                    const response = await fetch(apiUrl);
                    const data = await response.json();
                    setPrestadores(data);
                } catch (error) {
                    console.error("Erro ao buscar prestadores próximos:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchPrestadoresProximos();
        }
    }, [user, categoria, tituloServico]);

    if (loading) {
        return <ActivityIndicator size="large" color="#06437e" style={{ flex: 1, justifyContent: 'center' }} />;
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={28} color="#06437e" />
                </TouchableOpacity>
                {/* O título da tela agora mostra o que foi buscado */}
                <Text style={styles.headerTitle}>{tituloServico || categoria}</Text>
            </View>
            <FlatList
                data={prestadores}
                renderItem={({ item }) => <PrestadorCard prestador={item} />}
                keyExtractor={item => item.id.toString()}
                ListEmptyComponent={<Text style={styles.emptyText}>Nenhum prestador encontrado.</Text>}
                contentContainerStyle={styles.list}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    // ... (estilos da tela de resultados)
});
