import { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthContext } from '../context/AuthContext';
import { IP_DO_SERVIDOR } from '../config/api_config';

export default function CompletarCadastro() {
  const { user, login } = useContext(AuthContext);
  const [cep, setCep] = useState(user?.cep || '');
  const [numero, setNumero] = useState(user?.numero || '');
  const router = useRouter();

  const handleSave = async () => {
    try {
      const res = await fetch(`${IP_DO_SERVIDOR}/clientes/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cep, numero }),
      });
      if (res.ok) {
        const updated = await res.json();
        login(updated.data); // atualiza contexto
        router.replace('/home_cliente');
      } else {
        console.error('Erro ao salvar endereço');
      }
    } catch (e) {
      console.error('Erro de rede:', e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Complete seu cadastro</Text>
      <TextInput value={cep} onChangeText={setCep} placeholder="CEP" style={styles.input} />
      <TextInput value={numero} onChangeText={setNumero} placeholder="Número" style={styles.input} />
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Salvar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 15 },
  button: { backgroundColor: '#4894DB', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold' },
});
