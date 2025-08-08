/**
 * 드론 등록 페이지 - Axios API 통신 예시
 */

import React, { useState, useEffect } from 'react';
import { useDrone } from '../../hooks';
import type { DroneRegisterRequest } from '../../types';

const DroneRegisterPage: React.FC = () => {
  const { registerDrone, checkDroneExist, getMyDrone, drone, exists, isLoading } = useDrone();
  const [formData, setFormData] = useState<DroneRegisterRequest>({
    name: '',
    model: '',
    serialNumber: '',
  });
  const [error, setError] = useState<string>('');

  // 컴포넌트 마운트 시 드론 존재 여부 확인
  useEffect(() => {
    checkDroneExist().catch(console.error);
  }, [checkDroneExist]);

  // 폼 입력 처리
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // 드론 등록 제출 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await registerDrone(formData);
      // 등록 성공 후 처리 로직
    } catch (error) {
      setError(error instanceof Error ? error.message : '드론 등록에 실패했습니다.');
    }
  };

  // 드론 정보 새로고침
  const handleRefresh = () => {
    getMyDrone().catch(console.error);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            드론 등록
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Axios API 통신을 사용한 드론 등록 예시
          </p>

          {/* 현재 드론 상태 표시 */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">현재 드론 상태</h3>
            <div className="space-y-2 text-sm">
              <p>드론 존재 여부: {exists === null ? '확인 중...' : exists ? '등록됨' : '미등록'}</p>
              {drone && (
                <div>
                  <p>드론 이름: {drone.name}</p>
                  <p>시리얼 번호: {drone.serialNumber}</p>
                  <p>IVS ARN: {drone.IvsArn}</p>
                  <p>드론 ID: {drone.droneId}</p>
                </div>
              )}
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
              >
                {isLoading ? '새로고침 중...' : '새로고침'}
              </button>
            </div>
          </div>

          {/* 드론 등록 폼 */}
          {exists === false && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  드론 이름
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="드론 이름을 입력하세요"
                />
              </div>

              <div>
                <label htmlFor="model" className="block text-sm font-medium text-gray-700">
                  드론 모델
                </label>
                <input
                  id="model"
                  name="model"
                  type="text"
                  required
                  value={formData.model}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="드론 모델을 입력하세요"
                />
              </div>

              <div>
                <label htmlFor="serialNumber" className="block text-sm font-medium text-gray-700">
                  시리얼 번호
                </label>
                <input
                  id="serialNumber"
                  name="serialNumber"
                  type="text"
                  required
                  value={formData.serialNumber}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="시리얼 번호를 입력하세요"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '등록 중...' : '드론 등록'}
              </button>
            </form>
          )}

          {exists === true && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              드론이 이미 등록되어 있습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DroneRegisterPage; 