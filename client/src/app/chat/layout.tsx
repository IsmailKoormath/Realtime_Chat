"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchCurrentUser } from "@/store/slices/authSlice";
import { fetchConversations } from "@/store/slices/conversationSlice";
import { socketService } from "@/services/socket";
import Sidebar from "@/components/Sidebar";
import LoadingScreen from "@/components/LoadingScreen";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, token, user } = useAppSelector(
    (state) => state.auth
  );
  const { sidebarOpen } = useAppSelector((state) => state.ui);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.push("/auth/login");
      return;
    }

    // Initialize user data and socket connection
    const initializeChat = async () => {
      if (!user) {
        await dispatch(fetchCurrentUser());
      }
      await dispatch(fetchConversations());
      socketService.connect(token);
    };

    initializeChat();

    return () => {
      socketService.disconnect();
    };
  }, [isAuthenticated, token, user, dispatch, router]);

  if (!user) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-80" : "ml-20"
        }`}
      >
        {children}
      </main>
    </div>
  );
}
