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
    const { orderId, amount, description } = req.body

    if (!orderId || !amount || !description) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: orderId, amount, description'
      })
    }

    const order = await prisma.order.findUnique({
      where: { orderId }
    })

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Pedido não encontrado'
      })
    }

    const pixCode = generatePixCode(amount)
    const qrCode = generateQRCode(pixCode)
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000)

    await prisma.payment.create({
      data: {
        orderId,
        method: 'pix',
        amount: parseFloat(amount),
        pixCode,
        qrCode,
        expiresAt,
        status: 'PENDING'
      }
    })

    res.status(200).json({
      success: true,
      data: {
        pixCode,
        qrCode,
        expiresAt: expiresAt.toISOString(),
        amount: parseFloat(amount)
      }
    })

  } catch (error) {
    console.error('Erro ao gerar PIX:', error)
    res.status(500).json({ success: false, message: 'Erro interno do servidor' })
  }
}

function generatePixCode(amount: number): string {
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substring(2, 15)
  
  return `00020126580014br.gov.bcb.pix0136${randomId}520400005303986540${amount.toFixed(2)}5802BR5913BOTECO MAMINHA6008SAO PAULO62070503***6304${timestamp.toString().slice(-4)}`
}

function generateQRCode(pixCode: string): string {
  const base64Data = Buffer.from(pixCode).toString('base64')
  return `data:image/png;base64,${base64Data}`
}

