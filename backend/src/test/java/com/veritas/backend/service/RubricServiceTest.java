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

    @Test
    public void testUgc2018Level0SafeHarbor() {
        RubricService.Ugc2018Result res = rubricService.evaluateUgc2018(7.5);
        assertEquals("Level 0", res.getLevel());
        assertFalse(res.isRequiresTribunalHearing());
        assertTrue(res.getStudentPenalty().contains("no formal penalty"));
        assertTrue(res.getDaipRecommendation().contains("DISMISSED_NO_ACTION"));
        assertEquals(4, res.getStatutoryExclusions().size());
    }

    @Test
    public void testUgc2018Level1RevisionRequired() {
        RubricService.Ugc2018Result res = rubricService.evaluateUgc2018(25.0);
        assertEquals("Level 1", res.getLevel());
        assertTrue(res.isRequiresTribunalHearing());
        assertTrue(res.getStudentPenalty().contains("not exceeding 6 months"));
        assertTrue(res.getFacultyPenalty().contains("withdraw the manuscript"));
    }

    @Test
    public void testUgc2018Level2OneYearDebarment() {
        RubricService.Ugc2018Result res = rubricService.evaluateUgc2018(52.0);
        assertEquals("Level 2", res.getLevel());
        assertTrue(res.isRequiresTribunalHearing());
        assertTrue(res.getStudentPenalty().contains("strict period of one year"));
        assertTrue(res.getFacultyPenalty().contains("denial of one annual increment"));
    }

    @Test
    public void testUgc2018Level3PermanentExpulsion() {
        RubricService.Ugc2018Result res = rubricService.evaluateUgc2018(84.0);
        assertEquals("Level 3", res.getLevel());
        assertTrue(res.isRequiresTribunalHearing());
        assertTrue(res.getStudentPenalty().contains("permanently cancelled"));
        assertTrue(res.getFacultyPenalty().contains("denial of two successive annual increments"));
        assertTrue(res.getIaipRecommendation().contains("PROGRAMME_REGISTRATION_PERMANENTLY_CANCELLED"));
    }
}

