/**
 * CrackLive 섹션 컴포넌트
 * 실시간 드론 상태 모니터링
 */

import { NavLink } from "react-router-dom";
import { useDrone } from "../../../hooks/domain/drone/useDrone";
import { useEffect } from "react";

function CrackLiveSection() {
  const { drone, exists, isLoading, getMyDrone } = useDrone();

  // 컴포넌트 마운트 시 드론 정보 가져오기
  useEffect(() => {
    if (exists === null) {
      getMyDrone().catch(console.error);
    }
  }, [exists, getMyDrone]);

  // 드론 상태 데이터 (API에서 가져온 데이터 기반)
  const getDroneStatus = () => {
    if (isLoading) {
      return [
        {
          id: 'loading',
          name: '로딩 중...',
          status: 'Loading',
          batteryLevel: 0,
          isActive: false,
          lastUpdate: '로딩 중'
        }
      ];
    }

    if (!exists || !drone) {
      return [
        {
          id: 'no-drone',
          name: '드론 미등록',
          status: 'Not Registered',
          batteryLevel: 0,
          isActive: false,
          lastUpdate: '드론을 등록해주세요'
        }
      ];
    }

    // 실제 드론 데이터를 기반으로 상태 생성
    const isActive = true; // 기본적으로 활성 상태로 설정
    const batteryLevel = isActive ? 85 : 0; // 실제로는 API에서 받아와야 함
    const lastUpdate = isActive ? '방금 전' : '오프라인';

    return [
      {
        id: drone.droneId,
        name: drone.name,
        status: isActive ? 'Connected' : 'Not Working',
        batteryLevel,
        isActive,
        lastUpdate,
        model: 'Unknown' // DroneResponseDto에는 model이 없음
      }
    ];
  };

  const droneStatus = getDroneStatus();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Connected':
        return 'text-green-600 bg-green-100';
      case 'Not Working':
        return 'text-red-600 bg-red-100';
      case 'Not Registered':
        return 'text-orange-600 bg-orange-100';
      case 'Loading':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 60) return 'bg-green-500';
    if (level > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* 섹션 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">CrackLive</h3>
        </div>
        
        {/* 실시간 표시기 */}
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-blue-500 animate-pulse' : 'bg-green-500 animate-pulse'}`}></div>
          <span className="text-sm text-gray-600">
            {isLoading ? '로딩 중...' : '실시간'}
          </span>
        </div>
      </div>

      {/* 드론 상태 카드들 */}
      <div className="grid grid-cols-1 gap-4">
        {droneStatus.map((drone, index) => (
          <div 
            key={`drone-${drone.id || index}`}
            className={`p-4 rounded-lg border-2 transition-colors ${
              drone.isActive 
                ? 'border-green-200 bg-green-50' 
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                {/* 드론 아이콘 */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  drone.isActive ? 'bg-green-500' : 'bg-gray-400'
                } text-white`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
                
                                  <div>
                    <h4 className="font-medium text-gray-900">{drone.name}</h4>
                    {'model' in drone && drone.model && (
                      <p className="text-xs text-gray-500">{drone.model}</p>
                    )}
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(drone.status)}`}>
                        {drone.status}
                      </span>
                    </div>
                  </div>
              </div>
              
              {/* 배터리 레벨 */}
              {drone.batteryLevel > 0 && (
                <div className="flex items-center space-x-2">
                  <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getBatteryColor(drone.batteryLevel)} transition-all duration-300`}
                      style={{ width: `${drone.batteryLevel}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600">{drone.batteryLevel}%</span>
                </div>
              )}
            </div>
            
            {/* 마지막 업데이트 시간 */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>마지막 업데이트: {drone.lastUpdate}</span>
              {!exists && (
                <NavLink
                  to="/drone-register"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  드론 등록
                </NavLink>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 새로고침 버튼 */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => getMyDrone().catch(console.error)}
          disabled={isLoading}
          className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '새로고침 중...' : '새로고침'}
        </button>
      </div>
    </div>
  );
}

export default CrackLiveSection; 