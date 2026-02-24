package com.brewco.controller;

import com.brewco.entity.Cafe;
import com.brewco.entity.Order;
import com.brewco.entity.StaffAssignment;
import com.brewco.entity.User;
import com.brewco.repository.UserRepository;
import com.brewco.service.OrderService;
import com.brewco.service.StaffService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * WaiterController — handles the waiter's role in the order flow.
 */
@RestController
@RequestMapping("/api/waiter")
@PreAuthorize("hasRole('WAITER')")
public class WaiterController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StaffService staffService;

    @Autowired
    private OrderService orderService;

    private User getWaiter(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName()).orElseThrow();
    }

    private Cafe getAssignedCafe(Authentication authentication) throws Exception {
        User waiter = getWaiter(authentication);
        StaffAssignment assignment = staffService.getActiveAssignmentForStaff(waiter)
                .orElseThrow(() -> new Exception("Not assigned to any cafe"));
        return assignment.getCafe();
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getWaiterOrders(Authentication authentication) {
        try {
            Cafe cafe = getAssignedCafe(authentication);
            User waiter = getWaiter(authentication);

            List<Order> orders = new ArrayList<>();
            for (String status : List.of("CONFIRMED", "SENT_TO_KITCHEN", "READY", "DELIVERED")) {
                for (Order order : orderService.getCafeOrdersByStatus(cafe, status)) {
                    if (waiter.getId()
                            .equals(order.getAssignedWaiter() != null ? order.getAssignedWaiter().getId() : null)
                            || !"DELIVERED".equals(status)) {
                        orders.add(order);
                    }
                }
            }
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/orders/{orderId}/send-to-kitchen")
    public ResponseEntity<?> sendToKitchen(@PathVariable("orderId") Long orderId, Authentication authentication) {
        try {
            User waiter = getWaiter(authentication);
            return orderService.getOrderById(orderId).map(order -> {
                if (!"CONFIRMED".equals(order.getStatus())) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "Order must be CONFIRMED to send to kitchen"));
                }
                Order updated = orderService.updateOrderStatus(order, "SENT_TO_KITCHEN", waiter,
                        "Forwarded to kitchen by waiter");
                return ResponseEntity.ok(updated);
            }).orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/orders/{orderId}/deliver")
    public ResponseEntity<?> markDelivered(@PathVariable("orderId") Long orderId, Authentication authentication) {
        try {
            User waiter = getWaiter(authentication);
            return orderService.getOrderById(orderId).map(order -> {
                if (!"READY".equals(order.getStatus())) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Order must be READY to deliver"));
                }
                Order updated = orderService.updateOrderStatus(order, "DELIVERED", waiter, "Delivered by waiter");
                return ResponseEntity.ok(updated);
            }).orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable("orderId") Long orderId,
            @RequestBody Map<String, String> payload,
            Authentication authentication) {
        try {
            String status = payload.get("status");
            if (status == null)
                throw new Exception("Status is required");

            User waiter = getWaiter(authentication);
            return orderService.getOrderById(orderId).map(order -> {
                Order updated = orderService.updateOrderStatus(order, status, waiter, "Updated by waiter");
                return ResponseEntity.ok(updated);
            }).orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
