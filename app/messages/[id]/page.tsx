"use client";
import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  MessageWithSender,
  ConversationSummary,
  getConversations,
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  markConversationRead,
} from "@/app/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, Pencil, Trash2, Check, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export default function ConversationPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [userId, setUserId] = useState<string | null>(null);
  const [conv, setConv] = useState<ConversationSummary | null>(null);
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/");
        return;
      }
      setUserId(user.id);

      const [convs, msgs] = await Promise.all([
        getConversations(),
        getMessages(id),
      ]);
      const found = convs.find((c) => c.id === id) ?? null;
      setConv(found);
      setMessages(msgs);
      setLoading(false);
      markConversationRead(id);
    };
    load();
  }, [id]);

  // Scroll to bottom on load and new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Realtime subscription
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`mobile-conv:${id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${id}`,
        },
        (payload) => {
          const newMsg = payload.new as MessageWithSender;
          if (newMsg.sender_id !== userId) {
            setMessages((prev) => [...prev, { ...newMsg, sender: null }]);
            markConversationRead(id);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${id}`,
        },
        (payload) => {
          const updated = payload.new as MessageWithSender;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === updated.id
                ? { ...m, content: updated.content, edited: updated.edited, deleted: updated.deleted }
                : m
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, userId]);

  const handleSend = async () => {
    if (!draft.trim() || !userId) return;
    const content = draft.trim();
    setDraft("");
    const result = await sendMessage(id, content);
    if (result.success && result.data) {
      setMessages((prev) => [...prev, result.data!]);
    }
  };

  const handleEdit = async (msgId: string) => {
    if (!editDraft.trim()) return;
    await editMessage(msgId, editDraft.trim());
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId ? { ...m, content: editDraft.trim(), edited: true } : m
      )
    );
    setEditingId(null);
    setEditDraft("");
  };

  const handleDelete = async (msgId: string) => {
    await deleteMessage(msgId);
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, deleted: true } : m))
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b shrink-0 bg-background z-10">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => router.push("/messages")}
        >
          <ArrowLeft size={18} />
        </Button>
        {conv?.otherUser && (
          <Avatar className="h-8 w-8 overflow-hidden shrink-0">
            <AvatarImage
              src={conv.otherUser.avatar_url ?? undefined}
              className="rounded-full object-cover"
            />
            <AvatarFallback className="text-xs">
              {conv.otherUser.username?.[0]?.toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>
        )}
        <div className="min-w-0">
          <h1 className="font-semibold text-sm truncate">
            {conv?.otherUser ? `u/${conv.otherUser.username}` : "Conversation"}
          </h1>
          {conv?.otherUser && (
            <Link
              href={`/u/${conv.otherUser.username}`}
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              View profile
            </Link>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
            Loading…
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
            No messages yet. Say hello!
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.sender_id === userId;
            return (
              <div
                key={msg.id}
                className={`flex flex-col gap-0.5 ${isMine ? "items-end" : "items-start"}`}
              >
                {editingId === msg.id ? (
                  <div className="flex gap-2 w-full max-w-[85%]">
                    <Textarea
                      value={editDraft}
                      onChange={(e) => setEditDraft(e.target.value)}
                      className="min-h-0 h-auto text-sm resize-none"
                      rows={2}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleEdit(msg.id);
                        }
                        if (e.key === "Escape") {
                          setEditingId(null);
                          setEditDraft("");
                        }
                      }}
                    />
                    <div className="flex flex-col gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => handleEdit(msg.id)}
                      >
                        <Check size={14} />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => { setEditingId(null); setEditDraft(""); }}
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
                    {!isMine && (
                      <Avatar className="h-7 w-7 shrink-0 overflow-hidden mb-0.5">
                        <AvatarImage
                          src={msg.sender?.avatar_url ?? undefined}
                          className="rounded-full object-cover"
                        />
                        <AvatarFallback className="text-[10px]">
                          {msg.sender?.username?.[0]?.toUpperCase() ?? "?"}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm break-words ${
                        msg.deleted
                          ? "bg-muted text-muted-foreground italic"
                          : isMine
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {msg.deleted ? "Message deleted" : msg.content}
                      {msg.edited && !msg.deleted && (
                        <span className="text-[10px] ml-1 opacity-60">(edited)</span>
                      )}
                    </div>
                    {isMine && !msg.deleted && (
                      <div className="flex gap-0.5">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => {
                            setEditingId(msg.id);
                            setEditDraft(msg.content);
                          }}
                        >
                          <Pencil size={12} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(msg.id)}
                        >
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
                <span className="text-[10px] text-muted-foreground">
                  {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t px-4 py-3 shrink-0 flex gap-2 bg-background">
        <Textarea
          placeholder="Message…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          className="min-h-0 h-auto resize-none"
          style={{ fontSize: "16px" }}
          rows={1}
        />
        <Button
          size="icon"
          className="shrink-0"
          disabled={!draft.trim()}
          onClick={handleSend}
        >
          <Send size={16} />
        </Button>
      </div>
    </div>
  );
}
