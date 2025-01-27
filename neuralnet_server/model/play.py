import random
import sys
import getopt
import os

from .tictactoe import *
from . import parser


def get_movelist(list):
    list = list[0].tolist()
    return [
        ordered[0]
        for ordered in sorted(enumerate(list), key=lambda i: i[1], reverse=True)
    ]


def get_move(game, ordered_moves):
    for move in ordered_moves:
        if game.is_valid_move(move):
            return move


def get_random_move():
    return random.randint(0, 8)


def main(argv):

    play_ai = False

    try:
        opts, args = getopt.getopt(argv, "i:ao:", [])
    except getopt.GetoptError:
        print("Wrong usage, please check README.md")
        sys.exit(2)

    for opt, arg in opts:
        if opt == "-i":
            inputfile = arg
        elif opt == "-o":
            outputfile = arg
        elif opt == "-a":
            play_ai = True

    current_dir = os.path.dirname(os.path.abspath(__file__))
    network_file_path = os.path.join(current_dir, "net.json")
    network_file = open(network_file_path, "r")
    neuralnet = parser.import_network(network_file.read())

    game = Tictactoe()

    player = random.randint(0, 1)

    if player == 0:
        player = game.X
        ai = game.O
    else:
        player = game.O
        ai = game.X

    while not (game.is_gameover() or game.is_board_full()):
        game.print_board()

        if game.turn == player:

            # Player turn
            if play_ai:
                move = get_random_move()
                while not game.is_valid_move(move):
                    move = get_random_move()

            else:
                move = int(input())
                while not game.is_valid_move(move):
                    print("Invalid input")
                    move = int(input())

            game.make_move(move)

        else:
            # AI turn
            # feed all the board status to NN
            net_output = neuralnet.feed_forward(game.export_board())

            movelist = get_movelist(net_output)
            ai_move = get_move(game, movelist)

            game.make_move(ai_move)

    game.print_board()

    if game.is_gameover():
        print(str(game.winner) + " won!")
    else:
        print("Draw!")


if __name__ == "__main__":
    main(sys.argv[1:])
