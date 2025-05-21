class NotificationService {
  static getInstance() { return new NotificationService(); }
  async requestUserPermission() { return false; }
  async getFCMToken() { return null; }
  async onTokenRefresh() { return; }
  async setupNotificationListeners() { return; }
}

export default NotificationService; 