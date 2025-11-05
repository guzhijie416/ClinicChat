"use client";

import { useState, useRef, useEffect, useTransition } from 'react';
import type { Message } from '@/types';
import { submitMessage } from '@/app/actions/chat';
import ChatLayout from '@/components/chat/chat-layout';
import ChatMessages from '@/components/chat/chat-messages';
import ChatInput from '@/components/chat/chat-input';
import { getClinicData } from '@/lib/data';
import type { ClinicData } from '@/types';

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isPending, startTransition] = useTransition();
  const [clinicInfo, setClinicInfo] = useState<ClinicData | null>(null);

  const initialMessage: Message = {
    id: 'initial',
    role: 'assistant',
    content: `Hello! I'm the virtual assistant for ${clinicInfo?.name ?? 'the clinic'}. How can I help you today? You can ask me about our services, hours, or any other general wellness questions.`,
  };

  useEffect(() => {
    async function loadData() {
        // Since we are not using a database, we pass the data from client to server action.
        // In a real app with a DB, you'd fetch this in the server action.
        const data = await getClinicData();
        setClinicInfo(data);
    }
    loadData();
  }, [])
  
  const handleSend = (content: string) => {
    if (!content.trim() || !clinicInfo) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
    };
    
    setMessages((prev) => [...prev, userMessage]);

    startTransition(async () => {
      const assistantResponse = await submitMessage(content);
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: assistantResponse,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    });
  };
  
  // Update initial message when clinicInfo is loaded
  const displayMessages = clinicInfo ? [initialMessage, ...messages] : [];

  return (
    <ChatLayout clinicName={clinicInfo?.name || 'Clinic Chat'}>
      <ChatMessages
        messages={displayMessages}
        isLoading={isPending}
      />
      <ChatInput onSend={handleSend} isLoading={isPending} />
    </ChatLayout>
  );
}