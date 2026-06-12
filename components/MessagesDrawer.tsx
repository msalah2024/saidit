"use client";
import React, { useEffect, useRef, useState } from "react";
import { User } from "@supabase/supabase-js";
import { ArrowLeft, ChevronDown, ChevronUp, Send, Pencil, Trash2, X, Check, CheckCheck, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Skeleton } from "./ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { createClient } from "@/utils/supabase/client";
import {
  ConversationSummary,
  MessageWithSender,
  getConversations,
  getMessages,
  getOtherLastRead,
  sendMessage,
  editMessage,
  deleteMessage,
  markConversationRead,
} from "@/app/actions";
import { Textarea } from "./ui/textarea";
import Link from "next/link";
import { Button } from "./ui/button";

interface MessagesDrawerProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRead?: () => void;
  initialConversationId?: string;
}

export default function MessagesDrawer({
  user,
  open,
  onOpenChange,
  onRead,
  initialConversationId,
}: MessagesDrawerProps) {
  const [minimized, setMinimized] = useState(false);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [activeConvId, setActiveConvId] = useState<string | null>(
    initialConversationId ?? null
  );
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [otherLastReadAt, setOtherLastReadAt] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const activeConv = conversations.find((c) => c.id === activeConvId) ?? null;

  // Jump to conversation when initialConversationId changes
  useEffect(() => {
    if (initialConversationId) {
      setActiveConvId(initialConversationId);
      setMinimized(false);
    }
  }, [initialConversationId]);

  // Load conversations when opened
  useEffect(() => {
    if (!open) return;
    setLoadingConvs(true);
    getConversations().then((convs) => {
      setConversations(convs);
      setLoadingConvs(false);
    });
  }, [open]);

  // Load messages + other participant's last_read_at when conversation changes
  useEffect(() => {
    if (!activeConvId) return;
    setMessages([]);
    setLoadingMsgs(true);
    setOtherLastReadAt(null);
    Promise.all([
      getMessages(activeConvId),
      getOtherLastRead(activeConvId),
    ]).then(([msgs, otherRead]) => {
      setMessages(msgs);
      setOtherLastReadAt(otherRead);
      setLoadingMsgs(false);
      markConversationRead(activeConvId).then(() => {
        onRead?.();
        setConversations((prev) =>
          prev.map((c) => (c.id === activeConvId ? { ...c, unreadCount: 0 } : c))
        );
      });
    });
  }, [activeConvId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (!minimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, minimized]);

  // Realtime: messages in active conversation
  useEffect(() => {
    if (!activeConvId) return;
    const channel = supabase
      .channel(`drawer-conv:${activeConvId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${activeConvId}`,
        },
        (payload) => {
          const newMsg = payload.new as MessageWithSender;
          if (newMsg.sender_id !== user.id) {
            setMessages((prev) => [
              ...prev,
              {
                ...newMsg,
                sender: activeConv?.otherUser
                  ? { username: activeConv.otherUser.username ?? null, avatar_url: activeConv.otherUser.avatar_url ?? null }
                  : null,
              },
            ]);
            markConversationRead(activeConvId);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${activeConvId}`,
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
      // Track when the other person reads messages
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversation_participants",
          filter: `conversation_id=eq.${activeConvId}`,
        },
        (payload) => {
          const updated = payload.new as { user_id: string; last_read_at: string | null };
          if (updated.user_id !== user.id) {
            setOtherLastReadAt(updated.last_read_at);
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeConvId, user.id]);

  // Realtime: refresh conversation list on new messages
  useEffect(() => {
    if (!open) return;
    const channel = supabase
      .channel(`drawer-convlist:${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => { getConversations().then(setConversations); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [open, user.id]);

  const handleSend = async () => {
    if (!activeConvId || !draft.trim() || sending) return;
    const content = draft.trim();
    setDraft("");
    setSending(true);
    const result = await sendMessage(activeConvId, content);
    setSending(false);
    if (result.success && result.data) {
      setMessages((prev) => [...prev, result.data!]);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConvId
            ? { ...c, lastMessage: { content, sender_id: user.id, created_at: result.data!.created_at, deleted: false } }
            : c
        )
      );
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

  // Find the last sent message that's been read by the other person
  const lastReadMsgId = (() => {
    if (!otherLastReadAt) return null;
    const otherReadTime = new Date(otherLastReadAt).getTime();
    let last: string | null = null;
    for (const m of messages) {
      if (m.sender_id === user.id && !m.deleted) {
        const msgTime = new Date(m.created_at).getTime();
        if (msgTime <= otherReadTime) last = m.id;
      }
    }
    return last;
  })();

  if (!open) return null;

  return (
    <div
      className={`fixed bottom-0 right-4 z-50 flex flex-col shadow-2xl rounded-t-xl border border-border bg-background overflow-hidden transition-all duration-200 ${
        activeConvId
          ? `w-[620px] ${minimized ? "h-[44px]" : "h-[480px]"}`
          : `w-[300px] ${minimized ? "h-[44px]" : "h-[480px]"}`
      }`}
    >
      {/* ── Header ───────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-3 h-[44px] shrink-0 bg-muted/60 cursor-pointer select-none border-b border-border"
        onClick={() => setMinimized((m) => !m)}
      >
        <div className="flex items-center gap-2 min-w-0">
          {activeConvId && !minimized && (
            <button
              className="p-0.5 hover:text-primary rounded"
              onClick={(e) => { e.stopPropagation(); setActiveConvId(null); }}
            >
              <ArrowLeft size={15} />
            </button>
          )}
          {activeConv?.otherUser && (
            <Avatar className="h-6 w-6 overflow-hidden shrink-0">
              <AvatarImage src={activeConv.otherUser.avatar_url ?? undefined} className="rounded-full object-cover" />
              <AvatarFallback className="text-[10px]">
                {activeConv.otherUser.username?.[0]?.toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
          )}
          <span className="text-sm font-semibold truncate">
            {activeConv?.otherUser ? `u/${activeConv.otherUser.username}` : "Chats"}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className="p-1 rounded hover:bg-muted text-muted-foreground">
            {minimized ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </span>
          <button
            className="p-1 rounded hover:bg-muted text-muted-foreground"
            onClick={(e) => { e.stopPropagation(); onOpenChange(false); }}
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────── */}
      {!minimized && (
        <div className="flex flex-1 overflow-hidden">

          {/* ── Conversation list ─────────────────────────────── */}
          <div className={`flex flex-col border-r border-border overflow-y-auto ${activeConvId ? "w-[220px] shrink-0" : "flex-1"}`}>
            {loadingConvs ? (
              <div className="flex flex-col divide-y divide-border/40">
                {[72, 56, 80, 48, 64].map((nameW, i) => (
                  <div key={i} className="flex items-center gap-2.5 px-3 py-2.5">
                    <Skeleton className="h-8 w-8 rounded-full shrink-0 bg-zinc-700/50" />
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <Skeleton className="h-2.5 rounded-full bg-zinc-700/50" style={{ width: nameW }} />
                      <Skeleton className="h-2 rounded-full bg-zinc-700/40" style={{ width: nameW + 40 }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-1 px-4">
                <p className="text-xs text-center">No conversations yet</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  className={`flex items-start gap-2.5 px-3 py-2.5 text-left hover:bg-muted/50 transition-colors ${
                    activeConvId === conv.id ? "bg-muted/60" : ""
                  }`}
                  onClick={() => setActiveConvId(conv.id)}
                >
                  <Avatar className="h-8 w-8 shrink-0 overflow-hidden">
                    <AvatarImage src={conv.otherUser?.avatar_url ?? undefined} className="rounded-full object-cover" />
                    <AvatarFallback className="text-xs">
                      {conv.otherUser?.username?.[0]?.toUpperCase() ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-medium truncate">
                        {conv.otherUser?.username ?? "Unknown"}
                      </span>
                      {conv.lastMessage && (
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {formatDistanceToNow(new Date(conv.lastMessage.created_at), { addSuffix: false })}
                        </span>
                      )}
                    </div>
                    {conv.lastMessage && (
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                        {conv.lastMessage.deleted
                          ? "Message deleted"
                          : conv.lastMessage.sender_id === user.id
                          ? `You: ${conv.lastMessage.content}`
                          : conv.lastMessage.content}
                      </p>
                    )}
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="shrink-0 h-2 w-2 rounded-full bg-primary mt-1.5" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* ── Conversation view ─────────────────────────────── */}
          {activeConvId && (
            <div className="flex flex-col flex-1 overflow-hidden">
              {activeConv?.otherUser && (
                <div className="px-3 py-1.5 border-b shrink-0">
                  <Link
                    href={`/u/${activeConv.otherUser.username}`}
                    className="text-[11px] text-muted-foreground hover:text-primary transition-colors"
                    onClick={() => onOpenChange(false)}
                  >
                    View profile →
                  </Link>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-1.5">
                {loadingMsgs ? (
                  <div className="flex flex-col gap-3 py-2">
                    {[
                      { mine: false, w: 120 },
                      { mine: true,  w: 88  },
                      { mine: false, w: 160 },
                      { mine: true,  w: 104 },
                    ].map((row, i) => (
                      <div key={i} className={`flex ${row.mine ? "justify-end" : "justify-start items-end gap-1.5"}`}>
                        {!row.mine && <Skeleton className="h-5 w-5 rounded-full shrink-0 bg-zinc-700/50" />}
                        <Skeleton className="h-7 rounded-2xl bg-zinc-700/50" style={{ width: row.w }} />
                      </div>
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center py-6 text-muted-foreground text-xs text-center px-4">
                    No messages yet. Say hello!
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.sender_id === user.id;
                    const isLastRead = msg.id === lastReadMsgId;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col gap-0.5 ${isMine ? "items-end" : "items-start"}`}
                      >
                        {editingId === msg.id ? (
                          <div className="flex gap-1.5 w-full max-w-[85%]">
                            <Textarea
                              value={editDraft}
                              onChange={(e) => setEditDraft(e.target.value)}
                              className="min-h-0 h-auto text-xs resize-none"
                              rows={2}
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleEdit(msg.id); }
                                if (e.key === "Escape") { setEditingId(null); setEditDraft(""); }
                              }}
                            />
                            <div className="flex flex-col gap-0.5">
                              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleEdit(msg.id)}><Check size={12} /></Button>
                              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => { setEditingId(null); setEditDraft(""); }}><X size={12} /></Button>
                            </div>
                          </div>
                        ) : (
                          <div className={`group flex items-end gap-1 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
                            {!isMine && (
                              <Avatar className="h-5 w-5 shrink-0 overflow-hidden mb-0.5">
                                <AvatarImage
                                  src={activeConv?.otherUser?.avatar_url ?? msg.sender?.avatar_url ?? undefined}
                                  className="rounded-full object-cover"
                                />
                                <AvatarFallback className="text-[8px]">
                                  {(activeConv?.otherUser?.username ?? msg.sender?.username)?.[0]?.toUpperCase() ?? "?"}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div
                              className={`max-w-[88%] rounded-2xl px-2.5 py-1.5 text-xs break-words ${
                                msg.deleted
                                  ? "bg-muted text-muted-foreground italic"
                                  : isMine
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              {msg.deleted ? "Message deleted" : msg.content}
                              {msg.edited && !msg.deleted && (
                                <span className="text-[9px] ml-1 opacity-60">(edited)</span>
                              )}
                            </div>
                            {isMine && !msg.deleted && (
                              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button size="icon" variant="ghost" className="h-5 w-5"
                                  onClick={() => { setEditingId(msg.id); setEditDraft(msg.content); }}>
                                  <Pencil size={10} />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-5 w-5 text-destructive hover:text-destructive"
                                  onClick={() => handleDelete(msg.id)}>
                                  <Trash2 size={10} />
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                        <div className={`flex items-center gap-1 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
                          <span className="text-[9px] text-muted-foreground">
                            {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                          </span>
                          {isMine && isLastRead && (
                            <span className="flex items-center gap-0.5 text-[9px] text-primary">
                              <CheckCheck size={11} />
                              Read
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t px-2 py-2 shrink-0 flex gap-1.5 items-end">
                <Textarea
                  placeholder="Message…"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="min-h-0 h-auto resize-none text-xs"
                  rows={1}
                />
                <Button
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  disabled={!draft.trim() || sending}
                  onClick={handleSend}
                >
                  {sending
                    ? <Loader2 size={14} className="animate-spin" />
                    : <Send size={14} />
                  }
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
