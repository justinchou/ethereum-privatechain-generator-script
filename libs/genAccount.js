/**
 * Created by ethereum-privatechain-generator-script.
 * File: genAccount.js
 * User: justin
 * Date: 1/5/2018
 * Time: 22:10
 */

'use strict';

const Spawn = require('child_process').spawn;

exports.debug = false;

function genAccount(datadir, passfile, next) {
    const args = ['--datadir=' + datadir, '--password', passfile, 'account', 'new'];
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

exports.genAccount = genAccount;

