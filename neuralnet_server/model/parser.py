import json
import ast
import numpy as np
from .neuralnet import *


def import_training_data_json(json_data):
    training_data = []

    datas = json.loads(json_data)
    for data in datas:
        x = data["input"]
        y = data["output"]

        training_data.append((x, y))

    return training_data


def import_training_data_csv(csv_file):
    training_data = []

    with open(csv_file, "r") as csv:
        for line in csv:
            line = line.strip()
            if not line == "":
                io = ast.literal_eval((line))
                training_data.append(io)

    return training_data


def import_network(json_network):
    network_data = json.loads(json_network)

    layers = [layer["nr_nodes"] for layer in network_data["layers"]]
    layers = [network_data["nr_inputs"]] + layers

    nn = Neural_Net(layers)

    weights = [np.array(layer["input_weights"]) for layer in network_data["layers"]]
    nn.weights = weights

    biases = [np.array(layer["input_biases"]) for layer in network_data["layers"]]
    nn.biases = biases

    return nn


def to_training_data(game_history):
    training_data = []

    for move in game_history:
        input = move["input"]
        output = move["output"]

        training_data.append((input, output))

    return training_data
