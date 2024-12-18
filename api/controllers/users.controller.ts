import { PrismaClient } from "@prisma/client"
import { hashSync, genSaltSync } from "bcrypt"
import sendEmail from '../services/nodemailer';
import { profile } from "console";
import { v7 as uuidv7 } from 'uuid';

const prisma = new PrismaClient()
const userClient = new PrismaClient().user
const profileClient = new PrismaClient().profile
const webBaseUrl = process.env.WEB_BASE_URL

export const getAllUsers = async (req, res) => {
    try {
        const allUser = await userClient.findMany({
            include: {
                profile: true
            }
        })
        res.status(200).json({ data: allUser })
    } catch (error) {
        res.status(400).json(error)
    }
}

export const getUserById = async (req, res) => {
    const { id } = req.params

    try {
        const user = await userClient.findUnique({
            where: { id: String(id) },
            include: {
                profile: true
            }
        })
        res.status(200).json({ data: user })
    } catch (error) {
        res.status(400).json(error)
    }
}

function passwordVerify(password) {

    const passwordMissingCharacters = []

    // .length: retorna o tamanho da string (da senha)
    if (password.length < 8) {
        passwordMissingCharacters.push("A senha deve conter, no mínimo, 8 caracteres.")
    }

    // contadores
    let smallLetters = 0
    let bigLetters = 0
    let numbers = 0
    let simbols = 0

    // senha = "abc123"
    // letra = "a"

    // percorre as letras da variável senha
    for (const character of password) {
        // expressão regular
        if ((/[a-z]/).test(character)) {
            smallLetters++
        }
        else if ((/[A-Z]/).test(character)) {
            bigLetters++
        }
        else if ((/[0-9]/).test(character)) {
            numbers++
        } else {
            simbols++
        }
    }

    if (smallLetters == 0 || bigLetters == 0 || numbers == 0 || simbols == 0) {
        passwordMissingCharacters.push("A senha deve conter letras minúsculas, letras maiúsculas, números e símbolos.")
    }

    return passwordMissingCharacters
}

function emailVerify(email) {
    var regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
}

export const createUser = async (req, res) => {
    const { email, password, name } = req.body

    if (!email || !password) {
        res.status(400).json({ erro: "E-mail e senha são obrigatórios!" })
        return
    }

    const isValidEmail = emailVerify(email)
    if (!isValidEmail) {
        res.status(405).json({ erro: "E-mail inválido!" })
        return
    }

    const message = passwordVerify(password)
    if (message.length > 0) {
        res.status(400).json({ erro: message.join("-") })
        return
    }

    const salt = genSaltSync(12)
    const hashedPassword = hashSync(password, salt)

    try {
        const user = await userClient.create({
            data: { email, password: hashedPassword, name }
        })
        if (user) {
            const to = email
            const subject = "Lavar Carro - Confirme seu e-mail."
            const text = `Versão texto simples: Confirme seu e-mail acessando o link: ${webBaseUrl}/painel/${user.id}/${email} caso não consiga visualizar o e-mail estilizado.`
            const messageId = `<${uuidv7()}@lavarcarro.com>`
            const body = `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
            <meta charset="UTF-8">
            <title>Confirmação de E-mail</title>
            </head>
                <body style="font-family: 'Arial', sans-serif; background-color: #f5f5f5; margin: 0; padding: 0;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                        <!-- Cabeçalho -->
                        <div style="padding: 20px; text-align: center;">
                        </div>
                        <!-- Conteúdo -->
                        <div style="padding: 30px 20px; text-align: center;">
                        <h1 style="font-size: 24px; color: #333333; margin-bottom: 20px;">Confirme seu E-mail.</h1>
                        <p style="font-size: 16px; color: #555555;">Na Lavar Carro é necessário ativar seu anúncio através da confirmação de e-mail para começar a receber contato de clientes. Ative sua conta agora mesmo!</p>
                        <a href="${webBaseUrl}/painel/${user.id}/${email}" style="display: inline-block; padding: 25px 25px; background-color: #437FE5; color: #ffffff; text-decoration: none; font-size: 20px; border-radius: 5px; margin: 20px 0; font-weight: bold;"> CONFIRMAR E-MAIL </a>
                        <p style="font-size: 16px; color: #555555;">Se você não solicitou este e-mail, por favor ignore-o.</p>
                        </div>
                        <!-- Rodapé -->
                        <div style="padding: 20px; text-align: center; font-size: 12px; color: #999999;">
                        lavarcarro.com
                        </div>
                        <div style="padding: 20px; text-align: center; font-size: 12px; color: #999999;">
                        © 2024 Lavar Carro. Todos os direitos reservados.
                        </div>
                    </div>
                </body>
            </html>
            `
            await sendEmail(to, subject, body, text, messageId)
            res.status(201).json({
                data: {
                    userId: user.id,
                    userName: user.name
                }
            })
        } else {
            res.status(400).json("Erro ao criar usuário!")
        }

    } catch (error) {
        res.status(400).json(error)
    }
}

