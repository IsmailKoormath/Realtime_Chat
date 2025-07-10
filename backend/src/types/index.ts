import { Request } from "express";
import { IUserDocument } from "../models/User.model";

export interface AuthRequest extends Request {
  userId?: string;
  user?: IUserDocument;
}

export interface SocketRequest extends Request {
  userId?: string;
}
