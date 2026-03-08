package com.brewco.repository;

import com.brewco.entity.Cafe;
import com.brewco.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CafeRepository extends JpaRepository<Cafe, Long> {
    List<Cafe> findByOwner(User owner);

    @Query("SELECT c FROM Cafe c JOIN FETCH c.owner")
    List<Cafe> findAllWithOwner();

    List<Cafe> findByIsVerifiedTrueAndIsActiveTrue();

    Optional<Cafe> findByIdAndOwner(Long id, User owner);
}
