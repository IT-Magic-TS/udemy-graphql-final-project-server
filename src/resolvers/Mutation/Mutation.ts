import { authResolvers } from './auth-reolvers';
import { postResolvers } from './post-resolvers'

export const Mutation = {
  ...postResolvers,
  ...authResolvers
}