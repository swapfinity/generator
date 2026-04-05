import type { LabelPart2D } from "../types/label-part";

export type NotificationLevel = 'INFO' | 'WARN' | 'ERROR';

const LEVEL_PRIORITY: Record<NotificationLevel, number> = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
};

export type GenerationNotification = {
    level: NotificationLevel;
    message: string;
};

export class GenerationNotifications {
    private record: Record<string, GenerationNotification[]> = {};

    add(fieldName: string, notification: GenerationNotification) {
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

    get(fieldName: string): GenerationNotification[] {
        return this.record[fieldName] ?? [];
    }

    getFirst(fieldName: string): GenerationNotification | null {
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