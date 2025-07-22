import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Layout from './Layout';
import { styles, COLORS } from './styles';

const logo = require('../assets/images/logo-Jobconnect.png');

export default function WelcomeScreen() {
  const [selectedRole, setSelectedRole] = useState(null);

  return (
    <Layout>
      <Image source={logo} style={styles.logo} />
      <Text style={styles.title}>Bem vindo</Text>

      <TouchableOpacity
        style={[styles.selectButton, selectedRole === 'cliente' && styles.selectedButton]}
        onPress={() => setSelectedRole('cliente')}
      >
        <Ionicons name="person" size={24} color={COLORS.primary} />
        <Text style={styles.selectButtonText}>Sou Cliente</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.selectButton, selectedRole === 'prestador' && styles.selectedButton]}
        onPress={() => setSelectedRole('prestador')}
      >
        <Ionicons name="construct" size={24} color={COLORS.primary} />
        <Text style={styles.selectButtonText}>Sou Prestador</Text>
      </TouchableOpacity>

      <Text style={styles.loginText}>
        Já tem uma conta? <Text style={styles.loginLink}>Faça Login</Text>
      </Text>

      <TouchableOpacity style={styles.startButton}>
        <Text style={styles.startButtonText}>Começar</Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>
        "JobConnect – Conectando serviços, facilitando sua vida!"
      </Text>
    </Layout>
  );
}
