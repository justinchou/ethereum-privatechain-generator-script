/**
 * Created by ethereum-privatechain-generator-script.
 * File: init.js
 * User: justin
 * Date: 1/5/2018
 * Time: 21:30
 */

'use strict';

// *************************** CONST ***************************** //

const DATADIR = 'datastore';
const ACCOUNTDIR = 'account';
const PASSFILE = 'account.password';

const GEN_ACCOUNT_RET_REGEX = /Address: {(.*?)}/;
const UTC_REGEX = /^UTC--\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}.\d{9}Z--([0-9a-f]{40})$/;


// ************************** REQUIRES **************************** //

const Path = require('path');
const Fs = require('fs');
const Fse = require('fs-extra');
const Mkdirp = require('mkdirp');
const Async = require('async');
const Is = require('is');
const PkUtils = require('ethereum-mnemonic-privatekey-utils');

const genGenesis = require('./libs/genGenesis').genGenesis;
const genAccount = require('./libs/genAccount').genAccount;
const genWallet = require('./libs/genWallet').genWallet;


// ************* Load Config From Interactive Shell *************** //

const program = require('commander');

program
    .version('0.0.1')
    .option('-d, --datadir [data directory]', 'data dir relative to current directory, default to ' + DATADIR)
    .option('-a, --accountdir [account directory]', 'account dir relative to current directory, default to ' + ACCOUNTDIR)
    .option('-p, --passfile [password file]', 'password file relative to current directory, default to ' + PASSFILE)
    .option('-n, --amount [account amount]', 'account amount to generate, default to 0, only regenerate the data store')
    .parse(process.argv);

const accountdir = Path.join(__dirname, program.accountdir || ACCOUNTDIR);
Mkdirp(Path.join(accountdir, 'public'));
Mkdirp(Path.join(accountdir, 'private'));
Mkdirp(Path.join(accountdir, 'keystore'));

const datadir = Path.join(__dirname, program.datadir || DATADIR);
Mkdirp(Path.join(datadir, 'logs'));

const passfile = Path.join(__dirname, program.passfile || PASSFILE);
if (!Fs.existsSync(passfile)) {
    console.error('invalid password file');
    process.exit(1)
}
const passwords = Fs.readFileSync(passfile, {encoding: 'utf8'}).split(/[\r\n]/g);
if (passwords.length <= 0 || !passwords[0]) {
    console.error('invalid password file contents');
    process.exit()
}
const password = passwords[0];
if (password.indexOf('\n') !== -1) {
    console.error('password file includes invalid format, only support 1 line password!');
}

const amount = program.amount || 0;


// ********************* Static Functions  *********************** //

/**
 * get filename from a absolute path
 * @param {String} src
 * @returns {String} filename
 */
const getFilename = (src) => {
    const paths = src.split(/\//g);

    return paths[paths.length - 1];
};

/**
 * read json content from a file that match the name
 * @param {String} filepath
 * @param {String} nameRegex
 * @returns {Object|null}
 */
const getJsonFromfile = (filepath, nameRegex) => {
    const utcFiles = Fs.readdirSync(filepath);
    let json;

    for (let fileIdx = 0; fileIdx < utcFiles.length; fileIdx++) {
        if (utcFiles[fileIdx].indexOf(nameRegex) !== -1) {
            let str = Fs.readFileSync(Path.join(filepath, utcFiles[fileIdx]), {encoding: 'utf8'});

            try {
                json = JSON.parse(str)
            } catch (errParseJson) {
                console.error('parse json failed with %s', str);
                return null;
            }

            return json;
        }
    }

    return null;
};

/**
 * find utc file in account & geth keystore folder which matches provided account, and load the json content
 *
 * @param {String} account
 * @returns {Object} utc content
 */
const getUtcContent = (account) => {
    let filepath;
    let json;

    filepath = Path.join(datadir, 'keystore');
    json = getJsonFromfile(filepath, account);
    if (typeof json === 'object' && json !== null) return json;

    filepath = Path.join(accountdir, 'keystore');
    json = getJsonFromfile(filepath, account);
    if (typeof json === 'object' && json !== null) return json;

    console.error('file %s should exist!', account);
    throw new Error('file should exist');
};

/**
 * copy utc file between account & geth keystore folders
 * @param {String} srcdir
 * @param {String} destdir
 * @param {String} file
 * @param {Array=} accounts
 */
const copyUtcFile = (srcdir, destdir, file, accounts) => {
    Fse.copySync(
        Path.join(srcdir, 'keystore', file),
        Path.join(destdir, 'keystore', file),
        {
            filter: (src, dest) => {
                const filename = getFilename(src);

                if (!UTC_REGEX.test(filename)) return false;

                if (Is.array(accounts)) {
                    const [, account] = filename.match(UTC_REGEX);
                    accounts.push(account);
                }

                return true;
            },
            overwrite: false
        }
    );
};


// *** Real Logic To Generate Account And The Geth Data Folder *** //

/**
 * how many accounts to be generated
 * @type {Array}
 */
const accountGenerators = [];
for (let amtId = 0; amtId < amount; amtId++) {
    accountGenerators.push(cb => {
        /**
         * generate account with `geth account new` shell script
         */
        genAccount(datadir, passfile, function (err, stdout) {
            if (err) {
                console.error('generate account failed with: %s', err.message);
                process.exit()
            }

            console.log('generating account %s ....', amtId);

            console.log('creating the utc file');
            const [, account] = stdout.match(GEN_ACCOUNT_RET_REGEX);
            Fs.writeFileSync(Path.join(accountdir, 'public', `account-${account}.key`), account);

            console.log('creating the private key file');
            const utcContent = getUtcContent(account);
            const privateKey = PkUtils.getPrivateKeyFromKeystore(utcContent, password);
            Fs.writeFileSync(Path.join(accountdir, 'private', `private-${account}.key`), privateKey);

            cb(null)
        });
    })
}

/**
 * store generated UTC file to the account folder to backup
 */
accountGenerators.push((cb) => {
    const accounts = [];

    console.log('copying UTC files from keystore into account folder to backup....');

    const utcFiles = Fs.readdirSync(Path.join(datadir, 'keystore'));
    utcFiles.forEach(file => {
        copyUtcFile(datadir, accountdir, file, accounts)
    });

    console.log('generating genesis json file...');

    genGenesis(accounts);

    cb(null);
});

/**
 * finally regenerate the geth data folder
 */
Async.waterfall(accountGenerators, (err) => {
    if (err) {
        console.error('error occurs %s', err.message);
        process.exit()
    }

    console.log('empty old geth data folder, please backup before this!');

    Fse.emptyDirSync(Path.join(datadir, 'geth'));
    Fse.emptyDirSync(Path.join(datadir, 'keystore'));

    const utcFiles = Fs.readdirSync(Path.join(accountdir, 'keystore'));
    utcFiles.forEach(file => {
        copyUtcFile(accountdir, datadir, file)
    });

    genWallet(datadir, function (err, info) {
        if (err) {
            console.error('create wallet failed with %s', err.message);
            process.exit()
        }

        console.log('generate auto configured geth private chain success!');
    });
});