export const deleteUser = async (req, res) => {
    const { id } = req.params

    try {
        const user = await userClient.delete({
            where: { id: String(id) }
        })

        await prisma.log.create({
            data: {
                description: "Usuário deletado!",
                userId: id
            }
        })
        res.status(200).json({ msg: "Usuário deletado!" })
    } catch (error) {
        res.status(400).json(error)
    }
}

export const softDeleteUser = async (req, res) => {
    const { id } = req.params
    const deletedAt = new Date()

    try {
        const user = await userClient.update({
            where: { id: String(id) },
            data: { deletedAt }
        })
        res.status(200).json({ data: user })
    } catch (error) {
        res.status(400).json(error)
    }
}

export const updateUser = async (req, res) => {
    const { id } = req.params
    const { email, password, name } = req.body

    if (!email || !password || !name) {
        res.status(400).json({ "erro": "Email, Password and Name are required!" })
        return
    }

    try {
        const user = await userClient.update({
            where: { id: String(id) },
            data: { email, password, name },
        })
        res.status(200).json({ data: user })
    } catch (error) {
        res.status(400).json(error)
    }
}

export const generateCode = async (req, res) => {
    const { email } = req.body

    if (!email) {
        res.status(400).json({ "erro": "E-mail é obrigatório!" })
        return
    }

    const isValidEmail = emailVerify(email)
    if (!isValidEmail) {
        res.status(405).json({ erro: "E-mail inválido!" })
        return
    }
    //talvez adicionar verificação se existe código válido
    const randomCode = Math.floor(Math.random() * 900000) + 100000;
    console.log(email)

    try {
        const [user, code] = await prisma.$transaction([
            prisma.user.findUnique({ where: { email } }),
            prisma.code.create({
                data: {
                    email: email,
                    code: randomCode.toString(),
                    createdAt: new Date()
                }
            })
        ])

        if (user) {
            if (code) {
                const to = email
                const subject = "Lavar Carro - Código para alteração de senha."
                const text = `Versão texto simples: Este é o seu código para alteração de senha: ${code.code} caso não consiga visualizar o e-mail estilizado.`
                const messageId = `<${uuidv7()}@lavarcarro.com>`
                const body = `
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                <meta charset="UTF-8">
                <title>Recuperação de Senha</title>
                </head>
                    <body style="font-family: 'Arial', sans-serif; background-color: #f5f5f5; margin: 0; padding: 0;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                            <!-- Cabeçalho -->
                            <div style="padding: 20px; text-align: center;">
                            </div>
                            <!-- Conteúdo -->
                            <div style="padding: 30px 20px; text-align: center;">
                            <h1 style="font-size: 24px; color: #333333; margin-bottom: 20px;">Código de Recuperação de Senha</h1>
                            <p style="font-size: 16px; color: #555555;">Use o código abaixo para redefinir sua senha:</p>
                            <div style="font-size: 48px; color: #3B82F6; margin: 20px 0; letter-spacing: 5px;">${code.code}</div>
                            <p style="font-size: 16px; color: #555555;">Este código expira em 15 minutos.</p>
                            </div>
                            <!-- Rodapé -->
                            <div style="padding: 20px; text-align: center; font-size: 12px; color: #999999;">
                            lavarcarro.com
                            </div>
                            <div style="padding: 20px; text-align: center; font-size: 12px; color: #999999;">
                            © 2024 Lavar Carro. Todos os direitos reservados.
                            </div>
                        </div>
                    </body>
                </html>
                `
                await sendEmail(to, subject, String(body), text, messageId);
                res.status(200).json({
                    data: {
                        email: email,
                    }
                })
            } else {
                res.status(400).json({ erro: "Erro ao gerar código!" })
            }
        } else {
            res.status(405).json({ erro: "E-mail inválido! AQUI" })
        }
    } catch (error) {
        res.status(400).json(error)
    }
}

