const PubNub = require('pubnub');

const credentials = {
  publishKey: 'pub-c-89122e18-fa7f-4d46-b6c7-bdc9b8796cbe',
  subscribeKey: 'sub-c-8d8b65f6-8142-45ac-91b1-d7c778833add',
  secretKey: 'sec-c-OTEwNTk2ZDItODFhMC00M2JkLWEyMjEtZDE1ODM5NDA4OWM3'
};

//these are the channels in pub/sub 
const CHANNELS = {
  TEST: 'TEST',
  BLOCKCHAIN: 'BLOCKCHAIN',
  TRANSACTION: 'TRANSACTION'
};

class PubSub {
  constructor({ blockchain, transactionPool, wallet }) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.wallet = wallet;

    this.pubnub = new PubNub(credentials);

    //pub/sub instance that acts as an subscriber
    this.pubnub.subscribe({ channels: Object.values(CHANNELS) });

    //make subscriber listens to channels
    this.pubnub.addListener(this.listener());
  }

  broadcastChain() {
    this.publish({
      channel: CHANNELS.BLOCKCHAIN,
      message: JSON.stringify(this.blockchain.chain)
    });
  }

  broadcastTransaction(transaction) {
    this.publish({
      channel: CHANNELS.TRANSACTION,
      message: JSON.stringify(transaction)
    });
  }

  subscribeToChannels() {
    this.pubnub.subscribe({
      channels: [Object.values(CHANNELS)]
    });
  }

  listener() {
    return {
      message: messageObject => {
        const { channel, message } = messageObject;

        console.log(`Message received. Channel: ${channel}. Message: ${message}`);
        const parsedMessage = JSON.parse(message);

        switch(channel) {
          case CHANNELS.BLOCKCHAIN:
            this.blockchain.replaceChain(parsedMessage, true, () => {
              this.transactionPool.clearBlockchainTransactions(
                { chain: parsedMessage.chain }
              );
            });
            break;
          case CHANNELS.TRANSACTION:
            if (!this.transactionPool.existingTransaction({
              inputAddress: this.wallet.publicKey
            })) {
              this.transactionPool.setTransaction(parsedMessage);
            }
            break;
          default:
            return;
        }
      }
    }
  }

  publish({ channel, message }) {
    // there is an unsubscribe function in pubnub
    // but it doesn't have a callback that fires after success
    // therefore, redundant publishes to the same local subscriber will be accepted as noisy no-ops
    this.pubnub.publish({ message, channel });
  }

  broadcastChain() {
    this.publish({
      channel: CHANNELS.BLOCKCHAIN,
      message: JSON.stringify(this.blockchain.chain)
    });
  }

  broadcastTransaction(transaction) {
    this.publish({
      channel: CHANNELS.TRANSACTION,
      message: JSON.stringify(transaction)
    });
  }
}

module.exports = PubSub;
