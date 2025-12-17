import mongoose from "mongoose";

const medicalSchema = new mongoose.Schema({
    name: {type:String, required:true},
    //description:{type:String, required:true},
    price:{type:Number, required:true},
    image:{type:String,required:true},
    category:{type:String,required:true},
    quantity:{type:Number, required:true}
})

const medicalModel = mongoose.models.medical || mongoose.model("medical",medicalSchema);

export default medicalModel;