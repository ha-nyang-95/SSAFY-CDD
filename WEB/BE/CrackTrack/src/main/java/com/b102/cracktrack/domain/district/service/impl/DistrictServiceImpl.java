package com.b102.cracktrack.domain.district.service.impl;

import com.b102.cracktrack.common.enums.Region;
import com.b102.cracktrack.domain.district.repository.DistrictRepository;
import com.b102.cracktrack.domain.district.service.DistrictService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DistrictServiceImpl implements DistrictService {

  private final DistrictRepository districtRepository;

  @Transactional
  @Override
  public void createDistrict(Region region, String districtName) {
    

  }
}
