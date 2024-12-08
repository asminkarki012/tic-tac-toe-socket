# tic-tac-toe
App I made for [The Odin Project](https://www.theodinproject.com/lessons/node-path-javascript-tic-tac-toe).

## Things I learned 
- Basic of html,css and javascript
- basic working of websocket
- implementing neuralnet from scratch
- gradient descent algorithm for neuralnet
- sigmoid function
- forward and backward propagation of neuralnet


## Remaining Work
- Add Regularization for neuralnet for better performance(prevent overfitting)
- Improve the training data and optimized the neuralnet for better performance (tuning hyperparamters)

## Features:
- Websocket implemented more than two players can play tic tac toe over the network.
- Neuralnet is integrated with websocket on python
- User can play with neuralnet and they can also optimize its performance by fine tuning the hyperparameter

## Running multiplayer websocket server
```
npm i 
```
```
npm run dev 
```  
## Running neuralnet websocket server
```
cd neuralnet_server
```
```
pip install -r requirements.txt
```
```
python3 neuralnet_server/server.py
```
## Training of neuralnet
Took the code reference for neuralnet from [here](https://github.com/12yuens2/neural-net-tic-tac-toe)

To train the neuralnet
```
python3 -m neuralnet_server.model.train.py
```

To pretrain the neuralnet and generate training dataset(need to uncomment few things you can check on [code](https://github.com/12yuens2/neural-net-tic-tac-toe))
```
python3 -m neuranet_server.model.play_train.py
```
