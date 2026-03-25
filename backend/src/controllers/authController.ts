import { Request, Response } from 'express'
import { firebaseAuth } from '../lib/firebase'
import { prisma } from '../lib/prisma'

export async function verifyToken(req: Request, res: Response): Promise<void> {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token não fornecido' })
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = await firebaseAuth.verifyIdToken(token)
    const user = await prisma.user.upsert({
      where: { firebaseUid: decoded.uid },
      update: {
        name: decoded.name || decoded.email || 'Usuário',
        avatarUrl: decoded.picture || null,
      },
      create: {
        firebaseUid: decoded.uid,
        email: decoded.email || '',
        name: decoded.name || decoded.email || 'Usuário',
        avatarUrl: decoded.picture || null,
      },
    })
    res.json({ user })
  } catch {
    res.status(401).json({ error: 'Token inválido ou expirado' })
  }
}
