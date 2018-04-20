ethereum-privatechain-generator-script
===

Generate A Private Block Chain With Scripts, With Default Account Auto Generate And Configured.

## Installation

### Dependency

* Node.JS 8.11+ (Or Lower Version But Without Test For Sure.)
* Bash Shell
* Geth
* Python 2.7.x+ (not Python 3.x)
* Supervisor


## Quick Start

Get A Private Single Node Geth To Run:

1. Init Genesis Block

`sh init.sh`

It Will Generate An Account Start Wtth '0x' And Length Is 40 (Without '0x').

2. Start The Server

`sh start-geth.sh --mine --unlock 0xACCOUNT_GENERATED_IN_UPPER_STEP_01`

The `start-geth.sh` Script Support All Geth Params, But Some Of Them Included In The Script By Default.

_0xACCOUNT_GENERATED_IN_UPPER_STEP_01_ Is The Account Generated In The First Step.

Success!! Everything Is Supposed To Be OK!


## Folder Structure

By Default, 

* `account` Folder Is To Backup The Auto Generated Public Account

* `account/private` Private Keys That Match The Public Keys In `account`

* `datastore` Is The Main Ethereum Data Folder.

* `datastore/geth` All Block Chain Data Stored Here.

* `datastore/keystore` Auto Imported Keys, The Account Will Shown Via `personal.listAccounts`

* `datastore/logs` For Future Use To Store The Geth Log.

* `private` Folder Is The Imported Private Key.


## Usage

* `init.sh` Init Genesis Block

See [Quick Start](#quick-start)

You May Do This Several Times For Generate Multi Accounts.

* `start-geth.sh` Start A Private Block Chain

See [Quick Start](#quick-start)

* `import.sh` Import A Private Key Into The Keystore.

`sh import.sh A_VERY_LONG_PRIVATE_KEY_STRING`

Notice: The Imported Key's Password Need To Match That In File `account.password` 
**OR** The Imported Account Will Not Show In The `personal.listAccounts`



## Make Sure Geth Alive!

Use Supervisor To Make Sure That The Geth Press Alive~

### Start The Supervisor Daemon

```sh start-supervisord.sh```

By Default, It Use The `supervisord.conf`

If The Geth Process Printed, Then Start Success

### Stop The Supervisor Daemon

```sh stop-supervisord.sh```

If Nothing Printed, Then Stop Success

### Manage The Sub Process [Start|Restart...]

```supervisorctl -c supervisord.conf```

Enter The Interaction Shell, Then Type `help` For More Instructions.




