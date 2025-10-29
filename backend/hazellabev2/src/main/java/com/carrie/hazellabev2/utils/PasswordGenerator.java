package com.carrie.hazellabev2.utils;



import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class PasswordGenerator implements CommandLineRunner {

    @Override
    public void run(String... args) throws Exception {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        // 👉 Aquí colocas la contraseña que quieras encriptar
        String rawPassword = "admin123";
        String encodedPassword = encoder.encode(rawPassword);

        System.out.println("🔐 Contraseña original: " + rawPassword);
        System.out.println("🧾 Contraseña encriptada: " + encodedPassword);
    }
}
