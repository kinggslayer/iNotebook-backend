const mongoose= require("mongoose");
const mongoURI="mongodb://localhost:27017/?directConnection=true&readPreference=primary"

const connectToMongo=()=>{
    mongoose.connect(mongoURI).then(()=>console.log("Connected to mongo")).catch((e)=>console.log(e.message))

}
module.exports = connectToMongo;