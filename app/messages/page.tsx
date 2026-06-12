"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { getConversations, ConversationSummary } from "@/app/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MessagesPage() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/");
        return;
      }
      setUserId(user.id);
      const convs = await getConversations();
      setConversations(convs);
    };
    load();
  }, []);

  // Realtime: refresh conversations on new messages
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`mobile-convs:${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => {
          getConversations().then(setConversations);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b sticky top-0 bg-background z-10">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.back()}>
          <ArrowLeft size={18} />
        </Button>
        <h1 className="font-semibold text-base">Messages</h1>
      </div>

      {/* Conversation list */}
      <div className="flex-1 divide-y divide-border/40">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
            <p className="text-sm">No conversations yet</p>
          </div>
        ) : (
          conversations.map((conv) => (
            <Link
              key={conv.id}
              href={`/messages/${conv.id}`}
              className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50 active:bg-muted/70 transition-colors"
            >
              <Avatar className="h-10 w-10 shrink-0 overflow-hidden">
                <AvatarImage
                  src={conv.otherUser?.avatar_url ?? undefined}
                  className="rounded-full object-cover"
                />
                <AvatarFallback>
                  {conv.otherUser?.username?.[0]?.toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium truncate">
                    {conv.otherUser ? `u/${conv.otherUser.username}` : "Unknown"}
                  </span>
                  {conv.lastMessage && (
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatDistanceToNow(new Date(conv.lastMessage.created_at), {
                        addSuffix: false,
                      })}
                    </span>
                  )}
                </div>
                {conv.lastMessage && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {conv.lastMessage.deleted
                      ? "Message deleted"
                      : conv.lastMessage.sender_id === userId
                      ? `You: ${conv.lastMessage.content}`
                      : conv.lastMessage.content}
                  </p>
                )}
              </div>
              {conv.unreadCount > 0 && (
                <span className="shrink-0 h-2.5 w-2.5 rounded-full bg-primary mt-2" />
              )}
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
