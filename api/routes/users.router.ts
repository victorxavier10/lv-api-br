import { Router } from "express"

import { changeUserPassword, createUser, deleteUser, emailValidate, generateCode, getAllUsers, getUserById, softDeleteUser, updateUser, userRoleUpdate, validateCode } from "../controllers/users.controller"
import { tokenVerify } from "../middlewares/tokenVerify.middleware"

const usersRouter = Router()

usersRouter
    // .get("/", getAllUsers)
    .get("/:id", getUserById)
    .post("/generate-code/email", generateCode)
    .post("/validate-code/email", validateCode)
    .put("/account/email-validate", tokenVerify, emailValidate)
    .put("/change/user/password", changeUserPassword)
    .post("/", createUser)
    .delete("/:id", deleteUser)
    .put("/delete/:id", softDeleteUser)
    .put("/:id", tokenVerify, updateUser)
    .put("/role-update/:id", userRoleUpdate)

export default usersRouter
