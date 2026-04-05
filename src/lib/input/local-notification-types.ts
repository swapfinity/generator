export type LocalNotificationLevel = 'INFO' | 'WARN' | 'ERROR';

export type LocalNotification = {
    level: LocalNotificationLevel;
    message: string;
};
