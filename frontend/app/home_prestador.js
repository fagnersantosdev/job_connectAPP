import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { 
    View, 
    Text, 
    StyleSheet, 
    Image, 
    ScrollView, 
    TouchableOpacity,
    Switch,
    ActivityIndicator
} from 'react-native';

// --- SIMULAÇÃO DO BANCO DE DADOS ---

// 1. Dados do Prestador Logado (viria do seu contexto de autenticação ou API)
const prestadorLogado = {
    id: 101,
    nome: 'Robson',
    imagem: 'https://placehold.co/100x100/EFEFEF/333?text=R',
    areaAtuacao: 'Elétrica', // A especialidade do prestador
    cep: '27323-000', // CEP do prestador para cálculo de distância
};

// 2. Lista de todas as solicitações de serviços no "banco de dados"
const todasAsSolicitacoes = [
    { id: 1, cliente: { nome: 'Ana Ferreira', imagem: 'https://placehold.co/100x100/EFEFEF/555?text=A', cep: '27330-580' }, servico: 'Instalação de Tomada', area: 'Elétrica' },
    { id: 2, cliente: { nome: 'Carlos Souza', imagem: 'https://placehold.co/100x100/EFEFEF/555?text=C', cep: '27320-110' }, servico: 'Reparo em Disjuntor', area: 'Elétrica' },
    { id: 3, cliente: { nome: 'Julia Santos', imagem: 'https://placehold.co/100x100/EFEFEF/555?text=J', cep: '27335-400' }, servico: 'Conserto de vazamento', area: 'Encanamento' },
    { id: 4, cliente: { nome: 'Doutor Roger', imagem: 'https://placehold.co/100x100/EFEFEF/555?text=R', cep: '27331-020' }, servico: 'Troca de fiação', area: 'Elétrica' },
    { id: 5, cliente: { nome: 'Mariana Lima', imagem: 'https://placehold.co/100x100/EFEFEF/555?text=M', cep: '27350-330' }, servico: 'Pintura de parede', area: 'Pintura' },
];

// 3. Função para simular o cálculo de distância (em um app real, usaria uma API de geolocalização)
const calcularDistanciaSimulada = (cep1, cep2) => {
    // Lógica de simulação: retorna um valor aleatório para demonstração
    const randomKm = Math.floor(Math.random() * 15) + 1;
    return { km: randomKm, texto: `Aprox. ${randomKm}km de distância` };
};

// --- FIM DA SIMULAÇÃO ---


