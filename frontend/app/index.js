import { Redirect } from 'expo-router';

// Este arquivo é o ponto de entrada do aplicativo (rota 'index')
// Ele imediatamente redireciona para a tela de 'boas_vindas'.
export default function Index() {
  return <Redirect href="/boas_vindas" />;
}
