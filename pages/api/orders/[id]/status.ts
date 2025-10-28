import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'PATCH, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'ID do pedido é obrigatório'
    })
  }

  try {
    switch (req.method) {
      case 'PATCH':
        await handlePatch(req, res, id)
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

async function handlePatch(req: NextApiRequest, res: NextApiResponse, id: string) {
  const { status } = req.body

  if (!status) {
    return res.status(400).json({
      success: false,
      message: 'Campo obrigatório: status'
    })
  }

  const validStatuses = ['PENDING', 'PREPARING', 'READY', 'DELIVERED']
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Status inválido. Valores aceitos: PENDING, PREPARING, READY, DELIVERED'
    })
  }

  const existingOrder = await prisma.order.findUnique({
    where: { id }
  })

  if (!existingOrder) {
    return res.status(404).json({
      success: false,
      message: 'Pedido não encontrado'
    })
  }

  const updatedOrder = await prisma.order.update({
    where: { id },
    data: { status }
  })

  res.status(200).json({
    success: true,
    data: updatedOrder,
    message: 'Status do pedido atualizado com sucesso'
  })
}
