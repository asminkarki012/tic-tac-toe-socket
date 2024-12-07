# Neural Net for learning Tic Tac Toe
This is an  implementation of a multi layer feed forward neural networks. As I have focused on making my network learn via playing games against another AI and not by using a large dataset, the dataset provided in "training_data.csv" will not provide a competitive Noughts and Crosses AI.

## Testing the network
To test the implementation of the neural net works. Run `python3 test.py`. Details in the testing section of the report.

## Training the network on the dataset
To train the network on the dataset, run `python3 train.py`. The script takes two options to specify the training file and output file:
- `-i [training_file]`
- `-o [network_file]`  
If these flags are not specified, then the defaults are `training_data.csv` and `net.json`.

## Playing against the network 
To play against the network, run `python3 play.py`. The script takes one option:
- `-i [network_file]` to specify the network file as input. Default is `pretrained_net.json`

The inputs to place moves on the board are as follows:

| 0 | 1 | 2 |

| 3 | 4 | 5 |

| 6 | 7 | 8 |

## Reproducing a network
To reproduce the network by training it against the pseudo random AI, run `python3 play_train.py`. It will output the trained network to `trained_net.json`. It can also output the set of moves to `training_data.csv` but I have commented this out for the submission. This scripts takes many different options:
- `-t [int]` to specify the number of games to train. Default value is 20000
- `-i [file]` to specify to import a trained network instead of making one from scratch.
- `-l [float]` to specify the learning rate. Default value is 0.2
- `-e [int]` to specify the number of epochs to train per game. Default value is 4
- `-s` to specify not to save the moves and network after training.
- `-o [output file]` to specify the output filename of the neural network description. Default value is "trained_net.json"

## To play the trained network against the random AI
Run `python3 play_train.py -l 0.0 -s -i "pretrained_net.json"`

## Files in submission
- `neuralnet.py` The implementation of the feed forward neural net with back-propagation
- `parameters.py` The script used to test and experiment with different parameters. This script was modified for all the different tests, but the main loop was not changed
- `parser.py` Parses input files to Python data structures
- `play.py` To play against the neural net as a player
- `play_train.py` Plays the neural net against random AIs to train it. This was how my neural network was primarily trained
- `pretrained_net.json` The pretrained network that gave good win rates, though it does not execte the optimal strategy
- `test.py` Tests the implementation of the neural network is working
- `tictactoe.py` Implementation of the Noughts and Crosses game
- `train.py` Train the neural network on `training_data.csv`
