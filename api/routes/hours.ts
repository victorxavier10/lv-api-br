import { PrismaClient } from "@prisma/client"
import { Router } from "express"

const prisma = new PrismaClient()
const router = Router()

type WorkingHourInput = {
    start: string;
    end: string;
    scheduleId: number;
    profileId: number;
};

router.get("/", async (req, res) => {
    try {
        const workingHours = await prisma.workingHour.findMany({
            include: {
                schedule: true,
            }
        })
        res.status(200).json(workingHours)
    } catch (error) {
        res.status(400).json(error)
    }
})

router.get("/:id", async (req, res) => {
    const { id } = req.params

    try {
        const workingHour = await prisma.workingHour.findUnique({
            where: {
                id: Number(id)
            },
            include: {
                schedule: true,
            }
        })
        res.status(200).json(workingHour)
    } catch (error) {
        res.status(400).json(error)
    }
})

router.get("/schedule/:scheduleId", async (req, res) => {
    const { scheduleId } = req.params

    try {
        const workingHour = await prisma.workingHour.findMany({
            where: {
                scheduleId: Number(scheduleId)
            },
            include: {
                schedule: true,
            }
        })
        res.status(200).json(workingHour)
    } catch (error) {
        res.status(400).json(error)
    }
})

router.get("/profile/:profileId", async (req, res) => {
    const { profileId } = req.params

    try {
        const workingHours = await prisma.workingHour.findMany({
            where: {
                profileId: String(profileId)
            },
            include: {
                schedule: true,
            }
        })
        res.status(200).json(workingHours)
    } catch (error) {
        res.status(400).json(error)
    }
})

//Adicionar horário de almoço
router.post("/", async (req, res) => {
    const {
        scheduleId,
        profileId
    } = req.body

    try {
        const workingHour = await prisma.workingHour.create({
            data: {
                scheduleId,
                profileId
            }
        })
        res.status(201).json(workingHour)
    } catch (error) {
        res.status(400).json(error)
    }
})

// router.post("/create", async (req, res) => {
//     const workingHours: WorkingHourInput[] = req.body.workingHours;

//     try {
//         const creates = workingHours.map(({ start, end, scheduleId, profileId }) => 
//             prisma.workingHour.create({
//                 data: {
//                     scheduleId,
//                     profileId
//                 }
//             })
//         );

//         const workingHourRecords = await Promise.all(creates);
//         res.status(201).json(workingHourRecords);
//     } catch (error) {
//         res.status(400).json(error);
//     }
// });

router.delete("/:id", async (req, res) => {
    const { id } = req.params

    try {
        const workingHour = await prisma.workingHour.delete({
            where: { id: Number(id) },
            include: {
                schedule: true,
            }
        })
        res.status(200).json(workingHour)
    } catch (error) {
        res.status(400).json(error)
    }
})

router.put("/delete/:id", async (req, res) => {
    const { id } = req.params
    const deletedAt = new Date()

    try {
        const workingHour = await prisma.workingHour.update({
            where: { id: Number(id) },
            include: {
                schedule: true,
            },
            data: { deletedAt }
        })
        res.status(200).json(workingHour)
    } catch (error) {
        res.status(400).json(error)
    }
})

// router.put("/:id", async (req, res) => {
//     const { id } = req.params
//     const { start, end } = req.body

//     try {
//         const workingHour = await prisma.workingHour.update({
//             where: { id: Number(id) },
//             data: { start, end }
//         })
//         res.status(200).json(workingHour)
//     } catch (error) {
//         res.status(400).json(error)
//     }
// })

export default router
