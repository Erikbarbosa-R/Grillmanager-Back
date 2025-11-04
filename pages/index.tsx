export default function Home() {
  return (
    <div style={{
      padding: '2rem',
      fontFamily: 'system-ui, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1>🍔 GrillManager API</h1>
      <p>Esta é a API do sistema GrillManager.</p>
      <p>Para acessar os endpoints, use a rota <code>/api</code> seguida do caminho desejado.</p>
      
      <h2>Endpoints disponíveis:</h2>
      <ul>
        <li><code>GET /api/health</code> - Status da API</li>
        <li><code>GET /api/restaurant</code> - Informações do restaurante</li>
        <li><code>GET /api/categories</code> - Listar categorias</li>
        <li><code>GET /api/products</code> - Listar produtos</li>
        <li><code>GET /api/orders</code> - Listar pedidos</li>
      </ul>

      <p style={{ marginTop: '2rem', fontSize: '0.9em', color: '#666' }}>
        Consulte a documentação completa em <code>/docs/API_ROUTES.md</code>
      </p>
    </div>
  )
}

