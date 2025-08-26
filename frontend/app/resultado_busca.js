import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../app/AuthContext';
import { IP_DO_SERVIDOR } from '../app/api_config';

const PrestadorCard = ({ prestador }) => (
    <TouchableOpacity style={styles.card}>
        <Image source={{ uri: prestador.imagem || 'https://placehold.co/100x100/png?text=User' }} style={styles.image} />
        <View style={styles.infoContainer}>
            <Text style={styles.name}>{prestador.nome}</Text>
            {/* Arredonda a distância para 1 casa decimal */}
            <Text style={styles.distance}>{parseFloat(prestador.distancia_km).toFixed(1)} km de distância</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#B0B0B0" />
    </TouchableOpacity>
);

export default function ResultadosBuscaScreen() {
    const { user } = useContext(AuthContext);
    const params = useLocalSearchParams(); // Pega os parâmetros da rota
    const { categoria } = params;
    const router = useRouter();

    const [prestadores, setPrestadores] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && categoria) {
            const fetchPrestadoresProximos = async () => {
                try {
                    const response = await fetch(`${IP_DO_SERVIDOR}/prestadores/proximos?categoria=${categoria}&clienteId=${user.id}`);
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
    }, [user, categoria]);

    if (loading) {
        return <ActivityIndicator size="large" color="#06437e" style={{ flex: 1 }} />;
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={28} color="#06437e" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{categoria}</Text>
            </View>
            <FlatList
                data={prestadores}
                renderItem={({ item }) => <PrestadorCard prestador={item} />}
                keyExtractor={item => item.id.toString()}
                ListEmptyComponent={<Text style={styles.emptyText}>Nenhum prestador encontrado para esta categoria.</Text>}
                contentContainerStyle={styles.list}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F7FF' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 15,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0EFFF',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#06437e',
        marginLeft: 15,
    },
    list: { padding: 20 },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 15,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        elevation: 3,
    },
    image: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
    infoContainer: { flex: 1 },
    name: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    distance: { fontSize: 14, color: '#666', marginTop: 5 },
    emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#666' },
});
