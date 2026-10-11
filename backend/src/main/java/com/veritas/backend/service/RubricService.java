package com.veritas.backend.service;

import com.veritas.backend.model.RubricRule;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RubricService {

    public static class GradingResult {
        private final Double finalMarks;
        private final Double deductedMarks;
        private final String penaltyReason;
        private final String status;

        public GradingResult(Double finalMarks, Double deductedMarks, String penaltyReason, String status) {
            this.finalMarks = finalMarks;
            this.deductedMarks = deductedMarks;
            this.penaltyReason = penaltyReason;
            this.status = status;
        }

        public Double getFinalMarks() { return finalMarks; }
        public Double getDeductedMarks() { return deductedMarks; }
        public String getPenaltyReason() { return penaltyReason; }
        public String getStatus() { return status; }
    }

    /**
     * Evaluates a submission's similarity percentage against the teacher's rubric rules.
     */
    public GradingResult evaluate(Double similarityScore, Double maxMarks, List<RubricRule> rules) {
        if (maxMarks == null) maxMarks = 100.0;
        if (similarityScore == null) similarityScore = 0.0;

        // Default: Full marks with no penalty
        Double finalMarks = maxMarks;
        Double deductedMarks = 0.0;
        String reason = "Original content within acceptable threshold (0 penalty applied)";
        String status = "EVALUATED";

        if (rules != null && !rules.isEmpty()) {
            for (RubricRule rule : rules) {
                if (similarityScore >= rule.getMinSimilarity() && similarityScore <= rule.getMaxSimilarity()) {
                    if (Boolean.TRUE.equals(rule.getIsZeroFail())) {
                        finalMarks = 0.0;
                        deductedMarks = maxMarks;
                        reason = String.format("Plagiarism threshold exceeded (%.1f%%). Grade set to 0. Flagged for review.", similarityScore);
                        status = "FLAGGED_FOR_REVIEW";
                        break;
                    } else {
                        deductedMarks = rule.getMarkPenalty();
                        finalMarks = Math.max(0.0, maxMarks - deductedMarks);
                        reason = String.format("Similarity of %.1f%% triggered rubric: %s (Deducted %.1f marks)",
                                similarityScore, rule.getDescription() != null ? rule.getDescription() : "Standard penalty", deductedMarks);
                        status = "EVALUATED";
                        break;
                    }
                }
            }
        }

        return new GradingResult(finalMarks, deductedMarks, reason, status);
    }

    public static class Ugc2018Result {
        private final String level;
        private final Double similarityScore;
        private final String threshold;
        private final String studentPenalty;
        private final String facultyPenalty;
        private final String daipRecommendation;
        private final String iaipRecommendation;
        private final boolean requiresTribunalHearing;
        private final List<String> statutoryExclusions;
        private final String legalStatute;

        public Ugc2018Result(String level, Double similarityScore, String threshold,
                             String studentPenalty, String facultyPenalty,
                             String daipRecommendation, String iaipRecommendation,
                             boolean requiresTribunalHearing, List<String> statutoryExclusions) {
            this.level = level;
            this.similarityScore = similarityScore;
            this.threshold = threshold;
            this.studentPenalty = studentPenalty;
            this.facultyPenalty = facultyPenalty;
            this.daipRecommendation = daipRecommendation;
            this.iaipRecommendation = iaipRecommendation;
            this.requiresTribunalHearing = requiresTribunalHearing;
            this.statutoryExclusions = statutoryExclusions;
            this.legalStatute = "UGC (Promotion of Academic Integrity and Prevention of Plagiarism in HEIs) Regulations, 2018";
        }

        public String getLevel() { return level; }
        public Double getSimilarityScore() { return similarityScore; }
        public String getThreshold() { return threshold; }
        public String getStudentPenalty() { return studentPenalty; }
        public String getFacultyPenalty() { return facultyPenalty; }
        public String getDaipRecommendation() { return daipRecommendation; }
        public String getIaipRecommendation() { return iaipRecommendation; }
        public boolean isRequiresTribunalHearing() { return requiresTribunalHearing; }
        public List<String> getStatutoryExclusions() { return statutoryExclusions; }
        public String getLegalStatute() { return legalStatute; }
    }

    /**
     * Evaluates plagiarism similarity against the statutory UGC 2018 four-tier framework:
     * - Level 0: Up to 10% (Minor similarities; no formal penalty)
     * - Level 1: > 10% to 40% (Submit revised script within 6 months / withdraw manuscript)
     * - Level 2: > 40% to 60% (Debarred for 1 year / denial of 1 annual increment, 2-year supervision bar)
     * - Level 3: > 60% (Registration permanently cancelled / denial of 2 increments, 3-year supervision bar)
     */
    public Ugc2018Result evaluateUgc2018(Double similarityScore) {
        if (similarityScore == null) similarityScore = 0.0;

        List<String> statutoryExclusions = List.of(
                "Section 7(a): Quoted work reproduced with necessary academic attribution",
                "Section 7(b): References, bibliography, table of contents, and preface",
                "Section 7(c): Generic terms, laws, standard symbols, and equations",
                "Section 7(d): Common coincidental phrases up to 14 consecutive words"
        );

        if (similarityScore <= 10.0) {
            return new Ugc2018Result(
                    "Level 0",
                    similarityScore,
                    "Up to 10%",
                    "Minor similarities; no formal penalty imposed.",
                    "Minor similarities; no formal penalty imposed.",
                    "DISMISSED_NO_ACTION (Originality verified within statutory safe harbor)",
                    "CLOSED_NO_PENALTY",
                    false,
                    statutoryExclusions
            );
        } else if (similarityScore <= 40.0) {
            return new Ugc2018Result(
                    "Level 1",
                    similarityScore,
                    "Above 10% to 40%",
                    "Required to submit a revised script within a stipulated time period not exceeding 6 months.",
                    "Required to withdraw the manuscript.",
                    "REFERRED_FOR_REVISION (Must resubmit revised script within 6 months)",
                    "FORMAL_WRITTEN_WARNING_ISSUED",
                    true,
                    statutoryExclusions
            );
        } else if (similarityScore <= 60.0) {
            return new Ugc2018Result(
                    "Level 2",
                    similarityScore,
                    "Above 40% to 60%",
                    "Debarred from submitting a revised script for a strict period of one year.",
                    "Withdrawal of manuscript; denial of one annual increment; barred from supervising new scholars for two years.",
                    "REFERRED_TO_IAIP (Statutory recommendation: 1-year academic debarment)",
                    "ONE_YEAR_SCRIPT_DEBARMENT_IMPOSED",
                    true,
                    statutoryExclusions
            );
        } else {
            return new Ugc2018Result(
                    "Level 3",
                    similarityScore,
                    "Above 60%",
                    "Student registration for the programme is permanently cancelled.",
                    "Withdrawal of manuscript; denial of two successive annual increments; barred from supervising new scholars for three years.",
                    "REFERRED_TO_IAIP_CRITICAL (Statutory recommendation: permanent programme expulsion)",
                    "PROGRAMME_REGISTRATION_PERMANENTLY_CANCELLED",
                    true,
                    statutoryExclusions
            );
        }
    }
}
