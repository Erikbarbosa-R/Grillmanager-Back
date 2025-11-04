import { NextApiRequest, NextApiResponse } from 'next'

export function setCorsHeaders(res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
  res.setHeader('Access-Control-Max-Age', '86400')
}

type ApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void

export function withCors(handler: ApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    setCorsHeaders(res)

    if (req.method === 'OPTIONS') {
      res.status(200).end()
      return
    }

    try {
      return await handler(req, res)
    } catch (error) {
      setCorsHeaders(res)
      throw error
    }
  }
}
