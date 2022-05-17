import JWT from 'jsonwebtoken';
import { JSON_SIGNITURE } from '../keys';


export const getUserFromToken = (token: string) => {
  try {
    return JWT.verify(token, JSON_SIGNITURE) as {
      userId: number
    }
  } catch (error) {
    return null
  }
}