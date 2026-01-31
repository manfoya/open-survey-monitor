"use client";

import { MessageOut } from "@/features/messages/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, User, Users } from "lucide-react";
import { extractTextFromHtml } from "@/lib/markdown";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MessageListProps {
  messages: MessageOut[];
  emptyMessage?: string;
  onMessageClick: (message: MessageOut) => void;
}

export function MessageList({
  messages,
  emptyMessage = "Aucun message",
  onMessageClick,
}: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-muted-foreground border rounded-lg border-dashed">
        <Mail className="h-8 w-8 mb-2 opacity-50" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[600px] pr-2">
      <div className="space-y-2 pr-2">
        {messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            onClick={() => onMessageClick(message)}
          />
        ))}
      </div>
    </ScrollArea>
  );
}

function MessageItem({
  message,
  onClick,
}: {
  message: MessageOut;
  onClick: () => void;
}) {
  return (
    <Card
      role="button"
      tabIndex={0}
      className="overflow-hidden hover:bg-muted/50 transition-colors cursor-pointer active:scale-[0.99]"
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold truncate">
                {message.title}
              </CardTitle>
              <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                {formatDate(message.created_at)}
              </span>
            </div>
            <CardDescription className="text-xs truncate">
              Par:{" "}
              <span className="font-medium text-foreground">
                {message.sender_username}
              </span>
            </CardDescription>
          </div>
          <div className="flex shrink-0">
            {message.target_role && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 text-[10px] h-5 px-1.5"
              >
                <Users className="h-3 w-3" />
                {message.target_role}
              </Badge>
            )}
            {message.target_user_id && (
              <Badge
                variant="outline"
                className="flex items-center gap-1 text-[10px] h-5 px-1.5"
              >
                <User className="h-3 w-3" />
                User #{message.target_user_id}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {extractTextFromHtml(message.content)}
        </p>
      </CardContent>
    </Card>
  );
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: isToday ? undefined : "short",
    timeStyle: "short",
  }).format(date);
}
