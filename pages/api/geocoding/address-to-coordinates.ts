import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ success: false, message: 'Método não permitido' })
  }

  try {
    const { address } = req.body

    if (!address || typeof address !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Campo obrigatório: address (string)'
      })
    }

    const geocodedData = await geocodeAddress(address)

    if (!geocodedData) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ADDRESS',
          message: 'Endereço não encontrado ou inválido'
        }
      })
    }

    res.status(200).json({
      success: true,
      data: geocodedData
    })

  } catch (error) {
    console.error('Erro na geocodificação:', error)
    res.status(500).json({ success: false, message: 'Erro interno do servidor' })
  }
}

async function geocodeAddress(address: string) {
  try {
    await new Promise(resolve => setTimeout(resolve, 500))

    const mockData = generateMockGeocodingData(address)

    return mockData
  } catch (error) {
    console.error('Erro na geocodificação:', error)
    return null
  }
}

function generateMockGeocodingData(address: string) {
  const baseLat = -23.5505
  const baseLng = -46.6333
  
  const latVariation = (address.length % 100) / 1000
  const lngVariation = (address.charCodeAt(0) % 100) / 1000
  
  const coordinates = {
    latitude: baseLat + latVariation,
    longitude: baseLng + lngVariation
  }

  const components = extractAddressComponents(address)

  return {
    coordinates,
    formattedAddress: `${components.street}, ${components.number} - ${components.neighborhood}, ${components.city} - ${components.state}, ${components.zipCode}`,
    components
  }
}

function extractAddressComponents(address: string) {
  const streetMatch = address.match(/([A-Za-z\s]+),?\s*(\d+)/)
  const neighborhoodMatch = address.match(/(Vila|Bairro|Distrito)\s+([A-Za-z\s]+)/i)
  const cityMatch = address.match(/(São Paulo|Rio de Janeiro|Belo Horizonte|Salvador|Fortaleza|Brasília|Curitiba|Recife|Porto Alegre|Goiânia|Belém|Guarulhos|Campinas|São Luís|Maceió|Duque de Caxias|Natal|Teresina|Campo Grande|Nova Iguaçu|São Bernardo do Campo|João Pessoa|Santo André|Osasco|Jaboatão dos Guararapes|São José dos Campos|Ribeirão Preto|Uberlândia|Sorocaba|Contagem|Aracaju|Feira de Santana|Cuiabá|Joinville|Aparecida de Goiânia|Londrina|Niterói|Ananindeua|Serra|Campos dos Goytacazes|Vila Velha|Caxias do Sul|Macapá|Diadema|Campo Grande|Mauá|São João de Meriti|Belford Roxo|São Vicente|Jundiaí|Petrolina|Betim|Montes Claros|Carapicuíba|Maringá|Anápolis|Piracicaba|Cariacica|Bauru|Itaquaquecetuba|Franca|Nova Friburgo|Volta Redonda|Blumenau|Petrópolis|Canoas|Barueri|Guarujá|Ribeirão das Neves|Uberaba|Paulista|Caucaia|Santa Maria|Vitória da Conquista|Caruaru|Franco da Rocha|Pindamonhangaba|Itapevi|Praia Grande|Cascavel|Guarulhos|Taboão da Serra|Sumaré|São Caetano do Sul|Várzea Grande|Barra Mansa|Embu das Artes|Viamão|Mogi das Cruzes|Diadema|Suzano|Santa Luzia|Cabo Frio|Itabuna|Marília|Colombo|Americana|São José de Ribamar|Magé|Indaiatuba|Cotia|Itu|São José dos Pinhais|Moji Mirim|São Leopoldo|Palmas|Arapiraca|Rio Branco|Camaçari|Jequié|Ilhéus|Lauro de Freitas|Itajaí|Chapecó|Caxias|Nova Lima|Santa Bárbara d'Oeste|Cachoeiro de Itapemirim|Rio Claro|Maracanaú|Franco da Rocha|Pindamonhangaba|Itapevi|Praia Grande|Cascavel|Guarulhos|Taboão da Serra|Sumaré|São Caetano do Sul|Várzea Grande|Barra Mansa|Embu das Artes|Viamão|Mogi das Cruzes|Diadema|Suzano|Santa Luzia|Cabo Frio|Itabuna|Marília|Colombo|Americana|São José de Ribamar|Magé|Indaiatuba|Cotia|Itu|São José dos Pinhais|Moji Mirim|São Leopoldo|Palmas|Arapiraca|Rio Branco|Camaçari|Jequié|Ilhéus|Lauro de Freitas|Itajaí|Chapecó|Caxias|Nova Lima|Santa Bárbara d'Oeste|Cachoeiro de Itapemirim|Rio Claro|Maracanaú)/i)
  const stateMatch = address.match(/(SP|RJ|MG|BA|CE|DF|PR|PE|RS|GO|PA|SC|MA|AL|PB|ES|MS|RN|PI|MT|AC|SE|RO|TO|AM|RR|AP)/i)
  const zipMatch = address.match(/(\d{5}-?\d{3})/)

  return {
    street: streetMatch ? streetMatch[1].trim() : 'Rua das Flores',
    number: streetMatch ? streetMatch[2] : '123',
    neighborhood: neighborhoodMatch ? neighborhoodMatch[2].trim() : 'Centro',
    city: cityMatch ? cityMatch[0] : 'São Paulo',
    state: stateMatch ? stateMatch[0] : 'SP',
    zipCode: zipMatch ? zipMatch[1] : '01000-000'
  }
}

