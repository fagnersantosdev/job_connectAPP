export const PI = 3.141592;

export function aleatorio() {
  return Math.random();
}

export function isNomeCompleto(nome) {
  const partes = nome.trim().split(" ");
  return partes.length >= 2 && partes.every(p => p.length > 1);
}

export function isEmail(email) {
  const reg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return reg.test(email);
}

// Converte um blob (ex: imagem) em uma string base64 sem o prefixo "data:image/png;base64,"
export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(blob);
  });
}

const objeto = { objeto: "qualquer" };

export default objeto;
