package com.veritas.backend.service;

import com.veritas.backend.model.Submission;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

public class AuditLedgerServiceTest {

    private final AuditLedgerService ledgerService = new AuditLedgerService();

    @Test
    public void testCalculateSha256ProducesAccurateDigest() {
        String input = "Distributed consensus algorithms ensure node clusters reach agreement.";
        String hash1 = ledgerService.calculateSha256(input);
        String hash2 = ledgerService.calculateSha256(input);

        assertNotNull(hash1);
        assertEquals(64, hash1.length());
        assertEquals(hash1, hash2, "SHA-256 must be deterministic");
    }

    @Test
    public void testSealSubmissionGeneratesValidLedgerRecord() {
        Submission sub = new Submission(1L, "Arjun Patel", "arjun.p@cs.university.edu", "raft_impl.py", "def election(): pass");
        sub.setId(101L);

        String ledgerHash = ledgerService.sealSubmission(sub);

        assertNotNull(ledgerHash);
        assertTrue(ledgerHash.startsWith("0x"));
        assertEquals(sub.getLedgerHash(), ledgerHash);
        assertNotNull(sub.getAuditReportJson());
        assertTrue(sub.getAuditReportJson().contains("SEALED_ON_LEDGER"));
        assertTrue(sub.getAuditReportJson().contains("Arjun Patel"));
    }

    @Test
    public void testVerifyIntegrityConfirmsUntamperedSubmission() {
        Submission sub = new Submission(1L, "Sarah Jenkins", "sarah.j@cs.university.edu", "byzantine.py", "class StateMachine: pass");
        sub.setId(105L);

        ledgerService.sealSubmission(sub);
        Map<String, Object> integrity = ledgerService.verifyIntegrity(sub);

        assertTrue((Boolean) integrity.get("isCryptographicallyValid"));
        assertFalse((Boolean) integrity.get("tamperDetected"));
        assertEquals(105L, integrity.get("submissionId"));
    }

    @Test
    public void testGetRecentLedgerBlocksReturnsBlockChain() {
        List<Map<String, Object>> blocks = ledgerService.getRecentLedgerBlocks();

        assertNotNull(blocks);
        assertEquals(4, blocks.size());
        assertEquals(3142, blocks.get(0).get("height"));
    }

    @Test
    public void testGenerateSubmissionMerkleTreeProducesHierarchicalTopology() {
        Submission sub = new Submission(1L, "David Chen", "david.c@cs.university.edu", "consensus.py", "def paxos(): return True");
        sub.setId(103L);

        Map<String, Object> tree = ledgerService.generateSubmissionMerkleTree(sub);

        assertNotNull(tree);
        assertNotNull(tree.get("merkleRoot"));
        assertTrue(((String) tree.get("merkleRoot")).startsWith("0x"));

        List<String> leaves = (List<String>) tree.get("leaves");
        assertEquals(4, leaves.size());

        List<String> intermediates = (List<String>) tree.get("intermediates");
        assertEquals(2, intermediates.size());

        // Verify intermediate 0 is SHA-256(leaf 0 + leaf 1)
        String expectedH01 = ledgerService.calculateSha256(leaves.get(0) + leaves.get(1));
        assertEquals(expectedH01, intermediates.get(0));

        // Verify intermediate 1 is SHA-256(leaf 2 + leaf 3)
        String expectedH23 = ledgerService.calculateSha256(leaves.get(2) + leaves.get(3));
        assertEquals(expectedH23, intermediates.get(1));

        // Verify root is SHA-256(H01 + H23)
        String expectedRoot = ledgerService.calculateSha256(expectedH01 + expectedH23);
        assertEquals(expectedRoot, tree.get("rawMerkleRoot"));
    }

    @Test
    public void testVerifyMerkleProofValidatesPristineAndRejectsTamperedLeaves() {
        Submission sub = new Submission(1L, "Elena Rostova", "elena.r@cs.university.edu", "vector_clock.py", "class LamportClock: pass");
        sub.setId(102L);

        Map<String, Object> tree = ledgerService.generateSubmissionMerkleTree(sub);
        String merkleRoot = (String) tree.get("merkleRoot");
        List<String> leaves = (List<String>) tree.get("leaves");
        Map<String, List<Map<String, Object>>> proofs = (Map<String, List<Map<String, Object>>>) tree.get("proofs");

        // Verify Leaf 0 (Raw Text) proof path
        List<Map<String, Object>> leaf0Proof = proofs.get("0");
        boolean isProofValid = ledgerService.verifyMerkleProof(leaves.get(0), leaf0Proof, merkleRoot);
        assertTrue(isProofValid, "Merkle Proof for pristine Leaf 0 must evaluate to true");

        // Verify Leaf 2 (Stylometry) proof path
        List<Map<String, Object>> leaf2Proof = proofs.get("2");
        boolean isLeaf2Valid = ledgerService.verifyMerkleProof(leaves.get(2), leaf2Proof, merkleRoot);
        assertTrue(isLeaf2Valid, "Merkle Proof for pristine Leaf 2 must evaluate to true");

        // Test Tampered Leaf Hash (Adversarial mutation)
        String tamperedLeafHash = ledgerService.calculateSha256("MALICIOUS_SUBMISSION_TAMPERED_BY_ATTACKER");
        boolean isTamperAccepted = ledgerService.verifyMerkleProof(tamperedLeafHash, leaf0Proof, merkleRoot);
        assertFalse(isTamperAccepted, "Merkle Proof must mathematically reject tampered leaf hash");
    }
}
