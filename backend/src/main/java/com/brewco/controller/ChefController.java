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
 * ChefController — handles the chef's role in the order flow.
 */
@RestController
@RequestMapping("/api/chef")
@PreAuthorize("hasRole('CHEF')")
public class ChefController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StaffService staffService;

    @Autowired
    private OrderService orderService;

    private Cafe getAssignedCafe(Authentication authentication) throws Exception {
        User chef = userRepository.findByEmail(authentication.getName()).orElseThrow();
        StaffAssignment assignment = staffService.getActiveAssignmentForStaff(chef)
                .orElseThrow(() -> new Exception("Not assigned to any cafe"));
        return assignment.getCafe();
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getActiveOrders(Authentication authentication) {
        try {
            Cafe cafe = getAssignedCafe(authentication);
            List<Order> orders = new ArrayList<>();
            orders.addAll(orderService.getCafeOrdersByStatus(cafe, "SENT_TO_KITCHEN"));
            orders.addAll(orderService.getCafeOrdersByStatus(cafe, "PREPARING"));
            orders.addAll(orderService.getCafeOrdersByStatus(cafe, "READY"));
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/orders/{orderId}/start")
    public ResponseEntity<?> startPreparing(@PathVariable("orderId") Long orderId, Authentication authentication) {
        try {
            User chef = userRepository.findByEmail(authentication.getName()).orElseThrow();
            return orderService.getOrderById(orderId).map(order -> {
                if (!"SENT_TO_KITCHEN".equals(order.getStatus())) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "Order must be SENT_TO_KITCHEN to start preparing"));
                }
                order.setAssignedChef(chef);
                Order updated = orderService.updateOrderStatus(order, "PREPARING", chef, "Preparation started by chef");
                return ResponseEntity.ok(updated);
            }).orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/orders/{orderId}/ready")
    public ResponseEntity<?> markReady(@PathVariable("orderId") Long orderId, Authentication authentication) {
        try {
            User chef = userRepository.findByEmail(authentication.getName()).orElseThrow();
            return orderService.getOrderById(orderId).map(order -> {
                if (!"PREPARING".equals(order.getStatus())) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Order must be PREPARING to mark ready"));
                }
                Order updated = orderService.updateOrderStatus(order, "READY", chef, "Order ready — marked by chef");
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

            User chef = userRepository.findByEmail(authentication.getName()).orElseThrow();
            return orderService.getOrderById(orderId).map(order -> {
                Order updated = orderService.updateOrderStatus(order, status, chef, "Updated by chef");
                return ResponseEntity.ok(updated);
            }).orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
