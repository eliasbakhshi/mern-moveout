// This make it work to just import one time the env file in the app
import dotenv from 'dotenv'
dotenv.config({ path: `.env${process.env.NODE_ENV}` });
