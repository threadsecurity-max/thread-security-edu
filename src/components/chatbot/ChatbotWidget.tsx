'use client';

import React, { useState, useEffect } from 'react';
import { ChatLauncher } from './ChatLauncher';
import { ChatWindow } from './ChatWindow';
import {
  ChatMessageItem,
  ActionChip,
  handleLocalIntent,
  createAssistantMessage,
  buildCatalogMessage,
  buildDurationMessage,
  buildCourseDetailMessage,
} from './intentRouter';
import { SUGGESTIONS, MENTOR_PROFILES } from './knowledge';

export const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessageItem[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Hello! I am the **Thread Security Education AI Assistant**. How can I help you explore our Cybersecurity & AI curriculum, hands-on labs, or faculty mentors today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState('');

  // Initialize or retrieve sessionId
  useEffect(() => {
    try {
      let stored = sessionStorage.getItem('tse_chat_session_id');
      if (!stored) {
        stored = 'tse_' + Math.random().toString(36).substring(2, 12);
        sessionStorage.setItem('tse_chat_session_id', stored);
      }
      setSessionId(stored);
    } catch {
      setSessionId('tse_' + Date.now().toString());
    }
  }, []);

  // Reset conversation to initial state
  const handleReset = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: 'assistant',
        text: 'Conversation reset. How can I help you with our cybersecurity or AI programs?',
      },
    ]);
    setInput('');
    setIsTyping(false);
  };

  // Streaming fetch with AbortController and 1 retry
  const fetchWithRetry = async (query: string, assistantMessageId: string, attempt = 1): Promise<void> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, session_id: sessionId }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      if (!response.body) throw new Error('Response body is null');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId ? { ...msg, text: msg.text + chunk } : msg
          )
        );
      }
    } catch (error) {
      clearTimeout(timeout);
      console.warn(`[Chatbot Stream Error - Attempt ${attempt}]:`, error);

      if (attempt === 1) {
        await new Promise((res) => setTimeout(res, 800));
        return fetchWithRetry(query, assistantMessageId, 2);
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                text: "I'm having trouble connecting to the knowledge server right now. Please try asking again in a moment, or visit our consultation page at [/contact](/contact).",
              }
            : msg
        )
      );
    }
  };

  // Submit User Message
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = input.trim();
    if (!query || isTyping) return;

    const userMessage: ChatMessageItem = {
      id: Date.now().toString(),
      role: 'user',
      text: query,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // 1. Try Local Intent Match First (Instant 0-latency response)
    const localReply = handleLocalIntent(query);

    if (localReply) {
      setTimeout(() => {
        setMessages((prev) => [...prev, localReply]);
        setIsTyping(false);
      }, 250);
      return;
    }

    // 2. Fallback to Streaming Server API
    const assistantMessageId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, { id: assistantMessageId, role: 'assistant', text: '' }]);

    await fetchWithRetry(query, assistantMessageId);
    setIsTyping(false);
  };

  // Handle Suggestion Chips
  const handleSuggestionClick = (type: string) => {
    if (type === 'enroll') {
      window.open('/contact', '_blank');
      return;
    }
    if (type === 'mentors') {
      setMessages((prev) => [...prev, createAssistantMessage(MENTOR_PROFILES.combined)]);
      return;
    }
    if (type === 'more_cyber') {
      setMessages((prev) => [...prev, buildCatalogMessage('cyber')]);
      return;
    }
    if (type === 'more_ai') {
      setMessages((prev) => [...prev, buildCatalogMessage('ai')]);
      return;
    }
    const text = SUGGESTIONS[type] || 'We can help with AI and Cybersecurity curriculum details.';
    setMessages((prev) => [...prev, createAssistantMessage(text)]);
  };

  // Handle Action Pills
  const handleActionClick = (action: ActionChip) => {
    if (action.type === 'course' && action.domain && action.duration && action.courseName) {
      const detailMsg = buildCourseDetailMessage(action.domain, action.duration, action.courseName);
      setMessages((prev) => [...prev, detailMsg]);
    }
  };

  // Handle Duration Click from Catalog Card
  const handleDurationClick = (domain: string, duration: string) => {
    const durationMsg = buildDurationMessage(domain, duration);
    setMessages((prev) => [...prev, durationMsg]);
  };

  return (
    <>
      <ChatLauncher isOpen={isOpen} onClick={() => setIsOpen((prev) => !prev)} />
      <ChatWindow
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onReset={handleReset}
        messages={messages}
        input={input}
        setInput={setInput}
        onSubmit={handleSubmit}
        isTyping={isTyping}
        onActionClick={handleActionClick}
        onSuggestionClick={handleSuggestionClick}
        onDurationClick={handleDurationClick}
      />
    </>
  );
};
