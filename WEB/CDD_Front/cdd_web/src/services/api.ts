
import axios from 'axios';

const API_BASE_URL = '/api'; // Adjust this if your API is on a different domain/port

// --- Authentication APIs ---
export const login = async (username: string, password: string) => {
  const response = await axios.post(`${API_BASE_URL}/login`, { username, password });
  return response.data;
};

export const signup = async (username: string, password: string, employeeId: string) => {
  const response = await axios.post(`${API_BASE_URL}/signup`, { username, password, employeeId });
  return response.data;
};

export const logout = async (): Promise<{ success: boolean }> => {
  console.log('Simulating API call to logout...');

  // 네트워크 딜레이처럼 보이도록 300ms 지연을 줍니다.
  await new Promise(resolve => setTimeout(resolve, 300));

  console.log('Logout successful.');

  // 성공 응답을 반환합니다.
  return Promise.resolve({ success: true });
};

// export const logout = async () => {
//   const response = await axios.post(`${API_BASE_URL}/logout`);
//   return response.data;
// };

// --- Crack Data APIs ---
export interface Crack {
  id: string;
  location: string;
  severity: 'high' | 'medium' | 'low';
  length: number;
  width: number;
}

export interface CrackDetail extends Crack {
  description: string;
  imageURL?: string;
}

export const getCracks = async (): Promise<Crack[]> => {
  const response = await axios.get(`${API_BASE_URL}/cracks`);
  return response.data;
};

export const getCrackDetail = async (id: string): Promise<CrackDetail> => {
  const response = await axios.get(`${API_BASE_URL}/cracks/${id}`);
  return response.data;
};

// --- Structure Management APIs ---
export interface Structure {
  id: string;
  name: string;
  location: string;
  lastInspection: string;
}

export interface NewStructure {
  id: string;
  name: string;
  location: string;
  link: string;
}

export const getStructures = async (): Promise<Structure[]> => {
  const response = await axios.get(`${API_BASE_URL}/structures`);
  return response.data;
};
// 실제 네트워크 요청 대신 성공을 시뮬레이션하는 mock 함수로 변경
export const createStructure = async (data: { name: string; location: string; link: string }): Promise<NewStructure> => {
  console.log('Simulating API call to create structure with data:', data);

  // 1. 실제 네트워크 딜레이처럼 보이도록 500ms 지연을 줍니다.
  await new Promise(resolve => setTimeout(resolve, 500));

  // 2. 서버가 성공적으로 응답했다고 가정하고, 고유 ID를 가진 새 구조물 객체를 생성합니다.
  const newStructure: NewStructure = {
    id: `struct_${Date.now()}`, // 임시로 고유한 ID 생성
    ...data,
  };

  // 3. 에러 테스트를 하고 싶을 경우 아래 주석을 풀면 됩니다.
  // return Promise.reject(new Error('Simulated server error'));

  // 4. 생성된 구조물 데이터를 담아 성공(Promise.resolve)을 반환합니다.
  return Promise.resolve(newStructure);
};

export const generateLink = async (): Promise<{ link: string }> => {
  const response = await axios.get(`${API_BASE_URL}/structures/generate-link`);
  return response.data;
};

// --- Real-time Monitoring APIs ---
export interface LiveFeedStatus {
  status: 'live' | 'offline';
  url?: string;
}

export const getLiveFeedStatus = async (): Promise<LiveFeedStatus> => {
  const response = await axios.get(`${API_BASE_URL}/live-feed-status`);
  return response.data;
};
