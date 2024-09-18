import { UseMutationResult, useMutation } from '@tanstack/react-query';
import { fetchChatResponse } from '../_utils/FetchResponse';
import { useState, useEffect, useRef } from 'react';

type Message = {
  id: number;
  content: string;
  isUser: boolean;
  timestamp: string;
};

export const useChatInterfaceActions = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [editMode, setEditMode] = useState<number | null>(null);
  const [isStopping, setIsStopping] = useState(false);

  const messageContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  let abortController = useRef<AbortController | null>(null);

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [userInput]);

  const mutation: UseMutationResult<any, Error, Message, unknown> = useMutation({
    mutationFn: (message: Message) => {
      abortController.current = new AbortController();
      const { signal } = abortController.current;

      return fetchChatResponse(message, signal);
    },
    onSuccess: (data) => {
      const botMessage = {
        id: Date.now(),
        content: data.choices[0].message.content,
        isUser: false,
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages((prev) => [...prev, botMessage]);

      abortController.current = null;
      setIsStopping(false);
    },
    onError: (error) => {
      console.error('Error fetching response:', error);
      setIsStopping(false);
    },
  });

  const handleSend = () => {
    if (userInput.trim()) {
      const newMessage: Message = {
        id: Date.now(),
        content: userInput,
        isUser: true,
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages((prev) => [...prev, newMessage]);

      const existingHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
      const updatedHistory = [...existingHistory, newMessage];
      localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));

      mutation.mutate(newMessage);
      setUserInput('');
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const handleEdit = (messageId: number, content: string) => {
    setUserInput(content);
    setEditMode(messageId);
  };

  const handleSaveEdit = () => {
    if (editMode !== null && userInput.trim()) {
      setMessages((prev) =>
        prev.map((message) =>
          message.id === editMode ? { ...message, content: userInput } : message
        )
      );

      const editedMessage: Message = {
        id: editMode,
        content: userInput,
        isUser: true,
        timestamp: new Date().toLocaleTimeString(),
      };

      mutation.mutate(editedMessage);
      setUserInput('');
      setEditMode(null);
    }
  };

  const handleStop = () => {
    if (abortController.current) {
      abortController.current.abort();
      setIsStopping(true);
    }
  };

  return {
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
  };
};
