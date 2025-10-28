import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
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
    console.error('Erro na API de produtos:', error)
    res.status(500).json({ success: false, message: 'Erro interno do servidor' })
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' }
  })

  res.status(200).json({
    success: true,
    data: products
  })
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { name, description, price, category, image, popular, available } = req.body

  if (!name || !description || !price || !category) {
    return res.status(400).json({
      success: false,
      message: 'Campos obrigatórios: name, description, price, category'
    })
  }

  const product = await prisma.product.create({
    data: {
      name,
      description,
      price: parseFloat(price),
      category,
      image: image || null,
      popular: popular || false,
      available: available !== undefined ? available : true
    }
  })

  res.status(201).json({
    success: true,
    data: product,
    message: 'Produto criado com sucesso'
  })
}