export const validateCode = async (req, res) => {
    const { email, code } = req.body

    console.log(email, code)
    if (!email || !code) {
        res.status(400).json({ "erro": "E-mail e código são obrigatórios!" })
        return
    }

    try {
        const responseCode = await prisma.code.findFirst({
            where: {
                code: code,
                email: email,
                deletedAt: null
            }
        })

        if (responseCode) {
            const currentTime = new Date();
            const codeCreationTime = new Date(responseCode.createdAt);
            const timeDifference = (currentTime.getTime() - codeCreationTime.getTime()) / (1000 * 60);

            if (timeDifference > 15) {
                res.status(400).json({ erro: "Código expirado!" })
                return;
            }

            const deletedCode = await prisma.code.deleteMany({
                where: {
                    id: responseCode.id,
                    email: email,
                    code: code,
                    deletedAt: null
                }
            })
            if (deletedCode) {
                res.status(200).json({
                    data: {
                        msg: "Código validado!",
                        email: email
                    }
                })
            } else {
                res.status(400).json({ erro: "Erro ao deletar código!" })
            }
        } else {
            res.status(404).json({ erro: "Código inválido!" })
        }
    } catch (error) {
        res.status(400).json(error)
    }
}

export const changeUserPassword = async (req, res) => {
    const { email, password } = req.body
    console.log(email, password)
    if (!email || !password) {
        res.status(400).json({ erro: "Email e senha são obrigatórios!" })
        return
    }

    const message = passwordVerify(password)
    if (message.length > 0) {
        res.status(400).json({ erro: message.join("-") })
        return
    }

    const hashedPassword = hashSync(password, 10)

    try {
        const user = await userClient.update({
            where: {
                email: email
            },
            data: { password: hashedPassword }
        })
        if (user) {
            res.status(200).json({ msg: "Senha alterada com sucesso!" })
        } else {
            res.status(400).json({ error: "Erro ao alterar a senha!" })
        }

    } catch (error) {
        res.status(400).json(error)
    }
}

export const userRoleUpdate = async (req, res) => {
    const { id } = req.params
    const { role } = req.body

    if (!role) {
        res.status(400).json({ "erro": "role are required!" })
        return
    }

    try {
        const user = await userClient.update({
            where: { id: String(id) },
            data: { role }
        })
        await prisma.log.create({
            data: {
                description: "Permissão alterada!",
                userId: id
            }
        })
        res.status(200).json({ data: user })
    } catch (error) {
        res.status(400).json(error)
    }
}

export const emailValidate = async (req, res) => {
    const { userId, email } = req.body

    if (!userId || !email) {
        res.status(400).json({ "erro": "userId e E-mail são obrigatórios!" })
        return
    }

    const isValidEmail = emailVerify(email)
    if (!isValidEmail) {
        res.status(405).json({ erro: "E-mail inválido!" })
        return
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId, email }
        })

        if (user) {
            const profile = await prisma.profile.update({
                where: { userId },
                data: {
                    verified: true
                }
            })

            if (profile) {
                const to = email
                const subject = "Lavar Carro - E-mail validado com sucesso!"
                const text = `Versão texto simples: Seja bem-vindo(a) à Lavar Carro! Estamos muito felizes em ter você conosco. Você faz parte da primeira plataforma dedicada à estéticas automotivas do Brasil. Caso não consiga visualizar o e-mail estilizado.`
                const messageId = `<${uuidv7()}@lavarcarro.com>`
                const body = `
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                <meta charset="UTF-8">
                <title>Bem-vindo(a) à Lavar Carro</title>
                </head>
                    <body style="font-family: 'Arial', sans-serif; background-color: #f5f5f5; margin: 0; padding: 0;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                            <!-- Cabeçalho -->
                            <div style="padding: 20px; text-align: center;">
                            </div>
                            <!-- Conteúdo -->
                            <div style="padding: 30px 20px; text-align: center;">
                            <h1 style="font-size: 28px; color: #333333; margin-bottom: 20px;">Seja bem-vindo(a) à Lavar Carro!</h1>
                            <p style="font-size: 16px; color: #555555;">Estamos muito felizes em ter você conosco. Você faz parte da primeira plataforma dedicada à estéticas automotivas do Brasil.</p>
                            </div>
                            <!-- Rodapé -->
                            <div style="padding: 20px; text-align: center; font-size: 12px; color: #999999;">
                            lavarcarro.com
                            </div>
                            <div style="padding: 20px; text-align: center; font-size: 12px; color: #999999;">
                            © 2024 Lavar Carro. Todos os direitos reservados.
                            </div>
                        </div>
                    </body>
                </html>

                `

                await sendEmail(to, subject, body, text, messageId);
                res.status(200).json({
                    data: {
                        email,
                    }
                })
            } else {
                res.status(400).json({ erro: "Erro ao validar e-mail!" })
            }
        } else {
            res.status(404).json({ erro: "Erro ao encontrar usuário!" })
        }
    } catch (error) {
        res.status(400).json(error)
    }
}