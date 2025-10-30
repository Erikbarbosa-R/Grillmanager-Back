## API GrillManager - Rotas (Next.js)

Base: `/api`

### Saúde
- GET `/health`: Status da API (uptime, timestamp, env).

Exemplo:
```bash
curl -s https://SEU_HOST/api/health
```

### Restaurante
- GET `/restaurant`: Retorna informações do restaurante (cria defaults se vazio).
- PUT `/restaurant`: Atualiza nome, descrição, endereço, contato, logo e tema.
  - body: `{ name: string, description?, address?, phone?, email?, logo?, theme? }`

Exemplo PUT:
```bash
curl -X PUT https://SEU_HOST/api/restaurant \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "GrillManager",
    "description": "Melhor da cidade",
    "address": {"street":"Rua X","number":"123"},
    "phone": "(11) 99999-9999",
    "email": "contato@exemplo.com"
  }'
```

### Categorias
- GET `/categories`: Lista categorias.
- POST `/categories`: Cria categoria.
  - body: `{ name: string, description?, icon? }`

Exemplo POST:
```bash
curl -X POST https://SEU_HOST/api/categories \
  -H 'Content-Type: application/json' \
  -d '{"name":"Bebidas","description":"Drinks"}'
```
- GET `/categories/[id]`: Detalhe da categoria.
- PUT `/categories/[id]`: Atualiza campos informados.
  - body: `{ name?, description?, icon? }`
- DELETE `/categories/[id]`: Remove categoria (bloqueia se houver produtos associados).

### Produtos
- GET `/products`: Lista produtos.
- POST `/products`: Cria produto.
  - body: `{ name: string, description: string, price: number|string, category: string, image?, popular?, available? }`

Exemplo POST:
```bash
curl -X POST https://SEU_HOST/api/products \
  -H 'Content-Type: application/json' \
  -d '{
    "name":"Coca-Cola 350ml",
    "description":"Refrigerante",
    "price":5.9,
    "category":"Bebidas"
  }'
```
- GET `/products/[id]`: Detalhe do produto.
- PUT `/products/[id]`: Atualiza campos informados.
  - body: `{ name?, description?, price?, category?, image?, popular?, available? }`
- DELETE `/products/[id]`: Remove produto.

### Pedidos
- GET `/orders`: Lista pedidos.
- POST `/orders`: Cria pedido.
  - body: `{ customer: { name: string, ... }, deliveryAddress: { coordinates: { latitude, longitude }, ... }, items: [{ productId, name, quantity, unitPrice, ... }], payment?, delivery?, totals: { total: number, ... }, notes? }`

Exemplo POST:
```bash
curl -X POST https://SEU_HOST/api/orders \
  -H 'Content-Type: application/json' \
  -d '{
    "customer": {"name":"João"},
    "deliveryAddress": {"coordinates": {"latitude": -23.55, "longitude": -46.63}},
    "items": [{"productId":"ID","name":"Coca","quantity":1,"unitPrice":5.9}],
    "totals": {"total": 5.9}
  }'
```
- GET `/orders/[orderId]`: Detalhe do pedido + pagamento + entrega + ETA.
- PATCH `/orders/[orderId]/status`: Atualiza status com timeline.
  - body: `{ status: 'PENDING'|'CONFIRMED'|'PREPARING'|'READY'|'OUT_FOR_DELIVERY'|'DELIVERED'|'CANCELLED' }`

### Pagamentos (PIX)
- POST `/payments/pix/generate`: Gera código/QR PIX para um pedido.
  - body: `{ orderId: string, amount: number, description: string }`
  - retorno: `{ pixCode, qrCode (dataURL), expiresAt, amount }`
- POST `/payments/pix/verify`: Verifica/atualiza status de pagamento PIX.
  - body: `{ orderId: string, transactionId: string }`
  - retorno: `{ paid: boolean, paidAt?, transactionId, amount }`

### Entrega
- POST `/delivery/calculate-fee`: Calcula taxa/tempo de entrega.
  - body: `{ customerAddress: { coordinates: { latitude: number, longitude: number }, ... }, orderValue: number }`
  - retorno: `{ distance, baseFee, perKmFee, calculatedFee, freeDelivery, estimatedDeliveryTime, deliveryZone, isDeliverable }`

### Geocoding (mock)
- POST `/geocoding/address-to-coordinates`: Converte endereço em coordenadas.
  - body: `{ address: string }`
  - retorno: `{ coordinates: { latitude, longitude }, formattedAddress, components }`

### Seções Promocionais
- GET `/promotional-sections`: Lista seções ativas com produtos detalhados.
- POST `/promotional-sections`: Cria seção.
  - body: `{ title: string, description?, displayOrder?, active?, products: [{ productId: string, displayOrder: number }] }`
- GET `/promotional-sections/[id]`: Detalhe da seção (produtos detalhados).
- PUT `/promotional-sections/[id]`: Atualiza campos informados.
  - body: `{ title?, description?, displayOrder?, active?, products? }`
- DELETE `/promotional-sections/[id]`: Remove seção.

### Configurações
- GET `/settings`: Retorna configurações (merge de defaults + persistidas).
- POST `/settings`: Cria configuração nova.
  - body: `{ key: string, value: any }`
- PUT `/settings`: Atualiza configuração existente.
  - body: `{ key: string, value: any }`

### Backup/Importação
- GET `/import`: Exporta snapshot completo (produtos, categorias, restaurante, pedidos, seções).
- POST `/import`: Importa snapshot (sobrescreve dados).
  - body: `{ products: any[], categories: any[], restaurantInfo: any, orders: any[], promotionalSections?: any[] }`
- GET `/export`: Exporta snapshot completo (equivalente ao GET `/import`).

### Reset (dev)
- POST `/reset`: Zera e recria dados padrão (categorias, produtos, restaurante).

Observações gerais
- Todas as rotas aceitam `OPTIONS` para CORS preflight.
- Respostas seguem `{ success: boolean, data?, message?, error? }`.
- Autenticação: não exigida no código atual (ajustar quando necessário).


