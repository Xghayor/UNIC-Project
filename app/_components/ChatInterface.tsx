"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { solarizedlight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface Message {
  id: number;
  content: string;
  isUser: boolean;
  timestamp: string;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [chats, setChats] = useState<{ [key: string]: Message[] }>({});
  const [activeChat, setActiveChat] = useState<string | null>(null);

  useEffect(() => {
    const storedChats = localStorage.getItem('chats');
    if (storedChats) {
      setChats(JSON.parse(storedChats));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chats', JSON.stringify(chats));
  }, [chats]);

  const handleNewChat = () => {
    const today = new Date().toLocaleDateString();
    const newChatId = `Chat ${Object.keys(chats).length + 1} - ${today}`;
    setChats((prevChats) => ({
      ...prevChats,
      [newChatId]: [],
    }));
    setActiveChat(newChatId);
    setMessages([]);
  };

  const handleSend = () => {
    if (userInput.trim()) {
      const newMessage = {
        id: Date.now(),
        content: userInput,
        isUser: true,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, newMessage]);
      setUserInput('');
      setIsGenerating(true);
      simulateResponse(newMessage);

      if (activeChat) {
        setChats((prevChats) => ({
          ...prevChats,
          [activeChat]: [...(prevChats[activeChat] || []), newMessage],
        }));
      }
    }
  };

  const simulateResponse = (message: Message) => {
    setTimeout(() => {
      setIsGenerating(false);
      const response = {
        id: Date.now(),
        content: `**Response to:** ${message.content}\n\n\`\`\`js\nconst example = "Hello, world!";\n\`\`\``,
        isUser: false,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, response]);

      if (activeChat) {
        setChats((prevChats) => ({
          ...prevChats,
          [activeChat]: [...(prevChats[activeChat] || []), response],
        }));
      }
    }, 2000);
  };

  const handleStopGeneration = () => {
    setIsGenerating(false);
  };

  const loadChat = (chatId: string) => {
    setActiveChat(chatId);
    setMessages(chats[chatId] || []);
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    alert("Copied to clipboard!");
  };

  const SendIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-6 h-6"
    >
      <line x1="22" y1="2" x2="11" y2="13"></line>
      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
  );

  const StopIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-6 h-6"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <line x1="7" y1="7" x2="17" y2="17"></line>
      <line x1="17" y1="7" x2="7" y2="17"></line>
    </svg>
  );

  return (
    <div className="h-screen flex">
      <div className="w-1/4 bg-gray-900 text-white p-4 space-y-4">
        <h2 className="text-lg font-semibold">User History</h2>
        <button
          onClick={handleNewChat}
          className="w-full p-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
        >
          New Chat
        </button>
        <ul className="space-y-2 mt-4">
          {Object.keys(chats).length > 0 ? (
            Object.keys(chats).map((chatId) => (
              <li
                key={chatId}
                onClick={() => loadChat(chatId)}
                className="cursor-pointer p-2 hover:bg-gray-800"
              >
                {chatId}
              </li>
            ))
          ) : (
            <div>No conversations yet.</div>
          )}
        </ul>
      </div>

      <div className="flex-1 bg-gray-800 text-white p-4 flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-4">
          {messages.length > 0 ? (
            messages.map((message) => (
              <div
                key={message.id}
                className={`relative p-2 rounded-md ${
                  message.isUser ? 'ml-auto w-3/5 bg-gray-700' : 'w-full bg-gray-600'
                }`}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    code: ({ node, inline, className, children, ...props }: any) => {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={solarizedlight}
                          language={match[1]}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code {...props}>{children}</code>
                      );
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
                <div className="text-xs text-gray-400 mt-2">{message.timestamp}</div>
                <button
                  onClick={() => handleCopy(message.content)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-200"
                  title="Copy to clipboard"
                >
                  📋
                </button>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500">No messages yet.</div>
          )}
        </div>

        <div className="mt-4 flex items-center space-x-2 bg-gray-900 p-2 rounded-md">
          <textarea
            className="w-full p-2 rounded-md bg-gray-900 text-white border border-gray-700 focus:outline-none"
            placeholder="Type your message here..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            onClick={isGenerating ? handleStopGeneration : handleSend}
            className={`p-2 rounded-md text-white ${
              isGenerating ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title={isGenerating ? 'Stop' : 'Send'}
          >
            {isGenerating ? <StopIcon /> : <SendIcon />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
