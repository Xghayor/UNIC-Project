'use client';
import React, { useState } from 'react';
import { useChatInterfaceActions } from '../_utils/chatInterfaceActions';
import 'react-quill/dist/quill.snow.css';
import { MarkdownRenderer } from './MarkdownRenderer';
import SkeletonLoader from './SkeletonLoader';
import { FaCopy, FaEdit, FaPaperPlane, FaSave, FaStop, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import CopyToClipboard from 'react-copy-to-clipboard';
import UserHistory from './UserHistory';
import IconsBox from './IconsBox';

const ChatInterface: React.FC = () => {
  const {
    messages,
    userInput,
    editMode,
    isStopping,
    messageContainerRef,
    textareaRef,
    handleSend,
    handleEdit,
    handleSaveEdit,
    handleStop,
    setUserInput,
    mutation,
    clearMessages,
  } = useChatInterfaceActions();

  const [copiedId, setCopiedId] = useState<Number | null>(null);
  const [isHistoryVisible, setIsHistoryVisible] = useState(true);

  const handleCopy = (messageId: Number) => {
    setCopiedId(messageId);
    setTimeout(() => {
      setCopiedId(null);
    }, 1000);
  };

  const handleNewChat = () => {
    clearMessages();
  };

  const toggleHistoryMenu = () => {
    setIsHistoryVisible(!isHistoryVisible);
  };

  return (
    <div className="min-h-screen p-[50px_200px] flex flex-col"> {/* Let the entire document scroll */}
      <div className="flex w-full relative"> {/* Added relative to position the button correctly */}
        <div
          className={`transition-all duration-300 ${isHistoryVisible ? 'w-[20%]' : 'w-0'} overflow-hidden`} // Adjusted class for smooth transition
        >
          {isHistoryVisible && (
            <UserHistory prompt={userInput} onNewChat={handleNewChat} setIsHistoryVisible={setIsHistoryVisible} />
          )}
        </div>

        <div
          className={`transition-all duration-300 ${isHistoryVisible ? 'w-[80%]' : 'w-full'} flex-1 bg-black-800 text-white flex flex-col`}
        >
          {/* Message container that doesn't scroll */}
          <div ref={messageContainerRef} className="flex-1 p-10 space-y-4">
            {messages.length > 0 ? (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`relative p-2 rounded-md ${
                    message.isUser ? 'ml-auto w-3/5 bg-zinc-800' : 'w-full bg-zinc-900'
                  }`}
                >
                  <div>
                    <MarkdownRenderer>{message.content}</MarkdownRenderer>
                  </div>

                  <div className="text-xs text-gray-400 mt-2">{message.timestamp}</div>

                  <div className="mt-2 flex justify-end">
                    <CopyToClipboard text={message.content} onCopy={() => handleCopy(message.id)}>
                      <button className="flex items-center mr-2 p-1 text-[12px] text-gray-400 rounded-md hover:bg-gray-600">
                        <FaCopy className="mr-2" />
                      </button>
                    </CopyToClipboard>
                    {copiedId === message.id && <FaCopy className="mr-2 text-green-400" />}
                  </div>

                  {message.isUser && (
                    <div className="absolute bottom-2 right-2 flex space-x-2">
                      <FaEdit
                        className="text-gray-400 hover:text-white cursor-pointer"
                        onClick={() => handleEdit(message.id, message.content)}
                      />
                      {editMode === message.id && (
                        <FaSave
                          className="text-gray-400 hover:text-white cursor-pointer"
                          onClick={handleSaveEdit}
                        />
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-gray-400">
                <IconsBox />
              </div>
            )}

            {mutation.isPending && !isStopping && (
              <div className="relative p-2 w-full">
                <SkeletonLoader />
              </div>
            )}
          </div>

          {/* Sticky input area */}
          <div className="sticky bottom-0 bg-black-700 py-4 px-10">
            <div className="flex items-center space-x-2 border border-[#383636] px-5 py-0 rounded-[22px]">
              <textarea
                ref={textareaRef}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="flex-1 pt-2 bg-black-700 rounded-md text-white outline-none resize-none"
                placeholder="Type your message..."
                style={{ minHeight: '30px', maxHeight: '170px', overflowY: 'auto' }}
              />

              <button
                onClick={mutation.isPending ? handleStop : editMode ? handleSaveEdit : handleSend}
                className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-400"
              >
                {mutation.isPending ? (
                  <FaStop />
                ) : editMode ? (
                  userInput.trim() === '' ? <FaPaperPlane /> : <FaSave />
                ) : (
                  <FaPaperPlane />
                )}
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={toggleHistoryMenu}
          className={`fixed top-4 transition-transform duration-300 ${
            isHistoryVisible ? 'left-[15rem]' : 'left-4'
          } p-2 bg-gray-900 text-white rounded-full focus:outline-none z-50`}
        >
          {isHistoryVisible ? <FaChevronLeft /> : <FaChevronRight />}
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
