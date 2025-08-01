package com.b102.cracktrack.domain.ivs.repository;

import com.b102.cracktrack.domain.ivs.entity.IvsChannel;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * 이후 확장의 측면에서 필요하다면 사용할 예정입니다.
 */

@Repository
public interface IvsChannelRepository extends JpaRepository<IvsChannel, Long> {

  Optional<IvsChannel> findByUserId(Long userId);

  Optional<IvsChannel> findByDroneId(Long DroneId);

  Optional<IvsChannel> findByUserIdAndDroneId(Long userId, Long droneId);

  /**
   * 현재 코드들은 방송화면이 안 나올 때, 연결이 안되었을 때 에러처리용
   * 유저 드론 n:m 관계로 확장시 리스트 호출+상태 조회도 필요
   */
}
