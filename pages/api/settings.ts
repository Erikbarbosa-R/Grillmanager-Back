import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS')
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
      case 'PUT':
        await handlePut(req, res)
        break
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT'])
        res.status(405).json({ success: false, message: 'Método não permitido' })
    }
  } catch (error) {
    console.error('Erro na API de configurações:', error)
    res.status(500).json({ success: false, message: 'Erro interno do servidor' })
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const settings = await prisma.settings.findMany()
    
    const settingsObj = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {} as Record<string, unknown>)

    const defaultSettings = {
      delivery: {
        enabled: true,
        baseFee: 5.00,
        perKmFee: 2.00,
        maxDistance: 15.0,
        freeDeliveryMinOrder: 50.00,
        estimatedPrepTime: "25-35 min"
      },
      payment: {
        methods: ["pix", "dinheiro", "credito", "debito"],
        pix: {
          enabled: true,
          key: "boteco.maminha@pix.com"
        }
      },
      notifications: {
        whatsapp: {
          enabled: true,
          number: "(11) 99999-9999"
        },
        email: {
          enabled: true,
          address: "contato@botecodamaminha.com"
        }
      }
    }

    const finalSettings = { ...defaultSettings, ...settingsObj }

    res.status(200).json({
      success: true,
      data: finalSettings
    })

  } catch (error) {
    console.error('Erro ao buscar configurações:', error)
    res.status(500).json({ success: false, message: 'Erro interno do servidor' })
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { key, value } = req.body

    if (!key || !value) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: key, value'
      })
    }

    const existingSetting = await prisma.settings.findUnique({
      where: { key }
    })

    if (existingSetting) {
      return res.status(400).json({
        success: false,
        message: 'Configuração já existe. Use PUT para atualizar.'
      })
    }

    const setting = await prisma.settings.create({
      data: { key, value }
    })

    res.status(201).json({
      success: true,
      data: setting,
      message: 'Configuração criada com sucesso'
    })

  } catch (error) {
    console.error('Erro ao criar configuração:', error)
    res.status(500).json({ success: false, message: 'Erro interno do servidor' })
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { key, value } = req.body

    if (!key || !value) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: key, value'
      })
    }

    const existingSetting = await prisma.settings.findUnique({
      where: { key }
    })

    if (!existingSetting) {
      return res.status(404).json({
        success: false,
        message: 'Configuração não encontrada'
      })
    }

    const updatedSetting = await prisma.settings.update({
      where: { key },
      data: { value }
    })

    res.status(200).json({
      success: true,
      data: updatedSetting,
      message: 'Configuração atualizada com sucesso'
    })

  } catch (error) {
    console.error('Erro ao atualizar configuração:', error)
    res.status(500).json({ success: false, message: 'Erro interno do servidor' })
  }
}

