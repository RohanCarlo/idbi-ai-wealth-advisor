package com.idbi.wealthadvisor;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class WealthAdvisorApplication {
    public static void main(String[] args) {
        SpringApplication.run(WealthAdvisorApplication.class, args);
    }
}
