import { Context } from '..';

export const Query = {
  me: (_: any, __: any, {userInfo, prisma}: Context) => {
    if (!userInfo) return null
    return prisma.user.findUnique({
      where: {
        id: userInfo.userId
      }
    })
  },
  posts: async (_: any, __: any, { prisma }: Context) => {
    const posts = await prisma.post.findMany({
      where: {
        published: true
      },
      orderBy: {
        createdAt: "desc"
      }
    })
    return posts
  },
  profile: async (_: any, {userId}: {userId: string}, {userInfo, prisma}: Context) => {
    if (!userId) return null

    const isMyProfile = Number(userId) === userInfo?.userId

    const profile = await prisma.profile.findUnique({
      where: {
        userId: Number(userId)
      }
    })

    if (!profile) return null

    return {
      ...profile, isMyProfile
    }
  }
}
