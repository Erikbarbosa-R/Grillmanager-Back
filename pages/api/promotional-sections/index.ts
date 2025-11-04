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
    console.error('Erro na API de seções promocionais:', error)
    res.status(500).json({ success: false, message: 'Erro interno do servidor' })
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const sections = await prisma.promotionalSection.findMany({
    where: {
      active: true
    },
    orderBy: [
      { displayOrder: 'asc' },
      { createdAt: 'desc' }
    ]
  })

  interface ProductRef {
    productId: string
    displayOrder?: number
    [key: string]: unknown
  }

  const formattedSections = await Promise.all(
    sections.map(async (section) => {
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

      return {
        id: section.id,
        title: section.title,
        description: section.description,
        displayOrder: section.displayOrder,
        active: section.active,
        products: productDetails,
        createdAt: section.createdAt,
        updatedAt: section.updatedAt
      }
    })
  )

  res.status(200).json({
    success: true,
    data: formattedSections
  })
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { title, description, displayOrder, active, products } = req.body

  if (!title) {
    return res.status(400).json({
      success: false,
      message: 'Campo obrigatório: title'
    })
  }

  if (!products || !Array.isArray(products) || products.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Campo obrigatório: products (array não vazio)'
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

  const section = await prisma.promotionalSection.create({
    data: {
      title,
      description: description || null,
      displayOrder: displayOrder || 0,
      active: active !== undefined ? active : true,
      products: products
    }
  })

  res.status(201).json({
    success: true,
    data: section,
    message: 'Seção promocional criada com sucesso'
  })
}

