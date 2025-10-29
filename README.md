# 🍖 GrillManager API

API RESTful para sistema de gerenciamento de restaurante e delivery, desenvolvida com Next.js e Prisma. Esta aplicação fornece endpoints completos para gestão de produtos, pedidos, pagamentos PIX, entregas, categorias e análise de dados.

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias](#tecnologias)
- [Funcionalidades](#funcionalidades)
- [Estrutura da API](#estrutura-da-api)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Executando o Projeto](#executando-o-projeto)
- [Endpoints da API](#endpoints-da-api)
- [Modelo de Dados](#modelo-de-dados)
- [Deploy](#deploy)
- [Scripts Disponíveis](#scripts-disponíveis)

## 🎯 Sobre o Projeto

O **GrillManager API** é uma solução completa backend para restaurantes que oferecem serviços de delivery. O sistema permite gerenciar produtos, processar pedidos online, calcular taxas de entrega, processar pagamentos via PIX, e fornecer análises e estatísticas de negócio.

### Principais Características

- ✅ Gestão completa de produtos e categorias
- ✅ Sistema de pedidos com rastreamento em tempo real
- ✅ Cálculo automático de taxas de entrega baseado em distância
- ✅ Geração de códigos PIX para pagamento
- ✅ Sistema de geocodificação de endereços
- ✅ Análises e relatórios de vendas
- ✅ Configuração personalizada do restaurante
- ✅ Seções promocionais de produtos

## 🛠 Tecnologias

- **[Next.js 14](https://nextjs.org/)** - Framework React para API Routes
- **[TypeScript](https://www.typescriptlang.org/)** - Tipagem estática
- **[Prisma](https://www.prisma.io/)** - ORM para banco de dados
- **[PostgreSQL](https://www.postgresql.org/)** - Banco de dados relacional
- **[Node.js](https://nodejs.org/)** - Runtime JavaScript (>=18)

## ⚡ Funcionalidades

### Gestão de Produtos
- CRUD completo de produtos
- Categorização de produtos
- Controle de disponibilidade
- Produtos populares em destaque
- Suporte a imagens

### Sistema de Pedidos
- Criação e gestão de pedidos
- Rastreamento de status do pedido:
  - `PENDING` - Pendente
  - `CONFIRMED` - Confirmado
  - `PREPARING` - Em preparação
  - `READY` - Pronto
  - `OUT_FOR_DELIVERY` - Saiu para entrega
  - `DELIVERED` - Entregue
  - `CANCELLED` - Cancelado
- Timeline de eventos do pedido
- Histórico completo de pedidos

### Pagamentos PIX
- Geração automática de código PIX
- QR Code para pagamento
- Validação de pagamentos
- Controle de expiração (30 minutos)
- Status de pagamento

### Cálculo de Entrega
- Cálculo automático baseado em distância geográfica
- Taxa fixa + taxa por quilômetro
- Entrega grátis acima de valor mínimo
- Validação de zona de entrega
- Estimativa de tempo de entrega

### Geocodificação
- Conversão de endereços em coordenadas
- Integração com sistemas de geolocalização

### Analytics e Relatórios
- Total de pedidos e receita
- Valor médio por pedido
- Estatísticas de entregas
- Produtos mais vendidos
- Análise por zonas de entrega

### Configuração do Restaurante
- Informações do restaurante (nome, descrição, endereço)
- Horários de funcionamento
- Configurações de entrega
- Personalização de cores do tema
- Status de abertura/fechamento

### Seções Promocionais
- Criação de seções promocionais
- Organização por ordem de exibição
- Produtos em destaque

## 📁 Estrutura da API

```
pages/api/
├── analytics/
│   └── orders.ts          # Relatórios e análises
├── categories/
│   ├── [id].ts           # CRUD de categorias
│   └── index.ts
├── delivery/
│   └── calculate-fee.ts  # Cálculo de taxas de entrega
├── geocoding/
│   └── address-to-coordinates.ts
├── orders/
│   ├── [id]/
│   │   └── status.ts     # Atualização de status
│   ├── [orderId].ts      # Detalhes do pedido
│   └── index.ts          # Listagem e criação
├── payments/
│   └── pix/
│       ├── generate.ts   # Geração de PIX
│       └── verify.ts     # Verificação de pagamento
├── products/
│   ├── [id].ts           # CRUD de produtos
│   └── index.ts
├── promotional-sections/
│   ├── [id].ts
│   └── index.ts
├── restaurant/
│   └── index.ts          # Configurações do restaurante
├── settings.ts            # Configurações gerais
├── export.ts              # Exportação de dados
├── import.ts              # Importação de dados
└── health.ts              # Health check
```

## 📋 Pré-requisitos

Antes de começar, você precisa ter instalado:

- **Node.js** >= 18
- **npm** ou **yarn**
- **PostgreSQL** (local ou remoto)
- **Git**

## 🚀 Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/Erikbarbosa-R/Grillmanager-Back.git
cd Grillmanager-Back
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/grillmanager?schema=public"
NODE_ENV="development"
PORT=3001
```

4. **Configure o banco de dados**

Execute as migrações do Prisma:

```bash
npx prisma migrate dev
```

Ou se já tiver o banco configurado:

```bash
npx prisma db push
```

5. **Gere o Prisma Client**
```bash
npx prisma generate
```

## ⚙️ Configuração

### Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `DATABASE_URL` | URL de conexão do PostgreSQL | Obrigatório |
| `NODE_ENV` | Ambiente de execução | `development` |
| `PORT` | Porta do servidor | `3001` |

### Configuração do Banco de Dados

O schema do banco está definido em `prisma/schema.prisma`. As principais entidades são:

- **Product** - Produtos do cardápio
- **Category** - Categorias de produtos
- **Order** - Pedidos
- **Payment** - Pagamentos
- **Restaurant** - Configurações do restaurante
- **PromotionalSection** - Seções promocionais
- **Settings** - Configurações gerais

## 🏃 Executando o Projeto

### Modo Desenvolvimento

```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3001`

### Modo Produção

```bash
npm run build
npm start
```

### Prisma Studio (Visualização do Banco)

```bash
npm run db:studio
```

Acesse `http://localhost:5555` para visualizar e editar dados diretamente no banco.

## 📡 Endpoints da API

### Produtos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/products` | Lista todos os produtos |
| POST | `/api/products` | Cria um novo produto |
| GET | `/api/products/[id]` | Busca um produto específico |
| PUT | `/api/products/[id]` | Atualiza um produto |
| DELETE | `/api/products/[id]` | Remove um produto |

### Pedidos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/orders` | Lista todos os pedidos |
| POST | `/api/orders` | Cria um novo pedido |
| GET | `/api/orders/[orderId]` | Busca um pedido específico |
| PATCH | `/api/orders/[id]/status` | Atualiza status do pedido |

### Pagamentos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/payments/pix/generate` | Gera código PIX |
| POST | `/api/payments/pix/verify` | Verifica pagamento PIX |

### Entrega

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/delivery/calculate-fee` | Calcula taxa de entrega |

### Restaurante

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/restaurant` | Obtém configurações do restaurante |
| PUT | `/api/restaurant` | Atualiza configurações do restaurante |

### Analytics

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/analytics/orders` | Relatórios e análises de pedidos |

### Categorias

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/categories` | Lista categorias |
| POST | `/api/categories` | Cria categoria |
| GET | `/api/categories/[id]` | Busca categoria |
| PUT | `/api/categories/[id]` | Atualiza categoria |
| DELETE | `/api/categories/[id]` | Remove categoria |

### Seções Promocionais

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/promotional-sections` | Lista seções promocionais |
| POST | `/api/promotional-sections` | Cria seção promocional |
| GET | `/api/promotional-sections/[id]` | Busca seção |
| PUT | `/api/promotional-sections/[id]` | Atualiza seção |
| DELETE | `/api/promotional-sections/[id]` | Remove seção |

### Outros

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/health` | Health check da API |
| GET | `/api/geocoding/address-to-coordinates` | Converte endereço em coordenadas |
| GET | `/api/export` | Exporta dados |
| POST | `/api/import` | Importa dados |

## 🗄️ Modelo de Dados

### Order Status

```typescript
enum OrderStatus {
  PENDING              // Pendente
  CONFIRMED            // Confirmado
  PREPARING            // Em preparação
  READY                // Pronto
  OUT_FOR_DELIVERY     // Saiu para entrega
  DELIVERED            // Entregue
  CANCELLED            // Cancelado
}
```

### Payment Status

```typescript
enum PaymentStatus {
  PENDING              // Pendente
  PAID                 // Pago
  FAILED               // Falhou
  EXPIRED              // Expirado
  CANCELLED            // Cancelado
}
```

## 🚢 Deploy

O projeto está configurado para deploy em múltiplas plataformas:

### Vercel

O arquivo `vercel.json` já está configurado. Apenas conecte seu repositório à Vercel.

### Railway

Configure o arquivo `railway.toml` e conecte seu repositório.

### Render

O arquivo `render.yaml` contém a configuração necessária.

### Docker

```bash
docker build -t grillmanager-api .
docker-compose up
```

## 📜 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento (porta 3001) |
| `npm run build` | Compila o projeto para produção |
| `npm start` | Inicia servidor de produção |
| `npm run lint` | Executa o linter |
| `npm run db:generate` | Gera o Prisma Client |
| `npm run db:push` | Aplica alterações do schema ao banco |
| `npm run db:migrate` | Cria nova migração |
| `npm run db:studio` | Abre Prisma Studio |

## 📝 Exemplo de Uso

### Criar um Pedido

```javascript
const response = await fetch('http://localhost:3001/api/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    customer: {
      name: 'João Silva',
      phone: '(11) 99999-9999'
    },
    deliveryAddress: {
      street: 'Rua Exemplo',
      number: '123',
      coordinates: {
        latitude: -23.5505,
        longitude: -46.6333
      }
    },
    items: [
      {
        productId: 'prod_123',
        name: 'Hamburguer',
        quantity: 2,
        unitPrice: 25.00,
        totalPrice: 50.00
      }
    ],
    totals: {
      subtotal: 50.00,
      deliveryFee: 5.00,
      total: 55.00
    }
  })
});
```

### Gerar PIX

```javascript
const response = await fetch('http://localhost:3001/api/payments/pix/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    orderId: 'ORD-20240101-123',
    amount: 55.00,
    description: 'Pedido #ORD-20240101-123'
  })
});
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

## 📄 Licença

Este projeto é privado e de uso interno.

---

Desenvolvido com ❤️ para gerenciamento de restaurantes

