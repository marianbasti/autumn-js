import { confirm } from "@inquirer/prompts";
import chalk from "chalk";
import dotenv from "dotenv";
import fs from "fs";
import yoctoSpinner from "yocto-spinner";

export const notNullish = (value: any) => value !== null && value !== undefined;
export const nullish = (value: any) => value === null || value === undefined;

export function snakeCaseToCamelCase(value: string) {
	return value.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
}

export function idToVar(id: string): string {
	return id
		.replace(/[-_](.)/g, (_, letter) => letter.toUpperCase())
		.replace(/^[^a-zA-Z_$]/, "_") // Handle leading non-letter characters
		.replace(/[^a-zA-Z0-9_$]/g, ""); // Remove invalid JavaScript identifier characters
}

async function upsertEnvVar(
	filePath: string,
	varName: string,
	newValue: string,
) {
	const content = fs.readFileSync(filePath, "utf-8");
	const lines = content.split("\n");
	let found = false;

	for (let i = 0; i < lines.length; i++) {
		if (lines[i]?.startsWith(`${varName}=`)) {
			const shouldOverwrite = await confirm({
				message: `${varName} already exists in .env. Overwrite?`,
				default: false,
			});
			if (shouldOverwrite) {
				lines[i] = `${varName}=${newValue}`;
				found = true;
				break;
			}
		}
	}

	// If variable wasn't found, add it to the end
	if (!found) {
		lines.push(`${varName}=${newValue}`);
	}

	// Write the updated content back to the file
	fs.writeFileSync(filePath, lines.join("\n"));
}

export function storeToEnv(prodKey: string, sandboxKey: string) {
	const envPath = `${process.cwd()}/.env`;
	const envLocalPath = `${process.cwd()}/.env.local`;
	const envVars = `AUTUMN_PROD_SECRET_KEY=${prodKey}\nAUTUMN_SECRET_KEY=${sandboxKey}\n`;

	// Check if .env exists first
	if (fs.existsSync(envPath)) {
		upsertEnvVar(envPath, "AUTUMN_PROD_SECRET_KEY", prodKey);
		upsertEnvVar(envPath, "AUTUMN_SECRET_KEY", sandboxKey);
		console.log(chalk.green(".env file found. Updated keys."));
	} else if (fs.existsSync(envLocalPath)) {
		// If .env doesn't exist but .env.local does, create .env and write keys
		fs.writeFileSync(envPath, envVars);
		console.log(
			chalk.green(
				".env.local found but .env not found. Created new .env file and wrote keys.",
			),
		);
	} else {
		// Neither .env nor .env.local exists, create .env
		fs.writeFileSync(envPath, envVars);
		console.log(
			chalk.green(
				"No .env or .env.local file found. Created new .env file and wrote keys.",
			),
		);
	}
}

export function readFromEnv() {
	const envPath = `${process.cwd()}/.env`;
	const envLocalPath = `${process.cwd()}/.env.local`;
	const prodFlag =
		process.argv.includes("--prod") || process.argv.includes("-p");

	function getEnvVar(parsed: { [key: string]: string }) {
		// biome-ignore lint/complexity/useLiteralKeys: will throw "index signature" error otherwise
		if (parsed["AUTUMN_PROD_SECRET_KEY"] && prodFlag) {
			// biome-ignore lint/complexity/useLiteralKeys: will throw "index signature" error otherwise
			return parsed["AUTUMN_PROD_SECRET_KEY"];
			// biome-ignore lint/complexity/useLiteralKeys: will throw "index signature" error otherwise
		} else if (parsed["AUTUMN_SECRET_KEY"]) {
			// biome-ignore lint/complexity/useLiteralKeys: will throw "index signature" error otherwise
			return parsed["AUTUMN_SECRET_KEY"];
		}
		return undefined;
	}

	// Check .env first (has priority)
	if (fs.existsSync(envPath))
		return getEnvVar(dotenv.parse(fs.readFileSync(envPath, "utf-8")));

	// If not found in .env, check .env.local
	if (fs.existsSync(envLocalPath))
		return getEnvVar(dotenv.parse(fs.readFileSync(envLocalPath, "utf-8")));

	return undefined;
}

export function initSpinner(message: string) {
	const spinner = yoctoSpinner({
		text: message,
	});
	spinner.start();

	return spinner;
}
