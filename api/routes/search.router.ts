import { Router } from "express"

import { getAllCities, getAllStates, getCitiesByStateId, getCityByContainName, getCityById, getCityByName, getNeighborhoodById, getProfilesByCityById, getStateByContainName, getStateById, getStateByName } from "../controllers/search.controller"

const router = Router()

router
    .get("/cities", getAllCities)
    .get("/city/:id", getCityById)
    .get("/neighborhood/:id", getNeighborhoodById)
    .get("/profiles/city/:id", getProfilesByCityById)
    .get("/city/list/:name", getCityByName)
    .get("/city/list/contain/:name", getCityByContainName)
    .get("/states", getAllStates)
    .get("/state/:id", getStateById)
    .get("/cities-by-state/:stateId", getCitiesByStateId)
    .get("/state/list/:name", getStateByName)
    .get("/state/list/contain/:name", getStateByContainName)

export default router
