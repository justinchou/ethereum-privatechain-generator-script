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

const genGenesis = require('./genGenesis').genGenesis;
const genAccount = require('./genAccount').genAccount;
const genWallet = require('./genWallet').genWallet;



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

            console.log('generating account %s', amtId);

            const [, account] = stdout.match(GEN_ACCOUNT_RET_REGEX);
            Fs.writeFileSync(Path.join(accountdir, 'public', `account-${account}.key`), account)

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