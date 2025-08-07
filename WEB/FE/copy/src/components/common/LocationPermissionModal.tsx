/**
 * 위치 권한 요청 모달 컴포넌트
 * 데스크톱에서 지도 사용을 위한 위치 권한을 요청
 */

import React, { useState, useEffect } from 'react';

interface LocationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPermissionGranted: () => void;
}

function LocationPermissionModal({ isOpen, onClose, onPermissionGranted }: LocationPermissionModalProps) {
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [isRequesting, setIsRequesting] = useState(false);

  // 현재 권한 상태 확인
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setPermissionState(result.state);
        if (result.state === 'granted') {
          onPermissionGranted();
        }
      });
    }
  }, [onPermissionGranted]);

  // 권한 요청 처리
  const handleRequestPermission = () => {
    setIsRequesting(true);
    
    if (!navigator.geolocation) {
      alert('이 브라우저에서는 위치 정보를 지원하지 않습니다.');
      setIsRequesting(false);
      return;
    }

         navigator.geolocation.getCurrentPosition(
       (position) => {
         setPermissionState('granted');
         setIsRequesting(false);
         onPermissionGranted();
         onClose();
       },
       (error) => {
         setPermissionState('denied');
         setIsRequesting(false);
        
        let message = '위치 정보 접근이 거부되었습니다.\n\n';
        
        // 브라우저별 설정 안내
        const isChrome = navigator.userAgent.includes('Chrome');
        const isFirefox = navigator.userAgent.includes('Firefox');
        const isSafari = navigator.userAgent.includes('Safari');
        
        if (isChrome) {
          message += 'Chrome 설정 방법:\n';
          message += '1. 주소창 왼쪽 자물쇠 아이콘 클릭\n';
          message += '2. "위치" 권한을 "허용"으로 변경\n';
          message += '3. 페이지 새로고침';
        } else if (isFirefox) {
          message += 'Firefox 설정 방법:\n';
          message += '1. 주소창 왼쪽 자물쇠 아이콘 클릭\n';
          message += '2. "위치 정보" 권한을 "허용"으로 변경\n';
          message += '3. 페이지 새로고침';
        } else if (isSafari) {
          message += 'Safari 설정 방법:\n';
          message += '1. Safari > 환경설정 > 개인정보 보호\n';
          message += '2. 위치 서비스에서 이 사이트 허용\n';
          message += '3. 페이지 새로고침';
        } else {
          message += '브라우저 설정에서 위치 정보 접근을 허용한 후 페이지를 새로고침해주세요.';
        }
        
        alert(message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5분
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">위치 권한 요청</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 내용 */}
        <div className="space-y-4">
          {/* 아이콘 */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>

          {/* 설명 */}
          <div className="text-center space-y-2">
            <h4 className="text-lg font-medium text-gray-900">지도 기능을 사용하시겠습니까?</h4>
            <p className="text-sm text-gray-600">
              현재 위치를 확인하고 비행 가능 지역을 지도에서 확인할 수 있습니다.
              <br />
              <span className="text-purple-600 font-medium">위치 정보 접근 권한이 필요합니다.</span>
            </p>
          </div>

          {/* 권한 상태 표시 */}
          {permissionState === 'granted' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-medium text-green-800">위치 권한이 허용되었습니다</span>
              </div>
            </div>
          )}

          {permissionState === 'denied' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-sm font-medium text-red-800">위치 권한이 거부되었습니다</span>
              </div>
              <p className="text-xs text-red-600 mt-1">
                브라우저 설정에서 위치 정보 접근을 허용해주세요.
              </p>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex space-x-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              나중에
            </button>
            <button
              onClick={handleRequestPermission}
              disabled={isRequesting || permissionState === 'granted'}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isRequesting || permissionState === 'granted'
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {isRequesting ? (
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>확인 중...</span>
                </div>
              ) : permissionState === 'granted' ? (
                '허용됨'
              ) : (
                '위치 권한 허용'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LocationPermissionModal; 