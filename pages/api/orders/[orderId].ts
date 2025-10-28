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

  const { orderId } = req.query

  if (!orderId || typeof orderId !== 'string') {
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
      return res.status(404).json({
        success: false,
        message: 'Pedido não encontrado'
      })
    }

    const payment = await prisma.payment.findFirst({
      where: { orderId }
    })

    const formattedOrder = {
      orderId: order.orderId,
      status: order.status.toLowerCase(),
      customer: order.customer as any,
      deliveryAddress: order.deliveryAddress as any,
      items: order.items as any[],
      payment: {
        method: (order.payment as any)?.method || 'pix',
        status: payment?.status?.toLowerCase() || 'pending',
        paidAt: payment?.paidAt?.toISOString() || null
      },
      delivery: {
        ...(order.delivery as any),
        deliveryPerson: {
          name: "Maria Santos",
          phone: "(11) 88888-8888"
        }
      },
      timeline: order.timeline as any[] || [],
      estimatedDeliveryTime: calculateEstimatedDeliveryTime(order)
    }

    res.status(200).json({
      success: true,
      data: formattedOrder
    })

  } catch (error) {
    console.error('Erro ao buscar pedido:', error)
    res.status(500).json({ success: false, message: 'Erro interno do servidor' })
  }
}

function calculateEstimatedDeliveryTime(order: any): string {
  const createdAt = new Date(order.createdAt)
  const delivery = order.delivery as any
  const distance = delivery?.distance || 0
  
  const prepTime = 25
  const deliveryTime = Math.round(distance * 2 + 15)
  
  const totalMinutes = prepTime + deliveryTime
  const estimatedTime = new Date(createdAt.getTime() + totalMinutes * 60000)
  
  return estimatedTime.toISOString()
}


