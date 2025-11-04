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
    const { orderId, transactionId } = req.body

    if (!orderId || !transactionId) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: orderId, transactionId'
      })
    }

    const payment = await prisma.payment.findFirst({
      where: {
        orderId,
        transactionId
      }
    })

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pagamento não encontrado'
      })
    }

    if (payment.status === 'PAID') {
      return res.status(200).json({
        success: true,
        data: {
          paid: true,
          paidAt: payment.paidAt?.toISOString(),
          transactionId: payment.transactionId,
          amount: payment.amount
        }
      })
    }

    if (payment.expiresAt && payment.expiresAt < new Date()) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'EXPIRED' }
      })

      return res.status(400).json({
        success: false,
        message: 'Pagamento expirado'
      })
    }

    const isPaid = await verifyPixPayment(transactionId)

    if (isPaid) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'PAID',
          paidAt: new Date()
        }
      })

      await prisma.order.update({
        where: { orderId },
        data: { status: 'CONFIRMED' }
      })

      res.status(200).json({
        success: true,
        data: {
          paid: true,
          paidAt: new Date().toISOString(),
          transactionId: payment.transactionId,
          amount: payment.amount
        }
      })
    } else {
      res.status(200).json({
        success: true,
        data: {
          paid: false,
          paidAt: null,
          transactionId: payment.transactionId,
          amount: payment.amount
        }
      })
    }

  } catch (error) {
    console.error('Erro ao verificar PIX:', error)
    res.status(500).json({ success: false, message: 'Erro interno do servidor' })
  }
}

async function verifyPixPayment(_transactionId: string): Promise<boolean> {
  return Math.random() > 0.3
}

