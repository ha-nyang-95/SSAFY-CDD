/**
 * 렌더링 히스토리 섹션 컴포넌트
 * 3D 렌더링 이력 및 결과 관리
 */

import { useState, useEffect } from "react";
import { useLocation } from "../../../hooks/domain/location/useLocation";

function HistorySection() {
  const [selectedRegion, setSelectedRegion] = useState<string>("전체");

  const { locations, isLoading, error, fetchLocations } = useLocation();

  // 컴포넌트 마운트 시 지역 목록 조회
  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'failed': return 'text-red-600 bg-red-50';
      case 'processing': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '완료';
      case 'failed': return '실패';
      case 'processing': return '진행중';
      default: return '대기';
    }
  };

  const getSafetyColor = (safety: string) => {
    switch (safety) {
      case 'SAFE': return 'bg-green-500';
      case 'WARNING': return 'bg-yellow-500';
      case 'DANGER': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 h-full">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">렌더링 이력</h3>
        </div>
        
        <button
          onClick={() => alert('히스토리 상세 페이지 준비 중입니다.')}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
        >
          <span>전체 보기</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 지역 선택 드롭다운 */}
      {!isLoading && !error && locations.length > 0 && (
        <div className="mb-4">
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="전체">전체</option>
            {locations.map((location, index) => (
              <option key={`location-${location.id || index}`} value={location.name}>
                {location.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 이력 목록 */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-gray-500">이력을 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">데이터를 불러올 수 없습니다</h4>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <button
              onClick={fetchLocations}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              다시 시도
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">렌더링 이력이 없습니다</h4>
            <p className="text-sm text-gray-500 mb-4">새로운 3D 렌더링을 시작하여 이력을 확인하세요</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
              새 렌더링 시작
            </button>
          </div>
        )}
      </div>

      {/* 하단 액션 버튼 */}
      {!isLoading && !error && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button className="w-full bg-blue-50 text-blue-600 py-2 px-4 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">
            + 새 렌더링 이력 시작
          </button>
        </div>
      )}
    </div>
  );
}

export default HistorySection; 