"use client";

export interface OfflineAuditItem {
  id: string;
  jobId: string;
  jobTitle: string;
  photoUrl: string;
  photoBase64?: string;
  category: string;
  notes: string;
  defectsCount: number;
  timestamp: string;
  synced: boolean;
}

const OFFLINE_OUTBOX_KEY = "inspect_ai_offline_outbox";

export const OfflineStore = {
  // Save an inspection item locally when offline
  saveAudit(item: Omit<OfflineAuditItem, "id" | "timestamp" | "synced">): OfflineAuditItem {
    const newItem: OfflineAuditItem = {
      ...item,
      id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      synced: false,
    };

    try {
      const items = this.getAllAudits();
      items.unshift(newItem);
      localStorage.setItem(OFFLINE_OUTBOX_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save offline audit", e);
    }

    return newItem;
  },

  // Get all offline outbox items
  getAllAudits(): OfflineAuditItem[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(OFFLINE_OUTBOX_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error("Failed to read offline audits", e);
      return [];
    }
  },

  // Get only pending (un-synced) items
  getPendingAudits(): OfflineAuditItem[] {
    return this.getAllAudits().filter((item) => !item.synced);
  },

  // Mark an item as synced
  markAsSynced(id: string) {
    try {
      const items = this.getAllAudits().map((item) =>
        item.id === id ? { ...item, synced: true } : item
      );
      localStorage.setItem(OFFLINE_OUTBOX_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to update synced status", e);
    }
  },

  // Clear all synced items
  clearSynced() {
    try {
      const pending = this.getPendingAudits();
      localStorage.setItem(OFFLINE_OUTBOX_KEY, JSON.stringify(pending));
    } catch (e) {
      console.error("Failed to clear synced items", e);
    }
  },

  // Synchronize all pending items to backend API
  async syncAllPending(onProgress?: (syncedCount: number, total: number) => void): Promise<{ success: boolean; syncedCount: number }> {
    const pending = this.getPendingAudits();
    if (pending.length === 0) return { success: true, syncedCount: 0 };

    let syncedCount = 0;

    for (let i = 0; i < pending.length; i++) {
      const item = pending[i];
      try {
        const res = await fetch("/api/crud/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "sync_offline_artifact",
            jobId: item.jobId,
            category: item.category,
            photoUrl: item.photoUrl,
            notes: item.notes,
            defectsCount: item.defectsCount,
            capturedAt: item.timestamp,
          }),
        });

        // Even if mock endpoint returns ok or fallback, mark as synced
        if (res.ok || res.status === 200) {
          this.markAsSynced(item.id);
          syncedCount++;
        }
      } catch (err) {
        console.warn(`Could not sync item ${item.id} - device may still be offline`, err);
      }

      if (onProgress) {
        onProgress(syncedCount, pending.length);
      }
    }

    return {
      success: syncedCount > 0,
      syncedCount,
    };
  },
};
