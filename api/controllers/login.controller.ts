import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { PrismaClient } from "@prisma/client"

import * as dotenv from "dotenv"
dotenv.config()

const userClient = new PrismaClient().user

export const userLogin = async (req, res) => {
    const { email, password } = req.body

    const incorrectLoginMessage = {
        id: 0,
        msg: "Erro: Email ou senha incorretos!"
    }

    if (!email || !password) {
        res.status(400).json(incorrectLoginMessage)
        return
    }

    try {
        const user = await userClient.findUnique({ 
            where: { email },
            include: {
                profile: {
                    include: {
                        images: true,
                        states: true,
                        schedules: true,
                        workingHours: true
                    }
                }
            }
        })

        if (user == null) {
            res.status(400).json(incorrectLoginMessage)
            return
        }

        if (bcrypt.compareSync(password, user.password)) {
            const token = jwt.sign({
                userId: user.id,
                userName: user.name
            },
                process.env.JWT_KEY,
                { expiresIn: "168h" }
            )

            res.status(201).json({ token: token, userId: user.id, userName: user.name, profileId: user.profile.id })
        }
        else {
            res.status(400).json(incorrectLoginMessage)
            return
        }
    } catch (error) {
        res.status(400).json(error)
    }
}