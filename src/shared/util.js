export const PI = 3.141592

export function aleatorio(){
    return Math.random()
}

export function isNomeCompleto(nome){
    return nome.split(" ").length>1 ? true : false
}

export function isEmail(email){
    const reg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const ok = email.search(reg)
    return ok==-1?false:true
}

export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result.split(',')[1]); // Remove o prefixo "data:*/*;base64,"
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(blob);
  });
}

const objeto = {objeto:"qualquer"}

export default objeto
