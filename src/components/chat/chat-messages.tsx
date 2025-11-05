"use client";

import { useEffect, useRef } from 'react';
import type { Message } from '@/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Sparkles } from 'lucide-react';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

const TypingIndicator = () => (
  <div className="flex items-center space-x-2">
    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse"></div>
    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse [animation-delay:0.2s]"></div>
    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse [animation-delay:0.4s]"></div>
  </div>
);

export default function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div ref={scrollAreaRef} className="flex-grow overflow-y-auto p-4 space-y-6">
      {messages.map((message, index) => (
        <div
          key={message.id}
          className={cn(
            "flex items-start gap-3",
            message.role === 'user' ? "justify-end" : "justify-start"
          )}
        >
          {message.role === 'assistant' && (
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground">
                <Sparkles className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
          )}
          <div
            className={cn(
              "max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl whitespace-pre-wrap",
              message.role === 'user'
                ? "bg-primary text-primary-foreground rounded-br-none"
                : "bg-muted text-muted-foreground rounded-bl-none"
            )}
          >
            <p className="text-sm">{message.content}</p>
          </div>
          {message.role === 'user' && (
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      ))}
      {isLoading && (
        <div className="flex items-start gap-3 justify-start">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div className="bg-muted text-muted-foreground px-4 py-3 rounded-2xl rounded-bl-none">
            <TypingIndicator />
          </div>
        </div>
      )}
    </div>
  );
}
