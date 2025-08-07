/**
 * 마이페이지 컴포넌트
 * 사용자 정보 수정, 비밀번호 변경, 계정 설정 등을 제공
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/auth/useAuth';
import { useDrone } from '../../hooks/domain/drone/useDrone';

interface UserUpdateData {
  name: string;
  emailNotifications: boolean;
}

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface DroneRegisterRequest {
  name: string;
  model: string;
  serialNumber: string;
}

function MyPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { drone, isLoading: isDroneLoading, error: droneError, getMyDrone, registerDrone } = useDrone();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'devices'>('profile');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // 드론 등록 모달 상태
  const [showDroneModal, setShowDroneModal] = useState(false);
  const [droneFormData, setDroneFormData] = useState<DroneRegisterRequest>({
    name: '',
    model: '',
    serialNumber: '',
  });
  const [droneRegisterError, setDroneRegisterError] = useState<string>('');
  const [isRegistering, setIsRegistering] = useState(false);

  // 컴포넌트 마운트 시 드론 정보 조회
  useEffect(() => {
    if (isAuthenticated && activeTab === 'devices') {
      getMyDrone();
    }
  }, [isAuthenticated, activeTab, getMyDrone]);

  // 드론 등록 폼 입력 처리
  const handleDroneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDroneFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // 드론 등록 제출 처리
  const handleDroneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDroneRegisterError('');
    setIsRegistering(true);

    try {
      await registerDrone(droneFormData);
      setUpdateMessage({ type: 'success', message: '드론이 성공적으로 등록되었습니다.' });
      setShowDroneModal(false);
      setDroneFormData({ name: '', model: '', serialNumber: '' });
      // 드론 정보 새로고침
      getMyDrone();
    } catch (error) {
      setDroneRegisterError(error instanceof Error ? error.message : '드론 등록에 실패했습니다.');
    } finally {
      setIsRegistering(false);
    }
  };

  // 드론 등록 모달 닫기
  const handleCloseDroneModal = () => {
    setShowDroneModal(false);
    setDroneFormData({ name: '', model: '', serialNumber: '' });
    setDroneRegisterError('');
  };

  // 폼 데이터 상태
  const [profileData, setProfileData] = useState<UserUpdateData>({
    name: user?.name || '',
    emailNotifications: true, // 기본값으로 이메일 알림 활성화
  });

  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // 역할별 한글 표시
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'ADMIN': return '관리자';
      case 'GENERAL': return '일반 사용자';
      default: return role;
    }
  };

  // 프로필 정보 업데이트
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateMessage(null);

    try {
      // TODO: API 호출 구현
      
      // 임시 성공 메시지
      setTimeout(() => {
        setUpdateMessage({ type: 'success', message: '프로필이 성공적으로 업데이트되었습니다.' });
        setIsUpdating(false);
      }, 1000);
    } catch (error) {
      setUpdateMessage({ type: 'error', message: '프로필 업데이트에 실패했습니다.' });
      setIsUpdating(false);
    }
  };

  // 비밀번호 변경
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setUpdateMessage({ type: 'error', message: '새 비밀번호가 일치하지 않습니다.' });
      return;
    }

    setIsUpdating(true);
    setUpdateMessage(null);

    try {
      // TODO: API 호출 구현
      
      // 임시 성공 메시지
      setTimeout(() => {
        setUpdateMessage({ type: 'success', message: '비밀번호가 성공적으로 변경되었습니다.' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setIsUpdating(false);
      }, 1000);
    } catch (error) {
      setUpdateMessage({ type: 'error', message: '비밀번호 변경에 실패했습니다.' });
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">로그인이 필요합니다</h2>
          <p className="text-gray-600 mb-4">마이페이지를 이용하려면 로그인해주세요.</p>
          <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
            로그인하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">마이페이지</h1>
          <p className="text-gray-600">계정 정보를 관리하고 설정을 변경할 수 있습니다.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 사이드바 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mb-4">
                  <span className="text-white text-2xl font-bold">
                    {user.name ? user.name.charAt(0) : user.username.charAt(0)}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900">{user.name || user.username}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
                <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full mt-2">
                  {getRoleDisplayName(user.role)}
                </span>
              </div>

              {/* 탭 메뉴 */}
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    내 정보 수정
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('password')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'password'
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    비밀번호 변경
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('devices')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'devices'
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    기기 관리
                  </div>
                </button>
              </nav>
            </div>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* 알림 메시지 */}
              {updateMessage && (
                <div className={`mb-6 p-4 rounded-lg ${
                  updateMessage.type === 'success' 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-red-100 text-red-700 border border-red-200'
                }`}>
                  {updateMessage.message}
                </div>
              )}

              {/* 내 정보 수정 탭 */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">내 정보 수정</h2>
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          이름
                        </label>
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="이름을 입력하세요"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          이메일
                        </label>
                        <input
                          type="email"
                          value={user.email}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                          placeholder="이메일은 수정할 수 없습니다"
                        />
                        <p className="text-sm text-gray-500 mt-1">이메일은 고유값이므로 수정할 수 없습니다.</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          이메일 알림
                        </label>
                        <div className="flex items-center">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer"
                              checked={profileData.emailNotifications}
                              onChange={(e) => setProfileData({ ...profileData, emailNotifications: e.target.checked })}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                          </label>
                          <span className="ml-3 text-sm text-gray-700">중요한 업데이트와 알림을 이메일로 받습니다</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isUpdating}
                        className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUpdating ? '업데이트 중...' : '정보 수정'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* 비밀번호 변경 탭 */}
              {activeTab === 'password' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">비밀번호 변경</h2>
                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          현재 비밀번호
                        </label>
                        <input
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="현재 비밀번호를 입력하세요"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          새 비밀번호
                        </label>
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="새 비밀번호를 입력하세요"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          새 비밀번호 확인
                        </label>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="새 비밀번호를 다시 입력하세요"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isUpdating}
                        className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUpdating ? '변경 중...' : '비밀번호 변경'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* 기기 관리 탭 */}
              {activeTab === 'devices' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">기기 관리</h2>
                  
                  {/* 드론 추가 버튼 - 항상 표시 */}
                  <div className="mb-6">
                    <button
                      onClick={() => setShowDroneModal(true)}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>드론 추가</span>
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">등록된 드론</h3>
                      </div>
                      
                      {/* 드론 목록 - 로딩 상태 */}
                      {isDroneLoading ? (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 드론 정보를 불러오는 중입니다...</h3>
                        </div>
                      ) : droneError ? (
                        <div className="text-center py-8 text-red-600">
                          <p>드론 정보를 불러오는데 실패했습니다: {droneError}</p>
                        </div>
                      ) : drone ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">드론 이름</h4>
                            <span className="text-sm text-gray-700">{drone.name}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">시리얼 번호</h4>
                            <span className="text-sm text-gray-700">{drone.serialNumber}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">IVS ARN</h4>
                            <span className="text-sm text-gray-700">{drone.IvsArn}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">드론 ID</h4>
                            <span className="text-sm text-gray-700">{drone.droneId}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 드론이 없습니다</h3>
                          <p className="text-gray-500 mb-4">새로운 드론을 등록하여 관리하세요</p>
                          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                            드론 추가
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 드론 등록 모달 */}
      {showDroneModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">드론 등록</h3>
              <button
                onClick={handleCloseDroneModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleDroneSubmit} className="space-y-4">
              {droneRegisterError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {droneRegisterError}
                </div>
              )}

              <div>
                <label htmlFor="droneName" className="block text-sm font-medium text-gray-700 mb-2">
                  드론 이름
                </label>
                <input
                  id="droneName"
                  name="name"
                  type="text"
                  value={droneFormData.name}
                  onChange={handleDroneInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="아직은 1:1 연결만 가능합니다."
                  required
                />
              </div>

              <div>
                <label htmlFor="droneModel" className="block text-sm font-medium text-gray-700 mb-2">
                  드론 모델
                </label>
                <input
                  id="droneModel"
                  name="model"
                  type="text"
                  value={droneFormData.model}
                  onChange={handleDroneInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="드론 모델을 입력하세요"
                  required
                />
              </div>

              <div>
                <label htmlFor="droneSerial" className="block text-sm font-medium text-gray-700 mb-2">
                  시리얼 번호
                </label>
                <input
                  id="droneSerial"
                  name="serialNumber"
                  type="text"
                  value={droneFormData.serialNumber}
                  onChange={handleDroneInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="시리얼 번호를 입력하세요"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseDroneModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isRegistering}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRegistering ? '등록 중...' : '드론 등록'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyPage; 