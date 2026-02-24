package com.brewco.repository;

import com.brewco.entity.Cafe;
import com.brewco.entity.CafeDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CafeDocumentRepository extends JpaRepository<CafeDocument, Long> {
    List<CafeDocument> findByCafe(Cafe cafe);
}
