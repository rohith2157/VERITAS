package com.veritas.backend.service;

import com.veritas.backend.model.RubricRule;
import org.junit.jupiter.api.Test;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class RubricServiceTest {

    private final RubricService rubricService = new RubricService();

    @Test
    public void testCleanOriginalityGetsFullMarks() {
        List<RubricRule> rules = List.of(
                new RubricRule(1L, 15.0, 30.0, 15.0, false, "Moderate similarity"),
                new RubricRule(1L, 30.0, 100.0, 100.0, true, "Critical plagiarism")
        );

        RubricService.GradingResult res = rubricService.evaluate(8.5, 100.0, rules);
        assertEquals(100.0, res.getFinalMarks());
        assertEquals(0.0, res.getDeductedMarks());
        assertEquals("EVALUATED", res.getStatus());
    }

    @Test
    public void testModerateSimilarityDeductsPenalty() {
        List<RubricRule> rules = List.of(
                new RubricRule(1L, 15.0, 30.0, 15.0, false, "Moderate similarity"),
                new RubricRule(1L, 30.0, 100.0, 100.0, true, "Critical plagiarism")
        );

        RubricService.GradingResult res = rubricService.evaluate(22.0, 100.0, rules);
        assertEquals(85.0, res.getFinalMarks());
        assertEquals(15.0, res.getDeductedMarks());
        assertEquals("EVALUATED", res.getStatus());
    }

    @Test
    public void testCriticalSimilarityFailsAndFlags() {
        List<RubricRule> rules = List.of(
                new RubricRule(1L, 15.0, 30.0, 15.0, false, "Moderate similarity"),
                new RubricRule(1L, 30.0, 100.0, 100.0, true, "Critical plagiarism")
        );

        RubricService.GradingResult res = rubricService.evaluate(68.4, 100.0, rules);
        assertEquals(0.0, res.getFinalMarks());
        assertEquals(100.0, res.getDeductedMarks());
        assertEquals("FLAGGED_FOR_REVIEW", res.getStatus());
    }
}

