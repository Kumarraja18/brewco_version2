package com.brewco.repository;

import com.brewco.entity.Booking;
import com.brewco.entity.Cafe;
import com.brewco.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByCafe(Cafe cafe);

    List<Booking> findByCustomer(User customer);

    List<Booking> findByCafeAndBookingDate(Cafe cafe, LocalDate bookingDate);
}
