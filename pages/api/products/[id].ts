import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'ID do produto é obrigatório'
    })
  }

  try {
    switch (req.method) {
      case 'GET':
        await handleGet(req, res, id)
        break
      case 'PUT':
        await handlePut(req, res, id)
        break
      case 'DELETE':
        await handleDelete(req, res, id)
        break
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
        res.status(405).json({ success: false, message: 'Método não permitido' })
    }
  } catch (error) {
    console.error('Erro na API de produto:', error)
    res.status(500).json({ success: false, message: 'Erro interno do servidor' })
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse, id: string) {
  const product = await prisma.product.findUnique({
    where: { id }
  })

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Produto não encontrado'
    })
  }

  res.status(200).json({
    success: true,
    data: product
  })
}

async function handlePut(req: NextApiRequest, res: NextApiResponse, id: string) {
  const { name, description, price, category, image, popular, available } = req.body

  const existingProduct = await prisma.product.findUnique({
    where: { id }
  })

  if (!existingProduct) {
    return res.status(404).json({
      success: false,
      message: 'Produto não encontrado'
    })
  }

  const updatedProduct = await prisma.product.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(description && { description }),
      ...(price && { price: parseFloat(price) }),
      ...(category && { category }),
      ...(image !== undefined && { image }),
      ...(popular !== undefined && { popular }),
      ...(available !== undefined && { available })
    }
  })

  res.status(200).json({
    success: true,
    data: updatedProduct,
    message: 'Produto atualizado com sucesso'
  })
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse, id: string) {
  const existingProduct = await prisma.product.findUnique({
    where: { id }
  })

  if (!existingProduct) {
    return res.status(404).json({
      success: false,
      message: 'Produto não encontrado'
    })
  }

  await prisma.product.delete({
    where: { id }
  })

  res.status(200).json({
    success: true,
    message: 'Produto removido com sucesso'
  })
}
