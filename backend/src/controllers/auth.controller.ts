import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User.model';
import { asyncHandler } from '../middleware/errorHandler';
import { AppError } from '../middleware/errorHandler';
import { RegisterCredentials, LoginCredentials } from '../../../shared/types';

const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { username, email, password }: RegisterCredentials = req.body;

  const existingUser = await UserModel.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    throw new AppError("User already exists with this email or username", 400);
  }

  const user = await UserModel.create({
    username,
    email,
    password,
  });

  const token = generateToken(user._id.toString());

  res.status(201).json({
    success: true,
    data: {
      user: user.toJSON(),
      token,
    },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password }: LoginCredentials = req.body;

  const user = await UserModel.findOne({ email });

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = generateToken(user._id.toString());

  res.json({
    success: true,
    data: {
      user: user.toJSON(),
      token,
    },
  });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await UserModel.findById((req as any).userId);

  res.json({
    success: true,
    data: user,
  });
});