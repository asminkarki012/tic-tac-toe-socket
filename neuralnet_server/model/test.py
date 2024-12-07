from neuralnet import *

def test_input(training_data):
    for i, o in training_data:
        a = net.feed_forward(i)
        print("expected: " + str(o))
        print("actual:   " + str(a))

net = Neural_Net([9, 3, 9]) 

#Random inputs
input1 = [0,0,0,0,0,0,0,0,0]
input2 = [1,1,1,1,1,1,1,1,1]

#Expected outputs
output1 = [1,1,1,1,1,1,1,1,1]
output2 = [0,0,0,0,0,0,0,0,0]

training_data = [(input1, output1), (input2, output2)]

print("Before training: ")
test_input(training_data)

# Training the network
learning_rate = 0.2
epochs = 1000
net.train(training_data, learning_rate, epochs, True)

print("After training: ")
test_input(training_data)

