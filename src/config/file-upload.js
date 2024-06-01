import multer from "multer";

export const handleFileUploadMiddleware = multer({ dest: "src/storage" });
