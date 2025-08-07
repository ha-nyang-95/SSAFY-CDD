package com.b102.cracktrack.domain.crack.service;

import com.b102.cracktrack.domain.crack.dto.CrackResponseDto;
import java.util.List;

public interface CrackService {

  void createCrack(String trackingKey, String url);

  void deleteCrack(Long crackId, Long userId);

  CrackResponseDto checkCrack(Long crackId, Long userId);

  List<CrackResponseDto> findCracksByTaskId(Long taskId, Long userId);

  CrackResponseDto findCrackById(Long crackId, Long userId);
}
