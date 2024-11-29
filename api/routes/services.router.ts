import { Router } from "express"

import { getServiceByProfileId, createService, updateService, deleteService } from '../controllers/services.controller'

const router = Router()

router
    .get('/:id', getServiceByProfileId)
    .post('/', createService)
    .put('/:id', updateService)
    .delete('/:id', deleteService)

export default router
