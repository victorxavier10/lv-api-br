import { Router } from "express"

import { userLogin } from "../controllers/login.controller"

const loginRouter = Router()

loginRouter.post("/", userLogin)

export default loginRouter
