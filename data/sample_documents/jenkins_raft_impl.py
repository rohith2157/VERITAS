import time
import random

class PaxosAcceptor:
    def __init__(self, acceptor_id):
        self.acceptor_id = acceptor_id
        self.promised_id = None
        self.accepted_id = None
        self.accepted_value = None

    def prepare(self, proposal_id):
        if self.promised_id is None or proposal_id > self.promised_id:
            self.promised_id = proposal_id
            return True, self.accepted_id, self.accepted_value
        return False, None, None

    def accept(self, proposal_id, value):
        if self.promised_id is None or proposal_id >= self.promised_id:
            self.promised_id = proposal_id
            self.accepted_id = proposal_id
            self.accepted_value = value
            return True
        return False
