/**
 * Created by ethereum-privatechain-generator-script.
 * File: genWallet.js
 * User: justin
 * Date: 2/5/2018
 * Time: 00:36
 */

'use strict';

const Spawn = require('child_process').spawn;
const Path = require('path');

const GENESIS_FILE = Path.join(__dirname, '..', 'genesis.json');

exports.debug = false;

function genWallet(datadir, next) {
    const args = ['init', GENESIS_FILE, '--datadir', datadir];
    const genGethAccount = Spawn('geth', args);

    const stdout = [];
    const stderr = [];

    genGethAccount.stdout.on('data', function (data) {
        if (exports.debug) console.log('standard output:\n' + data);
        stdout.push(data);
    });

    genGethAccount.stderr.on('data', function (data) {
        if (exports.debug) console.log('standard error output:\n' + data);
        stderr.push(data)
    });

    genGethAccount.on('exit', function (code, signal) {
        if (exports.debug) console.log('child process eixt, exit: ' + code);

        if (code !== 0) {
            next(new Error(stderr.join('\n')));
        } else {
            next(null, stdout.join('\n'));
        }
    });
}

exports.genWallet = genWallet;
