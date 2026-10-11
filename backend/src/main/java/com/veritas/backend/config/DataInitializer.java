package com.veritas.backend.config;

import com.veritas.backend.model.Assignment;
import com.veritas.backend.model.Classroom;
import com.veritas.backend.model.RubricRule;
import com.veritas.backend.model.Submission;
import com.veritas.backend.repository.RubricRuleRepository;
import com.veritas.backend.repository.SubmissionRepository;
import com.veritas.backend.service.AuditLedgerService;
import com.veritas.backend.service.ClassroomService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final ClassroomService classroomService;
    private final SubmissionRepository submissionRepository;
    private final AuditLedgerService auditLedgerService;
    private final RubricRuleRepository rubricRuleRepository;

    public DataInitializer(ClassroomService classroomService,
                           SubmissionRepository submissionRepository,
                           AuditLedgerService auditLedgerService,
                           RubricRuleRepository rubricRuleRepository) {
        this.classroomService = classroomService;
        this.submissionRepository = submissionRepository;
        this.auditLedgerService = auditLedgerService;
        this.rubricRuleRepository = rubricRuleRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Enterprise Classroom (CS 401: Distributed Systems & Cryptographic Protocols)
        Classroom classroom = classroomService.createClassroom(
                "CS 401: Distributed Systems & Cryptographic Protocols",
                "Computer Science",
                "Dr. Evelyn Chen"
        );
        classroom.setJoinCode("CS-401-FALL");

        // 2. Seed Assignment 3: Raft Consensus & Byzantine Fault Tolerance
        Assignment assignment = classroomService.createAssignment(
                classroom.getId(),
                "Assignment 3: Raft Consensus & Byzantine Fault Tolerance",
                "Implement cluster leader election, log replication, and safety guarantees with fault tolerance.",
                "Compare Raft and Paxos consensus algorithms. Implement randomized timer leader election.",
                100.0,
                "2026-10-15"
        );

        // 3. Clear existing auto-rubrics and configure calibrated enterprise rubric rules
        rubricRuleRepository.deleteAll();
        rubricRuleRepository.save(new RubricRule(assignment.getId(), 0.0, 15.0, 0.0, false, "High Originality (> 85%)"));
        rubricRuleRepository.save(new RubricRule(assignment.getId(), 15.0, 40.0, 15.0, false, "Moderate Paraphrasing (60% - 85%)"));
        rubricRuleRepository.save(new RubricRule(assignment.getId(), 40.0, 60.0, 25.0, false, "Adversarial Evasion (Homoglyphs / Hidden Whitespace)"));
        rubricRuleRepository.save(new RubricRule(assignment.getId(), 60.0, 100.0, 50.0, true, "Direct Collusion / Plagiarism (< 60%)"));

        // 4. Seed Mock Submissions for the 5 Students

        // Student 1: Arjun Patel (Clean pass / Verified Ledger)
        String codeArjun = "# Raft Consensus Implementation\n" +
                "# Author: Arjun Patel (arjun.p@cs.university.edu)\n" +
                "import time, random\n\n" +
                "class RaftClusterNode:\n" +
                "    def __init__(self, node_id, peers):\n" +
                "        self.node_id = node_id\n" +
                "        self.peers = peers\n" +
                "        self.term = 0\n" +
                "        self.voted_for = None\n" +
                "        self.log = []\n" +
                "        self.state = 'FOLLOWER'\n" +
                "        self.election_timeout = random.uniform(0.15, 0.30)\n\n" +
                "    def run_election(self):\n" +
                "        self.state = 'CANDIDATE'\n" +
                "        self.term += 1\n" +
                "        self.voted_for = self.node_id\n" +
                "        votes = 1\n" +
                "        for peer in self.peers:\n" +
                "            if self.send_vote_request(peer, self.term, self.node_id):\n" +
                "                votes += 1\n" +
                "        if votes > len(self.peers) // 2:\n" +
                "            self.state = 'LEADER'\n";

        Submission sub1 = new Submission(assignment.getId(), "Arjun Patel", "arjun.p@cs.university.edu", "raft_consensus_patel.py", codeArjun);
        sub1.setSimilarityScore(6.2);
        sub1.setFinalMarks(98.0);
        sub1.setStatus("EVALUATED");
        sub1.setPenaltyReason("Clean Pass (Verified Ledger)");
        submissionRepository.save(sub1);
        auditLedgerService.sealSubmission(sub1);
        submissionRepository.save(sub1);

        // Student 2: Rohan Gupta (Collusion with Arjun Patel)
        String codeRohan = "# Raft Consensus Implementation\n" +
                "# Author: Rohan Gupta (rohan.g@cs.university.edu)\n" +
                "import time, random\n\n" +
                "class RaftClusterNode:\n" +
                "    def __init__(self, node_id, peers):\n" +
                "        self.node_id = node_id\n" +
                "        self.peers = peers\n" +
                "        self.term = 0\n" +
                "        self.voted_for = None\n" +
                "        self.log = []\n" +
                "        self.state = 'FOLLOWER'\n" +
                "        self.election_timeout = random.uniform(0.15, 0.30)\n\n" +
                "    def run_election(self):\n" +
                "        self.state = 'CANDIDATE'\n" +
                "        self.term += 1\n" +
                "        self.voted_for = self.node_id\n" +
                "        votes = 1\n" +
                "        for peer in self.peers:\n" +
                "            if self.send_vote_request(peer, self.term, self.node_id):\n" +
                "                votes += 1\n" +
                "        if votes > len(self.peers) // 2:\n" +
                "            self.state = 'LEADER'\n";

        Submission sub2 = new Submission(assignment.getId(), "Rohan Gupta", "rohan.g@cs.university.edu", "raft_submission_gupta.py", codeRohan);
        sub2.setSimilarityScore(84.6);
        sub2.setFinalMarks(45.0);
        sub2.setStatus("FLAGGED_FOR_REVIEW");
        sub2.setPenaltyReason("82% Collusion with Arjun Patel (Section 2)");
        submissionRepository.save(sub2);
        auditLedgerService.sealSubmission(sub2);
        submissionRepository.save(sub2);

        // Student 3: Elena Rostova (Adversarial homoglyphs evasion)
        String codeElena = "# Raft Cluster Invariants\n" +
                "# Author: Elena Rostova (elena.r@cs.university.edu)\n" +
                "# Thіѕ іѕ а dіѕtrіbutеd соnѕеnѕuѕ mесhаnіѕm wіth hоmоglурhѕ\n" +
                "class RaftReplica:\n" +
                "    def __init__(self, replica_id):\n" +
                "        self.replica_id = replica_id\n" +
                "        self.commit_index = 0\n" +
                "        self.log_entries = []\n" +
                "    def sync_log(self, entries):\n" +
                "        self.log_entries.extend(entries)\n";

        Submission sub3 = new Submission(assignment.getId(), "Elena Rostova", "elena.r@cs.university.edu", "raft_elena_final.py", codeElena);
        sub3.setSimilarityScore(12.0);
        sub3.setFinalMarks(72.0);
        sub3.setStatus("FLAGGED_FOR_REVIEW");
        sub3.setPenaltyReason("14 Cyrillic Homoglyphs Neutralized");
        submissionRepository.save(sub3);
        auditLedgerService.sealSubmission(sub3);
        submissionRepository.save(sub3);

        // Student 4: David Chen (Synthetic AI generated text)
        String codeDavid = "# Consensus Mechanism Overview\n" +
                "# Author: David Chen (david.c@cs.university.edu)\n" +
                "# In distributed computing, consensus protocols represent pivotal mechanisms.\n" +
                "# Furthermore, state machine replication guarantees cluster consistency.\n" +
                "# In summary, the Raft consensus protocol delivers robust fault tolerance.\n" +
                "def replicate_consensus_entries(cluster, payload):\n" +
                "    for node in cluster:\n" +
                "        node.append_entries(payload)\n" +
                "    return True\n";

        Submission sub4 = new Submission(assignment.getId(), "David Chen", "david.c@cs.university.edu", "consensus_david.py", codeDavid);
        sub4.setSimilarityScore(78.0);
        sub4.setFinalMarks(30.0);
        sub4.setStatus("FLAGGED_FOR_REVIEW");
        sub4.setPenaltyReason("Synthetic AI Perplexity < 15");
        submissionRepository.save(sub4);
        auditLedgerService.sealSubmission(sub4);
        submissionRepository.save(sub4);

        // Student 5: Sarah Jenkins (Canonical AST / Clean Pass)
        String codeSarah = "# Formal Byzantine Fault Tolerant State Machine\n" +
                "# Author: Sarah Jenkins (sarah.j@cs.university.edu)\n" +
                "class ByzantineStateMachine:\n" +
                "    def __init__(self, quorum_size: int):\n" +
                "        self.quorum_size = quorum_size\n" +
                "        self.view_number = 0\n" +
                "        self.certificates = set()\n\n" +
                "    def verify_quorum(self, proofs):\n" +
                "        valid_count = sum(1 for p in proofs if p.is_valid())\n" +
                "        return valid_count >= 2 * (self.quorum_size // 3) + 1\n";

        Submission sub5 = new Submission(assignment.getId(), "Sarah Jenkins", "sarah.j@cs.university.edu", "jenkins_raft_impl.py", codeSarah);
        sub5.setSimilarityScore(2.1);
        sub5.setFinalMarks(100.0);
        sub5.setStatus("EVALUATED");
        sub5.setPenaltyReason("Clean Pass (Canonical AST)");
        submissionRepository.save(sub5);
        auditLedgerService.sealSubmission(sub5);
        submissionRepository.save(sub5);

        System.out.println(">>> [Veritas] Seeded enterprise classroom CS 401 with 5 student submissions: Arjun Patel, Rohan Gupta, Elena Rostova, David Chen, Sarah Jenkins.");
    }
}
