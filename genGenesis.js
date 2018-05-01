/**
 * Created by ethereum-privatechain-generator-script.
 * File: init.js
 * User: justin
 * Date: 1/5/2018
 * Time: 21:30
 */

'use strict';

exports.debug = false;

const genesis = {
    "config": {
        "chainId": 1224,
        "homesteadBlock": 0,
        "eip155Block": 0,
        "eip158Block": 0
    },
    "alloc": {},
    "coinbase": "0x0000000000000000000000000000000000000000",
    "difficulty": "0x0400",
    "extraData": "",
    "gasLimit": "0x2fefd8",
    "nonce": "0x0000000000000042",
    "mixhash": "0x0000000000000000000000000000000000000000000000000000000000000000",
    "parentHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
    "timestamp": "0x00"
};

const Fs = require('fs');
const Path = require('path');
const is = require('is');

const PREFIX = '0x';
const EXAMPLE = '0cd59780cc3da5f1d6866ede6dcc6dafbc24e3a2';
const HEX_REGEX = /^0x[1-9a-f][0-9a-f]*$/;
const GENESIS_FILE = Path.join(__dirname, 'genesis.json');

const GETH_COIN = "0x821ab0d4414980000";

/**
 * generate genesis block via account list
 *
 * @param {Array|Object} accounts
 * accounts.${key} key is 40 length public account
 * accounts.${value} value is geth coin init value, if 0 passed then use default value
 */
function genGenesis(accounts) {
    let genAccounts;

    if (is.array(accounts)) {
        genAccounts = {};
        accounts.forEach(account => {
            genAccounts[account] = 0;
        });
    } else if (is.object(accounts)) {
        genAccounts = accounts;
    } else {
        throw new Error('invalid param type of genGenesis');
    }

    const accountList = Object.keys(genAccounts);

    accountList.forEach((account) => {
        if (account.length !== EXAMPLE.length) {
            if (exports.debug) console.error('invalid account');
            process.exit()
        }

        let coin = GETH_COIN;
        if (typeof genAccounts[account] === 'string' &&
            genAccounts[account].indexOf(PREFIX) === 0 &&
            HEX_REGEX.test(genAccounts[account]
            )) {
            coin = genAccounts[account]
        } else if (typeof genAccounts[account] === 'number' &&
            genAccounts[account] > 0
        ) {
            coin = PREFIX + genAccounts[account].toString(16)
        }

        if (exports.debug) console.log('gen account %s with %s', account, coin);

        genesis.alloc[PREFIX + account] = {"balance": coin}
    });

    const genesisBlock = JSON.stringify(genesis, null, 2);
    Fs.writeFileSync(GENESIS_FILE, genesisBlock);
}

exports.genGenesis = genGenesis;
