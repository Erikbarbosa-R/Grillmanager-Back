import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  try {
    switch (req.method) {
      case 'GET':
        await handleGet(req, res)
        break
      case 'POST':
        await handlePost(req, res)
        break
      default:
        res.setHeader('Allow', ['GET', 'POST'])
        res.status(405).json({ success: false, message: 'Método não permitido' })
    }
  } catch (error) {
    console.error('Erro na API de pedidos:', error)
    res.status(500).json({ success: false, message: 'Erro interno do servidor' })
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' }
  })

  res.status(200).json({
    success: true,
    data: orders
  })
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { 
    customer, 
    deliveryAddress, 
    items, 
    payment, 
    delivery, 
    totals, 
    notes 
  } = req.body

  if (!customer || !customer.name) {
    return res.status(400).json({
      success: false,
      message: 'Campo obrigatório: customer.name'
    })
  }

  if (!deliveryAddress || !deliveryAddress.coordinates) {
    return res.status(400).json({
      success: false,
      message: 'Campo obrigatório: deliveryAddress.coordinates'
    })
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Campo obrigatório: items (array não vazio)'
    })
  }

  if (!totals || !totals.total) {
    return res.status(400).json({
      success: false,
      message: 'Campo obrigatório: totals.total'
    })
  }

  for (const item of items) {
    if (!item.productId || !item.name || !item.quantity || !item.unitPrice) {
      return res.status(400).json({
        success: false,
        message: 'Cada item deve ter: productId, name, quantity, unitPrice'
      })
    }
  }

  const orderId = generateOrderId()

  const timeline = [
    {
      status: 'PENDING',
      timestamp: new Date().toISOString(),
      message: 'Pedido recebido'
    }
  ]

  const order = await prisma.order.create({
    data: {
      orderId,
      items: items as unknown,
      customer: customer as unknown,
      deliveryAddress: deliveryAddress as unknown,
      payment: (payment || { method: 'pix' }) as unknown,
      delivery: (delivery || { fee: 0, distance: 0 }) as unknown,
      totals: totals as unknown,
      notes: notes || null,
      status: 'PENDING',
      timeline: timeline as unknown
    }
  })

  res.status(201).json({
    success: true,
    data: {
      orderId: order.orderId,
      status: order.status,
      estimatedPrepTime: "25-30 min",
      estimatedDeliveryTime: delivery?.estimatedTime || "35-45 min",
      payment: {
        method: payment?.method || 'pix',
        pixCode: null, // Será gerado separadamente
        qrCode: null,
        expiresAt: null
      },
      tracking: {
        status: order.status,
        statusHistory: timeline
      }
    },
    message: 'Pedido criado com sucesso'
  })
}

function generateOrderId(): string {
  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  
  return `ORD-${dateStr}-${random}`
}
