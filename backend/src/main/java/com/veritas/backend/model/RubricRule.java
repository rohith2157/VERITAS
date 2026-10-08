package com.veritas.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "rubric_rules")
public class RubricRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long assignmentId;

    @Column(nullable = false)
    private Double minSimilarity; // e.g. 15.0

    @Column(nullable = false)
    private Double maxSimilarity; // e.g. 30.0

    private Double markPenalty = 0.0; // e.g. 15.0 marks deducted

    private Boolean isZeroFail = false; // if true, grade is set to 0 and flagged

    private String description; // e.g. "Deduct 15 marks for moderate similarity (15-30%)"

    public RubricRule() {}

    public RubricRule(Long assignmentId, Double minSimilarity, Double maxSimilarity, Double markPenalty, Boolean isZeroFail, String description) {
        this.assignmentId = assignmentId;
        this.minSimilarity = minSimilarity;
        this.maxSimilarity = maxSimilarity;
        this.markPenalty = (markPenalty != null) ? markPenalty : 0.0;
        this.isZeroFail = (isZeroFail != null) ? isZeroFail : false;
        this.description = description;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getAssignmentId() { return assignmentId; }
    public void setAssignmentId(Long assignmentId) { this.assignmentId = assignmentId; }

    public Double getMinSimilarity() { return minSimilarity; }
    public void setMinSimilarity(Double minSimilarity) { this.minSimilarity = minSimilarity; }

    public Double getMaxSimilarity() { return maxSimilarity; }
    public void setMaxSimilarity(Double maxSimilarity) { this.maxSimilarity = maxSimilarity; }

    public Double getMarkPenalty() { return markPenalty; }
    public void setMarkPenalty(Double markPenalty) { this.markPenalty = markPenalty; }

    public Boolean getIsZeroFail() { return isZeroFail; }
    public void setIsZeroFail(Boolean isZeroFail) { this.isZeroFail = isZeroFail; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}

