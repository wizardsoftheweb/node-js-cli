# Proof of Concept

This is a raw app I built to test my idea. It's not going to work without some coaxing.

## Installation

You'll need to add a `package.json`:
```json
{
  "bin": {
    "wotw-ghost": "wotw-ghost.js",
    ".wotw-ghost-plugins/backup-config": "backup-config.js"
  },
  "author": "CJ Harries <cj@wizardsoftheweb.pro> (https://wizardsoftheweb.pro/)",
  "license": "ISC",
  "dependencies": {
    "argparse": "^1.0.9",
    "shelljs": "^0.7.8",
    "winston": "^2.4.0"
  }
}
```

With that, you can run this to add it:
```sh-session
$ yarn add /path/to/wherever/you/put/it
yarn add v1.3.2
info No lockfile found.
[1/4] Resolving packages...
[2/4] Fetching packages...
[3/4] Linking dependencies...
[4/4] Building fresh packages...
success Saved lockfile.
success Saved 26 new dependencies.
├─ @wizardsoftheweb/ghost-app-amp@0.0.0
├─ argparse@1.0.9
├─ async@1.0.0
├─ balanced-match@1.0.0
├─ brace-expansion@1.1.8
├─ colors@1.0.3
├─ concat-map@0.0.1
├─ cycle@1.0.3
├─ eyes@0.1.8
├─ fs.realpath@1.0.0
├─ glob@7.1.2
├─ inflight@1.0.6
├─ inherits@2.0.3
├─ interpret@1.1.0
├─ isstream@0.1.2
├─ minimatch@3.0.4
├─ once@1.4.0
├─ path-is-absolute@1.0.1
├─ path-parse@1.0.5
├─ rechoir@0.6.2
├─ resolve@1.5.0
├─ shelljs@0.7.8
├─ sprintf-js@1.0.3
├─ stack-trace@0.0.10
├─ winston@2.4.0
└─ wrappy@1.0.2
Done in 29.17s.
>>> elapsed time 30s
```

This is a sample run:
```sh-session
$ node_modules/.bin/wotw-ghost -h
usage: wotw-ghost [-h [{all,backup-config}]]

WotW Ghost Tooling

Optional arguments:
  -h [{all,backup-config}], --help [{all,backup-config}]
                        Prints this message
usage: wotw-ghost backup-config [-h] [-f]

backup-config works with the existing Ghost config

Optional arguments:
  -h, --help   Show this help message and exit.
  -f, --force  DESTRUCTIVE. Overwrites any current backups.
$ node_modules/.bin/wotw-ghost backup-config
debug: Attempting to update settings
input: Provided settings:
{ verbosity: 10 }
verbose: Current settings
{ verbosity: 10,
  subcommand: 'backup-config',
  overwriteConfig: false }
info: Settings updated
data:
[ 'BackupConfig' ]
debug: Parsing CLI args
input: Injected args
[ 'backup-config' ]
silly: BackupConfig has args
debug: Registering subparsers
debug: Adding parser
debug: Attempting to parse default args
debug: Attempting to update settings
input: Provided settings:
{ verbosity: 10,
  subcommand: 'backup-config',
  overwriteConfig: false }
verbose: Current settings
{ verbosity: 10,
  subcommand: 'backup-config',
  overwriteConfig: false }
info: Settings updated
info: CLI args successfully parsed
info: Settings updated
info: Discovered calling application
info: Settings updated
warn: wotw-ghost encountered an error; exiting
error: wotw-ghost expects the Ghost instance to have core/server/config to maintain the illusion of security
warn: Full run log available in /tmp/test/wotw-ghost-2018-01-02T05-49-29-754Z-error.log
error: uncaughtException: wotw-ghost expects the Ghost instance to have core/server/config to maintain the illusion of security
```
