import { Request, Response } from 'express'
import { z } from 'zod'
import {
  createGroup,
  joinGroup,
  getMyGroups,
  getGroupDetail,
  removeMember,
  leaveGroup,
} from '../services/groupService'

const createGroupSchema = z.object({ name: z.string().min(3).max(50) })
const joinGroupSchema = z.object({ inviteCode: z.string().min(6).max(6) })

export async function create(req: Request, res: Response): Promise<void> {
  const parsed = createGroupSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Nome inválido', details: parsed.error.flatten() })
    return
  }
  try {
    const group = await createGroup(parsed.data.name, req.user.id)
    res.status(201).json({ group })
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string }
    res.status(e.status || 500).json({ error: e.message })
  }
}

export async function join(req: Request, res: Response): Promise<void> {
  const parsed = joinGroupSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Código inválido' })
    return
  }
  try {
    const group = await joinGroup(parsed.data.inviteCode, req.user.id)
    res.json({ group })
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string }
    res.status(e.status || 500).json({ error: e.message })
  }
}

export async function list(req: Request, res: Response): Promise<void> {
  const groups = await getMyGroups(req.user.id)
  res.json({ groups })
}

export async function detail(req: Request, res: Response): Promise<void> {
  try {
    const group = await getGroupDetail(String(req.params.id), req.user.id)
    res.json({ group })
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string }
    res.status(e.status || 500).json({ error: e.message })
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    await removeMember(String(req.params.id), String(req.params.userId), req.user.id)
    res.json({ success: true })
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string }
    res.status(e.status || 500).json({ error: e.message })
  }
}

export async function leave(req: Request, res: Response): Promise<void> {
  try {
    await leaveGroup(String(req.params.id), req.user.id)
    res.json({ success: true })
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string }
    res.status(e.status || 500).json({ error: e.message })
  }
}
