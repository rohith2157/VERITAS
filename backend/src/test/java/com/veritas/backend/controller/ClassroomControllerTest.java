package com.veritas.backend.controller;

import com.veritas.backend.service.ClassroomService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
public class ClassroomControllerTest {

    @Autowired
    private ClassroomController classroomController;

    @Autowired
    private StudioController studioController;

    private MockMvc mockMvcClassroom;
    private MockMvc mockMvcStudio;

    @BeforeEach
    public void setup() {
        this.mockMvcClassroom = MockMvcBuilders.standaloneSetup(classroomController).build();
        this.mockMvcStudio = MockMvcBuilders.standaloneSetup(studioController).build();
    }

    @Test
    public void testGetAllClassroomsReturnsSeededCourse() throws Exception {
        mockMvcClassroom.perform(get("/api/classrooms"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", not(empty())))
                .andExpect(jsonPath("$[0].name", containsString("CS 401")));
    }

    @Test
    public void testGetAssignmentsAndSubmissionsContract() throws Exception {
        // 1. Verify assignments list
        mockMvcClassroom.perform(get("/api/classrooms/1/assignments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", not(empty())))
                .andExpect(jsonPath("$[0].title", containsString("Assignment 3")));

        // 2. Verify assignment details
        mockMvcClassroom.perform(get("/api/classrooms/assignments/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.assignment.id", is(1)))
                .andExpect(jsonPath("$.rubrics", not(empty())))
                .andExpect(jsonPath("$.submissions_count", greaterThanOrEqualTo(5)));

        // 3. Verify submissions list contains the 5 seeded students
        mockMvcClassroom.perform(get("/api/classrooms/assignments/1/submissions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(5))))
                .andExpect(jsonPath("$[*].studentName", hasItems("Arjun Patel", "Rohan Gupta", "Elena Rostova", "David Chen", "Sarah Jenkins")));
    }

    @Test
    public void testLedgerBlocksAndVerificationEndpoints() throws Exception {
        // 1. Verify ledger blocks
        mockMvcClassroom.perform(get("/api/classrooms/ledger/blocks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(4))))
                .andExpect(jsonPath("$[0].height", greaterThanOrEqualTo(3140)));

        // 2. Verify submission SHA-256 seal
        mockMvcClassroom.perform(get("/api/classrooms/submissions/1/ledger"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isCryptographicallyValid", is(true)))
                .andExpect(jsonPath("$.tamperDetected", is(false)));
    }

    @Test
    public void testStudioHealthAndComparisonEndpoints() throws Exception {
        // 1. Health check
        mockMvcStudio.perform(get("/api/studio/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("UP")))
                .andExpect(jsonPath("$.gateway", containsString("Veritas")));

        // 2. 1-to-1 comparison gateway
        String jsonPayload = """
                {
                    "text_a": "Distributed consensus algorithms ensure node clusters reach agreement.",
                    "text_b": "Distributed consensus algorithms ensure node clusters reach agreement.",
                    "title_a": "Doc A",
                    "title_b": "Doc B"
                }
                """;

        mockMvcStudio.perform(post("/api/studio/compare-1to1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("success")))
                .andExpect(jsonPath("$.similarity_percentage", greaterThan(0.0)));
    }
}
