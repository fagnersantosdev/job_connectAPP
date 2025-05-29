import produtos from "../database/produtos.js";


export const getAll = async ()=>{
    return produtos
}
export const getById = async (id) =>{
    return produtos.find(produtos=>{produtos.id = id})
}
export const create = async (obj) =>{} 
export const update = async (id, obj)=>{} 
export const del = async (id) =>{} 
