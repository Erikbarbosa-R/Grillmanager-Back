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
      message: 'ID da seção promocional é obrigatório'
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
    console.error('Erro na API de seção promocional:', error)
    res.status(500).json({ success: false, message: 'Erro interno do servidor' })
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse, id: string) {
  const section = await prisma.promotionalSection.findUnique({
    where: { id }
  })

  if (!section) {
    return res.status(404).json({
      success: false,
      message: 'Seção promocional não encontrada'
    })
  }

  interface ProductRef {
    productId: string
    displayOrder?: number
    [key: string]: unknown
  }

  const products = section.products as ProductRef[]
  const productDetails = await Promise.all(
    products.map(async (productRef: ProductRef) => {
      const product = await prisma.product.findUnique({
        where: { id: productRef.productId }
      })
      return {
        ...productRef,
        product
      }
    })
  )

  res.status(200).json({
    success: true,
    data: {
      ...section,
      products: productDetails
    }
  })
}

async function handlePut(req: NextApiRequest, res: NextApiResponse, id: string) {
  const { title, description, displayOrder, active, products } = req.body

  const existingSection = await prisma.promotionalSection.findUnique({
    where: { id }
  })

  if (!existingSection) {
    return res.status(404).json({
      success: false,
      message: 'Seção promocional não encontrada'
    })
  }

  if (products !== undefined) {
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Products deve ser um array não vazio'
      })
    }

    for (const product of products) {
      if (!product.productId || product.displayOrder === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Cada produto deve ter: productId, displayOrder'
        })
      }

      const existingProduct = await prisma.product.findUnique({
        where: { id: product.productId }
      })

      if (!existingProduct) {
        return res.status(400).json({
          success: false,
          message: `Produto não encontrado: ${product.productId}`
        })
      }
    }
  }

  const updatedSection = await prisma.promotionalSection.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(displayOrder !== undefined && { displayOrder }),
      ...(active !== undefined && { active }),
      ...(products !== undefined && { products })
    }
  })

  res.status(200).json({
    success: true,
    data: updatedSection,
    message: 'Seção promocional atualizada com sucesso'
  })
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse, id: string) {
  const existingSection = await prisma.promotionalSection.findUnique({
    where: { id }
  })

  if (!existingSection) {
    return res.status(404).json({
      success: false,
      message: 'Seção promocional não encontrada'
    })
  }

  await prisma.promotionalSection.delete({
    where: { id }
  })

  res.status(200).json({
    success: true,
    message: 'Seção promocional removida com sucesso'
  })
}

