package com.brewco.repository;

import com.brewco.entity.WorkExperience;
import com.brewco.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkExperienceRepository extends JpaRepository<WorkExperience, Long> {
    List<WorkExperience> findByUser(User user);
    List<WorkExperience> findByUserId(Long userId);
}
