"use client";
import React, { useEffect, useRef, useState } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { markNotificationsRead, toggleNotificationRead } from "@/app/actions";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

export type Notification = {
  id: string;
  user_id: string;
  actor_id: string | null;
  actor_username: string | null;
  type: string;
  read: boolean;
  created_at: string;
  post_id: string | null;
  comment_id: string | null;
  post_slug: string | null;
  community_name: string | null;
};

interface NotificationBellProps {
  user: User | null;
}

export function notificationText(n: Notification) {
  const actor = n.actor_username ? `u/${n.actor_username}` : "Someone";
  if (n.type === "post_upvote") return `${actor} upvoted your post`;
  if (n.type === "comment_reply") return `${actor} replied to your comment`;
  if (n.type === "comment_follow_reply") return `${actor} replied to a comment you follow`;
  return "You have a new notification";
}

export function notificationLink(n: Notification) {
  if (n.post_slug && n.community_name) {
    return `/s/${n.community_name}/comments/${n.post_slug}`;
  }
  return "/";
}

// ─── Shared list content ────────────────────────────────────────────────────

function NotificationList({
  notifications,
  onClose,
  onToggleRead,
  onMarkAllRead,
  showSeeAll = true,
}: {
  notifications: Notification[];
  onClose: () => void;
  onToggleRead: (e: React.MouseEvent, n: Notification) => void;
  onMarkAllRead: () => void;
  showSeeAll?: boolean;
}) {
  const preview = notifications.slice(0, 10);

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h3 className="font-semibold text-sm">Notifications</h3>
        {notifications.some((n) => !n.read) && (
          <button
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
            onClick={onMarkAllRead}
          >
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="overflow-y-auto divide-y divide-border/40 flex-1">
        {preview.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
            <Bell size={28} className="opacity-40" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          preview.map((n) => (
            <div
              key={n.id}
              className={`group relative flex items-start gap-3 px-4 py-3 transition-colors ${
                !n.read ? "bg-muted/30" : ""
              } hover:bg-muted/50`}
            >
              {/* Read/unread dot — click to toggle */}
              <button
                onClick={(e) => onToggleRead(e, n)}
                title={n.read ? "Mark as unread" : "Mark as read"}
                className="mt-1.5 shrink-0 h-2 w-2 rounded-full transition-colors focus:outline-none"
                style={{
                  background: n.read
                    ? "transparent"
                    : "hsl(var(--primary))",
                }}
              >
                {n.read && (
                  <span className="block h-2 w-2 rounded-full border border-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>

              {/* Content */}
              <Link
                href={notificationLink(n)}
                onClick={onClose}
                className="min-w-0 flex-1"
              >
                <p className="text-sm leading-snug">{notificationText(n)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDistanceToNow(new Date(n.created_at), {
                    addSuffix: true,
                  })}
                </p>
              </Link>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {showSeeAll && notifications.length > 0 && (
        <div className="border-t shrink-0">
          <Link
            href="/notifications"
            onClick={onClose}
            className="flex items-center justify-center py-3 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            See all notifications
          </Link>
        </div>
      )}
    </>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function NotificationBell({ user }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const supabase = createClient();
  const notifPermissionRequested = useRef(false);
  const isMobile = useIsMobile();

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Request browser notification permission once
  useEffect(() => {
    if (!user || notifPermissionRequested.current) return;
    notifPermissionRequested.current = true;
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, [user]);

  // Fetch existing notifications
  useEffect(() => {
    if (!user) return;
    const fetchNotifications = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(30);
      if (data) setNotifications(data as Notification[]);
    };
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotif = payload.new as Notification;
          setNotifications((prev) => [newNotif, ...prev]);
          if (
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            new Notification("Saidit", {
              body: notificationText(newNotif),
              icon: "/assets/images/saidit-logo.svg",
            });
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const updated = payload.new as Notification;
          setNotifications((prev) =>
            prev.map((n) => (n.id === updated.id ? { ...n, read: updated.read } : n))
          );
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Auto-mark visible unread as read when opened
  useEffect(() => {
    if (!open) return;
    const preview = notifications.slice(0, 10);
    const unreadIds = preview.filter((n) => !n.read).map((n) => n.id);
    if (!unreadIds.length) return;
    markNotificationsRead(unreadIds).then(() => {
      setNotifications((prev) =>
        prev.map((n) => (unreadIds.includes(n.id) ? { ...n, read: true } : n))
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleToggleRead = (e: React.MouseEvent, n: Notification) => {
    e.preventDefault();
    e.stopPropagation();
    const newRead = !n.read;
    toggleNotificationRead(n.id, newRead);
    setNotifications((prev) =>
      prev.map((x) => (x.id === n.id ? { ...x, read: newRead } : x))
    );
  };

  const handleMarkAllRead = () => {
    const allIds = notifications.map((n) => n.id);
    markNotificationsRead(allIds).then(() => {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    });
  };

  if (!user) return null;

  const trigger = (
    <Button
      variant="outline"
      size="icon"
      className="relative rounded-full hover:bg-primary"
    >
      <Bell size={18} />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Button>
  );

  const listProps = {
    notifications,
    onClose: () => setOpen(false),
    onToggleRead: handleToggleRead,
    onMarkAllRead: handleMarkAllRead,
  };

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent className="max-h-[85vh] flex flex-col">
          <DrawerHeader className="sr-only">
            <DrawerTitle>Notifications</DrawerTitle>
          </DrawerHeader>
          <div className="flex flex-col flex-1 overflow-hidden">
            <NotificationList {...listProps} showSeeAll={false} />
          </div>
          {/* See all — pinned at bottom */}
          {notifications.length > 0 && (
            <div className="border-t shrink-0 pb-safe">
              <Link
                href="/notifications"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <CheckCheck size={14} />
                See all notifications
              </Link>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 overflow-hidden mt-4">
        <div className="flex flex-col max-h-[460px]">
          <NotificationList {...listProps} />
        </div>
      </PopoverContent>
    </Popover>
  );
}
