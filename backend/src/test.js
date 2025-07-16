import pool from './database/conexao.js';

async function testarConexao() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Conexão OK. Hora do servidor:', res.rows[0].now);
  } catch (err) {
    console.error('Erro na conexão:', err);
  } finally {
    await pool.end();
  }
}

testarConexao();
