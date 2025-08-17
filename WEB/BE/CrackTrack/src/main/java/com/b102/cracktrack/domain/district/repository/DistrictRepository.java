package com.b102.cracktrack.domain.district.repository;

import com.b102.cracktrack.common.enums.Region;
import com.b102.cracktrack.domain.district.entity.District;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DistrictRepository extends JpaRepository<District, Long> {

  List<District> findDistrictByRegion(Region region);

  Optional<District> findDistrictByName(String districtName);

  // 지역 + 이름으로 정확 조회 (동명이 구역 충돌 방지)
  Optional<District> findByRegionAndName(Region region, String name);

}
