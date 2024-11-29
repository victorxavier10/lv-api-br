import { Router } from 'express'
import { upload, uploadCoverImage, deleteCoverImage } from '../controllers/coverImage.controller';

const coverImageRouter = Router()

coverImageRouter.post('/', upload.single('image'), uploadCoverImage)
coverImageRouter.delete('/', deleteCoverImage);

export default coverImageRouter
