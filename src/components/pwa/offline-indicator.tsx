"use client";

import { useState, useEffect } from "react";
import { Wifi, WifiOff, RefreshCw, CheckCircle2, CloudUpload } from "lucide-react";
import { OfflineStore, type OfflineAuditItem } from "@/lib/offline-store";

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingItems, setPendingItems] = useState<OfflineAuditItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check initial online status
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
      refreshPendingList();

      // Register Service Worker
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("[PWA] Service Worker registered successfully with scope:", reg.scope);
          })
          .catch((err) => {
            console.log("[PWA] Service Worker registration failed:", err);
          });
      }

      const handleOnline = () => {
        setIsOnline(true);
        // Auto-sync when coming back online
        handleSync();
      };

      const handleOffline = () => {
        setIsOnline(false);
      };

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  const refreshPendingList = () => {
    const list = OfflineStore.getPendingAudits();
    setPendingItems(list);
  };

  const handleSync = async () => {
    const pending = OfflineStore.getPendingAudits();
    if (pending.length === 0) return;

    setIsSyncing(true);
    try {
      const result = await OfflineStore.syncAllPending();
      refreshPendingList();
      if (result.syncedCount > 0) {
        setSyncSuccessMessage(`Synced ${result.syncedCount} offline inspection audits!`);
        setTimeout(() => setSyncSuccessMessage(null), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  // If online and no pending items and no success message, don't show intrusive bar
  if (isOnline && pendingItems.length === 0 && !syncSuccessMessage) {
    return null;
  }

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-xs px-4 py-2 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-40 transition-all duration-300">
      {/* Left: Status Message */}
      <div className="flex items-center gap-2">
        {!isOnline ? (
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
            <WifiOff className="w-4 h-4 animate-pulse" />
            <span>
              ⚡ <strong>OFFLINE MODE ACTIVE</strong> • Field photos &amp; audits are saved to local outbox
            </span>
          </div>
        ) : syncSuccessMessage ? (
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>{syncSuccessMessage}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
            <Wifi className="w-4 h-4" />
            <span>
              Back Online • {pendingItems.length} inspection items waiting to sync
            </span>
          </div>
        )}
      </div>

      {/* Right: Sync Action Button */}
      {pendingItems.length > 0 && isOnline && (
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-lg font-bold shadow-md shadow-blue-600/30 transition-all text-xs disabled:opacity-50"
        >
          <CloudUpload className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
          <span>{isSyncing ? "Syncing Outbox..." : `Sync Now (${pendingItems.length} pending)`}</span>
        </button>
      )}
    </div>
  );
}
