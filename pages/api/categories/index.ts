import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { setCorsHeaders } from '@/lib/withCors'

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
      case 'POST':
        await handlePost(req, res)
        break
      default:
        setCorsHeaders(res)
        res.setHeader('Allow', ['GET', 'POST'])
        res.status(405).json({ success: false, message: 'Método não permitido' })
    }
  } catch (error) {
    console.error('Erro na API de categorias:', error)
    setCorsHeaders(res)
    res.status(500).json({ success: false, message: 'Erro interno do servidor' })
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  setCorsHeaders(res)
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: 'desc' }
  })

  res.status(200).json({
    success: true,
    data: categories
  })
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  setCorsHeaders(res)
  const { name, description, icon } = req.body

  if (!name) {
    return res.status(400).json({
      success: false,
      message: 'Campo obrigatório: name'
    })
  }

  const existingCategory = await prisma.category.findUnique({
    where: { name }
  })

  if (existingCategory) {
    return res.status(400).json({
      success: false,
      message: 'Já existe uma categoria com esse nome'
    })
  }

  const category = await prisma.category.create({
    data: {
      name,
      description: description || null,
      icon: icon || null
    }
  })

  res.status(201).json({
    success: true,
    data: category,
    message: 'Categoria criada com sucesso'
  })
}
