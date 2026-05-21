"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useGeneralProfile } from '@/app/context/GeneralProfileContext'
import { markNotificationsRead, toggleNotificationRead } from '@/app/actions'
import { notificationText, notificationLink, Notification } from '@/components/NotificationBell'
import Link from 'next/link'
import { Bell, CheckCheck, MailOpen, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'
import PulseLogo from '@/components/PulseLogo'

type NotificationWithActor = Notification & {
    actor_avatar_url?: string | null
}

export default function NotificationsPage() {
    const { user } = useGeneralProfile()
    const supabase = createClient()
    const [notifications, setNotifications] = useState<NotificationWithActor[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const mergeAvatars = async (data: Notification[]): Promise<NotificationWithActor[]> => {
        const actorIds = [...new Set(data.map(n => n.actor_id).filter(Boolean))] as string[]
        if (!actorIds.length) return data
        const { data: users } = await supabase
            .from('users')
            .select('account_id, avatar_url')
            .in('account_id', actorIds)
        const avatarMap = Object.fromEntries((users ?? []).map(u => [u.account_id, u.avatar_url]))
        return data.map(n => ({ ...n, actor_avatar_url: n.actor_id ? (avatarMap[n.actor_id] ?? null) : null }))
    }

    // Initial fetch
    useEffect(() => {
        if (!user) return
        const fetchNotifications = async () => {
            setIsLoading(true)
            const { data } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(100)
            if (data) {
                const merged = await mergeAvatars(data as Notification[])
                setNotifications(merged)
            }
            setIsLoading(false)
        }
        fetchNotifications()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id])

    // Realtime subscription
    useEffect(() => {
        if (!user) return
        const channel = supabase
            .channel(`notifications-page:${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`,
                },
                async (payload) => {
                    const newNotif = payload.new as Notification
                    const [merged] = await mergeAvatars([newNotif])
                    setNotifications(prev => [merged, ...prev])
                }
            )
            .subscribe()
        return () => { supabase.removeChannel(channel) }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id])

    const handleToggleRead = (n: NotificationWithActor) => {
        const newRead = !n.read
        toggleNotificationRead(n.id, newRead)
        setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: newRead } : x))
    }

    const handleMarkAllRead = () => {
        const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
        if (!unreadIds.length) return
        markNotificationsRead(unreadIds).then(() => {
            setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        })
    }

    const unreadCount = notifications.filter(n => !n.read).length

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
                    {unreadCount > 0 && (
                        <p className="text-sm text-muted-foreground mt-0.5">{unreadCount} unread</p>
                    )}
                </div>
                {unreadCount > 0 && (
                    <Button variant="outline" size="sm" className="rounded-full gap-2" onClick={handleMarkAllRead}>
                        <CheckCheck size={14} />
                        Mark all read
                    </Button>
                )}
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex justify-center py-20">
                    <PulseLogo />
                </div>
            ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
                    <Bell size={40} className="opacity-30" />
                    <p className="text-base">No notifications yet</p>
                    <p className="text-sm opacity-70">You&apos;ll be notified when someone replies or upvotes</p>
                </div>
            ) : (
                <div className="rounded-xl border border-border/60 overflow-hidden divide-y divide-border/40">
                    {notifications.map(n => (
                        <div
                            key={n.id}
                            className={`flex items-center gap-3 px-4 py-3 transition-colors ${!n.read ? 'bg-muted/20' : 'bg-background'} hover:bg-muted/30`}
                        >
                            {/* Unread indicator dot (visual only) */}
                            <span className={`shrink-0 h-2 w-2 rounded-full ${!n.read ? 'bg-primary' : 'bg-transparent'}`} />

                            {/* Actor avatar */}
                            <Link href={n.actor_username ? `/u/${n.actor_username}` : '#'} className="shrink-0">
                                <Avatar className="h-9 w-9 overflow-hidden">
                                    <AvatarImage src={n.actor_avatar_url ?? undefined} className="rounded-full" draggable={false} />
                                    <AvatarFallback className="text-xs rounded-full">
                                        {n.actor_username ? n.actor_username.slice(0, 2).toUpperCase() : '?'}
                                    </AvatarFallback>
                                </Avatar>
                            </Link>

                            {/* Text */}
                            <Link href={notificationLink(n)} className="flex-1 min-w-0">
                                <p className={`text-sm leading-snug ${!n.read ? 'font-medium' : ''}`}>
                                    {notificationText(n)}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                                </p>
                            </Link>

                            {/* Toggle read/unread — always visible */}
                            <button
                                onClick={() => handleToggleRead(n)}
                                title={n.read ? 'Mark as unread' : 'Mark as read'}
                                className="shrink-0 p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                            >
                                {n.read ? <Mail size={15} /> : <MailOpen size={15} />}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
