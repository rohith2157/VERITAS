package com.distributed.lock;

public class DistributedLockManager {
    private final String lockKey;
    private boolean isHeld;
    private long leaseExpiration;

    public DistributedLockManager(String lockKey) {
        this.lockKey = lockKey;
        this.isHeld = false;
        this.leaseExpiration = 0L;
    }

    public synchronized boolean acquireLock(long ttlMillis) {
        long now = System.currentTimeMillis();
        if (!isHeld || now > leaseExpiration) {
            this.isHeld = true;
            this.leaseExpiration = now + ttlMillis;
            return true;
        }
        return false;
    }

    public synchronized void releaseLock() {
        this.isHeld = false;
        this.leaseExpiration = 0L;
    }
}