/**
 * 오른쪽 사이드바 컴포넌트
 * 비행 가능 지역 지도와 Shortcuts 섹션
 */

import { NavLink } from "react-router-dom";
import VWorldMap from "../map/VWorldMap";
import { useState, useCallback, useEffect } from "react";
import { useDrone } from "../../hooks/domain/drone/useDrone";

function RightSidebar() {
  // 지도 관련 상태
  const [mapCenter] = useState({ lat: 37.5665, lng: 126.9780 }); // 서울 시청
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

  // 드론 관련 상태
  const { drone, exists, isLoading, error, getMyDrone } = useDrone();

  // 컴포넌트 마운트 시 드론 정보 조회
  useEffect(() => {
    if (exists === null) {
      getMyDrone();
    }
  }, [exists, getMyDrone]);

  // 비행 가능 지역 데이터 (실제 API 연동 시 교체)
  const flightZones: Array<{
    id: string;
    name: string;
    status: string;
    coordinates: { lat: number; lng: number };
    radius: number;
    color: string;
    fillColor: string;
    fillOpacity: number;
  }> = [];

  // 지도 클릭 핸들러
  const handleMapClick = useCallback((lat: number, lng: number) => {
    // 지도 클릭 이벤트 처리
  }, []);

  // 현재 위치 가져오기 (간단한 버전)
  const getCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          // 위치 정보 가져오기 실패 처리
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 300000 // 5분
        }
      );
    }
  }, []);

  // 지도 마커 데이터
  const mapMarkers = currentLocation ? [{
    id: 'current-location',
    position: currentLocation,
    title: '내 현재 위치',
    color: 'purple'
  }] : [];

  // 지도 원형 영역 데이터
  const mapCircles = flightZones.map(zone => ({
    id: zone.id,
    center: zone.coordinates,
    radius: zone.radius,
    color: zone.color,
    fillColor: zone.fillColor,
    fillOpacity: zone.fillOpacity
  }));

  // 드론 바로가기 데이터 (실제 드론 데이터 사용)
  const droneShortcuts = drone && drone.droneId ? [{
    id: drone.droneId.toString(),
    name: drone.name || 'Unknown Drone',
    status: 'active', // 기본적으로 활성 상태로 설정
    color: 'bg-green-500'
  }] : [];

  return (
    <div className="w-80 h-full bg-white border-l border-gray-200 flex flex-col">
      {/* 비행 가능 지역 섹션 */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">비행 가능 지역</h3>
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        </div>
        
        {/* 실제 지도 영역 */}
        <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden mb-4 border border-gray-200">
          <VWorldMap
            center={mapCenter}
            level={7}
            mapStyle="normal"
            onMapClick={handleMapClick}
            minHeight="192px"
            markers={mapMarkers}
            circles={mapCircles}
          />
          
          
          {/* 현재 위치 버튼 */}
          <button
            onClick={getCurrentLocation}
            className="absolute top-2 right-2 w-6 h-6 bg-blue-500 hover:bg-blue-600 rounded shadow-lg flex items-center justify-center transition-colors"
            title="현재 위치"
          >
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          
          {/* 지도 범례 */}
          <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 rounded px-2 py-1 text-xs text-gray-600 shadow">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>비행가능</span>
              </div>
              {currentLocation && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>내위치</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 자세히 보기 버튼 */}
        <NavLink
          to="/map"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <span>전체 지도 보기</span>
        </NavLink>
      </div>

      {/* Shortcuts 섹션 */}
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Shortcuts</h3>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>

        {/* 드론 바로가기 목록 */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-sm text-gray-500">드론 정보를 불러오는 중...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500 mb-2">드론 정보를 불러올 수 없습니다</p>
              <button
                onClick={getMyDrone}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                다시 시도
              </button>
            </div>
          ) : droneShortcuts.length > 0 ? (
            droneShortcuts.map((drone) => (
              <NavLink
                key={drone.id}
                to="/detection"
                className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors group"
              >
                <div className={`w-12 h-12 ${drone.color} rounded-lg flex items-center justify-center text-white`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
                
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 group-hover:text-gray-700">
                    {drone.name}
                  </h4>
                  <div className="flex items-center space-x-1 mt-1">
                    <div className={`w-2 h-2 rounded-full ${
                      drone.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                    <span className="text-xs text-gray-500">
                      {drone.status === 'active' ? '활성' : '비활성'}
                    </span>
                  </div>
                </div>
                
                <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </NavLink>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <h5 className="text-sm font-medium text-gray-900 mb-1">등록된 드론이 없습니다</h5>
              <p className="text-xs text-gray-500 mb-3">드론을 등록하여 바로가기를 사용하세요</p>
              <NavLink
                to="/drone/register"
                className="text-blue-600 hover:text-blue-700 text-xs font-medium"
              >
                + 드론 등록
              </NavLink>
            </div>
          )}
        </div>

        {/* 추가 바로가기 버튼 */}
        {droneShortcuts.length > 0 && (
          <div className="mt-4">
            <button className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors">
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="text-sm font-medium">드론 추가</span>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* 하단 정보 섹션 */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500">
          <div className="flex items-center justify-between mb-1">
            <span>시스템 상태</span>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
          <div className="flex items-center justify-between">
            <span>마지막 업데이트</span>
            <span>방금 전</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RightSidebar; 