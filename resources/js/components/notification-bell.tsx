import { useEffect, useState, useCallback } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { type SharedData } from '@/types';

interface NotificationData {
  kind: string;
  title: string;
  body: string;
  url?: string;
  status?: string;
}

interface NotificationItem {
  id: string;
  data: NotificationData;
  read_at: string | null;
  created_at: string;
}

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'baru saja';
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  return `${days} hari lalu`;
}

/**
 * Ikon lonceng notifikasi in-app di kanan atas (dipakai SELURUH user) —
 * sumbernya alur persetujuan impor Excel (lihat
 * App\Notifications\RiskExcelImportRequestSubmitted/Reviewed di backend).
 * Polling ringan (bukan real-time push) krn broadcasting (Reverb/Pusher)
 * belum dikonfigurasi di proyek ini — cukup utk kebutuhan "ada pesan
 * masuk yang perlu ditindaklanjuti", bukan chat langsung.
 */
export default function NotificationBell() {
  const { props } = usePage<SharedData>();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(props.unreadNotificationsCount ?? 0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setUnreadCount(props.unreadNotificationsCount ?? 0);
  }, [props.unreadNotificationsCount]);

  const fetchNotifications = useCallback(() => {
    setLoading(true);
    fetch('/notifications', { headers: { Accept: 'application/json' } })
      .then((res) => res.json())
      .then((data: { notifications: NotificationItem[]; unread_count: number }) => {
        setNotifications(data.notifications);
        setUnreadCount(data.unread_count);
      })
      .finally(() => setLoading(false));
  }, []);

  // Polling ringan tiap 60 detik supaya badge tetap terkini tanpa perlu
  // navigasi ulang — cukup utk kebutuhan tindak lanjut approval, bukan
  // real-time chat.
  useEffect(() => {
    const interval = setInterval(() => {
      fetch('/notifications', { headers: { Accept: 'application/json' } })
        .then((res) => res.json())
        .then((data: { unread_count: number }) => setUnreadCount(data.unread_count));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  const handleItemClick = (n: NotificationItem) => {
    if (!n.read_at) {
      router.post(`/notifications/${n.id}/read`, {}, { preserveScroll: true, preserveState: true });
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x)));
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    if (n.data.url) {
      setOpen(false);
      router.visit(n.data.url);
    }
  };

  const handleMarkAllRead = () => {
    router.post(
      '/notifications/read-all',
      {},
      {
        preserveScroll: true,
        preserveState: true,
        onSuccess: () => {
          setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
          setUnreadCount(0);
        },
      },
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifikasi">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 min-w-5 justify-center rounded-full px-1 text-[10px]" variant="destructive">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between p-3">
          <span className="text-sm font-semibold">Notifikasi</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={handleMarkAllRead}>
              <CheckCheck className="h-3.5 w-3.5" />
              Tandai semua dibaca
            </Button>
          )}
        </div>
        <Separator />
        <div className="max-h-96 overflow-y-auto">
          {loading && <div className="p-4 text-center text-sm text-muted-foreground">Memuat...</div>}
          {!loading && notifications.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">Belum ada notifikasi.</div>
          )}
          {!loading &&
            notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => handleItemClick(n)}
                className={`flex w-full flex-col gap-0.5 border-b p-3 text-left text-sm transition-colors last:border-b-0 hover:bg-muted/60 ${
                  !n.read_at ? 'bg-muted/30' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{n.data.title}</span>
                  {!n.read_at && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                  {n.read_at && <Check className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
                </div>
                <span className="text-xs text-muted-foreground">{n.data.body}</span>
                <span className="text-[11px] text-muted-foreground">{timeAgo(n.created_at)}</span>
              </button>
            ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
