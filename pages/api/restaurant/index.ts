import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { setCorsHeaders } from '@/lib/withCors'
import { Prisma } from '@prisma/client'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  setCorsHeaders(res)

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  try {
    switch (req.method) {
      case 'GET':
        await handleGet(req, res)
        break
      case 'PUT':
        await handlePut(req, res)
        break
      default:
        setCorsHeaders(res)
        res.setHeader('Allow', ['GET', 'PUT'])
        res.status(405).json({ success: false, message: 'Método não permitido' })
    }
  } catch (error) {
    console.error('Erro na API do restaurante:', error)
    setCorsHeaders(res)
    res.status(500).json({ success: false, message: 'Erro interno do servidor' })
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  setCorsHeaders(res)
  let restaurant = await prisma.restaurant.findFirst()

  if (!restaurant) {
    const defaultData = {
      name: 'Boteco da Maminha',
      description: 'Comida caseira e deliciosa',
      address: {
        street: 'Rua do Comércio',
        number: '123',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01000-000',
        coordinates: {
          latitude: -23.5505,
          longitude: -46.6333
        }
      },
      contact: {
        phone: '(11) 99999-9999',
        whatsapp: '(11) 99999-9999',
        email: 'contato@botecodamaminha.com'
      },
      deliverySettings: {
        baseFee: 5.00,
        perKmFee: 2.00,
        maxDistance: 15.0,
        freeDeliveryMinOrder: 50.00
      },
      operatingHours: {
        monday: { open: '11:00', close: '22:00' },
        tuesday: { open: '11:00', close: '22:00' },
        wednesday: { open: '11:00', close: '22:00' },
        thursday: { open: '11:00', close: '22:00' },
        friday: { open: '11:00', close: '22:00' },
        saturday: { open: '11:00', close: '23:00' },
        sunday: { open: '12:00', close: '21:00' }
      },
      isOpen: true,
      estimatedPrepTime: '25-35 min',
      logo: '/images/logo.png',
      primaryColor: '#f97316',
      secondaryColor: '#ea580c'
    }

    restaurant = await prisma.restaurant.create({
      data: {
        ...defaultData,
        address: (defaultData.address as unknown) as Prisma.InputJsonValue,
        contact: (defaultData.contact as unknown) as Prisma.InputJsonValue,
        deliverySettings: (defaultData.deliverySettings as unknown) as Prisma.InputJsonValue,
        operatingHours: (defaultData.operatingHours as unknown) as Prisma.InputJsonValue
      }
    })
  }

  const formattedRestaurant = {
    id: restaurant.id,
    name: restaurant.name,
    description: restaurant.description,
    address: restaurant.address,
    contact: restaurant.contact,
    deliverySettings: restaurant.deliverySettings,
    operatingHours: restaurant.operatingHours,
    isOpen: restaurant.isOpen,
    estimatedPrepTime: restaurant.estimatedPrepTime,
    logo: restaurant.logo,
    theme: {
      primaryColor: restaurant.primaryColor,
      secondaryColor: restaurant.secondaryColor
    },
    updatedAt: restaurant.updatedAt
  }

  res.status(200).json({
    success: true,
    data: formattedRestaurant
  })
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  setCorsHeaders(res)
  const { 
    name, 
    description, 
    address, 
    phone, 
    email, 
    logo, 
    theme 
  } = req.body

  if (!name) {
    return res.status(400).json({
      success: false,
      message: 'Campo obrigatório: name'
    })
  }

  let restaurant = await prisma.restaurant.findFirst()

  interface ContactInfo {
    phone?: string | null
    email?: string | null
    whatsapp?: string | null
  }

  const currentContact = (restaurant?.contact as ContactInfo | null) || {}
  const updatedContact: ContactInfo = {
    phone: phone !== undefined ? phone : currentContact.phone || null,
    email: email !== undefined ? email : currentContact.email || null,
    whatsapp: currentContact.whatsapp || currentContact.phone || null
  }

  if (!restaurant) {
    const contactData = (phone || email) ? updatedContact : undefined
    restaurant = await prisma.restaurant.create({
      data: {
        name,
        description: description || null,
        address: (address as unknown) as Prisma.InputJsonValue,
        contact: (contactData as unknown) as Prisma.InputJsonValue,
        logo: logo || null,
        primaryColor: theme?.primaryColor || '#f97316',
        secondaryColor: theme?.secondaryColor || '#ea580c'
      }
    })
  } else {
    const contactData = (phone !== undefined || email !== undefined) ? updatedContact : restaurant.contact
    restaurant = await prisma.restaurant.update({
      where: { id: restaurant.id },
      data: {
        name,
        description: description !== undefined ? description : restaurant.description,
        address: address !== undefined ? ((address as unknown) as Prisma.InputJsonValue) : ((restaurant.address as unknown) as Prisma.InputJsonValue),
        contact: (contactData as unknown) as Prisma.InputJsonValue,
        logo: logo !== undefined ? logo : restaurant.logo,
        primaryColor: theme?.primaryColor || restaurant.primaryColor,
        secondaryColor: theme?.secondaryColor || restaurant.secondaryColor
      }
    })
  }

  const contact = (restaurant.contact as ContactInfo | null) || {}

  const formattedRestaurant = {
    name: restaurant.name,
    description: restaurant.description,
    address: restaurant.address,
    contact: contact,
    logo: restaurant.logo,
    theme: {
      primaryColor: restaurant.primaryColor,
      secondaryColor: restaurant.secondaryColor
    },
    updatedAt: restaurant.updatedAt
  }

  res.status(200).json({
    success: true,
    data: formattedRestaurant,
    message: 'Informações do restaurante atualizadas com sucesso'
  })
}
