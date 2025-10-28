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
      message: 'ID da categoria é obrigatório'
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
    console.error('Erro na API de categoria:', error)
    res.status(500).json({ success: false, message: 'Erro interno do servidor' })
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse, id: string) {
  const category = await prisma.category.findUnique({
    where: { id }
  })

  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Categoria não encontrada'
    })
  }

  res.status(200).json({
    success: true,
    data: category
  })
}

async function handlePut(req: NextApiRequest, res: NextApiResponse, id: string) {
  const { name, description, icon } = req.body

  const existingCategory = await prisma.category.findUnique({
    where: { id }
  })

  if (!existingCategory) {
    return res.status(404).json({
      success: false,
      message: 'Categoria não encontrada'
    })
  }

  if (name && name !== existingCategory.name) {
    const duplicateCategory = await prisma.category.findUnique({
      where: { name }
    })

    if (duplicateCategory) {
      return res.status(400).json({
        success: false,
        message: 'Já existe uma categoria com esse nome'
      })
    }
  }

  const updatedCategory = await prisma.category.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(icon !== undefined && { icon })
    }
  })

  res.status(200).json({
    success: true,
    data: updatedCategory,
    message: 'Categoria atualizada com sucesso'
  })
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse, id: string) {
  const existingCategory = await prisma.category.findUnique({
    where: { id }
  })

  if (!existingCategory) {
    return res.status(404).json({
      success: false,
      message: 'Categoria não encontrada'
    })
  }

  const productsWithCategory = await prisma.product.findFirst({
    where: { category: existingCategory.name }
  })

  if (productsWithCategory) {
    return res.status(400).json({
      success: false,
      message: 'Não é possível excluir categoria que possui produtos associados'
    })
  }

  await prisma.category.delete({
    where: { id }
  })

  res.status(200).json({
    success: true,
    message: 'Categoria removida com sucesso'
  })
}
