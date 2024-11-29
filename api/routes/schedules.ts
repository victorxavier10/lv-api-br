import { PrismaClient } from "@prisma/client"
import { Router } from "express"

const prisma = new PrismaClient()
const router = Router()

const DayEnum = {
    Monday: 'Monday',
    Tuesday: 'Tuesday',
    Wednesday: 'Wednesday',
    Thursday: 'Thursday',
    Friday: 'Friday',
    Saturday: 'Saturday',
    Sunday: 'Sunday',
} as const;

type Day = keyof typeof DayEnum;

router.get("/", async (req, res) => {
    try {
        const schedules = await prisma.schedule.findMany({
            include: {
                workingHours: true,
            }
        })
        res.status(200).json(schedules)
    } catch (error) {
        res.status(400).json(error)
    }
})

router.get("/:id", async (req, res) => {
    const { id } = req.params

    try {
        const schedule = await prisma.schedule.findUnique({
            where: {
                id: Number(id)
            },
            include: {
                workingHours: true,
            }
        })
        res.status(200).json(schedule)
    } catch (error) {
        res.status(400).json(error)
    }
})

router.get("/day/list", async (req, res) => {
    const day: Day = req.body.day as Day;

    if (!DayEnum[day]) {
        res.status(400).json({ "error": "Valid day is required!" })
        return
    }

    try {
        const schedule = await prisma.schedule.findMany({
            where: {
                day: DayEnum[day]
            },
            include: {
                workingHours: true,
            }
        })
        res.status(200).json(schedule)
    } catch (error) {
        console.log(error)
        res.status(400).json(error)
    }
})

router.get("/days/list", async (req, res) => {
    const days: Day[] = req.body.days as Day[];

    // Validate each day in the array
    for (const day of days) {
        if (!DayEnum[day]) {
            res.status(400).json({ "error": `Invalid day: ${day}` })
            return
        }
    }

    try {
        const schedule = await prisma.schedule.findMany({
            where: {
                day: {
                    in: days.map(day => DayEnum[day]) // Use the 'in' operator to filter by multiple days
                }
            },
            include: {
                workingHours: true,
            }
        })
        res.status(200).json(schedule)
    } catch (error) {
        console.log(error)
        res.status(400).json(error)
    }
})

router.get("/profile/:profileId", async (req, res) => {
    const { profileId } = req.params

    try {
        const schedule = await prisma.schedule.findMany({
            where: {
                profileId: String(profileId)
            },
            include: {
                workingHours: true,
            }
        })
        res.status(200).json(schedule)
    } catch (error) {
        res.status(400).json(error)
    }
})

router.get("/day/profile/:profileId/list", async (req, res) => {
    const { profileId } = req.params
    const day: Day = req.body.day as Day;

    if (!DayEnum[day]) {
        res.status(400).json({ "error": "Valid day is required!" })
        return
    }

    try {
        const schedule = await prisma.schedule.findMany({
            where: {
                profileId: String(profileId),
                day: DayEnum[day]
            },
            include: {
                workingHours: true,
            }
        })
        res.status(200).json(schedule)
    } catch (error) {
        console.log(error)
        res.status(400).json(error)
    }
})

router.get("/days/profile/:profileId/list", async (req, res) => {
    const { profileId } = req.params
    const days: Day[] = req.body.days as Day[];

    // Validate each day in the array
    for (const day of days) {
        if (!DayEnum[day]) {
            res.status(400).json({ "error": `Invalid day: ${day}` })
            return
        }
    }

    try {
        const schedule = await prisma.schedule.findMany({
            where: {
                profileId: String(profileId),
                day: {
                    in: days.map(day => DayEnum[day]) // Use the 'in' operator to filter by multiple days
                }
            },
            include: {
                workingHours: true,
            }
        })
        res.status(200).json(schedule)
    } catch (error) {
        console.log(error)
        res.status(400).json(error)
    }
})

router.post("/", async (req, res) => {
    const {
        day,
        profileId
    } = req.body

    try {
        const schedule = await prisma.schedule.create({
            data: {
                day,
                profileId
            }
        })
        res.status(201).json(schedule)
    } catch (error) {
        res.status(400).json(error)
    }
})

router.post("/create/:profileId", async (req, res) => {
    const { profileId } = req.params;
    const days: Day[] = req.body.days as Day[];

    // Validate each day in the array
    for (const day of days) {
        if (!DayEnum[day]) {
            res.status(400).json({ "error": `Invalid day: ${day}` });
            return;
        }
    }

    try {
        const creates = days.map(day => 
            prisma.schedule.create({
                data: {
                    day: DayEnum[day],
                    profileId: String(profileId)
                }
            })
        );

        const schedules = await Promise.all(creates);
        res.status(201).json(schedules);
    } catch (error) {
        res.status(400).json(error);
    }
});


router.delete("/:id", async (req, res) => {
    const { id } = req.params

    try {
        const schedule = await prisma.schedule.delete({
            where: { id: Number(id) },
            include: {
                workingHours: true,
            }
        })
        res.status(200).json(schedule)
    } catch (error) {
        res.status(400).json(error)
    }
})

router.put("/delete/:id", async (req, res) => {
    const { id } = req.params
    const deletedAt = new Date()

    try {
        const schedule = await prisma.schedule.update({
            where: { id: Number(id) },
            include: {
                workingHours: true,
            },
            data: { deletedAt }
        })
        res.status(200).json(schedule)
    } catch (error) {
        res.status(400).json(error)
    }
})
//Falta fazer a requisição no Postman 
router.put("/:id", async (req, res) => {
    const { id } = req.params
    const { day } = req.body

    try {
        const schedule = await prisma.schedule.update({
            where: { id: Number(id) },
            data: { day }
            //Adicionar se é dia trabalhado ou não - boolean
        })
        res.status(200).json(schedule)
    } catch (error) {
        res.status(400).json(error)
    }
})

export default router
