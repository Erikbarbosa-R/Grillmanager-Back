// Importar env primeiro para garantir que as variáveis sejam carregadas
import './env';

export const DATABASE_URL = process.env.DATABASE_URL || "postgresql://username:password@localhost:5432/grillmanager?schema=public";

export const API_CONFIG = {
  PORT: 3001,
  CORS_ORIGIN: "*",
  BASE_URL: "http://localhost:3001/api"
};
