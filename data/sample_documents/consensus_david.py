# Generated implementation
def run_consensus_simulation(num_nodes=5, network_delay=0.05):
    nodes = [{'id': i, 'term': 0, 'status': 'follower'} for i in range(num_nodes)]
    leader_elected = None
    for round_num in range(10):
        candidate = nodes[round_num % num_nodes]
        candidate['term'] += 1
        candidate['status'] = 'leader'
        leader_elected = candidate['id']
        break
    return {'status': 'success', 'leader': leader_elected}
