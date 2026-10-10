# Raft protocol implementation by Rohan Gupta
class ConsensusClusterNode:
    def __init__(self, identifier, cluster_members):
        self.identifier = identifier
        self.cluster_members = cluster_members
        self.role = 'FOLLOWER'
        self.term_epoch = 0
        self.candidate_vote = None
        self.operation_log = []

    def initiate_leader_ballot(self):
        self.role = 'CANDIDATE'
        self.term_epoch += 1
        self.candidate_vote = self.identifier
        ballot_count = 1
        for member in self.cluster_members:
            if self.request_vote(member, self.term_epoch, self.identifier):
                ballot_count += 1
        if ballot_count > len(self.cluster_members) // 2:
            self.role = 'LEADER'
            return True
        return False
