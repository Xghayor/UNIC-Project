import React, { useEffect, useState } from 'react';
import { FaTrash } from 'react-icons/fa';

interface UserHistoryProps {
  onNewChat: () => void;
  prompt: string;
  setIsHistoryVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const UserHistory: React.FC<UserHistoryProps> = ({ prompt, onNewChat, setIsHistoryVisible }) => {
  const [chats, setChats] = useState<Array<{ id: string; content: string }>>([]);
  const [isLocalHistoryVisible, setLocalIsHistoryVisible] = useState(true);

  useEffect(() => {
    const savedChats = localStorage.getItem('chatHistory');
    if (savedChats) {
      setChats(JSON.parse(savedChats));
    }
  }, [prompt]);

  useEffect(() => {
    // Sync the local state with the prop state
    setLocalIsHistoryVisible(true);
  }, [prompt]);

  const handleChatRemove = (chatId: string) => {
    const updatedChats = chats.filter((chat) => chat.id !== chatId);
    setChats(updatedChats);
    localStorage.setItem('chatHistory', JSON.stringify(updatedChats));
  };

  const toggleHistoryMenu = () => {
    const newVisibility = !isLocalHistoryVisible;
    setLocalIsHistoryVisible(newVisibility);
    setIsHistoryVisible(newVisibility);
  };

  return (
    <div className="relative">
      <div
        className={`w-72 bg-gray-900 text-white p-4 h-screen fixed top-0 left-0 overflow-y-auto transition-transform duration-300
        ${isLocalHistoryVisible ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">User History</h2>
          <button
            onClick={toggleHistoryMenu}
            className="text-gray-500 hover:text-white"
          >
            X
          </button>
        </div>

        <button
          onClick={onNewChat}
          className="w-full p-2 bg-blue-500 text-white rounded-full hover:bg-blue-400 mt-4"
          style={{ borderRadius: '22px' }}
        >
          + New Chat
        </button>

        <ul className="space-y-2 mt-4 flex-1 overflow-y-auto">
          {chats.length > 0 ? (
            chats.map((chat) => (
              <li
                key={chat.id}
                className="cursor-pointer p-2 hover:bg-gray-800 flex justify-between items-center"
              >
                <span>{chat.content.slice(0, 20) || 'No title'}</span>
                <button onClick={() => handleChatRemove(chat.id)} className="text-gray-500">
                  <FaTrash className="h-5 w-5" />
                </button>
              </li>
            ))
          ) : (
            <div className='p-2'>No conversations yet.</div>
          )}
        </ul>

        <div className="mt-4 pt-4 absolute bottom-0 left-0 w-full bg-gray-900">
          <div className="flex items-center gap-2 p-2.5 text-sm cursor-pointer hover:bg-gray-800 rounded-lg">
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
              </svg>
            </span>

            <div className="flex flex-col">
              <span className="font-semibold">Upgrade Plan</span>
              <span className="text-xs text-gray-500">More access to the best models</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserHistory;
