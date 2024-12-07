from . import parser
import random
import sys
import getopt
import os
from .tictactoe import *
from .neuralnet import *

current_dir = os.path.dirname(os.path.abspath(__file__))
moveset_file = os.path.join(current_dir, "training_data.csv")
network_file = os.path.join(current_dir, "trained_net.json")


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


def get_random_move(game):
    # Heuristic to try and win if possible
    for i in range(9):
        if game.board[i] == game.EMPTY:
            game.board[i] = game.turn
            if game.is_gameover():
                game.board[i] = game.EMPTY
                return i
            else:
                game.board[i] = game.EMPTY

    return random.randint(0, 8)


def train_ai(neuralnet, winning_moves, training_rate, epochs, save):
    training_data = parser.to_training_data(winning_moves)

    # if save:
    #     f = open(moveset_file, "a")
    #     for i, o in training_data:
    #         f.write(str(i) + "," + str(o) + "\n")
    #     f.close()

    neuralnet.train(training_data, training_rate, epochs)


def write_net(net, save):
    if save:
        trained_net = net.export()
        f = open(network_file, "w")
        f.write(trained_net)
        f.close()


def main(argv):
    neuralnet = Neural_Net([9, 27, 27, 9])

    game = Tictactoe()
    ai_wins = 0
    player_wins = 0
    draws = 0
    games = 0
    learning_rate = 0.2
    epochs = 10
    training = 50000
    save = True

    try:
        opts, args = getopt.getopt(argv, "t:i:l:e:so:", [])
    except getopt.GetoptError:
        print("Wrong usage, please check README.md")
        sys.exit(2)

    for opt, arg in opts:
        if opt == "-t":
            training = int(arg)
        elif opt == "-i":
            f = open(str(arg), "r")
            neuralnet = parser.import_network(f.read())
        elif opt == "-l":
            learning_rate = float(arg)
        elif opt == "-e":
            epochs = int(arg)
        elif opt == "-s":
            save == False
        elif opt == "-o":
            global network_file
            network_file = str(arg)

    while games < training:
        try:
            game.reset()
            player = random.randint(0, 1)

            if player == 0:
                player = game.X
                ai = game.O
            else:
                player = game.O
                ai = game.X

            while not (game.is_gameover() or game.is_board_full()):

                if game.turn == player:

                    # Player turn
                    move = get_random_move(game)
                    while not game.is_valid_move(move):
                        move = get_random_move(game)

                    game.make_move(move)

                else:
                    # AI turn
                    net_output = neuralnet.feed_forward(game.export_board())

                    movelist = get_movelist(net_output)
                    ai_move = get_move(game, movelist)

                    game.make_move(ai_move)

            games += 1

            if game.winner == player:
                player_wins += 1

                # Train on losing move
                losing_moves = game.export_losing_moves(ai)
                train_ai(neuralnet, [losing_moves[-1]], learning_rate, epochs, save)

                # Train on winning moves
                winning_moves = game.export_player_moves(player)
                train_ai(neuralnet, winning_moves, learning_rate, epochs, save)

            elif game.winner == ai:
                ai_wins += 1

                # Train on winning moves
                train_ai(
                    neuralnet, game.export_player_moves(ai), learning_rate, epochs, save
                )
            else:
                draws += 1

                # Train on drawing moves
                train_ai(
                    neuralnet, game.export_player_moves(ai), learning_rate, epochs, save
                )

            ai_winrate = (ai_wins + draws) / games
            print(
                "Player wins: %d, AI wins: %d, Draws: %d - AI win rate: %lf"
                % (player_wins, ai_wins, draws, ai_winrate),
                end="\r",
            )

        except KeyboardInterrupt:
            write_net(neuralnet, save)
            raise

    write_net(neuralnet, save)
    print("\nDone")


if __name__ == "__main__":
    main(sys.argv[1:])
