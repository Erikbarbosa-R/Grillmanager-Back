import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { setCorsHeaders } from '@/lib/withCors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  setCorsHeaders(res)

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'GET') {
    setCorsHeaders(res)
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ success: false, message: 'Método não permitido' })
  }

  const { orderId } = req.query

  if (!orderId || typeof orderId !== 'string') {
    setCorsHeaders(res)
    return res.status(400).json({
      success: false,
      message: 'ID do pedido é obrigatório'
    })
  }

  try {
    const order = await prisma.order.findUnique({
      where: { orderId }
    })

    if (!order) {
      setCorsHeaders(res)
      return res.status(404).json({
        success: false,
        message: 'Pedido não encontrado'
      })
    }

    const payment = await prisma.payment.findFirst({
      where: { orderId }
    })

    interface CustomerInfo {
      name?: string
      phone?: string
      email?: string
    }

    interface DeliveryAddress {
      street?: string
      number?: string
      neighborhood?: string
      city?: string
      state?: string
      zipCode?: string
      coordinates?: {
        latitude: number
        longitude: number
      }
    }

    interface OrderItem {
      productId: string
      name: string
      quantity: number
      unitPrice: number
      totalPrice?: number
    }

    interface PaymentInfo {
      method?: string
    }

    interface DeliveryInfo {
      fee?: number
      distance?: number
      deliveryZone?: string
      [key: string]: unknown
    }

    interface TimelineEntry {
      status: string
      timestamp: string
      message: string
    }

    const formattedOrder = {
      orderId: order.orderId,
      status: order.status.toLowerCase(),
      customer: order.customer as CustomerInfo,
      deliveryAddress: order.deliveryAddress as DeliveryAddress,
      items: order.items as OrderItem[],
      payment: {
        method: (order.payment as PaymentInfo | null)?.method || 'pix',
        status: payment?.status?.toLowerCase() || 'pending',
        paidAt: payment?.paidAt?.toISOString() || null
      },
      delivery: {
        ...(order.delivery as DeliveryInfo | null),
        deliveryPerson: {
          name: "Maria Santos",
          phone: "(11) 88888-8888"
        }
      },
      timeline: (order.timeline as TimelineEntry[] | null) || [],
      estimatedDeliveryTime: calculateEstimatedDeliveryTime(order)
    }

    setCorsHeaders(res)
    res.status(200).json({
      success: true,
      data: formattedOrder
    })

  } catch (error) {
    console.error('Erro ao buscar pedido:', error)
    setCorsHeaders(res)
    res.status(500).json({ success: false, message: 'Erro interno do servidor' })
  }
}

interface OrderForCalculation {
  createdAt: Date | string
  delivery?: {
    distance?: number
  } | null
}

function calculateEstimatedDeliveryTime(order: OrderForCalculation): string {
  const createdAt = new Date(order.createdAt)
  const delivery = order.delivery as { distance?: number } | null
  const distance = delivery?.distance || 0
  
  const prepTime = 25
  const deliveryTime = Math.round(distance * 2 + 15)
  
  const totalMinutes = prepTime + deliveryTime
  const estimatedTime = new Date(createdAt.getTime() + totalMinutes * 60000)
  
  return estimatedTime.toISOString()
}


