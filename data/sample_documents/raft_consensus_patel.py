class RaftNode:
    def __init__(self, node_id, peers):
        self.node_id = node_id
        self.peers = peers
        self.state = 'FOLLOWER'
        self.current_term = 0
        self.voted_for = None
        self.log = []

    def start_election(self):
        self.state = 'CANDIDATE'
        self.current_term += 1
        self.voted_for = self.node_id
        votes = 1
        for peer in self.peers:
            if self.request_vote(peer, self.current_term, self.node_id):
                votes += 1
        if votes > len(self.peers) // 2:
            self.state = 'LEADER'
            return True
        return False
