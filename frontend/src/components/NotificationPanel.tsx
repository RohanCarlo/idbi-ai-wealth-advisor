"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/services/api";
import { Notification } from "@/types";
import { Bell, AlertTriangle, CheckCircle, TrendingUp, Info, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const ICON_MAP: Record<string, React.ReactNode> = {
  ALERT: <AlertTriangle className="w-4 h-4 text-red-400" />,
  MILESTONE: <CheckCircle className="w-4 h-4 text-emerald-500" />,
  WARNING: <AlertTriangle className="w-4 h-4 text-amber-400" />,
  INSIGHT: <TrendingUp className="w-4 h-4 text-brand-500" />,
};

export default function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: notes = [] } = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: () => notificationsApi.getAll().then((r) => r.data.data),
  });

  const { data: countData } = useQuery({
    queryKey: ["notifications-count"],
    queryFn: () => notificationsApi.getUnreadCount().then((r) => r.data.data.count),
    refetchInterval: 60_000,
  });

  const markRead = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-count"] });
    },
  });

  const unread = Number(countData ?? 0);

  return (
    <div className="relative">
      <button onClick={() => { setOpen(!open); if (!open && unread > 0) markRead.mutate(); }}
        className="relative w-9 h-9 flex items-center justify-center rounded-xl text-content-3 hover:text-content transition-colors"
        style={{ background: "var(--outline-2)" }}>
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 w-80 rounded-2xl shadow-xl z-40 overflow-hidden border animate-scale-in"
            style={{ background: "var(--surface-elevated)", borderColor: "var(--outline)" }}>
            <div className="flex items-center justify-between px-4 py-3 border-b"
              style={{ borderColor: "var(--outline)" }}>
              <h3 className="font-semibold text-content text-sm">Notifications</h3>
              <button onClick={() => setOpen(false)} className="text-content-4 hover:text-content transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notes.length === 0 ? (
                <div className="p-8 text-center text-content-4 text-sm">No notifications</div>
              ) : (
                notes.map((n) => (
                  <div key={n.id} className="p-3.5 flex gap-3 border-b last:border-b-0 transition-colors"
                    style={{
                      borderColor: "var(--outline)",
                      background: !n.read ? "var(--outline-2)" : "transparent",
                    }}>
                    <div className="w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0"
                      style={{ background: "var(--outline-2)", borderColor: "var(--outline)" }}>
                      {ICON_MAP[n.type] ?? <Info className="w-4 h-4 text-content-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-content leading-snug">{n.title}</p>
                      {n.message && <p className="text-xs text-content-3 mt-0.5 leading-relaxed">{n.message}</p>}
                      <p className="text-xs text-content-4 mt-1">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
