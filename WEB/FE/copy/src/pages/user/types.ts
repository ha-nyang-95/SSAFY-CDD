// 사용자 관련 타입 정의

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  username?: string;
  emailNotifications: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserUpdateData {
  name: string;
  emailNotifications: boolean;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserDevice {
  id: string;
  name: string;
  type: 'drone' | 'controller' | 'sensor';
  status: 'online' | 'offline' | 'maintenance';
  lastSeen?: Date;
}

export interface MyPageTab {
  id: 'profile' | 'password' | 'devices';
  label: string;
  icon: string;
} 