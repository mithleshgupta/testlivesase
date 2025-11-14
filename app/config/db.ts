import mongoose from "mongoose";
import logger from "../utils/logger";

const connectDatabase = async (uri: string) => {
	try {
		await mongoose.connect(uri);
		logger.info(`Database connected`);
	} catch (err) {
		logger.error(`Database connection failed: ${err instanceof Error ? err.message : err}`);
		process.exit(1);
	}
};

export default connectDatabase;