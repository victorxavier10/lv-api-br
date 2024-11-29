// import { PrismaClient } from "@prisma/client"
// import { Router } from "express"

// const prisma = new PrismaClient()
// const router = Router()

// router.get("/", async (req, res) => {
//   try {
//     const vinhos = await prisma.vinho.findMany()
//     res.status(200).json(vinhos)
//   } catch (error) {
//     res.status(400).json(error)
//   }
// })

// router.post("/", async (req, res) => {
//   const { tipo, preco, quant, teor, marcaId } = req.body

//   if (!tipo || !preco || !quant || !teor || !marcaId) {
//     res.status(400).json({ "erro": "Informe tipo, preco, quant, teor e marcaId" })
//     return
//   }

//   try {
//     const vinho = await prisma.vinho.create({
//       data: { tipo, preco, quant, teor, marcaId }
//     })
//     res.status(201).json(vinho)
//   } catch (error) {
//     res.status(400).json(error)
//   }
// })

// router.delete("/:id", async (req, res) => {
//   const { id } = req.params

//   try {
//     const vinho = await prisma.vinho.delete({
//       where: { id: Number(id) }
//     })
//     res.status(200).json(vinho)
//   } catch (error) {
//     res.status(400).json(error)
//   }
// })

// router.put("/:id", async (req, res) => {
//   const { id } = req.params
//   const { tipo, preco, quant, teor, marcaId } = req.body

//   if (!tipo || !preco || !quant || !teor || !marcaId) {
//     res.status(400).json({ "erro": "Informe tipo, preco, quant, teor e marcaId" })
//     return
//   }

//   try {
//     const vinho = await prisma.vinho.update({
//       where: { id: Number(id) },
//       data: { tipo, preco, quant, teor, marcaId }
//     })
//     res.status(200).json(vinho)
//   } catch (error) {
//     res.status(400).json(error)
//   }
// })

// export default router