export default function HomePrestadorScreen() {
    const [disponivel, setDisponivel] = useState(true);
    const [greeting, setGreeting] = useState('');
    const [solicitacoes, setSolicitacoes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getGreeting = () => {
            const currentHour = new Date().getHours();
            if (currentHour < 12) return 'Bom dia';
            if (currentHour < 18) return 'Boa tarde';
            return 'Boa noite';
        };
        setGreeting(getGreeting());

        // Função para buscar e processar os dados
        const fetchSolicitacoes = async () => {
            setLoading(true);
            try {
                // Passo 1: Filtrar solicitações pela área de atuação do prestador
                const solicitacoesFiltradas = todasAsSolicitacoes.filter(
                    sol => sol.area === prestadorLogado.areaAtuacao
                );

                // Passo 2: Calcular a distância para cada solicitação filtrada
                const solicitacoesComDistancia = solicitacoesFiltradas.map(sol => {
                    const distancia = calcularDistanciaSimulada(prestadorLogado.cep, sol.cliente.cep);
                    return { ...sol, distancia }; // Adiciona a distância ao objeto
                });

                // Passo 3: Ordenar as solicitações pela distância (mais próxima primeiro)
                solicitacoesComDistancia.sort((a, b) => a.distancia.km - b.distancia.km);

                // Simula um atraso de rede
                setTimeout(() => {
                    setSolicitacoes(solicitacoesComDistancia);
                    setLoading(false);
                }, 1500);

            } catch (error) {
                console.error("Erro ao buscar solicitações:", error);
                setLoading(false);
            }
        };

        fetchSolicitacoes();
    }, []);


    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            {/* Cabeçalho */}
            <View style={styles.header}>
                <View style={styles.headerLogoContainer}>
                    <Image source={require('../assets/images/logo-Jobconnect.png')} style={styles.logo} resizeMode="contain" />
                </View>
                <TouchableOpacity style={styles.profileIconContainer}>
                    <Ionicons name="person-circle" size={38} color="#06437e" />
                </TouchableOpacity>
            </View>

            {/* Cartão de Boas-Vindas */}
            <View style={styles.welcomeCard}>
                <View>
                    <Text style={styles.welcomeTitle}>{greeting}, {prestadorLogado.nome}!</Text>
                </View>
                <Image source={{ uri: prestadorLogado.imagem }} style={styles.profileImage} />
            </View>

            {/* Botões de Ação Rápida */}
            <View style={styles.actionButtonsContainer}>
                <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="eye-outline" size={24} color="#06437e" />
                    <Text style={styles.actionButtonText}>Ver Solicitações</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="calendar-outline" size={24} color="#06437e" />
                    <Text style={styles.actionButtonText}>Gerenciar Agenda</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="build-outline" size={24} color="#06437e" />
                    <Text style={styles.actionButtonText}>Meus Serviços</Text>
                </TouchableOpacity>
            </View>

            {/* Toggle de Disponibilidade */}
            <View style={styles.availabilityContainer}>
                <Text style={styles.availabilityText}>Disponível</Text>
                <Switch
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={disponivel ? "#06437e" : "#f4f3f4"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={() => setDisponivel(previousState => !previousState)}
                    value={disponivel}
                />
            </View>

            {/* Seção de Solicitações Recentes */}
            <View style={styles.requestsContainer}>
                <Text style={styles.sectionTitle}>Solicitações Recentes</Text>
                {loading ? (
                    <ActivityIndicator size="large" color="#06437e" style={{ marginTop: 20 }} />
                ) : solicitacoes.length > 0 ? (
                    solicitacoes.map((item) => (
                        <TouchableOpacity key={item.id} style={styles.requestCard}>
                            <Image source={{ uri: item.cliente.imagem }} style={styles.requestProfileImage} />
                            <View style={styles.requestInfo}>
                                <Text style={styles.requestName}>{item.cliente.nome}</Text>
                                <Text style={styles.requestService}>{item.servico}</Text>
                                <Text style={styles.requestDistance}>{item.distancia.texto}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={24} color="#B0B0B0" />
                        </TouchableOpacity>
                    ))
                ) : (
                    <Text style={styles.noRequestsText}>Nenhuma solicitação encontrada para sua área.</Text>
                )}
            </View>
            
            <TouchableOpacity style={styles.helpLink}>
                <Text style={styles.helpLinkText}>Preciso de Ajuda!</Text>
            </TouchableOpacity>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F7FF',
    },
    contentContainer: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 50,
        paddingBottom: 20,
    },
    headerLogoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logo: {
        width: 150,
        height: 40,
    },
    profileIconContainer: {
        padding: 5,
    },
    welcomeCard: {
        backgroundColor: '#E0EFFF',
        borderRadius: 15,
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    welcomeTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#06437e',
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    actionButton: {
        backgroundColor: '#FFF',
        borderRadius: 15,
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
        width: '31%',
        borderWidth: 1,
        borderColor: '#D1E5FF',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    actionButtonText: {
        marginTop: 8,
        fontSize: 12,
        color: '#06437e',
        fontWeight: '500',
        textAlign: 'center',
    },
    availabilityContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    availabilityText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    requestsContainer: {
        width: '100%',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    requestCard: {
        backgroundColor: '#FFF',
        borderRadius: 15,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E0EFFF',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    requestProfileImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
    },
    requestInfo: {
        flex: 1,
    },
    requestName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    requestService: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    requestDistance: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    helpLink: {
        alignItems: 'center',
        marginTop: 20,
    },
    helpLinkText: {
        fontSize: 14,
        color: '#06437e',
        fontWeight: 'bold',
    },
    noRequestsText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#666',
    },
});
