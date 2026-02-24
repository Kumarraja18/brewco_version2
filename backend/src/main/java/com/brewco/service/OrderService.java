package com.brewco.service;

import com.brewco.entity.*;
import com.brewco.repository.OrderItemRepository;
import com.brewco.repository.OrderRepository;
import com.brewco.repository.OrderStatusHistoryRepository;
import com.brewco.util.ReferenceGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private OrderStatusHistoryRepository orderStatusHistoryRepository;

    @Autowired
    private ReferenceGenerator referenceGenerator;

    @Transactional
    public Order placeOrder(Order order, List<OrderItem> items, User placedBy) {
        order.setOrderRef(referenceGenerator.generateOrderReference());
        order.setStatus("PLACED");

        BigDecimal total = BigDecimal.ZERO;
        for (OrderItem item : items) {
            BigDecimal subTotal = item.getUnitPrice().multiply(new BigDecimal(item.getQuantity()));
            item.setSubTotal(subTotal);
            total = total.add(subTotal);
        }

        order.setTotalAmount(total);
        order.setGrandTotal(total.add(order.getTaxAmount()).subtract(order.getDiscountAmount()));

        Order savedOrder = orderRepository.save(order);

        for (OrderItem item : items) {
            item.setOrder(savedOrder);
            item.setStatus("PLACED");
            orderItemRepository.save(item);
        }

        logStatusChange(savedOrder, "PLACED", placedBy, "Order placed");

        return savedOrder;
    }

    public List<Order> getCustomerOrders(User customer) {
        return orderRepository.findByCustomer(customer);
    }

    public List<Order> getCafeOrders(Cafe cafe) {
        return orderRepository.findByCafe(cafe);
    }

    public List<Order> getCafeOrdersByStatus(Cafe cafe, String status) {
        return orderRepository.findByCafeAndStatus(cafe, status);
    }

    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }

    @Transactional
    public Order updateOrderStatus(Order order, String newStatus, User updatedBy, String notes) {
        order.setStatus(newStatus);
        Order savedOrder = orderRepository.save(order);
        logStatusChange(savedOrder, newStatus, updatedBy, notes);
        return savedOrder;
    }

    private void logStatusChange(Order order, String status, User changedBy, String notes) {
        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrder(order);
        history.setStatus(status);
        history.setChangedBy(changedBy);
        history.setNotes(notes);
        orderStatusHistoryRepository.save(history);
    }

    // ========================================================================
    // AUTO-ASSIGN SKELETON (Round-Robin) — Code kept but NOT activated.
    // Activation: call autoAssignStaff(order, cafe) instead of manual assignment.
    // Uses OS-inspired round-robin scheduling: rotate through available staff.
    // ========================================================================

    @Autowired
    private com.brewco.service.StaffService staffService;

    // Counters for round-robin rotation (in production, store in DB or Redis)
    private static final java.util.concurrent.atomic.AtomicLong chefCounter = new java.util.concurrent.atomic.AtomicLong(
            0);
    private static final java.util.concurrent.atomic.AtomicLong waiterCounter = new java.util.concurrent.atomic.AtomicLong(
            0);

    /**
     * Auto-assigns a chef and waiter to the order using round-robin scheduling.
     * Currently NOT called in the main flow — cafe owner manually assigns.
     * To activate: call this from confirmOrder() in CafeOwnerController.
     */
    public Order autoAssignStaff(Order order, Cafe cafe) {
        List<com.brewco.entity.StaffAssignment> activeStaff = staffService.getActiveStaffForCafe(cafe);

        // Separate chefs and waiters
        List<User> chefs = activeStaff.stream()
                .filter(s -> "CHEF".equals(s.getRole()))
                .map(com.brewco.entity.StaffAssignment::getStaff)
                .toList();

        List<User> waiters = activeStaff.stream()
                .filter(s -> "WAITER".equals(s.getRole()))
                .map(com.brewco.entity.StaffAssignment::getStaff)
                .toList();

        // Round-robin: pick next chef
        if (!chefs.isEmpty()) {
            int idx = (int) (chefCounter.getAndIncrement() % chefs.size());
            order.setAssignedChef(chefs.get(idx));
        }

        // Round-robin: pick next waiter
        if (!waiters.isEmpty()) {
            int idx = (int) (waiterCounter.getAndIncrement() % waiters.size());
            order.setAssignedWaiter(waiters.get(idx));
        }

        return orderRepository.save(order);
    }
}
