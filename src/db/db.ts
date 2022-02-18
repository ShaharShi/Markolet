import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config()


const DB_NAME = process.env.DB_NAME;
const DB_URL = process.env.MONGODB_URI || 'mongodb://localhost:27017';

export async function connectDb() {
    await mongoose.connect(DB_URL, {
        dbName: DB_NAME
    })
}