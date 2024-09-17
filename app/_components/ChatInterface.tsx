"use client";

import React, { useState, useEffect } from 'react';
import 'react-quill/dist/quill.snow.css';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { solarizedlight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

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

  const handleSend = async () => {
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
      await fetchResponse(newMessage);

      if (activeChat) {
        setChats((prevChats) => ({
          ...prevChats,
          [activeChat]: [...(prevChats[activeChat] || []), newMessage],
        }));
      }
    }
  };

  const fetchResponse = async (message: Message) => {
    const response = await fetch('https://api-inference.huggingface.co/models/microsoft/Phi-3-mini-4k-instruct/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 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', // replace with your token
      },
      body: JSON.stringify({
        model: 'microsoft/Phi-3-mini-4k-instruct',
        messages: [{ role: 'user', content: message.content }],
        max_tokens: 500,
        stream: false,
      }),
    });

    const data = await response.json();

    const botMessage = {
      id: Date.now(),
      content: data.choices[0].message.content,
      isUser: false,
      timestamp: new Date().toLocaleTimeString(),
    };

    setIsGenerating(false);
    setMessages((prev) => [...prev, botMessage]);

    if (activeChat) {
      setChats((prevChats) => ({
        ...prevChats,
        [activeChat]: [...(prevChats[activeChat] || []), botMessage],
      }));
    }
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
    alert('Copied to clipboard!');
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

  const SkeletonLoader = () => (
    <div className="p-4 space-y-4">
      <div className="h-8 w-3/4 bg-gray-700 rounded-md animate-pulse"></div>
      <div className="h-8 w-1/2 bg-gray-700 rounded-md animate-pulse"></div>
      <div className="h-8 w-3/4 bg-gray-700 rounded-md animate-pulse"></div>
    </div>
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
                <div className="bg-gray-700 text-white p-4 rounded-md overflow-x-auto max-h-80">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      code: ({ node, inline, className, children, ...props }) => {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={solarizedlight}
                            language={match[1]}
                            PreTag="div"
                            {...props}
                            class="bg-black"
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
                </div>
                <div className="text-xs text-gray-400 mt-2">{message.timestamp}</div>
                <button
                  onClick={() => handleCopy(message.content)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-200"
                  title="Copy to clipboard"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="icon-md-heavy"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M7 5C7 3.34315 8.34315 2 10 2H19C20.6569 2 22 3.34315 22 5V14C22 15.6569 20.6569 17 19 17H17V19C17 20.6569 15.6569 22 14 22H5C3.34315 22 2 20.6569 2 19V10C2 8.34315 3.34315 7 5 7H7V5ZM5 9C
5 9C4.44772 9 4 9.44772 4 10V19C4 19.5523 4.44772 20 5 20H14C14.5523 20 15 19.5523 15 19V17H10C8.34315 17 7 15.6569 7 14V9H5ZM10 4C9.44772 4 9 4.44772 9 5V14C9 14.5523 9.44772 15 10 15H19C19.5523 15 20 14.5523 20 14V5C20 4.44772 19.5523 4 19 4H10Z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              </div>
            ))
          ) : (
            <div>No messages yet.</div>
          )}
          {isGenerating && <SkeletonLoader />}
        </div>

        <div className="mt-4">
          <div className="relative flex">
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="w-full p-2 pr-14 bg-gray-700 text-white rounded-md resize-none focus:outline-none overflow-y-auto"
              placeholder="Type your message here..."
              style={{
                height: '55px',
                maxHeight: '200px',
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
              }}
            />
            <button
              onClick={isGenerating ? handleStopGeneration : handleSend}
              disabled={!userInput.trim()}
              className={`absolute right-2 bottom-2 p-2 text-white rounded-md ${
                isGenerating ? 'bg-gray-500' : 'bg-gray-600 hover:bg-gray-500'
              }`}
            >
              {isGenerating ? <StopIcon /> : <SendIcon />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
