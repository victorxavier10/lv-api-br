import { Router } from "express"

import { createProfile, createProfileComplete, getAllProfiles, getListOfMaxPrice, getListOfMinPrice, getListOfTotalPoints, getProfileById, softDeleteProfile, deleteProfile, updateProfile, updateProfileEditDetails } from "../controllers/profiles.controller"
import { tokenVerify } from '../middlewares/tokenVerify.middleware'

const profileRouter = Router()

profileRouter
	// .get("/", tokenVerify, getAllProfiles) // Com middleware
	.get("/", getAllProfiles)
	.get("/:id", getProfileById)
	// .get("/list/total-points", getListOfTotalPoints)
	// .get("/list/max-price", getListOfMaxPrice)
	// .get("/list/min-price", getListOfMinPrice)
	// .post("/", tokenVerify, createProfile)
	.post("/", createProfile)
	// .post("/complete", createProfileComplete)
	.delete("/:id", deleteProfile)
	.put("/delete/:id", tokenVerify, softDeleteProfile)
	.put("/:id", tokenVerify, updateProfile)
	.put("/details/:id", tokenVerify, updateProfileEditDetails)

export default profileRouter
