package com.b102.cracktrack.domain.crack.service;

import com.b102.cracktrack.domain.crack.dto.CrackResponseDto;
import java.util.List;

public interface CrackService {

  void createCrack(String trackingKey, String url);

  void deleteCrack(Long CrackId);

  CrackResponseDto checkCrack(Long CrackId);

  List<CrackResponseDto> findCracksByTaskId(Long taskId);

  CrackResponseDto findCrackById(Long crackId);
}
