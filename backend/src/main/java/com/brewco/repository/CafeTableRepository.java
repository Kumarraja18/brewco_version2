package com.brewco.repository;

import com.brewco.entity.Cafe;
import com.brewco.entity.CafeTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CafeTableRepository extends JpaRepository<CafeTable, Long> {
    List<CafeTable> findByCafe(Cafe cafe);
}
