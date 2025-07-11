'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setActiveView, toggleSidebar, setSearchQuery } from '@/store/slices/uiSlice';
import ConversationList from './ConversationList';
import UserProfile from './UserProfile';
import NewConversationModal from './NewConversationModal';
import { AnyCaaRecord } from 'dns';

export default function Sidebar() {
  const dispatch = useAppDispatch();
  const { activeView, sidebarOpen, searchQuery } = useAppSelector((state) => state.ui);
  const { user } = useAppSelector((state) => state.auth);
  const [showNewConversation, setShowNewConversation] = useState(false);

  const menuItems = [
    { id: 'chats', label: 'Chats', icon: ChatBubbleLeftRightIcon },
    { id: 'contacts', label: 'Contacts', icon: UserGroupIcon },
    { id: 'settings', label: 'Settings', icon: Cog6ToothIcon },
  ];

  return (
    <>
      <aside
        className={`fixed left-0 top-0 h-full bg-white dark:bg-gray-800 shadow-xl transition-all duration-300 z-40 ${
          sidebarOpen ? "w-80" : "w-20"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <motion.div
                initial={false}
                animate={{ opacity: sidebarOpen ? 1 : 0 }}
                className={`flex items-center space-x-3 ${
                  !sidebarOpen && "hidden"
                }`}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">N</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  NexChat
                </h1>
              </motion.div>
              <button
                onClick={() => dispatch(toggleSidebar())}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {sidebarOpen ? (
                  <XMarkIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Bars3Icon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Search */}
          {sidebarOpen && (
            <div className="p-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="px-4 py-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => dispatch(setActiveView(item.id as any))}
                className={`w-full flex items-center ${
                  sidebarOpen ? "justify-start" : "justify-center"
                } space-x-3 px-3 py-2 mb-1 rounded-lg transition-all ${
                  activeView === item.id
                    ? "bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {sidebarOpen && (
                  <span className="font-medium">{item.label}</span>
                )}
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {activeView === "chats" && <ConversationList />}
            {activeView === "contacts" && sidebarOpen && (
              <div className="p-4">
                <p className="text-gray-500 dark:text-gray-400">
                  Contacts coming soon...
                </p>
              </div>
            )}
            {activeView === "settings" && sidebarOpen && (
              <div className="p-4">
                <p className="text-gray-500 dark:text-gray-400">
                  Settings coming soon...
                </p>
              </div>
            )}
          </div>

          {/* User Profile */}
          {user && <UserProfile user={user} expanded={sidebarOpen} />}

          {/* New Conversation Button */}
          {sidebarOpen && activeView === "chats" && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNewConversation(true)}
              className="absolute bottom-24 right-6 w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
            >
              <PlusIcon className="w-6 h-6 text-white" />
            </motion.button>
          )}
        </div>
      </aside>

      {/* New Conversation Modal */}
      <NewConversationModal
        isOpen={showNewConversation}
        onClose={() => setShowNewConversation(false)}
      />
    </>
  );
  }