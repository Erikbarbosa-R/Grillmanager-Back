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
    const [products, categories, restaurantInfo, orders, promotionalSections] = await Promise.all([
      prisma.product.findMany(),
      prisma.category.findMany(),
      prisma.restaurant.findFirst(),
      prisma.order.findMany(),
      prisma.promotionalSection.findMany()
    ])

    const exportData = {
      products,
      categories,
      restaurantInfo,
      orders,
      promotionalSections,
      exportDate: new Date().toISOString()
    }

    res.status(200).json({
      success: true,
      data: exportData
    })
  } catch (error) {
    console.error('Erro na API de export:', error)
    res.status(500).json({ success: false, message: 'Erro interno do servidor' })
  }
}
