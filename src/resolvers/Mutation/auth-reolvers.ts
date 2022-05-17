import { Context } from '../..'
import validator from 'validator'
import bcrypt from 'bcryptjs'
import JWT from 'jsonwebtoken'
import { JSON_SIGNITURE } from '../../keys';

interface SignupArgs {
  credentials : {
    email: string
    password: string
  }
  name: string
  bio: string
}

interface SigninArgs {
  credentials : {
    email: string
    password: string
  }
}

interface UserPlayload {
  userErrors: {
    message: string
  }[]
  token: string | null
}

export const authResolvers = {
  signup: async (_: any, {credentials, bio, name}: SignupArgs, { prisma }: Context): Promise<UserPlayload> => {
    const {email, password} = credentials
    const isEmail = validator.isEmail(email)
    const isValidPassword = validator.isLength(password, {
      min: 5
    })

    if (!isEmail) {
      return {
        userErrors: [{
          message: 'Invalid email!'
        }],
        token: null
      }
    }

    if (!isValidPassword) {  
      return {
        userErrors: [{
          message: 'Invalid password!'
        }],
        token: null
      }
    }

    if (!name || !bio) {
      return {
        userErrors: [{
          message: 'Invalid name or bio!'
        }],
        token: null
      }
    }

    const hashPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name, email, password: hashPassword
      }
    })

    await prisma.profile.create({
      data: {
        bio, userId: user.id
      }
    })

    const token = await JWT.sign({
      userId: user.id,
    }, JSON_SIGNITURE, {
      expiresIn: 3600000
    })

    return {
      userErrors: [],
      token
    }
  },
  signin: async (_: any, {credentials}: SigninArgs, {prisma}: Context): Promise<UserPlayload> => {
    const { email, password } = credentials

    console.log(email)

    const user = await prisma.user.findUnique({
      where: {
        email
      }
    })

    if (!user) {
      return {
        userErrors: [
          {
            message: 'Invalid credentials 1'
          }
        ],
        token: null
      }
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return {
        userErrors: [
          {
            message: 'Invalid credentials 2'
          }
        ],
        token: null
      }
    }

    return {
      userErrors: [],
      token: JWT.sign({userId: user.id}, JSON_SIGNITURE, {
        expiresIn: 3600000
      })
    }
  }
}