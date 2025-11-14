class AppError extends Error {
    public readonly statusCode: number;
    public readonly log: unknown;

    constructor(
        message: string,
        statusCode = 500,
        log?: unknown
    ) {
        super(message);
        this.statusCode = statusCode;
        this.log = !log ? message : log;
        Error.captureStackTrace(this, this.constructor);
    }

    static wrap(
        error: unknown,
        fallbackStatus = 500,
        fallbackMessage = "Internal server error",
        log: string
    ): AppError {
        if (error instanceof AppError) return error;
        
        return new AppError(
            fallbackMessage,
            fallbackStatus,
            `[Status]: ${fallbackStatus} | [Message]: ${log} | [Error]: ${error instanceof Error ? error.message : error}`
        );
    }
}

export default AppError;