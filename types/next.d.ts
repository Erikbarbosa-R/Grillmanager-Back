import { NextApiRequest } from 'next'

declare module 'next' {
  interface NextApiRequest {
    method?: string
  }
}

// Ensure Buffer is available (Node.js global)
declare var Buffer: {
  from(data: string | Buffer, encoding?: string): Buffer
  alloc(size: number): Buffer
  isBuffer(obj: any): obj is Buffer
}

