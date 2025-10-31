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
  } catch (error: any) {
    console.error('Erro na API de categorias:', error)
    setCorsHeaders(res)
    
    // Em desenvolvimento, mostra mais detalhes do erro
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? error?.message || 'Erro interno do servidor'
      : 'Erro interno do servidor'
    
    res.status(500).json({ 
      success: false, 
      message: errorMessage,
      ...(process.env.NODE_ENV === 'development' && { error: error?.stack })
    })
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
