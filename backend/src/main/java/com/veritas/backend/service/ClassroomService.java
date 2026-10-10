package com.veritas.backend.service;

import com.veritas.backend.model.Assignment;
import com.veritas.backend.model.Classroom;
import com.veritas.backend.model.RubricRule;
import com.veritas.backend.model.Submission;
import com.veritas.backend.repository.AssignmentRepository;
import com.veritas.backend.repository.ClassroomRepository;
import com.veritas.backend.repository.RubricRuleRepository;
import com.veritas.backend.repository.SubmissionRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ClassroomService {

    private final ClassroomRepository classroomRepository;
    private final AssignmentRepository assignmentRepository;
    private final RubricRuleRepository rubricRuleRepository;
    private final SubmissionRepository submissionRepository;
    private final AiEngineClient aiEngineClient;
    private final RubricService rubricService;
    private final AuditLedgerService auditLedgerService;

    public ClassroomService(ClassroomRepository classroomRepository,
                            AssignmentRepository assignmentRepository,
                            RubricRuleRepository rubricRuleRepository,
                            SubmissionRepository submissionRepository,
                            AiEngineClient aiEngineClient,
                            RubricService rubricService,
                            AuditLedgerService auditLedgerService) {
        this.classroomRepository = classroomRepository;
        this.assignmentRepository = assignmentRepository;
        this.rubricRuleRepository = rubricRuleRepository;
        this.submissionRepository = submissionRepository;
        this.aiEngineClient = aiEngineClient;
        this.rubricService = rubricService;
        this.auditLedgerService = auditLedgerService;
    }

    public Classroom createClassroom(String name, String subject, String teacherName) {
        String joinCode = "VTS-" + (1000 + new Random().nextInt(9000));
        Classroom classroom = new Classroom(name, subject, teacherName, joinCode);
        return classroomRepository.save(classroom);
    }

    public List<Classroom> getAllClassrooms() {
        return classroomRepository.findAll();
    }

    public Optional<Classroom> getClassroomById(Long id) {
        return classroomRepository.findById(id);
    }

    public Assignment createAssignment(Long classroomId, String title, String description, String prompt, Double maxMarks, String dueDate) {
        Assignment assignment = new Assignment(classroomId, title, description, prompt, maxMarks, dueDate);
        Assignment saved = assignmentRepository.save(assignment);

        // Seed standard default rubrics
        rubricRuleRepository.save(new RubricRule(saved.getId(), 0.0, 15.0, 0.0, false, "High Originality (0 penalty applied)"));
        rubricRuleRepository.save(new RubricRule(saved.getId(), 15.0, 35.0, 15.0, false, "Moderate Paraphrasing (15 marks deducted)"));
        rubricRuleRepository.save(new RubricRule(saved.getId(), 35.0, 60.0, 25.0, false, "Adversarial Evasion / High Overlap (25 marks deducted)"));
        rubricRuleRepository.save(new RubricRule(saved.getId(), 60.0, 100.0, 50.0, true, "Critical Collusion / Plagiarism (Flagged for Review)"));

        return saved;
    }

    public List<Assignment> getAssignmentsByClassroom(Long classroomId) {
        return assignmentRepository.findByClassroomId(classroomId);
    }

    public Optional<Assignment> getAssignmentById(Long id) {
        return assignmentRepository.findById(id);
    }

    public List<RubricRule> getRubricRules(Long assignmentId) {
        return rubricRuleRepository.findByAssignmentId(assignmentId);
    }

    public RubricRule addRubricRule(RubricRule rule) {
        return rubricRuleRepository.save(rule);
    }

    public Submission submitAssignment(Long assignmentId, String studentName, String studentEmail, String filename, String rawText) {
        Submission submission = new Submission(assignmentId, studentName, studentEmail, filename, rawText);
        Submission saved = submissionRepository.save(submission);
        auditLedgerService.sealSubmission(saved);
        return submissionRepository.save(saved);
    }

    public List<Submission> getSubmissions(Long assignmentId) {
        return submissionRepository.findByAssignmentId(assignmentId);
    }

    public Optional<Submission> getSubmissionById(Long id) {
        return submissionRepository.findById(id);
    }

    public Map<String, Object> verifySubmissionIntegrity(Long submissionId) {
        return submissionRepository.findById(submissionId)
                .map(auditLedgerService::verifyIntegrity)
                .orElse(Map.of("error", "Submission not found with ID: " + submissionId));
    }

    public List<Map<String, Object>> getLedgerBlocks() {
        return auditLedgerService.getRecentLedgerBlocks();
    }

    /**
     * Executes the Intra-Cohort Collusion Evaluation across all student submissions for an assignment.
     */
    public Map<String, Object> evaluateAssignmentCohort(Long assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new IllegalArgumentException("Assignment not found with ID: " + assignmentId));

        List<Submission> submissions = submissionRepository.findByAssignmentId(assignmentId);
        if (submissions.isEmpty()) {
            Map<String, Object> emptyRes = new HashMap<>();
            emptyRes.put("message", "No submissions found to evaluate for this assignment.");
            emptyRes.put("evaluated_count", 0);
            return emptyRes;
        }

        List<RubricRule> rules = rubricRuleRepository.findByAssignmentId(assignmentId);

        // 1. Build document payload for Python AI engine
        List<Map<String, Object>> docPayloads = new ArrayList<>();
        for (Submission s : submissions) {
            Map<String, Object> doc = new HashMap<>();
            doc.put("id", String.valueOf(s.getId()));
            doc.put("name", s.getStudentName() + " (" + (s.getFilename() != null ? s.getFilename() : "document") + ")");
            doc.put("text", s.getRawText() != null ? s.getRawText() : "");
            doc.put("timestamp", s.getSubmittedAt() != null ? s.getSubmittedAt().toString() : null);
            docPayloads.add(doc);
        }

        // 2. Call Python AI Engine for NxN matrix computation
        Map<String, Object> aiResult = aiEngineClient.compareCohort(docPayloads, 20.0);

        // 3. Extract matrix and compute max collusion score per student
        List<List<Number>> matrix = (List<List<Number>>) aiResult.get("similarity_matrix");

        for (int i = 0; i < submissions.size(); i++) {
            Submission sub = submissions.get(i);
            double maxPeerSimilarity = 0.0;

            if (matrix != null && i < matrix.size()) {
                List<Number> row = matrix.get(i);
                for (int j = 0; j < row.size(); j++) {
                    if (i != j) {
                        double score = row.get(j).doubleValue();
                        if (score > maxPeerSimilarity) {
                            maxPeerSimilarity = score;
                        }
                    }
                }
            }

            sub.setSimilarityScore(Math.round(maxPeerSimilarity * 100.0) / 100.0);

            // 4. Apply Spring Boot automated rubric grading
            RubricService.GradingResult gradeRes = rubricService.evaluate(sub.getSimilarityScore(), assignment.getMaxMarks(), rules);
            sub.setFinalMarks(gradeRes.getFinalMarks());
            sub.setPenaltyReason(gradeRes.getPenaltyReason());
            sub.setStatus(gradeRes.getStatus());

            // Reseal with cryptographic audit ledger
            auditLedgerService.sealSubmission(sub);
            submissionRepository.save(sub);
        }

        assignment.setStatus("EVALUATED");
        assignmentRepository.save(assignment);

        Map<String, Object> response = new HashMap<>();
        response.put("assignment", assignment);
        response.put("evaluated_submissions", submissions);
        response.put("cohort_matrix_analysis", aiResult);
        response.put("status", "BATCH EVALUATION COMPLETE (DETERMINISTIC WINNOWING & RUBRIC ENGINE)");
        return response;
    }
}
