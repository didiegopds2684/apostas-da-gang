import { prisma } from '../lib/prisma'

function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

async function getUniqueInviteCode(retries = 5): Promise<string> {
  for (let i = 0; i < retries; i++) {
    const code = generateInviteCode()
    const existing = await prisma.group.findUnique({ where: { inviteCode: code } })
    if (!existing) return code
  }
  throw new Error('Não foi possível gerar um código único')
}

export async function createGroup(name: string, userId: string) {
  const inviteCode = await getUniqueInviteCode()
  const group = await prisma.group.create({
    data: {
      name,
      inviteCode,
      members: { create: { userId, role: 'admin' } },
    },
    include: { _count: { select: { members: true } } },
  })
  return { ...group, memberCount: group._count.members, myRole: 'admin' }
}

export async function joinGroup(inviteCode: string, userId: string) {
  const group = await prisma.group.findFirst({
    where: { inviteCode: inviteCode.toUpperCase() },
    include: { _count: { select: { members: true } } },
  })
  if (!group) throw { status: 404, message: 'Grupo não encontrado' }

  const existing = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: group.id, userId } },
  })
  if (existing) throw { status: 400, message: 'Você já é membro deste grupo' }

  await prisma.groupMember.create({ data: { groupId: group.id, userId, role: 'member' } })
  return { ...group, memberCount: group._count.members + 1, myRole: 'member' }
}

export async function getMyGroups(userId: string) {
  const memberships = await prisma.groupMember.findMany({
    where: { userId },
    include: {
      group: { include: { _count: { select: { members: true } } } },
    },
    orderBy: { joinedAt: 'desc' },
  })

  return memberships.map(m => ({
    id: m.group.id,
    name: m.group.name,
    inviteCode: m.group.inviteCode,
    memberCount: m.group._count.members,
    myRole: m.role,
  }))
}

export async function getGroupDetail(groupId: string, userId: string) {
  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
  })
  if (!membership) throw { status: 403, message: 'Acesso negado' }

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      },
    },
  })
  if (!group) throw { status: 404, message: 'Grupo não encontrado' }

  const isAdmin = membership.role === 'admin'

  return {
    id: group.id,
    name: group.name,
    inviteCode: isAdmin ? group.inviteCode : undefined,
    members: group.members.map(m => ({
      userId: m.user.id,
      name: m.user.name,
      avatarUrl: m.user.avatarUrl,
      role: m.role,
    })),
  }
}

export async function removeMember(groupId: string, targetUserId: string, requesterId: string) {
  const requester = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: requesterId } },
  })
  if (!requester || requester.role !== 'admin') throw { status: 403, message: 'Sem permissão' }
  if (targetUserId === requesterId) throw { status: 403, message: 'Admin não pode remover a si mesmo' }

  await prisma.groupMember.delete({
    where: { groupId_userId: { groupId, userId: targetUserId } },
  })
}

export async function leaveGroup(groupId: string, userId: string) {
  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
  })
  if (!member) throw { status: 404, message: 'Membro não encontrado' }
  if (member.role === 'admin') throw { status: 400, message: 'Admin não pode sair do grupo' }

  await prisma.groupMember.delete({
    where: { groupId_userId: { groupId, userId } },
  })
}
