package com.brewco.service;

import com.brewco.entity.Booking;
import com.brewco.entity.Cafe;
import com.brewco.entity.User;
import com.brewco.repository.BookingRepository;
import com.brewco.util.ReferenceGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ReferenceGenerator referenceGenerator;

    public Booking makeBooking(Booking booking) {
        booking.setBookingRef(referenceGenerator.generateBookingReference());
        booking.setStatus("PENDING");
        return bookingRepository.save(booking);
    }

    public Booking createBooking(Booking booking) {
        if (booking.getBookingRef() == null) {
            booking.setBookingRef(referenceGenerator.generateBookingReference());
        }
        return bookingRepository.save(booking);
    }

    public List<Booking> getCustomerBookings(User customer) {
        return bookingRepository.findByCustomer(customer);
    }

    public List<Booking> getCafeBookings(Cafe cafe) {
        return bookingRepository.findByCafe(cafe);
    }

    public Optional<Booking> getBookingById(Long id) {
        return bookingRepository.findById(id);
    }

    public Booking updateBookingStatus(Booking booking, String newStatus) {
        booking.setStatus(newStatus);
        return bookingRepository.save(booking);
    }
}
