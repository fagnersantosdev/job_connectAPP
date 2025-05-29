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

const objeto = {objeto:"qualquer"}

export default objeto
