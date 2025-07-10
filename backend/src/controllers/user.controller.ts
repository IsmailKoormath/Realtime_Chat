import { Response } from "express";
import { UserModel } from "../models/User.model";
import { asyncHandler } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth.middleware";

export const getUsers = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const users = await UserModel.find({ _id: { $ne: req.userId } })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users,
    });
  }
);

export const getUserById = asyncHandler(
  async (req: AuthRequest, res: Response) => {
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
  }
);

export const updateProfile = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const updates = req.body;

    if (updates.username) {
      const existingUser = await UserModel.findOne({
        username: updates.username,
        _id: { $ne: req.userId },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: "Username already taken",
        });
      }
    }

    const user = await UserModel.findByIdAndUpdate(req.userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.json({
      success: true,
      data: user,
    });
  }
);

export const searchUsers = asyncHandler(
  async (req: AuthRequest, res: Response) => {
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
  }
);
