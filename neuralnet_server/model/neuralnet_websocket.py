import os
from . import parser, play


def get_ai_move(board_state):
    current_dir = os.path.dirname(os.path.abspath(__file__))
    trained_network_file_path = os.path.join(current_dir, "net.json")
    reinforcement_network_file_path = os.path.join(current_dir, "trained_net.json")

    network_file = open(reinforcement_network_file_path, "r")
    neuralnet = parser.import_network(network_file.read())
    net_output = neuralnet.feed_forward(board_state)

    movelist = play.get_movelist(net_output)

    for move in movelist:
        if board_state[move] == 0:
            return move

    return None
