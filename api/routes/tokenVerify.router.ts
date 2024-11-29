import { Router } from 'express'
import { tokenVerifyController } from '../controllers/tokenVerify.controller';
import { tokenVerify } from '../middlewares/tokenVerify.middleware';

const tokenVerifyRouter = Router()

tokenVerifyRouter.get("/verify", tokenVerify, tokenVerifyController)

export default tokenVerifyRouter
