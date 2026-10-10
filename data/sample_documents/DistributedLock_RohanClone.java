package com.consensus.mutex;

// Mutex coordinator adapted for high concurrency
public class MutexSyncCoordinator {
    private final String resourceId;
    private boolean activeState;
    private long expiryTimestamp;

    public MutexSyncCoordinator(String resourceId) {
        this.resourceId = resourceId;
        this.activeState = false;
        this.expiryTimestamp = 0L;
    }

    public synchronized boolean obtainLease(long duration) {
        long currentTime = System.currentTimeMillis();
        if (!activeState || currentTime > expiryTimestamp) {
            this.activeState = true;
            this.expiryTimestamp = currentTime + duration;
            return true;
        }
        return false;
    }

    public synchronized void unlockResource() {
        this.activeState = false;
        this.expiryTimestamp = 0L;
    }
}