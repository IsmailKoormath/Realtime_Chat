"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRightOnRectangleIcon,
  CameraIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useAppDispatch } from "@/store/hooks";
import { logout, updateUser } from "@/store/slices/authSlice";
import { User } from "../../../shared/index";
import Avatar from "./Avatar";
import { userAPI } from "@/services/api";
import toast from "react-hot-toast";

interface UserProfileProps {
  user: User;
  expanded: boolean;
}

export default function UserProfile({ user, expanded }: UserProfileProps) {
  const dispatch = useAppDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(user.username);
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setLoading(true);
      const response = await userAPI.updateProfile(formData);
      dispatch(updateUser(response.data));
      toast.success("Avatar updated successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to update avatar");
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameUpdate = async () => {
    if (username === user.username) {
      setIsEditing(false);
      return;
    }

    const formData = new FormData();
    formData.append("username", username);

    try {
      setLoading(true);
      const response = await userAPI.updateProfile(formData);
      dispatch(updateUser(response.data));
      setIsEditing(false);
      toast.success("Username updated successfully");
    } catch (error) {
      toast.error("Failed to update username");
      console.log(error);
      setUsername(user.username);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-4">
      <div
        className={`flex items-center ${
          expanded ? "space-x-3" : "justify-center"
        }`}
      >
        <div className="relative group">
          <Avatar
            src={user.avatar}
            alt={user.username}
            size={expanded ? "md" : "sm"}
          />
          {expanded && (
            <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
              <CameraIcon className="w-5 h-5 text-white" />
              <input
                type="file"
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
                disabled={loading}
              />
            </label>
          )}
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex-1 min-w-0"
            >
              {isEditing ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="flex-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={loading}
                  />
                  <button
                    onClick={handleUsernameUpdate}
                    className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded"
                    disabled={loading}
                  >
                    <CheckIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setUsername(user.username);
                    }}
                    className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                    disabled={loading}
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {user.username}
                  </h3>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <PencilIcon className="w-3 h-3" />
                  </button>
                </div>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user.email}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={handleLogout}
          className={`p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ${
            !expanded && "mx-auto"
          }`}
          title="Logout"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
