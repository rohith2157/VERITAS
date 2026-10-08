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
}

