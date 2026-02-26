package com.brewco.repository;

import com.brewco.entity.GovernmentProof;
import com.brewco.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GovernmentProofRepository extends JpaRepository<GovernmentProof, Long> {
    List<GovernmentProof> findByUser(User user);
    List<GovernmentProof> findByUserId(Long userId);
}
