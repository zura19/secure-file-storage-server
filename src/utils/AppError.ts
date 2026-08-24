class AppError extends Error {
  status: number;
  statusText: "fail" | "error";
  isOperational: boolean;

  constructor(message: string, status: number) {
    super(message);

    this.status = status;
    this.statusText = status.toString().startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default AppError;
