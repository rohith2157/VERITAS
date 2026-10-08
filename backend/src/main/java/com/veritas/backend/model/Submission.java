package com.veritas.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "submissions")
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long assignmentId;

    @Column(nullable = false)
    private String studentName;

    private String studentEmail;

    private String filename;

    @Column(columnDefinition = "TEXT")
    private String rawText;

    private Double similarityScore = 0.0;

    private Double finalMarks = 100.0;

    private String penaltyReason;

    private String status = "PENDING"; // PENDING, EVALUATED, FLAGGED_FOR_REVIEW

    private LocalDateTime submittedAt = LocalDateTime.now();

    @Column(columnDefinition = "TEXT")
    private String auditReportJson;

    @Column(columnDefinition = "TEXT")
    private String matchedSourcesJson;

    public Submission() {}

    public Submission(Long assignmentId, String studentName, String studentEmail, String filename, String rawText) {
        this.assignmentId = assignmentId;
        this.studentName = studentName;
        this.studentEmail = studentEmail;
        this.filename = filename;
        this.rawText = rawText;
        this.status = "PENDING";
        this.submittedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getAssignmentId() { return assignmentId; }
    public void setAssignmentId(Long assignmentId) { this.assignmentId = assignmentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getStudentEmail() { return studentEmail; }
    public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }

    public String getFilename() { return filename; }
    public void setFilename(String filename) { this.filename = filename; }

    public String getRawText() { return rawText; }
    public void setRawText(String rawText) { this.rawText = rawText; }

    public Double getSimilarityScore() { return similarityScore; }
    public void setSimilarityScore(Double similarityScore) { this.similarityScore = similarityScore; }

    public Double getFinalMarks() { return finalMarks; }
    public void setFinalMarks(Double finalMarks) { this.finalMarks = finalMarks; }

    public String getPenaltyReason() { return penaltyReason; }
    public void setPenaltyReason(String penaltyReason) { this.penaltyReason = penaltyReason; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }

    public String getAuditReportJson() { return auditReportJson; }
    public void setAuditReportJson(String auditReportJson) { this.auditReportJson = auditReportJson; }

    public String getMatchedSourcesJson() { return matchedSourcesJson; }
    public void setMatchedSourcesJson(String matchedSourcesJson) { this.matchedSourcesJson = matchedSourcesJson; }
}

