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
}
