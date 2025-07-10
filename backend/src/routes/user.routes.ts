import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate";
import { body } from "express-validator";
import { asyncHandler } from "../middleware/errorHandler";
import { Request, Response } from "express";
import { UserModel } from "../models/User.model";
import { AuthRequest } from "../middleware/auth.middleware";
import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs/promises";

const router = Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Get all users
router.get(
  "/",
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const users = await UserModel.find({ _id: { $ne: req.userId } })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users,
    });
  })
);

// Get user by ID
router.get(
  "/:userId",
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await UserModel.findById(req.params.userId).select(
      "-password"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  })
);

// Update user profile
router.patch(
  "/profile",
  authenticate,
  upload.single("avatar"),
  [body("username").optional().isLength({ min: 3, max: 30 }).trim()],
  validate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const updates: any = {};

    if (req.body.username) {
      // Check if username is already taken
      const existingUser = await UserModel.findOne({
        username: req.body.username,
        _id: { $ne: req.userId },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: "Username already taken",
        });
      }

      updates.username = req.body.username;
    }

    if (req.file) {
      // Process and save avatar
      const filename = `avatar-${req.userId}-${Date.now()}.jpeg`;
      const filepath = path.join(__dirname, "../../uploads/avatars", filename);

      // Ensure upload directory exists
      await fs.mkdir(path.dirname(filepath), { recursive: true });

      // Process image with sharp
      await sharp(req.file.buffer)
        .resize(200, 200)
        .jpeg({ quality: 90 })
        .toFile(filepath);

      updates.avatar = `/uploads/avatars/${filename}`;
    }

    const user = await UserModel.findByIdAndUpdate(req.userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.json({
      success: true,
      data: user,
    });
  })
);

// Search users
router.get(
  "/search/:query",
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { query } = req.params;

    const users = await UserModel.find({
      $and: [
        { _id: { $ne: req.userId } },
        {
          $or: [
            { username: { $regex: query, $options: "i" } },
            { email: { $regex: query, $options: "i" } },
          ],
        },
      ],
    })
      .select("-password")
      .limit(10);

    res.json({
      success: true,
      data: users,
    });
  })
);

export default router;
