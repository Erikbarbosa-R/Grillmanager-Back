// Importar env primeiro para garantir que as variáveis sejam carregadas
import './env';

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nodeEnv = (globalThis as any).process?.env?.NODE_ENV
if (nodeEnv !== 'production') {
  globalForPrisma.prisma = prisma
}
