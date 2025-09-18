
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  Picker
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function AdvancedUserSettingsScreen() {
  // Dados do usuário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profileImage, setProfileImage] = useState(null);

  // Preferências
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [privacyPublicProfile, setPrivacyPublicProfile] = useState(true);
  const [language, setLanguage] = useState('pt');

  // Upload de imagem
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  // Validação simples
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => password.length >= 6;

  // Salvar configurações (simulação)
  const handleSave = () => {
    if (!validateEmail(email)) {
      Alert.alert('Erro', 'Por favor, insira um email válido.');
      return;
    }
    if (password && !validatePassword(password)) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    // Aqui você poderia enviar para backend via API
    Alert.alert(
      'Configurações salvas',
      `Nome: ${name}\nEmail: ${email}\nTema: ${darkMode ? 'Escuro' : 'Claro'}\nNotificações: ${notifications ? 'Ativadas' : 'Desativadas'}\nPerfil Público: ${privacyPublicProfile ? 'Sim' : 'Não'}\nIdioma: ${language === 'pt' ? 'Português' : 'Inglês'}`
    );
  };

  const themeStyles = darkMode ? darkStyles : lightStyles;

  return (
    <ScrollView style={[styles.container, themeStyles.container]}>
      <Text style={[styles.title, themeStyles.text]}>Configurações Avançadas</Text>

      {/* Foto de Perfil */}
      <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
        ) : (
          <Text style={themeStyles.text}>Adicionar Foto de Perfil</Text>
        )}
      </TouchableOpacity>

      {/* Nome */}
      <Text style={[styles.label, themeStyles.text]}>Nome</Text>
      <TextInput
        style={[styles.input, themeStyles.input]}
        value={name}
        onChangeText={setName}
        placeholder="Digite seu nome"
        placeholderTextColor={darkMode ? '#aaa' : '#888'}
      />

      {/* Email */}
      <Text style={[styles.label, themeStyles.text]}>Email</Text>
      <TextInput
        style={[styles.input, themeStyles.input]}
        value={email}
        onChangeText={setEmail}
        placeholder="Digite seu email"
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor={darkMode ? '#aaa' : '#888'}
      />

      {/* Senha */}
      <Text style={[styles.label, themeStyles.text]}>Senha</Text>
      <TextInput
        style={[styles.input, themeStyles.input]}
        value={password}
        onChangeText={setPassword}
        placeholder="Digite sua nova senha"
        secureTextEntry
        placeholderTextColor={darkMode ? '#aaa' : '#888'}
      />

      {/* Tema Escuro */}
      <View style={styles.switchContainer}>
        <Text style={[styles.label, themeStyles.text]}>Modo Escuro</Text>
        <Switch value={darkMode} onValueChange={setDarkMode} />
      </View>

      {/* Notificações */}
      <View style={styles.switchContainer}>
        <Text style={[styles.label, themeStyles.text]}>Notificações</Text>
        <Switch value={notifications} onValueChange={setNotifications} />
      </View>

      {/* Privacidade */}
      <View style={styles.switchContainer}>
        <Text style={[styles.label, themeStyles.text]}>Perfil Público</Text>
        <Switch value={privacyPublicProfile} onValueChange={setPrivacyPublicProfile} />
      </View>

      {/* Idioma */}
      <Text style={[styles.label, themeStyles.text]}>Idioma</Text>
      <View style={[styles.pickerContainer, themeStyles.input]}>
        <Picker
          selectedValue={language}
          onValueChange={(itemValue) => setLanguage(itemValue)}
          style={[themeStyles.text, { width: '100%' }]}
        >
          <Picker.Item label="Português" value="pt" />
          <Picker.Item label="Inglês" value="en" />
        </Picker>
      </View>

      {/* Botão Salvar */}
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Salvar Configurações</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 16, marginVertical: 10 },
  input: { borderWidth: 1, padding: 12, borderRadius: 8 },
  switchContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 15 },
  button: { backgroundColor: '#0066FF', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 30, marginBottom: 20 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  imageContainer: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#ddd', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 20, overflow: 'hidden' },
  profileImage: { width: '100%', height: '100%' },
  pickerContainer: { borderWidth: 1, borderRadius: 8, marginVertical: 10 },
});

// Tema Claro
const lightStyles = StyleSheet.create({
  container: { backgroundColor: '#fff' },
  text: { color: '#000' },
  input: { borderColor: '#ccc', color: '#000', backgroundColor: '#f8f8f8' },
});

// Tema Escuro
const darkStyles = StyleSheet.create({
  container: { backgroundColor: '#121212' },
  text: { color: '#fff' },
  input: { borderColor: '#555', color: '#fff', backgroundColor: '#1e1e1e' },
});
