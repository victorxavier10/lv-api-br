import { PrismaClient } from "@prisma/client"
import { Router } from "express"

const prisma = new PrismaClient()
const router = Router()

type NeighborhoodsInput = {
	name: string;
	cityId: number;
};

router.get("/", async (req, res) => {
	try {
		const neighborhoods = await prisma.neighborhoods.findMany()
		res.status(200).json(neighborhoods)
	} catch (error) {
		res.status(400).json(error)
	}
})

router.get("/:id", async (req, res) => {
	const { id } = req.params

	try {
		const neighborhood = await prisma.neighborhoods.findUnique({
			where: { id: Number(id) }
		})
		res.status(200).json(neighborhood)
	} catch (error) {
		res.status(400).json(error)
	}
})

router.get("/list/:name", async (req, res) => {
	const { name } = req.params

	try {
		const neighborhoods = await prisma.neighborhoods.findMany({
			where: {
				name
			}
		})
		res.status(200).json(neighborhoods)
	} catch (error) {
		res.status(400).json(error)
	}
})

router.get("/search/:cityId/:name", async (req, res) => {
	const { cityId, name } = req.params
	console.log(cityId, name)
	try {
		const neighborhoods = await prisma.neighborhoods.findMany({
			where: {
			 	name: {
					contains: name,
					mode: 'insensitive'
				},
                cityId: Number(cityId)
			}
		})
		console.log(neighborhoods)
		res.status(200).json(neighborhoods)
	} catch (error) {
		res.status(400).json(error)
	}
})

// router.post("/", async (req, res) => {
// 	const {
// 		name,
// 		uf,
// 		stateId
// 	} = req.body

// 	try {
// 		const city = await prisma.city.create({
// 			data: {
// 				name,
// 				uf,
// 				stateId
// 			}
// 		})
// 		res.status(201).json(city)
// 	} catch (error) {
// 		res.status(400).json(error)
// 	}
// })

// router.post("/create", async (req, res) => {
// 	const cities: CitiesInput[] = req.body.citiesInput;

// 	try {
// 		const creates = cities.map(({ name, uf, stateId }) =>
// 			prisma.city.create({
// 				data: {
// 					name,
// 					uf,
// 					stateId
// 				}
// 			})
// 		);

// 		const citiesRecords = await Promise.all(creates);
// 		res.status(201).json(citiesRecords);
// 	} catch (error) {
// 		res.status(400).json(error);
// 	}
// });

router.put("/:id", async (req, res) => {
	const { id } = req.params
	const {
		name
	} = req.body

	try {
		const neighborhoods = await prisma.neighborhoods.update({
			where: { id: Number(id) },
			data: {
				name
			}
		})
		res.status(200).json(neighborhoods)
	} catch (error) {
		res.status(400).json(error)
	}
})

export default router
