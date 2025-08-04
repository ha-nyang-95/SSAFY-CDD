/**
 * VWorld 지도 컴포넌트
 * 국토교통부 VWorld API를 사용하여 실제 지도를 표시
 */

import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css'; // OpenLayers CSS
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import XYZ from 'ol/source/XYZ';
import VectorSource from 'ol/source/Vector';
import { fromLonLat, transform } from 'ol/proj';
import { Point, Circle } from 'ol/geom';
import { Feature } from 'ol';
import { Style, Circle as CircleStyle, Fill, Stroke } from 'ol/style';

interface VWorldMapProps {
  center?: { lat: number; lng: number };
  level?: number;
  mapStyle?: 'normal' | 'satellite' | 'hybrid';
  onMapLoad?: (map: any) => void;
  onMapClick?: (lat: number, lng: number) => void;
  minHeight?: string;
  markers?: Array<{
    id: string;
    position: { lat: number; lng: number };
    title?: string;
    color?: string;
  }>;
  circles?: Array<{
    id: string;
    center: { lat: number; lng: number };
    radius: number;
    color: string;
    fillColor: string;
    fillOpacity: number;
  }>;
}

function VWorldMap({
  center = { lat: 37.5665, lng: 126.9780 }, // 서울 시청
  level = 8,
  mapStyle = 'normal',
  onMapLoad,
  onMapClick,
  minHeight = '300px',
  markers = [],
  circles = []
}: VWorldMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<Map | null>(null);
  const [mapMarkers, setMapMarkers] = useState<VectorLayer<VectorSource>[]>([]);
  const [mapCircles, setMapCircles] = useState<VectorLayer<VectorSource>[]>([]);

  // VWorld API 키
  const apiKey = import.meta.env.VITE_VWORLD_API_KEY;

  // VWorld 지도 초기화
  useEffect(() => {
    if (!mapRef.current) return;

    if (!apiKey) {
      console.error('VWorld API 키가 설정되지 않았습니다. 환경변수 VITE_VWORLD_API_KEY를 확인해주세요.');
      if (mapRef.current) {
        mapRef.current.innerHTML = `
          <div class="flex items-center justify-center h-full bg-gray-100 rounded-lg">
            <div class="text-center">
              <div class="text-red-500 text-lg font-medium mb-2">API 키 오류</div>
              <div class="text-gray-600 text-sm">
                VWorld API 키가 설정되지 않았습니다.<br>
                환경변수를 확인해주세요.
              </div>
            </div>
          </div>
        `;
      }
      return;
    }

    try {
      // VWorld 타일 레이어 설정 (OpenStreetMap 대신 사용)
      const osmSource = new XYZ({
        url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        crossOrigin: 'anonymous'
      });

      // 지도 생성
      const vworldMap = new Map({
        target: mapRef.current,
        layers: [
          new TileLayer({
            source: osmSource
          })
        ],
        view: new View({
          center: fromLonLat([center.lng, center.lat]),
          zoom: level
        })
      });

      // 지도 클릭 이벤트
      if (onMapClick) {
        vworldMap.on('click', (event) => {
          const coordinate = event.coordinate;
          const lonLat = transform(coordinate, 'EPSG:3857', 'EPSG:4326');
          onMapClick(lonLat[1], lonLat[0]); // lat, lng 순서
        });
      }

      setMap(vworldMap);

      // 지도 로드 완료 콜백
      if (onMapLoad) {
        onMapLoad(vworldMap);
      }

             // VWorld 지도 초기화 완료

    } catch (error) {
      console.error('VWorld 지도 로드 실패:', error);
      if (mapRef.current) {
        mapRef.current.innerHTML = `
          <div class="flex items-center justify-center h-full bg-gray-100 rounded-lg">
            <div class="text-center">
              <div class="text-red-500 text-lg font-medium mb-2">지도 로드 실패</div>
              <div class="text-gray-600 text-sm">
                VWorld 지도를 로드하는 중 오류가 발생했습니다.<br>
                네트워크 연결을 확인해주세요.
              </div>
            </div>
          </div>
        `;
      }
    }
  }, [apiKey, center.lat, center.lng, level, onMapClick, onMapLoad]);

  // 마커 업데이트
  useEffect(() => {
    if (!map) return;

    // 기존 마커 레이어 제거
    mapMarkers.forEach(layer => map.removeLayer(layer));
    mapCircles.forEach(layer => map.removeLayer(layer));

    const newMarkers: VectorLayer<VectorSource>[] = [];
    const newCircles: VectorLayer<VectorSource>[] = [];

    // 마커 레이어 생성
    const markerFeatures: Feature[] = [];
    markers.forEach(markerData => {
      const feature = new Feature({
        geometry: new Point(fromLonLat([markerData.position.lng, markerData.position.lat]))
      });

      // 마커 스타일 설정
      const markerColor = markerData.color === 'purple' ? '#8B5CF6' : '#3B82F6';
      feature.setStyle(new Style({
        image: new CircleStyle({
          radius: 8,
          fill: new Fill({ color: markerColor }),
          stroke: new Stroke({ color: 'white', width: 2 })
        })
      }));

      markerFeatures.push(feature);
    });

    if (markerFeatures.length > 0) {
      const markerSource = new VectorSource({
        features: markerFeatures
      });

      const markerLayer = new VectorLayer({
        source: markerSource
      });

      map.addLayer(markerLayer);
      newMarkers.push(markerLayer);
    }

    // 원형 영역 레이어 생성
    const circleFeatures: Feature[] = [];
    circles.forEach(circleData => {
      const feature = new Feature({
        geometry: new Circle(fromLonLat([circleData.center.lng, circleData.center.lat]), circleData.radius * 1000)
      });

      feature.setStyle(new Style({
        stroke: new Stroke({
          color: circleData.color,
          width: 2
        }),
        fill: new Fill({
          color: circleData.fillColor + Math.floor(circleData.fillOpacity * 255).toString(16).padStart(2, '0')
        })
      }));

      circleFeatures.push(feature);
    });

    if (circleFeatures.length > 0) {
      const circleSource = new VectorSource({
        features: circleFeatures
      });

      const circleLayer = new VectorLayer({
        source: circleSource
      });

      map.addLayer(circleLayer);
      newCircles.push(circleLayer);
    }

    setMapMarkers(newMarkers);
    setMapCircles(newCircles);
  }, [map, markers, circles]);

  // 지도 중심점 업데이트
  useEffect(() => {
    if (!map) return;

         const newCenter = fromLonLat([center.lng, center.lat]);
     map.getView().setCenter(newCenter);
  }, [map, center]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-full rounded-lg"
      style={{ minHeight }}
    />
  );
}

export default VWorldMap; 