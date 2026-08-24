export type NotificationLevel = 'green' | 'yellow' | 'red';

export interface StudyNotification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  level: NotificationLevel;
  category: 'cronograma' | 'estudos' | 'simulado' | 'admin' | 'revisao';
  read: boolean;
  actionLabel?: string;
  actionTarget?: 'home' | 'caderno' | 'mapa' | 'treino';
}
