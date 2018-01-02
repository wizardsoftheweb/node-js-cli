#! /usr/bin/env node

const EXCEPTIONS = {
    NOTHING_SPECIFIED: "No action was specified",
    LAUNCHED_BY_REQUIRE: "wotw-ghost cannot currently be required; it must be used via the CLI",
    STAGED_FILES: "wotw-ghost can create tags; please commit all staged files before running",
    UNKNOWN_RUN_LOCATION: "wotw-ghost must be run from node_modules/.bin to maintain the illusion of security",
    UNKNOWN_GHOST_INSTANCE: "wotw-ghost expects the Ghost instance to have core/server/config to maintain the illusion of security",
};

if (require.main !== module) {
    throw new Error(EXCEPTIONS.LAUNCHED_BY_REQUIRE);
}

const argparse = require("argparse");
const fs = require("fs");
const path = require("path");
const shelljs = require("shelljs");
const winston = require("winston");

const DEFAULT_SETTINGS = {
    verbosity: 10,
};

const SETTINGS = {};

const DEFAULT_ARGV = process.argv;

const LOGGER_LEVELS = [
  "error",
  "warn",
  "help",
  "data",
  "info",
  "debug",
  "prompt",
  "verbose",
  "input",
  "silly",
];

const FULL_LOG_FILE = path.join(process.cwd(), `wotw-ghost-${(new Date()).toISOString().replace(/[:.]/g, "-")}-error.log`);

const CONSOLE_TRANSPORT = new winston.transports.Console({
    colorize: true,
    prettyPrint: true,
    handleExceptions: true,
    humanReadableUnhandledException: true,
});

const MEMORY_TRANSPORT = new winston.transports.Memory({ level: "silly" });

const FILE_TRANSPORT = new winston.transports.File({
    name: "fullLog",
    level: "silly",
    filename: FULL_LOG_FILE,
    handleExceptions: true,
});

const LOGGER = new winston.Logger({
    colors: winston.config.cli.colors,
    levels: winston.config.cli.levels,
    transports: [
        FILE_TRANSPORT,
        MEMORY_TRANSPORT,
    ]
});
// LOGGER.add(CONSOLE_TRANSPORT, {}, true);

const CLI_LOG_QUEUE = [];

const EXPECTED_RUN_PATH = ["node_modules", ".bin"];
// const EXPECTED_SERVER_PATH = ["core", "server", "index.js"];

const EXPECTED_SERVER_CONFIG_PATH = ["core", "server", "config"];
const SAVED_SERVER_CONFIG_FILES = ["defaults.json", "overrides.json"];

const COMMAND_DIRECTORY = ".wotw-ghost-plugins";
const COMMANDS = [];

let MEMORY_TRANSPORT_LISTENER = addToCliLogQueue;

LOGGER
    .on("logging", MEMORY_TRANSPORT_LISTENER)
    .on("close", () => {
        console.log("closed!");
    });

updateSettings(DEFAULT_SETTINGS);

cli(...DEFAULT_ARGV);

function addToCliLogQueue(transport, level, message, meta) {
    if (transport === MEMORY_TRANSPORT) {
        // CLI_LOG_QUEUE.push({level: level, message: message, meta: meta});
        CLI_LOG_QUEUE.push([level, message, meta]);
    }
}

function setVerbosity(verbosity = SETTINGS.verbosity) {
    LOGGER.debug("Updating verbosity");
    LOGGER.input("Provided verbosity:", verbosity);
    if (0 > verbosity) {
        LOGGER.silly("Increasing verbosity input to 0");
        verbosity = 0;
    }
    if (LOGGER_LEVELS.length <= verbosity) {
        LOGGER.silly(`Decreasing verbosity input to ${LOGGER_LEVELS.length}`)
        verbosity = LOGGER_LEVELS.length - 1;
    }
    LOGGER.transports.console.level = LOGGER_LEVELS[verbosity];
    LOGGER.verbose("New level", verbosity, LOGGER_LEVELS[verbosity]);
    LOGGER.info("Verbosity updated");
}

function updateSettings(newSettings) {
    LOGGER.debug("Attempting to update settings");
    LOGGER.input("Provided settings:", newSettings);
    Object.assign(SETTINGS, newSettings);
    if (newSettings.verbosity && LOGGER.transports && LOGGER.transports.console) {
        console.log(LOGGER.transports.console);
        setVerbosity();
    }
    LOGGER.verbose("Current settings", SETTINGS);
    LOGGER.info("Settings updated");
}

function throwException(message) {
    LOGGER.warn("wotw-ghost encountered an error; exiting");
    LOGGER.error(message);
    LOGGER.warn(`Full run log available in ${FULL_LOG_FILE}`);
    throw new Error(message);
}

function cli(callingProcess, callingScript, ...args) {
    discoverCommands(callingScript);
    parseCliArgs(args);
    // LOGGER.info("Testing 1");
    // setVerbosity(0);
    // LOGGER.info("Testing 2");
    // setVerbosity(10);
    // LOGGER.info("Testing 3");
    discoverCallingApp(callingScript);
    discoverCallingGhost();
    cleanExit();
}

function discoverCommands(callingScript) {
    const commandDirectory = path.join(
        path.dirname(callingScript),
        COMMAND_DIRECTORY
    );
    module.paths.push(commandDirectory);
    const loadedPlugins = shelljs
        .ls(commandDirectory)
        .map((discoveredCommand) => {
            const command = require(discoveredCommand);
            COMMANDS.push(command);
            return command.name;
        });
    LOGGER.data(loadedPlugins);
}

