const Transaction = require('../wallet/transaction');

class TransactionMiner {
  constructor({ blockchain, transactionPool, wallet, pubsub }) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.wallet = wallet;
    this.pubsub = pubsub;
  }

  mineTransactions() {
    //1) get valid transactions from transaction pool
    const validTransactions = this.transactionPool.validTransactions();

    //2) generate miner's reward
    validTransactions.push(
      Transaction.rewardTransaction({ minerWallet: this.wallet })
    );

    //3) add this block to blockchain...this block contains transactions as data
    this.blockchain.addBlock({ data: validTransactions });

    //4) Broadcast updated blockchain
    this.pubsub.broadcastChain();

    //5) clear the transaction pool
    this.transactionPool.clear();
  }
}

module.exports = TransactionMiner;
