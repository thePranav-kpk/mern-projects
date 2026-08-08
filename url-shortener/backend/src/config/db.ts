import mongoose from "mongoose";

const connectDB = (URL:string) => {
  return mongoose.connect(URL)
}

export default connectDB;