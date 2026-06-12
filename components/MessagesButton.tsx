"use client";
import React, { useEffect, useRef, useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "./ui/button";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useIsMobile } from "@/hooks/use-mobile";
import Link from "next/link";
import MessagesDrawer from "./MessagesDrawer";

interface MessagesButtonProps {
  user: User | null;
}

async function fetchUnreadConvCount(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<number> {
  // Get all conversations for this user
  const { data: participants } = await supabase
    .from("conversation_participants")
    .select("conversation_id, last_read_at")
    .eq("user_id", userId);

  if (!participants?.length) return 0;

  const convIds = participants.map((p) => p.conversation_id);

  // Get last_message_at for each conversation
  const { data: convs } = await supabase
    .from("conversations")
    .select("id, last_message_at")
    .in("id", convIds);

  if (!convs) return 0;

  let count = 0;
  for (const conv of convs) {
    if (!conv.last_message_at) continue;
    const part = participants.find((p) => p.conversation_id === conv.id);
    if (!part) continue;
    const lastRead = part.last_read_at ? new Date(part.last_read_at) : new Date(0);
    const lastMsg = new Date(conv.last_message_at);
    if (lastMsg > lastRead) count++;
  }
  return count;
}

export default function MessagesButton({ user }: MessagesButtonProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const supabase = createClient();
  const isMobile = useIsMobile();
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!user || fetchedRef.current) return;
    fetchedRef.current = true;
    fetchUnreadConvCount(supabase, user.id).then(setUnreadCount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Realtime: re-count on new messages or participant read updates
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`messages-unread:${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => {
          fetchUnreadConvCount(supabase, user.id).then(setUnreadCount);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversation_participants",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchUnreadConvCount(supabase, user.id).then(setUnreadCount);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (!user) return null;

  const badge = unreadCount > 0 && (
    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
      {unreadCount > 9 ? "9+" : unreadCount}
    </span>
  );

  if (isMobile) {
    return (
      <Button variant="outline" size="icon" className="relative rounded-full hover:bg-primary" asChild>
        <Link href="/messages">
          <Mail size={18} />
          {badge}
        </Link>
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="relative rounded-full hover:bg-primary"
        onClick={() => setDrawerOpen(true)}
      >
        <Mail size={18} />
        {badge}
      </Button>
      <MessagesDrawer
        user={user}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onRead={() => setUnreadCount(0)}
      />
    </>
  );
}
