import { Post, Prisma } from '@prisma/client';
import { Context } from '../..';
import { canUserMutatePost } from '../../utils/canUserMutatePost';

interface PostArgs {
  post: {
    title?: string
    content?: string
  }
}

interface PostPayloadType {
  userErrors: {
    message: string
  }[],
  post: Post | Prisma.Prisma__PostClient<Post> | null
}

export const postResolvers = {
  postCreate: async (parent: any, {post}: PostArgs, { prisma, userInfo }: Context): Promise<PostPayloadType> => {

    if (!userInfo) {
      return {
        userErrors: [
          {
            message: 'Forbiden access (unauthenticated)'
          }
        ], 
        post: null
      }
    }

    const { title, content } = post
    if (!title || !content) {
      return {
        userErrors: [
          {
            message: "You must provide title and content to create a post"
          }
        ],
        post: null
      }
    }

    return {
      userErrors: [],
      post: prisma.post.create({
        data: {
          title,
          content,
          authorId: userInfo.userId
        }
      })
    }
  },
  postUpdate: async (_: any, { postId, post }: {postId: string, post: PostArgs['post']}, {prisma, userInfo}: Context): Promise<PostPayloadType> => {
    if (!userInfo) {
      return {
        userErrors: [
          {
            message: 'Forbiden access (unauthenticated)'
          }
        ],
        post: null
      }
    }

    const error = await canUserMutatePost({
      userId: userInfo.userId,
      postId: Number(postId),
      prisma
    })

    if (error) return error;

    const { title, content } = post

    if (!title && !content) {
      return {
        userErrors: [
          {
            message: "Need to have at least one field to update"
          }
        ],
        post: null
      }
    }
 
    const existingPost = await prisma.post.findUnique({
      where: {
        id: Number(postId)
      }
    })

    if (!existingPost) {
      return {
        userErrors: [
          {
            message: "Post doesn't exist"
          }
        ],
        post: null
      }
    }

    let payloadoUpdate = {
      title, content
    }

    if (!title) delete payloadoUpdate.title
    if (!content) delete payloadoUpdate.content

    // Update Post
    return {
      userErrors: [],
      post: prisma.post.update({
        where: {
          id: Number(postId)
        },
        data: {
          ...payloadoUpdate
        }
      })
    }
  },
  postDelete: async (_: any, {postId}: {postId: string}, {prisma, userInfo }: Context): Promise<PostPayloadType>  => {
    if (!userInfo) {
      return {
        userErrors: [
          {
            message: 'Forbiden access (unauthenticated)'
          }
        ],
        post: null
      }
    }

    const post = await prisma.post.findUnique({
      where: {
        id: Number(postId)
      }
    })

    const error = await canUserMutatePost({
      userId: userInfo.userId,
      postId: Number(postId),
      prisma
    })

    if (error) return error;

    if (!post) {
      return {
        userErrors: [
          {
            message: "Post doesn't exist"
          }
        ],
        post: null
      }
    }

    await prisma.post.delete({
      where: {
        id: Number(postId)
      }
    })

    return {
      userErrors: [],
      post
    }

  },
  postPublish: async (_: any, {postId}: {postId: string}, {prisma, userInfo}: Context): Promise<PostPayloadType> => {
    if (!userInfo) {
      return {
        userErrors: [
          {
            message: 'Forbiden access! (unauthenticated)'
          }
        ],
        post: null
      }
    }

    const error = await canUserMutatePost({
      userId: userInfo.userId,
      postId: Number(postId),
      prisma
    })

    if (error) return error

    const existingPost = await prisma.post.findUnique({
      where: {
        id: Number(postId)
      }
    })

    if (!existingPost) {
      return {
        userErrors: [{message: 'Post does not exists'}],
        post: null
      }
    }

    // update post
    return {
      userErrors: [],
      post: prisma.post.update({
        where: {
          id: Number(postId)
        },
        data: {
          published: true
        }
      })
    }
  },
  postUnPublish: async (_: any, {postId}: {postId: string}, {prisma, userInfo}: Context): Promise<PostPayloadType> => {
    if (!userInfo) {
      return {
        userErrors: [
          {
            message: 'Forbiden access! (unauthenticated)'
          }
        ],
        post: null
      }
    }

    const error = await canUserMutatePost({
      userId: userInfo.userId,
      postId: Number(postId),
      prisma
    })

    if (error) return error

    const existingPost = await prisma.post.findUnique({
      where: {
        id: Number(postId)
      }
    })

    if (!existingPost) {
      return {
        userErrors: [{message: 'Post does not exists'}],
        post: null
      }
    }

    // update post
    return {
      userErrors: [],
      post: prisma.post.update({
        where: {
          id: Number(postId)
        },
        data: {
          published: false
        }
      })
    }
  }
}