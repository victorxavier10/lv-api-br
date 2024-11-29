import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const getServiceByProfileId = async (req, res) => {
    const { id } = req.params

    try {
        const services = await prisma.service.findMany({
            where: { profileId: String(id) }
        })
        res.status(200).json(services)
    } catch (error) {
        res.status(400).json(error)
    }
}

export const createService = async (req, res) => {
    const { profileId, title, description, value, time } = req.body

    try {
        const newService = await prisma.service.create({
            data: {
                profileId: String(profileId),
                title,
                description,
                value,
                time,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        })
        res.status(201).json(newService)
    } catch (error) {
        res.status(400).json(error)
    }
}

export const updateService = async (req, res) => {
    const { id } = req.params
    const { title, description, value, time } = req.body

    try {
        const updatedService = await prisma.service.update({
            where: { id: Number(id) },
            data: {
                title,
                description,
                value,
                time,
                updatedAt: new Date()
            }
        })
        res.status(200).json(updatedService)
    } catch (error) {
        res.status(400).json(error)
    }
}

export const deleteService = async (req, res) => {
    const { id } = req.params

    try {
        await prisma.service.delete({
            where: { id: Number(id) }
        })
        res.status(204).send()
    } catch (error) {
        res.status(400).json(error)
    }
}
