import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

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
    const { customerAddress, orderValue } = req.body

    if (!customerAddress || !customerAddress.coordinates) {
      return res.status(400).json({
        success: false,
        message: 'Endereço com coordenadas é obrigatório'
      })
    }

    if (!orderValue || typeof orderValue !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Valor do pedido é obrigatório'
      })
    }

    const restaurant = await prisma.restaurant.findFirst()
    
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurante não encontrado'
      })
    }

    const deliverySettings = restaurant.deliverySettings as any || {
      baseFee: 5.00,
      perKmFee: 2.00,
      maxDistance: 15.0,
      freeDeliveryMinOrder: 50.00
    }

    const restaurantCoords = {
      latitude: -23.5505,
      longitude: -46.6333
    }

    const distance = calculateDistance(
      restaurantCoords.latitude,
      restaurantCoords.longitude,
      customerAddress.coordinates.latitude,
      customerAddress.coordinates.longitude
    )

    if (distance > deliverySettings.maxDistance) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'DELIVERY_NOT_AVAILABLE',
          message: 'Entrega não disponível para este endereço',
          details: {
            maxDistance: deliverySettings.maxDistance,
            requestedDistance: distance
          }
        }
      })
    }

    let calculatedFee = deliverySettings.baseFee + (distance * deliverySettings.perKmFee)
    const freeDelivery = orderValue >= deliverySettings.freeDeliveryMinOrder

    if (freeDelivery) {
      calculatedFee = 0
    }

    const estimatedDeliveryTime = `${Math.round(distance * 2 + 15)}-${Math.round(distance * 2 + 25)} min`

    res.status(200).json({
      success: true,
      data: {
        distance: Math.round(distance * 10) / 10,
        baseFee: deliverySettings.baseFee,
        perKmFee: deliverySettings.perKmFee,
        calculatedFee: Math.round(calculatedFee * 100) / 100,
        freeDelivery,
        estimatedDeliveryTime,
        deliveryZone: getDeliveryZone(distance),
        isDeliverable: true
      }
    })

  } catch (error) {
    console.error('Erro no cálculo de taxa:', error)
    res.status(500).json({ success: false, message: 'Erro interno do servidor' })
  }
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

function getDeliveryZone(distance: number): string {
  if (distance <= 2) return 'zone_001'
  if (distance <= 5) return 'zone_002'
  if (distance <= 10) return 'zone_003'
  return 'zone_004'
}

