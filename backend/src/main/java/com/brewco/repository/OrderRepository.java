package com.brewco.repository;

import com.brewco.entity.Cafe;
import com.brewco.entity.Order;
import com.brewco.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCafe(Cafe cafe);

    List<Order> findByCustomer(User customer);

    List<Order> findByCafeAndStatus(Cafe cafe, String status);

    List<Order> findByCafeAndCreatedAtBetween(Cafe cafe, LocalDateTime start, LocalDateTime end);
}
