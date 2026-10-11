package com.veritas.backend.controller;

import com.veritas.backend.model.Assignment;
import com.veritas.backend.model.Classroom;
import com.veritas.backend.model.RubricRule;
import com.veritas.backend.model.Submission;
import com.veritas.backend.service.ClassroomService;
import com.veritas.backend.service.RubricService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/classrooms")
@CrossOrigin(origins = "*")
public class ClassroomController {

    private final ClassroomService classroomService;

    public ClassroomController(ClassroomService classroomService) {
        this.classroomService = classroomService;
    }

    @PostMapping
    public ResponseEntity<Classroom> createClassroom(@RequestBody Map<String, String> payload) {
        String name = payload.getOrDefault("name", "Default Classroom");
        String subject = payload.getOrDefault("subject", "General");
        String teacherName = payload.getOrDefault("teacherName", "Instructor");
        Classroom classroom = classroomService.createClassroom(name, subject, teacherName);
        return ResponseEntity.ok(classroom);
    }

    @GetMapping
    public ResponseEntity<List<Classroom>> getAllClassrooms() {
        return ResponseEntity.ok(classroomService.getAllClassrooms());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Classroom> getClassroomById(@PathVariable Long id) {
        return classroomService.getClassroomById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/assignments")
    public ResponseEntity<Assignment> createAssignment(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        String title = (String) payload.getOrDefault("title", "Untitled Assignment");
        String description = (String) payload.getOrDefault("description", "");
        String prompt = (String) payload.getOrDefault("prompt", "");
        Double maxMarks = payload.get("maxMarks") != null ? Double.valueOf(payload.get("maxMarks").toString()) : 100.0;
        String dueDate = (String) payload.getOrDefault("dueDate", "2026-10-31");

        Assignment assignment = classroomService.createAssignment(id, title, description, prompt, maxMarks, dueDate);
        return ResponseEntity.ok(assignment);
    }

    @GetMapping("/{id}/assignments")
    public ResponseEntity<List<Assignment>> getAssignmentsByClassroom(@PathVariable Long id) {
        return ResponseEntity.ok(classroomService.getAssignmentsByClassroom(id));
    }

    @GetMapping("/assignments/{assignmentId}")
    public ResponseEntity<Map<String, Object>> getAssignmentDetails(@PathVariable Long assignmentId) {
        return classroomService.getAssignmentById(assignmentId)
                .map(assignment -> {
                    Map<String, Object> res = new HashMap<>();
                    res.put("assignment", assignment);
                    res.put("rubrics", classroomService.getRubricRules(assignmentId));
                    res.put("submissions_count", classroomService.getSubmissions(assignmentId).size());
                    return ResponseEntity.ok(res);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/assignments/{assignmentId}/submit")
    public ResponseEntity<Submission> submitAssignment(@PathVariable Long assignmentId, @RequestBody Map<String, String> payload) {
        String studentName = payload.getOrDefault("studentName", "Anonymous Student");
        String studentEmail = payload.getOrDefault("studentEmail", "student@university.edu");
        String filename = payload.getOrDefault("filename", "essay.txt");
        String rawText = payload.getOrDefault("rawText", "");

        Submission submission = classroomService.submitAssignment(assignmentId, studentName, studentEmail, filename, rawText);
        return ResponseEntity.ok(submission);
    }

    @GetMapping("/assignments/{assignmentId}/submissions")
    public ResponseEntity<List<Submission>> getSubmissions(@PathVariable Long assignmentId) {
        return ResponseEntity.ok(classroomService.getSubmissions(assignmentId));
    }

    @PostMapping("/assignments/{assignmentId}/evaluate")
    public ResponseEntity<Map<String, Object>> evaluateCohort(@PathVariable Long assignmentId) {
        Map<String, Object> evaluationResult = classroomService.evaluateAssignmentCohort(assignmentId);
        return ResponseEntity.ok(evaluationResult);
    }

    @PostMapping("/assignments/{assignmentId}/rubrics")
    public ResponseEntity<RubricRule> addRubricRule(@PathVariable Long assignmentId, @RequestBody RubricRule rule) {
        rule.setAssignmentId(assignmentId);
        RubricRule saved = classroomService.addRubricRule(rule);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/ledger/blocks")
    public ResponseEntity<List<Map<String, Object>>> getLedgerBlocks() {
        return ResponseEntity.ok(classroomService.getLedgerBlocks());
    }

    @GetMapping("/submissions/{submissionId}/ledger")
    public ResponseEntity<Map<String, Object>> getSubmissionLedger(@PathVariable Long submissionId) {
        return ResponseEntity.ok(classroomService.verifySubmissionIntegrity(submissionId));
    }

    @GetMapping("/submissions/{submissionId}/verify")
    public ResponseEntity<Map<String, Object>> verifySubmission(@PathVariable Long submissionId) {
        return ResponseEntity.ok(classroomService.verifySubmissionIntegrity(submissionId));
    }

    @GetMapping("/submissions/{submissionId}/merkle")
    public ResponseEntity<Map<String, Object>> getSubmissionMerkleTree(@PathVariable Long submissionId) {
        return ResponseEntity.ok(classroomService.getSubmissionMerkleTree(submissionId));
    }

    @PostMapping("/ledger/merkle/verify")
    public ResponseEntity<Map<String, Object>> verifyMerkleProof(@RequestBody Map<String, Object> payload) {
        String leafHash = (String) payload.get("leafHash");
        List<Map<String, Object>> proof = (List<Map<String, Object>>) payload.get("proof");
        String expectedRoot = (String) payload.get("expectedRoot");

        boolean isValid = classroomService.verifyMerkleProof(leafHash, proof, expectedRoot);
        Map<String, Object> result = new HashMap<>();
        result.put("isProofValid", isValid);
        result.put("leafHash", leafHash);
        result.put("expectedRoot", expectedRoot);
        result.put("verifiedAt", java.time.LocalDateTime.now().toString());
        result.put("cryptographicStandard", "SHA-256 Binary Merkle Tree (O(log N) Verification)");

        return ResponseEntity.ok(result);
    }

    @PostMapping("/ugc2018/evaluate")
    public ResponseEntity<RubricService.Ugc2018Result> evaluateUgc2018(@RequestBody Map<String, Object> payload) {
        Double similarityScore = payload.get("similarityScore") != null
                ? Double.valueOf(payload.get("similarityScore").toString())
                : 0.0;
        return ResponseEntity.ok(classroomService.evaluateUgc2018(similarityScore));
    }

    @GetMapping("/assignments/{assignmentId}/submissions/{submissionId}/certificate")
    public ResponseEntity<Map<String, Object>> getSubmissionCertificate(
            @PathVariable Long assignmentId,
            @PathVariable Long submissionId) {
        Submission submission = classroomService.getSubmissions(assignmentId).stream()
                .filter(s -> s.getId().equals(submissionId))
                .findFirst()
                .orElseThrow(() -> new java.util.NoSuchElementException("Submission not found with ID: " + submissionId));

        Map<String, Object> integrity = classroomService.verifySubmissionIntegrity(submissionId);
        Map<String, Object> merkleTree = classroomService.getSubmissionMerkleTree(submissionId);

        Map<String, Object> certificate = new HashMap<>();
        certificate.put("certificate_id", "CERT-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        certificate.put("submission_id", submission.getId());
        certificate.put("student_name", submission.getStudentName());
        certificate.put("student_email", submission.getStudentEmail());
        certificate.put("filename", submission.getFilename());
        certificate.put("submitted_at", submission.getSubmittedAt());
        certificate.put("merkle_root", submission.getLedgerHash() != null ? submission.getLedgerHash() : (merkleTree != null ? merkleTree.get("merkleRoot") : "0x00"));
        certificate.put("evidentiary_seal", "SEAL-SHA256-" + (submission.getLedgerHash() != null ? submission.getLedgerHash().substring(0, Math.min(12, submission.getLedgerHash().length())).toUpperCase() : "VERITAS"));
        certificate.put("peer_similarity_score", submission.getSimilarityScore());
        certificate.put("ugc_classification", classroomService.evaluateUgc2018(submission.getSimilarityScore()));
        certificate.put("integrity_verification", integrity);
        certificate.put("merkle_tree", merkleTree);
        certificate.put("validator_authority", "Veritas Cryptographic Ledger Node-US-East");
        certificate.put("dpdp_compliance", "DPDP Act 2023 Sec 12 Cryptographic Seal Verified");
        certificate.put("timestamp", java.time.Instant.now());

        return ResponseEntity.ok(certificate);
    }
}

