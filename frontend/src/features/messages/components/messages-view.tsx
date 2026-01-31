"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/features/auth/contexts/user-context";
import { UserRole } from "@/features/auth/types";
import { MessageOut } from "@/features/messages/types";
import { getMyMessages, getSentMessages } from "@/features/messages/services";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCcw } from "lucide-react";
import { MessageList } from "./message-list";
import { NewMessageForm } from "./new-message-form";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import { MessageDetailDialog } from "./message-detail-dialog";
import PageHeader from "@/components/page-header";

export default function MessagesView() {
  const currentUser = useCurrentUser();
  const [messages, setMessages] = useState<MessageOut[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"inbox" | "sent">("inbox");
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);

  // Detail view state
  const [selectedMessage, setSelectedMessage] = useState<MessageOut | null>(
    null,
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // If director, default to "sent" since inbox is empty for now
  useEffect(() => {
    if (currentUser?.role === UserRole.DIRECTEUR) {
      setActiveTab("sent");
    }
  }, [currentUser]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      let data: MessageOut[] = [];
      if (activeTab === "inbox") {
        data = await getMyMessages();
      } else {
        data = await getSentMessages();
      }
      setMessages(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [activeTab]);

  const handleMessageSent = () => {
    setIsNewMessageOpen(false);
    if (activeTab === "sent") {
      fetchMessages();
    } else {
      setActiveTab("sent");
    }
  };

  const handleMessageClick = (message: MessageOut) => {
    setSelectedMessage(message);
    setIsDetailOpen(true);
  };

  if (!currentUser) return null;

  const isDirector = currentUser.role === UserRole.DIRECTEUR;

  return (
    <>
      <MessageDetailDialog
        message={selectedMessage}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />

      <div className="space-y-4">
        <PageHeader
          title="Messagerie"
          description={
            isDirector ? "Gérez vos communications." : "Consultez vos messages."
          }
          actions={
            <MessageViewActions
              fetchMessages={fetchMessages}
              loading={loading}
              isDirector={isDirector}
              isNewMessageOpen={isNewMessageOpen}
              setIsNewMessageOpen={setIsNewMessageOpen}
              handleMessageSent={handleMessageSent}
            />
          }
        />

        <div className="w-full">
          <MessageViewTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isDirector={isDirector}
          />
          <MessageViewContent
            activeTab={activeTab}
            messages={messages}
            handleMessageClick={handleMessageClick}
            isDirector={isDirector}
          />
        </div>
      </div>
    </>
  );
}

function MessageViewActions({
  fetchMessages,
  loading,
  isDirector,
  isNewMessageOpen,
  setIsNewMessageOpen,
  handleMessageSent,
}: {
  fetchMessages: () => void;
  loading: boolean;
  isDirector: boolean;
  isNewMessageOpen: boolean;
  setIsNewMessageOpen: (open: boolean) => void;
  handleMessageSent: () => void;
}) {
  return (
    <>
      <Button variant="outline" onClick={fetchMessages} disabled={loading}>
        <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />{" "}
        Actualiser
      </Button>

      {isDirector && (
        <Dialog open={isNewMessageOpen} onOpenChange={setIsNewMessageOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau message
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogTitle className="sr-only">Nouveau message</DialogTitle>
            <NewMessageForm onSuccess={handleMessageSent} />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

function MessageViewTabs({
  activeTab,
  setActiveTab,
  isDirector,
}: {
  activeTab: "inbox" | "sent";
  setActiveTab: (tab: "inbox" | "sent") => void;
  isDirector: boolean;
}) {
  return (
    <div className="grid w-full grid-cols-2 max-w-[400px] bg-muted p-1 rounded-lg mb-6">
      <button
        onClick={() => setActiveTab("inbox")}
        disabled={isDirector}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          activeTab === "inbox"
            ? "bg-background text-foreground shadow-sm"
            : "",
        )}
      >
        Boîte de réception
      </button>
      <button
        onClick={() => setActiveTab("sent")}
        disabled={!isDirector}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          activeTab === "sent" ? "bg-background text-foreground shadow-sm" : "",
        )}
      >
        Messages envoyés
      </button>
    </div>
  );
}

function MessageViewContent({
  activeTab,
  messages,
  handleMessageClick,
  isDirector,
}: {
  activeTab: "inbox" | "sent";
  messages: MessageOut[];
  handleMessageClick: (message: MessageOut) => void;
  isDirector: boolean;
}) {
  return (
    <div className="mt-6">
      {activeTab === "inbox" && (
        <div className="mt-6">
          {isDirector ? (
            <div className="text-center p-8 text-muted-foreground">
              La boîte de réception du directeur est désactivée pour le moment.
            </div>
          ) : (
            <MessageList
              messages={messages}
              emptyMessage="Vous n'avez aucun message."
              onMessageClick={handleMessageClick}
            />
          )}
        </div>
      )}

      {activeTab === "sent" && (
        <div className="mt-6">
          {!isDirector ? (
            <div className="text-center p-8 text-muted-foreground">
              Vous n'avez pas la permission d'envoyer des messages.
            </div>
          ) : (
            <MessageList
              messages={messages}
              emptyMessage="Vous n'avez envoyé aucun message."
              onMessageClick={handleMessageClick}
            />
          )}
        </div>
      )}
    </div>
  );
}
