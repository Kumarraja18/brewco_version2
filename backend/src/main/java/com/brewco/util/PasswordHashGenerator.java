package com.brewco.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import java.io.PrintWriter;
import java.io.FileWriter;

public class PasswordHashGenerator {
    public static void main(String[] args) throws Exception {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String hash = encoder.encode("kumar0237");
        try (PrintWriter out = new PrintWriter(new FileWriter("hash_output.txt"))) {
            out.println(hash);
        }
        System.out.println("Hash written to hash_output.txt");
    }
}
