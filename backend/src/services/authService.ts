import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { generateToken } from "../utils/tokenUtils";

export const registerUser = async (
  name: string,
  email: string,
  password: string
) => {
  const existing = await User.findOne({ email });
  if (existing) throw new Error("User already exists");

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed });

  const token = generateToken(user);
  return { id: user._id, name: user.name, email: user.email, token };
};

export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid credentials");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Invalid credentials");

  const token = generateToken(user);
  return { id: user._id, name: user.name, email: user.email, token };
};
