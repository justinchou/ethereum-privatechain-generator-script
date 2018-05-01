const genesis = {
  "config": {
    "chainId": 1224,
    "homesteadBlock": 0,
    "eip155Block": 0,
    "eip158Block": 0
  },
  "alloc" : {
  },
  "coinbase" : "0x0000000000000000000000000000000000000000",
  "difficulty" : "0x0400",
  "extraData" : "",
  "gasLimit" : "0x2fefd8",
  "nonce" : "0x0000000000000042",
  "mixhash" : "0x0000000000000000000000000000000000000000000000000000000000000000",
  "parentHash" : "0x0000000000000000000000000000000000000000000000000000000000000000",
  "timestamp" : "0x00"
};

const cash = {"balance": "0x821ab0d4414980000"};
const prefix = '0x';

const args = process.argv.length;
if (args <= 2) process.exit();

const example = '0cd59780cc3da5f1d6866ede6dcc6dafbc24e3a2';
const accounts = process.argv.splice(2, args);

accounts.forEach((account) => {
  if (account.length !== example.length) {
    console.log('invalid account');
    process.exit()
  }
});

//console.log(accounts)
accounts.forEach((account) => {
  genesis.alloc[prefix + account] = cash
});

const genesisBlock = JSON.stringify(genesis, null, 2);
require('fs').writeFileSync('./genesis.json', genesisBlock);