function parseCliArgs(argsToParse) {
    LOGGER.debug("Parsing CLI args");
    LOGGER.input("Injected args", argsToParse);

    const pluginsWithArgs = [];
    const helpChoices = ["all"];

    for (const command of COMMANDS) {
        if (command.SUBCOMMAND && command.registerArgs) {
            LOGGER.silly(`${command.name} has args`);
            helpChoices.push(command.SUBCOMMAND);
            pluginsWithArgs.push(command.registerArgs);
        }
    }

    const helpParser = new argparse.ArgumentParser({
        description: "WotW Ghost Tooling",
        conflictHandler: "resolve",
    });

    helpParser.addArgument(
        ["-h", "--help"],
        {
            action: "store",
            nargs: "?",
            default: argparse.Const.SUPPRESS,
            defaultValue: argparse.Const.SUPPRESS,
            choices: helpChoices,
            dest: "help",
            help: "Prints this message",
        }
    );

    const parser = new argparse.ArgumentParser({
        parents: [helpParser],
        addHelp: false,
        description: "WotW Ghost Tooling",
        conflictHandler: "resolve",
    });

    parser.addArgument(
        ["-v", "--verbose"],
        {
            action: "count",
            dest: "verbosity",
            defaultValue: DEFAULT_SETTINGS.verbosity,
            help: "Increases verbosity level"
        },
    );

    const allSubParsers = {};

    if (pluginsWithArgs.length > 0) {
        LOGGER.debug("Registering subparsers");
        const subparsers = parser.addSubparsers({
            title:"subcommands",
            description: "Available plugins",
            dest:"subcommand",
            help: "Run wotw-ghost SUBCOMMAND -h for more information",
        });
        LOGGER.debug("Adding parser");
        pluginsWithArgs.map((pluginParser) => {
            allSubParsers[pluginParser] = pluginParser(subparsers);
        });
    }

    let parsedArgs = {};
    try {
        LOGGER.debug("Attempting to parse default args");
        parser.error = (error) => {
            LOGGER.silly("Parser threw", error);
            throw new Error(error);
        };
        parsedArgs = parser.parseArgs(argsToParse);
    } catch (error) {
        LOGGER.info("Unable to parse normal args");
        LOGGER.debug("Attempting to parse help args");
        parsedArgs = helpParser.parseKnownArgs(argsToParse)[0];
        if (parsedArgs.hasOwnProperty("help")) {
            LOGGER.info("Help args found");
            if (allSubParsers[parsedArgs.help]) {
                allSubParsers[parsedArgs.help].printHelp();
            } else {
                helpParser.printHelp();
                for (const subparser in allSubParsers) {
                    if (allSubParsers.hasOwnProperty(subparser)) {
                        allSubParsers[subparser].printHelp();
                    }
                }
            }
            cleanExit();
        } else {
            throwException(EXCEPTIONS.NOTHING_SPECIFIED);
        }
    }
    updateSettings(parsedArgs);
    LOGGER.remove(MEMORY_TRANSPORT);
    // LOGGER.remove(FILE_TRANSPORT);
    LOGGER.add(CONSOLE_TRANSPORT, {}, true);
    for (const info of CLI_LOG_QUEUE) {
        CONSOLE_TRANSPORT.log(...info, () => {});
    }
    // LOGGER.add(FILE_TRANSPORT);
    LOGGER.verbose("Parsed args", parsedArgs);
    LOGGER.info("CLI args successfully parsed");
}

function parsePathWithExplode(pathToExplode) {
    if (!pathToExplode.dir) {
        pathToExplode = path.parse(pathToExplode);
    }
    pathToExplode.exploded = pathToExplode.dir
        .split(path.sep)
        .slice("" !== pathToExplode.root ? 1 : 0);
    LOGGER.silly("Exploded path", pathToExplode);
    return pathToExplode;
}

function validateRunPath(runPath) {
    LOGGER.debug("Validating wotw-ghost's call location")
    LOGGER.input("Current run path", runPath);
    LOGGER.silly("Desired run path", EXPECTED_RUN_PATH);
    if (EXPECTED_RUN_PATH.toString() !== runPath.toString()) {
        throwException(EXCEPTIONS.UNKNOWN_RUN_LOCATION);
    }
}

function discoverCallingApp(callingScript) {
    LOGGER.debug("Attempting to discover calling application");
    LOGGER.input("Calling script", callingScript);
    const parsedPath = parsePathWithExplode(callingScript);
    validateRunPath(parsedPath.exploded.splice(-2));
    updateSettings({ callingApp: path.join(parsedPath.root, ...parsedPath.exploded) });
    LOGGER.verbose("Calling app", SETTINGS.callingApp);
    LOGGER.info("Discovered calling application");
}

function validateGhostRootPath(pathToGhost) {
    LOGGER.debug("Validating Ghost root path");
    LOGGER.input("Given root path", pathToGhost);
    const expectedFile = path.join(pathToGhost, ...EXPECTED_SERVER_CONFIG_PATH);
    LOGGER.silly("Looking for", expectedFile);
    if (!fs.existsSync(expectedFile)) {
        throwException(EXCEPTIONS.UNKNOWN_GHOST_INSTANCE);
    }
}

function discoverCallingGhost(callingApp = SETTINGS.callingApp) {
    LOGGER.debug("Attempting to discover Ghost root");
    LOGGER.input("Calling app", callingApp);
    if (!SETTINGS.ghostRoot) {
        LOGGER.silly("Setting Ghost root to Calling app");
        updateSettings({ ghostRoot: callingApp });
    }
    validateGhostRootPath(SETTINGS.ghostRoot);
    LOGGER.verbose("Ghost root", SETTINGS.ghostRoot);
    LOGGER.info("Ghost root discovered");
}

function cleanExit() {
    LOGGER.info("wotw-ghost finished without errors");
    shelljs.exit(0);
}
