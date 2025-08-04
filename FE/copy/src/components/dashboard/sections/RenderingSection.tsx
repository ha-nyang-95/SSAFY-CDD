/**
 * 3D 렌더링 섹션 컴포넌트
 * 가장 최근 렌더링 항목과 등록된 지역 목록 표시
 */

import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useLocation } from "../../../hooks/domain/location/useLocation";
import { LocationAddModal } from "../../common";
import type { LocationRequestDto } from "../../../types/api";

function RenderingSection() {
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const { locations, isLoading, error, fetchLocations, addLocation } = useLocation();

  // 컴포넌트 마운트 시 지역 목록 조회
  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  // 지역 추가 처리
  const handleAddLocation = async (locationData: LocationRequestDto) => {
    setAddError(null);
    try {
      await addLocation(locationData);
      setShowAddModal(false);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : '지역 추가에 실패했습니다.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'processing': return 'text-blue-600 bg-blue-50';
      case 'failed': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '완료';
      case 'processing': return '진행중';
      case 'failed': return '실패';
      default: return '대기';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 h-full">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">3D Rendering</h3>
        </div>
        
        <NavLink
          to="/rendering"
          className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center space-x-1"
        >
          <span>자세히 보기</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </NavLink>
      </div>

      {/* 최근 렌더링 항목 */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">최근 렌더링</h4>
        <div className="border border-gray-200 rounded-lg p-6 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5" />
            </svg>
          </div>
          <h5 className="text-sm font-medium text-gray-900 mb-1">렌더링 이력이 없습니다</h5>
          <p className="text-xs text-gray-500">새로운 3D 렌더링을 시작해보세요</p>
        </div>
      </div>

      {/* 등록된 지역 목록 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700">등록된 지역</h4>
          <button
            onClick={() => setShowAddModal(true)}
            className="text-purple-600 hover:text-purple-700 text-xs font-medium flex items-center space-x-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>추가</span>
          </button>
        </div>

        {isLoading ? (
          <div className="border border-gray-200 rounded-lg p-6 text-center">
            <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-gray-500">지역 목록을 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="border border-red-200 rounded-lg p-4 text-center">
            <p className="text-xs text-red-600 mb-2">{error}</p>
            <button
              onClick={fetchLocations}
              className="text-xs text-purple-600 hover:text-purple-700"
            >
              다시 시도
            </button>
          </div>
        ) : locations.length > 0 ? (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {locations.map((location, index) => (
              <button
                key={`location-${location.id || index}`}
                onClick={() => setSelectedRegion(location.name)}
                className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                  selectedRegion === location.name
                    ? "border-purple-200 bg-purple-50 text-purple-700"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-sm font-medium">{location.name}</span>
                    {location.description && (
                      <p className="text-xs text-gray-500 mt-1 truncate">{location.description}</p>
                    )}
                  </div>
                  {selectedRegion === location.name && (
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="border border-gray-200 rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h5 className="text-sm font-medium text-gray-900 mb-1">등록된 지역이 없습니다</h5>
            <p className="text-xs text-gray-500 mb-3">새로운 지역을 등록하여 렌더링을 시작하세요</p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="text-purple-600 hover:text-purple-700 text-xs font-medium"
            >
              + 새 지역 추가
            </button>
          </div>
        )}
      </div>

      {/* 지역 추가 모달 */}
      <LocationAddModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddLocation}
        isLoading={isLoading}
      />

      {/* 에러 메시지 */}
      {addError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-600">{addError}</p>
        </div>
      )}
    </div>
  );
}

export default RenderingSection; 