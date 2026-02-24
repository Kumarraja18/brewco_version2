package com.brewco.repository;

import com.brewco.entity.Cafe;
import com.brewco.entity.StaffAssignment;
import com.brewco.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StaffAssignmentRepository extends JpaRepository<StaffAssignment, Long> {
    List<StaffAssignment> findByCafe(Cafe cafe);

    List<StaffAssignment> findByCafeAndIsActiveTrue(Cafe cafe);

    List<StaffAssignment> findByCafeAndRoleAndIsActiveTrue(Cafe cafe, String role);

    Optional<StaffAssignment> findByStaffAndIsActiveTrue(User staff);
}
