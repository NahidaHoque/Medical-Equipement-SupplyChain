import medicalModel from "../models/medicalModel.js";
import { contract } from "../contract.js";
import fs from 'fs'

// add medical equipment

const addMedical = async(req,res)=>{
     
      let image_filename = `${req.file.filename}`;

      const medical = new medicalModel({
        name:req.body.name,
        price:req.body.price,
        category:req.body.category,
        image:image_filename,
        quantity: req.body.quantity

      })
      try{
        await medical.save();
        res.json({success:true,message:"Equipment Added"})
      } catch (error){
            console.log(error)
            res.json({success:false,message:"Error"})
      }


}
// all equipment list

const listEquipment = async (req,res)=>{
      try{
        const medicals =await medicalModel.find({});
        res.json({success:true,data:medicals})
      }catch (error){
        console.log(error);
        res.json({success:false,message:"Error"})

      }
}

// remove medical equipment

const removeMedical = async (req,res)=>{
     try {
        const medical = await medicalModel.findById(req.body.id);
        fs.unlink(`uploads/${medical.image}`,()=>{})

        await medicalModel.findByIdAndDelete(req.body.id);
        res.json({success:true,message:"Equipment removed"})
        
     } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
        
     }
}

export {addMedical,listEquipment,removeMedical}