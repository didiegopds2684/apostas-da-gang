import { Request, Response, NextFunction } from 'express'
import { firebaseAuth } from '../lib/firebase'
import { prisma } from '../lib/prisma'

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token não fornecido' })
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = await firebaseAuth.verifyIdToken(token)
    const user = await prisma.user.findUnique({ where: { firebaseUid: decoded.uid } })

    if (!user) {
      res.status(401).json({ error: 'Usuário não encontrado' })
      return
    }

    req.user = user
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido ou expirado' })
  }
}
