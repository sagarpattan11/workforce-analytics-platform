export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'pipeline' | 'skill_gap' | 'placement' | 'learning' | 'system';
  severity: 'info' | 'warning' | 'success' | 'error';
  link?: string;
}

const STORAGE_KEY = 'wfa_notifications_state_v1';

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Pipeline Ingestion Completed',
    message: 'Synced 120 placements, 85 requisitions, and 210 learning records across departments.',
    timestamp: '15m ago',
    read: false,
    type: 'pipeline',
    severity: 'success',
    link: '/analytics',
  },
  {
    id: 'notif-2',
    title: 'Critical Skill Gaps Identified',
    message: '3 capability deficits detected in Engineering & Cloud Architecture requiring upskilling.',
    timestamp: '1h ago',
    read: false,
    type: 'skill_gap',
    severity: 'warning',
    link: '/analytics',
  },
  {
    id: 'notif-3',
    title: 'Executive Placement Recorded',
    message: 'Candidate Priya Sharma placed as Senior Cloud Architect at TechCorp Global (₹18.5 LPA).',
    timestamp: '3h ago',
    read: false,
    type: 'placement',
    severity: 'info',
    link: '/analytics',
  },
  {
    id: 'notif-4',
    title: 'Competency Mastery Achieved',
    message: '14 trainees completed Advanced Fullstack Upskilling with average assessment score of 88%.',
    timestamp: '1d ago',
    read: true,
    type: 'learning',
    severity: 'success',
    link: '/analytics',
  },
];

type Listener = (notifications: AppNotification[]) => void;
const listeners: Set<Listener> = new Set();

const notifyListeners = (notifs: AppNotification[]) => {
  listeners.forEach((listener) => {
    try {
      listener(notifs);
    } catch (e) {
      console.error('Error notifying notification listener:', e);
    }
  });
};

export const notificationService = {
  getNotifications(): AppNotification[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse stored notifications:', e);
    }
    // Initialize defaults if not present
    this.saveNotifications(DEFAULT_NOTIFICATIONS);
    return DEFAULT_NOTIFICATIONS;
  },

  saveNotifications(notifs: AppNotification[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifs));
      notifyListeners(notifs);
    } catch (e) {
      console.error('Failed to save notifications:', e);
    }
  },

  getUnreadCount(): number {
    const notifs = this.getNotifications();
    return notifs.filter((n) => !n.read).length;
  },

  markAsRead(id: string): void {
    const notifs = this.getNotifications().map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    this.saveNotifications(notifs);
  },

  markAllAsRead(): void {
    const notifs = this.getNotifications().map((n) => ({ ...n, read: true }));
    this.saveNotifications(notifs);
  },

  deleteNotification(id: string): void {
    const notifs = this.getNotifications().filter((n) => n.id !== id);
    this.saveNotifications(notifs);
  },

  clearAll(): void {
    this.saveNotifications([]);
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    // Provide initial state immediately
    listener(this.getNotifications());
    return () => {
      listeners.delete(listener);
    };
  },
};
