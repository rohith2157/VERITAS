package com.veritas.backend.config;

import com.veritas.backend.model.Assignment;
import com.veritas.backend.model.Classroom;
import com.veritas.backend.service.ClassroomService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final ClassroomService classroomService;

    public DataInitializer(ClassroomService classroomService) {
        this.classroomService = classroomService;
    }

    @Override
    public void run(String... args) throws Exception {
        // Seed default demo classroom
        Classroom classroom = classroomService.createClassroom(
                "CS301: Advanced Distributed Systems",
                "Computer Science",
                "Dr. Vikram Sharma"
        );

        // Seed demo assignment
        Assignment assignment = classroomService.createAssignment(
                classroom.getId(),
                "Assignment 2: Distributed Consensus & State Machine Replication",
                "Analyze the differences between Raft and Paxos protocols. Explain leader election and log replication guarantees.",
                "Compare Raft and Paxos consensus algorithms.",
                100.0,
                "2026-10-31"
        );

        // Seed sample student submissions
        String essayA = "Distributed consensus algorithms ensure that a cluster of nodes can agree on values despite network partitions. " +
                "Raft simplifies consensus by decomposing it into leader election, log replication, and safety guarantees. " +
                "A leader is elected via randomized heartbeat timers to prevent split-vote scenarios. " +
                "Once established, all client state transitions flow strictly through the leader before being committed to follower logs.";

        String essayB = "Distributed consensus algorithms ensure that a cluster of nodes can agree on values despite network partitions. " +
                "Raft simplifies consensus by decomposing it into leader election, log replication, and safety guarantees. " +
                "A leader is elected via randomized heartbeat timers to prevent split-vote scenarios. " +
                "All client state transitions flow strictly through the leader before being committed to follower logs.";

        String essayC = "Photosynthesis represents the biological mechanism where photosynthetic organisms convert solar irradiance into chemical energy. " +
                "Chlorophyll molecules capture photon wavelengths within the thylakoid membranes, facilitating light-dependent enzymatic cascades.";

        classroomService.submitAssignment(assignment.getId(), "Arjun Patel", "arjun.p@university.edu", "Raft_Consensus_Final.pdf", essayA);
        classroomService.submitAssignment(assignment.getId(), "Rohan Gupta", "rohan.g@university.edu", "Raft_Paper_v2.docx", essayB);
        classroomService.submitAssignment(assignment.getId(), "Neha Deshmukh", "neha.d@university.edu", "Biology_Elective.txt", essayC);

        System.out.println(">>> [Veritas] Seeded demo classroom (ID: " + classroom.getId() + ") with 3 student submissions.");
    }
}

