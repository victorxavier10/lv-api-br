import { PrismaClient } from "@prisma/client"
import { Router } from "express"

const prisma = new PrismaClient()
const router = Router()

router.get("/", async (req, res) => {
  try {
    const images = await prisma.image.findMany()
    res.status(200).json(images)
  } catch (error) {
    res.status(400).json(error)
  }
})

router.get("/:id", async (req, res) => {
  const { id } = req.params

  try {
    const image = await prisma.image.findUnique({
      where: { id: Number(id) }
    })
    res.status(200).json(image)
  } catch (error) {
    res.status(400).json(error)
  }
})

router.post("/", async (req, res) => {
  const {
    url,
    published,
    profileId
  } = req.body

  try {
    const image = await prisma.image.create({
      data: {
        url,
        published,
        profileId
      }
    })
    res.status(201).json(image)
  } catch (error) {
    res.status(400).json(error)
  }
})

router.delete("/:id", async (req, res) => {
  const { id } = req.params

  try {
    const image = await prisma.image.delete({
      where: { id: Number(id) }
    })
    res.status(200).json(image)
  } catch (error) {
    res.status(400).json(error)
  }
})

router.put("/delete/:id", async (req, res) => {
  const { id } = req.params
  const deletedAt = new Date()

  try {
    const image = await prisma.image.update({
      where: { id: Number(id) },
      data: { deletedAt }
    })
    res.status(200).json(image)
  } catch (error) {
    res.status(400).json(error)
  }
})

router.put("/", async (req, res) => {
  const {
    url,
    oldImageId,
  } = req.body

  try {
    const image = await prisma.image.update({
      where: { id: Number(oldImageId) },
      data: {
        url
      }
    })
    res.status(200).json(image)
  } catch (error) {
    res.status(400).json(error)
  }
})

export default router
