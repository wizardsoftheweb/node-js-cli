#!/usr/bin/env node

const EXCEPTIONS = {
    LAUNCHED_FROM_CLI: "The backup-config plugin must be executed through the wotw-ghost runner",
};

const ArgumentParser = require("argparse").ArgumentParser;
const fs = require("fs");
const path = require("path");
const shelljs = require("shelljs");
const winston = require("winston");

const EXPECTED_SERVER_CONFIG_PATH = ["core", "server", "config"];
const SAVED_SERVER_CONFIG_FILES = ["defaults.json", "overrides.json"];

if (require.main === module) {
    throw new Error(EXCEPTIONS.LAUNCHED_FROM_CLI);
}

class BackupConfig {
	static get SUBCOMMAND() {
		return "backup-config";
	}

	constructor(settings, logger) {
		this.settings = settings;
		this.logger = logger;
	}

	static registerArgs(subparsers) {
		const parser = subparsers.addParser(
			"backup-config",
			{
				required: false,
				addHelp: true,
				description: "backup-config works with the existing Ghost config",
				title: "backup-config",
			},
		);
		parser.addArgument(
			["-f", "--force"],
			{
				action: "storeTrue",
				default: false,
				dest: "overwriteConfig",
				help: "DESTRUCTIVE. Overwrites any current backups."
			}
		);
		return parser;
	}

	getArrayOfStagedFiles() {
		this.logger.debug("Discovering staged files");
		this.logger.prompt("git diff --name-only --cached");
		const stagedFiles = shelljs.exec(
				"git diff --name-only --cached",
				{ silent: true },
			).stdout
			.split(/\r?\n/)
			.reduce(
				(accumulator, currentValue) => {
					return ("" === currentValue ? accumulator : accumulator.concat([currentValue]));
				},
				[],
			);
		this.logger.verbose("Staged files", stagedFiles);
		return stagedFiles;
	}

	ensureNothingIsStaged() {
		this.logger.debug("Checking that nothing is staged");
		const stagedFiles = getArrayOfStagedFiles();
		if (0 < stagedFiles.length) {
			throwException(EXCEPTIONS.STAGED_FILES);
		}
	}

	commitFiles(message) {
		shelljs.exec(`git commit -m "${message}"`);
	}

	tagRepo(tagName) {
		shelljs.exec(`git -f tag ${tagName}`);
	}

	backupOriginalConfig() {
		const configPath = path.join(this.settings.ghostRoot, ...EXPECTED_SERVER_CONFIG_PATH);
		for (const originalBasename of SAVED_SERVER_CONFIG_FILES) {
			const originalPath = path.join(configPath, originalBasename);
			const backupPath = path.join(configPath, `wotw-ghost-saved-${originalBasename}`);
			if (!fs.existsSync(backupPath)) {
				shelljs.cp(originalPath, backupPath);
				shelljs.exec(`git add ${backupPath}`);
			}
		}
		const stagedFiles = getArrayOfStagedFiles();
		if (stagedFiles.length > 0) {
			this.commitFiles("Backing up original config");
			this.tagRepo("wotw-ghost-config-backup");
		}
	}
}

module.exports = BackupConfig;
