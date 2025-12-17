import express from "express"

import {addMedical,listEquipment,removeMedical} from "../controllers/medicalController.js"
import multer from "multer"

const medicalRouter = express.Router();

//Image Storage Engine

const storage = multer.diskStorage({
    destination:"uploads",
    filename:(req,file,cb)=>{
        return cb(null,`${Date.now()}${file.originalname}`)

    }
})

const upload = multer({storage:storage})

medicalRouter.post("/add",upload.single("image"),addMedical)
medicalRouter.get("/list",listEquipment)
medicalRouter.post("/remove",removeMedical);




export default medicalRouter;
