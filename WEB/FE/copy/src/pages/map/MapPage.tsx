/**
 * 전체 지도 보기 페이지
 * 비행 가능 지역과 드론 위치를 상세히 표시
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../hooks/auth/useAuth';
import { useResponsive } from '../../hooks/common/useResponsive';
import VWorldMap from '../../components/map/VWorldMap';

interface FlightZone {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'restricted';
  coordinates: { lat: number; lng: number };
  radius: number; // km
  description: string;
  lastUpdated: string;
}



function MapPage() {
  const { user } = useAuth();
  const { isDesktop } = useResponsive();
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 37.5665, lng: 126.9780 }); // 서울 시청
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

  // 비행 가능 지역 데이터 (실제 API 연동 시 교체)
  const flightZones: FlightZone[] = [];



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'restricted':
        return 'text-yellow-600 bg-yellow-100';
      case 'inactive':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '활성';
      case 'inactive': return '비활성';
      case 'restricted': return '제한';
      default: return status;
    }
  };

  // 지도 클릭 핸들러
  const handleMapClick = useCallback((lat: number, lng: number) => {
    setMapCenter({ lat, lng });
  }, []);

  // 현재 위치 가져오기
  const getCurrentLocation = useCallback(() => {
    setIsLoadingLocation(true);
    
    if (!navigator.geolocation) {
      alert('이 브라우저에서는 위치 정보를 지원하지 않습니다.');
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
             (position) => {
         const { latitude, longitude } = position.coords;
         
         // 현재 위치 저장
         const newLocation = { lat: latitude, lng: longitude };
         setCurrentLocation(newLocation);
         
         // 지도 중심 업데이트
         setMapCenter(newLocation);
         
         setIsLoadingLocation(false);
       },
      (error) => {
        setIsLoadingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert('위치 정보 접근이 거부되었습니다. 브라우저 설정에서 위치 정보 접근을 허용해주세요.');
            break;
          case error.POSITION_UNAVAILABLE:
            alert('위치 정보를 사용할 수 없습니다.');
            break;
          case error.TIMEOUT:
            alert('위치 정보 요청 시간이 초과되었습니다.');
            break;
          default:
            alert('위치 정보를 가져오는 중 오류가 발생했습니다.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5분
      }
    );
  }, []);

  // 페이지 로드 시 위치 허용 요청 (모바일에서만)
  useEffect(() => {
    // 모바일에서만 위치 권한 요청
    if (!isDesktop) {
      // 페이지 로드 후 1초 뒤에 위치 허용 요청
      const timer = setTimeout(() => {
        if (navigator.permissions && navigator.permissions.query) {
          navigator.permissions.query({ name: 'geolocation' }).then((result) => {
            setLocationPermission(result.state);
            if (result.state === 'granted') {
              getCurrentLocation();
            } else if (result.state === 'prompt') {
              // 사용자에게 위치 허용 요청
              getCurrentLocation();
            }
          });
          
          // 권한 상태 변화 모니터링 (타입 안전성을 위해 any 사용)
          (navigator.permissions as any).onchange = () => {
            navigator.permissions.query({ name: 'geolocation' }).then((result) => {
              setLocationPermission(result.state);
              if (result.state === 'granted') {
                getCurrentLocation();
              }
            });
          };
        } else {
          // permissions API를 지원하지 않는 브라우저
          getCurrentLocation();
        }
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      // 데스크톱에서는 이미 허용된 권한이 있는지 확인
      if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({ name: 'geolocation' }).then((result) => {
          setLocationPermission(result.state);
          if (result.state === 'granted') {
            // 이미 허용된 경우 자동으로 현재 위치 가져오기
            getCurrentLocation();
          }
        });
      }
    }
  }, [getCurrentLocation, isDesktop]);

  // 카카오맵 마커 데이터 (현재 위치만)
  const mapMarkers = currentLocation ? [{
    id: 'current-location',
    position: currentLocation,
    title: '내 현재 위치',
    color: 'purple' // 보라색으로 현재 위치 구분
  }] : [];

  // 카카오맵 원형 영역 데이터
  const mapCircles = flightZones.map(zone => ({
    id: zone.id,
    center: zone.coordinates,
    radius: zone.radius,
    color: zone.status === 'active' ? '#10B981' : zone.status === 'restricted' ? '#F59E0B' : '#EF4444',
    fillColor: zone.status === 'active' ? '#10B981' : zone.status === 'restricted' ? '#F59E0B' : '#EF4444',
    fillOpacity: zone.status === 'active' ? 0.3 : zone.status === 'restricted' ? 0.2 : 0.1
  }));

    return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-4 px-4">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">전체 지도 보기</h1>
              <p className="text-sm sm:text-base text-gray-600">VWorld 지도로 비행 가능 지역과 현재 위치를 실시간으로 확인할 수 있습니다.</p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* 위치 권한 토글 버튼 (모바일에서만 표시) */}
              {!isDesktop && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs sm:text-sm font-medium text-gray-700">위치 권한:</span>
                  <button
                    onClick={() => {
                      if (locationPermission === 'denied') {
                        // 브라우저별 설정 안내
                        const isChrome = navigator.userAgent.includes('Chrome');
                        const isFirefox = navigator.userAgent.includes('Firefox');
                        const isSafari = navigator.userAgent.includes('Safari');
                        
                        let message = '브라우저 설정에서 위치 정보 접근을 허용해주세요.\n\n';
                        
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
                      } else {
                        getCurrentLocation();
                      }
                    }}
                    className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-lg font-medium transition-colors ${
                      locationPermission === 'granted'
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : locationPermission === 'denied'
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    }`}
                  >
                    {locationPermission === 'granted' ? '허용됨' :
                     locationPermission === 'denied' ? '거부됨' : '확인 중'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* 사이드바 */}
          <div className="lg:col-span-1 space-y-4 lg:space-y-6">
            {/* 비행 가능 지역 목록 */}
            <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6">
              <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">비행 가능 지역</h3>
              <div className="space-y-2 lg:space-y-3">
                {flightZones.map((zone) => (
                  <div
                    key={zone.id}
                    className={`p-2 lg:p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedZone === zone.id
                        ? 'border-purple-300 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedZone(zone.id)}
                  >
                    <div className="flex items-center justify-between mb-1 lg:mb-2">
                      <h4 className="font-medium text-gray-900 text-sm lg:text-base">{zone.name}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(zone.status)}`}>
                        {getStatusText(zone.status)}
                      </span>
                    </div>
                    <p className="text-xs lg:text-sm text-gray-600 mb-1 lg:mb-2">{zone.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>반경: {zone.radius}km</span>
                      <span className="hidden sm:inline">업데이트: {zone.lastUpdated}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 현재 위치 정보 */}
            {currentLocation && (
              <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6">
                <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">내 현재 위치</h3>
                <div className="p-2 lg:p-3 rounded-lg border border-purple-200 bg-purple-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-purple-900 text-sm lg:text-base">현재 위치</h4>
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  </div>
                  
                  {/* 위치 정확도 확인 및 새로고침 */}
                  <div className="mt-2 lg:mt-3 pt-2 lg:pt-3 border-t border-purple-200">
                    <div className="text-xs text-purple-600 mb-2">
                      잘못된 위치로 표시되나요?
                    </div>
                    <button
                      onClick={getCurrentLocation}
                      disabled={isLoadingLocation}
                      className={`w-full text-xs px-2 lg:px-3 py-1 lg:py-1.5 rounded-md font-medium transition-colors ${
                        isLoadingLocation
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                      }`}
                    >
                      {isLoadingLocation ? (
                        <div className="flex items-center justify-center space-x-1">
                          <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          <span>위치 확인 중...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          <span>위치 새로고침</span>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

                    {/* 메인 지도 영역 */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 lg:mb-6 space-y-2 sm:space-y-0">
                <h3 className="text-base lg:text-lg font-semibold text-gray-900">실시간 지도</h3>
                <div className="flex flex-wrap items-center gap-2 text-xs lg:text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 lg:w-3 lg:h-3 bg-green-500 rounded-full"></div>
                    <span>비행 가능</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 lg:w-3 lg:h-3 bg-yellow-500 rounded-full"></div>
                    <span>제한 구역</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 lg:w-3 lg:h-3 bg-red-500 rounded-full"></div>
                    <span>금지 구역</span>
                  </div>
                  {currentLocation && (
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 lg:w-3 lg:h-3 bg-purple-500 rounded-full"></div>
                      <span>내 위치</span>
                    </div>
                  )}
                </div>
              </div>

              {/* VWorld 지도 컨테이너 */}
              <div className="relative h-64 sm:h-80 lg:h-96 rounded-lg overflow-hidden border-2 border-gray-200">
                                 <VWorldMap
                   center={mapCenter}
                   level={8}
                   mapStyle="normal"
                   onMapClick={handleMapClick}
                   minHeight="384px"
                   markers={mapMarkers}
                   circles={mapCircles}
                 />
                
                {/* 지도 컨트롤 오버레이 */}
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex flex-col space-y-1 sm:space-y-2">
                  <button 
                    onClick={getCurrentLocation}
                    disabled={isLoadingLocation}
                    className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg shadow-lg flex items-center justify-center transition-colors ${
                      isLoadingLocation 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                    title={isLoadingLocation ? "위치 확인 중..." : "현재 위치로 이동"}
                  >
                    {isLoadingLocation ? (
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                  <button 
                    onClick={() => setMapCenter({ lat: 37.5665, lng: 126.9780 })}
                    className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50"
                    title="서울로 이동"
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => setMapCenter({ lat: 35.1586, lng: 129.1603 })}
                    className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50"
                    title="부산으로 이동"
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => setMapCenter({ lat: 35.8581, lng: 128.6310 })}
                    className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50"
                    title="대구로 이동"
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                </div>

                {/* 지도 정보 */}
                <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 bg-white rounded-lg shadow-lg p-2 sm:p-3">
                  <div className="text-xs text-gray-600">
                    <div>확대/축소: 마우스 휠</div>
                    <div>이동: 드래그</div>
                    <div>선택: 클릭</div>
                  </div>
                </div>
              </div>

                             {/* 선택된 구역 정보 */}
               {selectedZone && (
                 <div className="mt-4 lg:mt-6 p-3 lg:p-4 bg-purple-50 border border-purple-200 rounded-lg">
                   <h4 className="font-medium text-purple-900 mb-1 lg:mb-2 text-sm lg:text-base">선택된 구역 정보</h4>
                   <div className="text-xs lg:text-sm text-purple-700">
                     {flightZones.find(z => z.id === selectedZone)?.description}
                   </div>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapPage; 