class Tictactoe(object):
    
    def __init__(self):
        self.EMPTY = '_'
        self.X = 'X'
        self.O = 'O'

        self.XValue = -1
        self.OValue = 1
        self.EValue = 0

        self.winner = self.EMPTY

        self.SIZE = 3

        self.history = { self.X: [], self.O: [] }

        self.reset()
        

    def make_move(self, pos):
        if (pos < self.SIZE**2 and self.board[pos] == self.EMPTY):
            self.save_move(pos)

            self.board[pos] = self.turn

            if self.is_gameover():
                self.winner = self.turn
            else:
                self.turn = self.next_turn()
        else:
            print("Invalid move")

    def save_move(self, pos):
        move = { "board": self.export_board(), "move": pos }
        self.history[self.turn].append(move)

    def next_turn(self):
       return (self.O if self.turn == self.X else self.X)

    def is_gameover(self):
        return self.is_row_over() or self.is_col_over() or self.is_diag_over()

    def is_board_full(self):
        non_empty = [not self.board[i] == self.EMPTY for i in range(self.SIZE**2)]

        if all(non_empty):
            return True
        return False

    def is_valid_move(self, move):
        return self.board[move] == self.EMPTY
    
    def reset(self): 
        self.turn = self.X
        self.board = [self.EMPTY for i in range(self.SIZE**2)]
        self.winner = self.EMPTY
        self.history = { self.X: [], self.O: [] }

    def is_row_over(self):
        for i in range(0, (self.SIZE**2), self.SIZE):
            same = [self.board[j] == self.board[j+1] for j in range(i, (i + self.SIZE -1))]
            
            if all(same) and not self.board[i] == self.EMPTY:
                return True
        return False

    def is_col_over(self):
        for i in range(self.SIZE):
            same = [self.board[j] == self.board[j+self.SIZE] for j in range(i, (self.SIZE**2 - self.SIZE), self.SIZE)]

            if all(same) and not self.board[i] == self.EMPTY:
                return True

        return False

    def is_diag_over(self):
        increment = self.SIZE - 1
        same = [self.board[i] == self.board[i+increment] for i in range(increment, (self.SIZE**2 - 2*increment), increment)]

        if all(same) and not self.board[increment] == self.EMPTY:
            return True

        increment = self.SIZE + 1
        same = [self.board[i] == self.board[i+increment] for i in range(0, (self.SIZE**2 - increment), increment)]

        if all(same) and not self.board[increment] == self.EMPTY:
            return True

        return False

    def print_board(self):
        for i in range(self.SIZE**2):
            if i % self.SIZE == 0 and not i == 0:
                print()
            if not i % self.SIZE == 0:
                print('|', end='')
            print(self.board[i], end='')
        print()

    def export_board(self):
        export = []
        for pos in self.board:
            if pos == self.X:
                export.append(self.XValue)
            elif pos == self.O:
                export.append(self.OValue)
            else:
                export.append(self.EValue)

        return export

    def export_player_moves(self, player):
        winning_moves = self.history[player]

        export = []

        for move_made in winning_moves:
            input = move_made["board"]
            output = [0 for i in range(self.SIZE**2)]
            output[move_made["move"]] = 1

            data = { "input": input, "output": output }

            export.append(data)

        return export

    def export_losing_moves(self, player):
        losing_moves = self.history[player]

        export = []

        for move_made in losing_moves:
            input = move_made["board"]
            output = [0.75 for i in range(self.SIZE**2)]
            output[move_made["move"]] = 0

            data = { "input": input, "output": output }

            export.append(data)

        return export

        

