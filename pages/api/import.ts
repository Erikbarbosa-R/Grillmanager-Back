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
        await handleExport(req, res)
        break
      case 'POST':
        await handleImport(req, res)
        break
      default:
        res.setHeader('Allow', ['GET', 'POST'])
        res.status(405).json({ success: false, message: 'Método não permitido' })
    }
  } catch (error) {
    console.error('Erro na API de backup:', error)
    res.status(500).json({ success: false, message: 'Erro interno do servidor' })
  }
}

async function handleExport(req: NextApiRequest, res: NextApiResponse) {
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
}

async function handleImport(req: NextApiRequest, res: NextApiResponse) {
  const { products, categories, restaurantInfo, orders, promotionalSections } = req.body

  if (!products || !categories || !restaurantInfo || !orders) {
    return res.status(400).json({
      success: false,
      message: 'Dados de backup inválidos. Campos obrigatórios: products, categories, restaurantInfo, orders'
    })
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.order.deleteMany()
      await tx.product.deleteMany()
      await tx.category.deleteMany()
      await tx.restaurant.deleteMany()
      await tx.promotionalSection.deleteMany()

      if (categories.length > 0) {
        await tx.category.createMany({
          data: categories.map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            description: cat.description,
            icon: cat.icon,
            createdAt: cat.createdAt ? new Date(cat.createdAt) : new Date(),
            updatedAt: cat.updatedAt ? new Date(cat.updatedAt) : new Date()
          }))
        })
      }

      if (products.length > 0) {
        await tx.product.createMany({
          data: products.map((prod: any) => ({
            id: prod.id,
            name: prod.name,
            description: prod.description,
            price: prod.price,
            category: prod.category,
            image: prod.image,
            popular: prod.popular,
            available: prod.available,
            createdAt: prod.createdAt ? new Date(prod.createdAt) : new Date(),
            updatedAt: prod.updatedAt ? new Date(prod.updatedAt) : new Date()
          }))
        })
      }

      if (restaurantInfo) {
        await tx.restaurant.create({
          data: {
            id: restaurantInfo.id,
            name: restaurantInfo.name,
            description: restaurantInfo.description,
            address: restaurantInfo.address,
            phone: restaurantInfo.phone,
            email: restaurantInfo.email,
            logo: restaurantInfo.logo,
            primaryColor: restaurantInfo.primaryColor || '#f97316',
            secondaryColor: restaurantInfo.secondaryColor || '#ea580c',
            createdAt: restaurantInfo.createdAt ? new Date(restaurantInfo.createdAt) : new Date(),
            updatedAt: restaurantInfo.updatedAt ? new Date(restaurantInfo.updatedAt) : new Date()
          }
        })
      }

      if (orders.length > 0) {
        await tx.order.createMany({
          data: orders.map((order: any) => ({
            id: order.id,
            orderId: order.orderId || order.id,
            items: order.items,
            customer: order.customer,
            deliveryAddress: order.deliveryAddress,
            payment: order.payment,
            delivery: order.delivery,
            totals: order.totals,
            notes: order.notes,
            status: order.status,
            timeline: order.timeline,
            createdAt: order.createdAt ? new Date(order.createdAt) : new Date(),
            updatedAt: order.updatedAt ? new Date(order.updatedAt) : new Date()
          }))
        })
      }

      if (promotionalSections && promotionalSections.length > 0) {
        await tx.promotionalSection.createMany({
          data: promotionalSections.map((section: any) => ({
            id: section.id,
            title: section.title,
            description: section.description,
            displayOrder: section.displayOrder || 0,
            active: section.active !== undefined ? section.active : true,
            products: section.products,
            createdAt: section.createdAt ? new Date(section.createdAt) : new Date(),
            updatedAt: section.updatedAt ? new Date(section.updatedAt) : new Date()
          }))
        })
      }
    })

    res.status(200).json({
      success: true,
      message: 'Dados importados com sucesso'
    })
  } catch (error) {
    console.error('Erro ao importar dados:', error)
    res.status(500).json({
      success: false,
      message: 'Erro ao importar dados'
    })
  }
}
