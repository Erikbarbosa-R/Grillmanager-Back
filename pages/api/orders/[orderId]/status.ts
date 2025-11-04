import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'PATCH, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  const { orderId } = req.query

  if (!orderId || typeof orderId !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'ID do pedido é obrigatório'
    })
  }

  try {
    switch (req.method) {
      case 'PATCH':
        await handlePatch(req, res, orderId)
        break
      default:
        res.setHeader('Allow', ['PATCH'])
        res.status(405).json({ success: false, message: 'Método não permitido' })
    }
  } catch (error) {
    console.error('Erro na API de status do pedido:', error)
    res.status(500).json({ success: false, message: 'Erro interno do servidor' })
  }
}

async function handlePatch(req: NextApiRequest, res: NextApiResponse, orderId: string) {
  const { status } = req.body

  if (!status) {
    return res.status(400).json({
      success: false,
      message: 'Campo obrigatório: status'
    })
  }

  const validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Status inválido. Valores aceitos: PENDING, CONFIRMED, PREPARING, READY, OUT_FOR_DELIVERY, DELIVERED, CANCELLED'
    })
  }

  const existingOrder = await prisma.order.findUnique({
    where: { orderId }
  })

  if (!existingOrder) {
    return res.status(404).json({
      success: false,
      message: 'Pedido não encontrado'
    })
  }

  interface TimelineEntry {
    status: string
    timestamp: string
    message: string
  }

  const timeline = ((existingOrder.timeline as unknown) as TimelineEntry[] | null) || []
  timeline.push({
    status: status,
    timestamp: new Date().toISOString(),
    message: getStatusMessage(status)
  })

  const updatedOrder = await prisma.order.update({
    where: { orderId },
    data: { 
      status,
      timeline: timeline as Prisma.InputJsonValue
    }
  })

  res.status(200).json({
    success: true,
    data: updatedOrder,
    message: 'Status do pedido atualizado com sucesso'
  })
}

function getStatusMessage(status: string): string {
  const messages: { [key: string]: string } = {
    'PENDING': 'Pedido recebido',
    'CONFIRMED': 'Pedido confirmado',
    'PREPARING': 'Pedido em preparação',
    'READY': 'Pedido pronto para retirada',
    'OUT_FOR_DELIVERY': 'Pedido saiu para entrega',
    'DELIVERED': 'Pedido entregue',
    'CANCELLED': 'Pedido cancelado'
  }
  return messages[status] || 'Status atualizado'
}

