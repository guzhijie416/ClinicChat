
"use client";

import { useEffect, useRef } from 'react';
import type { Message } from '@/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Sparkles, CalendarCheck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';

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

const MessageContent = ({ content }: { content: string }) => {
  const actionRegex = /\[ACTION:BOOK_NOW\]/g;
  const boldRegex = /(\*\*.*?\*\*)/g;

  // Combine regexes for splitting
  const combinedRegex = new RegExp(`${actionRegex.source}|${boldRegex.source}`, 'g');
  const parts = content.split(combinedRegex).filter(Boolean);

  return (
    <div className="text-sm space-y-2">
      {parts.map((part, index) => {
        if (part === '[ACTION:BOOK_NOW]') {
          return (
            <Button key={index} asChild className="mt-2">
              <Link href="/book">
                <CalendarCheck className="mr-2 h-4 w-4" />
                Book a Session
              </Link>
            </Button>
          );
        }
        if (part.startsWith('**') && part.endsWith('**')) {
          return <p key={index}><strong>{part.slice(2, -2)}</strong></p>;
        }
        // To handle multiline text correctly, we split the part by newlines
        return part.split('\n').map((line, lineIndex) => <p key={`${index}-${lineIndex}`}>{line}</p>);
      })}
    </div>
  );
};


export default function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div ref={scrollAreaRef} className="flex-grow overflow-y-auto p-4 space-y-6">
      {messages.map((message) => (
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
              "max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl",
              message.role === 'user'
                ? "bg-primary text-primary-foreground rounded-br-none"
                : "bg-muted text-muted-foreground rounded-bl-none"
            )}
          >
            <MessageContent content={message.content} />
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
