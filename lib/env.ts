// Arquivo de inicialização das variáveis de ambiente
// Este arquivo deve ser importado PRIMEIRO antes de qualquer outro módulo
import dotenv from 'dotenv';
import path from 'path';

// Carregar o arquivo .env da raiz do projeto
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Exportar função para verificar se as variáveis necessárias estão definidas
export function validateEnv() {
  const required = ['DATABASE_URL'];
  const missing: string[] = [];

  required.forEach(key => {
    if (!process.env[key]) {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    throw new Error(
      `Variáveis de ambiente obrigatórias não encontradas: ${missing.join(', ')}\n` +
      `Certifique-se de que o arquivo .env existe na raiz do projeto e contém essas variáveis.`
    );
  }
}

// Validar apenas em desenvolvimento para ajudar com debug
// Em produção, as variáveis devem estar configuradas no ambiente
if (process.env.NODE_ENV === 'development') {
  try {
    validateEnv();
  } catch (error) {
    console.warn('⚠️  Aviso:', (error as Error).message);
  }
}

