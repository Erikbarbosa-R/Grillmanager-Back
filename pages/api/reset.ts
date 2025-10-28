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
    await prisma.$transaction(async (tx) => {
      await tx.order.deleteMany()
      await tx.product.deleteMany()
      await tx.category.deleteMany()
      await tx.restaurant.deleteMany()
      await tx.promotionalSection.deleteMany()

      const defaultCategories = [
        {
          name: 'Hambúrgueres',
          description: 'Nossos deliciosos hambúrgueres artesanais',
          icon: '🍔'
        },
        {
          name: 'Bebidas',
          description: 'Refrigerantes, sucos e cervejas geladas',
          icon: '🥤'
        },
        {
          name: 'Acompanhamentos',
          description: 'Batatas fritas, anéis de cebola e muito mais',
          icon: '🍟'
        }
      ]

      const defaultProducts = [
        {
          name: 'Hambúrguer Clássico',
          description: 'Pão, carne, alface, tomate, cebola e molho especial',
          price: 25.90,
          category: 'Hambúrgueres',
          image: '/images/hamburger-classic.jpg',
          popular: true,
          available: true
        },
        {
          name: 'Hambúrguer Bacon',
          description: 'Pão, carne, bacon crocante, queijo, alface e molho barbecue',
          price: 29.90,
          category: 'Hambúrgueres',
          image: '/images/hamburger-bacon.jpg',
          popular: true,
          available: true
        },
        {
          name: 'Coca-Cola 350ml',
          description: 'Refrigerante gelado',
          price: 5.90,
          category: 'Bebidas',
          image: '/images/coca-cola.jpg',
          popular: false,
          available: true
        },
        {
          name: 'Batata Frita',
          description: 'Batatas fritas crocantes com sal',
          price: 12.90,
          category: 'Acompanhamentos',
          image: '/images/batata-frita.jpg',
          popular: false,
          available: true
        }
      ]

      const defaultRestaurant = {
        name: 'GrillManager',
        description: 'O melhor hambúrguer da cidade!',
        address: 'Rua das Flores, 123 - Centro',
        phone: '(11) 99999-9999',
        email: 'contato@grillmanager.com',
        logo: '/images/logo.png',
        primaryColor: '#f97316',
        secondaryColor: '#ea580c'
      }

      await tx.category.createMany({
        data: defaultCategories
      })

      await tx.product.createMany({
        data: defaultProducts
      })

      await tx.restaurant.create({
        data: defaultRestaurant
      })
    })

    res.status(200).json({
      success: true,
      message: 'Dados resetados para valores padrão com sucesso'
    })
  } catch (error) {
    console.error('Erro ao resetar dados:', error)
    res.status(500).json({
      success: false,
      message: 'Erro ao resetar dados'
    })
  }
}
