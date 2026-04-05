import type { LabelPart2D } from "../types/label-part";

export type NotificationLevel = 'INFO' | 'WARN' | 'ERROR';

const LEVEL_PRIORITY: Record<NotificationLevel, number> = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
};

export type FieldNotification = {
    level: NotificationLevel;
    message: string;
};

export class FieldNotifications {
    private record: Record<string, FieldNotification[]> = {};

    add(fieldName: string, notification: FieldNotification) {
        if (!this.record[fieldName]) {
            this.record[fieldName] = [];
        }

        this.record[fieldName].push(notification);
        this.record[fieldName].sort((a, b) => LEVEL_PRIORITY[a.level] - LEVEL_PRIORITY[b.level]);
    }

    addFromPart(part: LabelPart2D) {
        if (part.state !== 'OK') {
            this.add(part.fieldName, { level: toNotificationLevel(part.state), message: part.message });
        }
    }

    get(fieldName: string): FieldNotification[] {
        return this.record[fieldName] ?? [];
    }

    getFirst(fieldName: string): FieldNotification | null {
        return this.get(fieldName)[0] ?? null;
    }

    hasAny(): boolean {
        return Object.keys(this.record).length > 0;
    }

    isEmpty(): boolean {
        return !this.hasAny();
    }
}

export const toNotificationLevel = (state: 'WARN' | 'ERROR'): NotificationLevel => {
    switch (state) {
        case 'WARN': return 'WARN';
        case 'ERROR': return 'ERROR';
    }
};