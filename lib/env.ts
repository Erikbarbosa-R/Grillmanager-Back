// Arquivo de inicialização das variáveis de ambiente
// Este arquivo deve ser importado PRIMEIRO antes de qualquer outro módulo
import path from 'path';

// Carregar o arquivo .env apenas se não estiver em ambiente Next.js
// Next.js carrega .env automaticamente, mas precisamos para comandos do Prisma CLI
// Usar import dinâmico para evitar problemas de build
if (typeof window === 'undefined' && !process.env.NEXT_PHASE) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const dotenv = require('dotenv');
    dotenv.config({ path: path.resolve(process.cwd(), '.env') });
  } catch (error) {
    // Se dotenv não estiver disponível, assumir que Next.js já carregou as variáveis
    // Isso é normal em builds de produção do Next.js
  }
}

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

