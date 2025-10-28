import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ success: false, message: 'Método não permitido' })
  }

  try {
    const orders = await prisma.order.findMany({
      where: {
        status: {
          not: 'CANCELLED'
        }
      }
    })

    const totalOrders = orders.length
    const totalRevenue = orders.reduce((sum, order) => {
      const totals = order.totals as any
      return sum + (totals?.total || 0)
    }, 0)

    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    const deliveryOrders = orders.filter(order => {
      const delivery = order.delivery as any
      return delivery?.fee > 0
    })

    const totalDeliveries = deliveryOrders.length
    const averageDistance = deliveryOrders.reduce((sum, order) => {
      const delivery = order.delivery as any
      return sum + (delivery?.distance || 0)
    }, 0) / (totalDeliveries || 1)

    const averageDeliveryFee = deliveryOrders.reduce((sum, order) => {
      const delivery = order.delivery as any
      return sum + (delivery?.fee || 0)
    }, 0) / (totalDeliveries || 1)

    const productStats = new Map()
    
    orders.forEach(order => {
      const items = order.items as any[]
      items.forEach(item => {
        const productId = item.productId
        const quantity = item.quantity || 1
        const price = item.totalPrice || item.unitPrice || 0
        
        if (productStats.has(productId)) {
          const stats = productStats.get(productId)
          stats.orders += quantity
          stats.revenue += price
        } else {
          productStats.set(productId, {
            productId,
            name: item.name || 'Produto',
            orders: quantity,
            revenue: price
          })
        }
      })
    })

    const popularItems = Array.from(productStats.values())
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 10)

    const zoneStats = new Map()
    
    deliveryOrders.forEach(order => {
      const delivery = order.delivery as any
      const zone = delivery?.deliveryZone || 'zone_001'
      const distance = delivery?.distance || 0
      const fee = delivery?.fee || 0
      
      if (zoneStats.has(zone)) {
        const stats = zoneStats.get(zone)
        stats.orders += 1
        stats.totalDistance += distance
        stats.totalFee += fee
      } else {
        zoneStats.set(zone, {
          zone,
          orders: 1,
          totalDistance: distance,
          totalFee: fee
        })
      }
    })

    const deliveryZones = Array.from(zoneStats.values()).map(zone => ({
      zone: zone.zone,
      orders: zone.orders,
      averageDistance: zone.totalDistance / zone.orders,
      averageFee: zone.totalFee / zone.orders
    }))

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100,
        deliveryStats: {
          totalDeliveries,
          averageDistance: Math.round(averageDistance * 10) / 10,
          averageDeliveryFee: Math.round(averageDeliveryFee * 100) / 100
        },
        popularItems,
        deliveryZones
      }
    })

  } catch (error) {
    console.error('Erro na API de analytics:', error)
    res.status(500).json({ success: false, message: 'Erro interno do servidor' })
  }
}


