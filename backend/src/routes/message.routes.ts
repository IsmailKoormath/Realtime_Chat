import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate";
import { body, param } from "express-validator";
import {
  getMessages,
  sendMessage,
  markAsRead,
} from "../controllers/message.controller";
import multer from "multer";
import path from "path";

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../uploads/files");
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

router.use(authenticate);

router.get(
  "/:conversationId",
  [param("conversationId").isMongoId().withMessage("Invalid conversation ID")],
  validate,
  getMessages
);

router.post(
  "/",
  [
    body("conversationId").isMongoId().withMessage("Invalid conversation ID"),
    body("content").optional().isString().trim(),
    body("type").optional().isIn(["text", "image", "file"]),
  ],
  validate,
  sendMessage
);

// router.post("/upload", upload.single("file"), async (req: any, res) => {
//   if (!req.file) {
//     return res.status(400).json({
//       success: false,
//       error: "No file uploaded",
//     });
//   }

//   res.json({
//     success: true,
//     data: {
//       filename: req.file.filename,
//       originalName: req.file.originalname,
//       size: req.file.size,
//       url: `/uploads/files/${req.file.filename}`,
//     },
//   });
// });

router.patch(
  "/:messageId/read",
  [param("messageId").isMongoId().withMessage("Invalid message ID")],
  validate,
  markAsRead
);

export default router;
