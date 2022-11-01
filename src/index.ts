import { fetch } from "undici";
import { CONSTANTS, Scorecoard, payload } from "./types.js";

export async function result(
  repository: string,
  options: payload
): Promise<Scorecoard> {
  const { platform = CONSTANTS.kdefaultPlatform } = options;

  const { href } = new URL(`${CONSTANTS.kbaseUrl}/${platform}/${repository}`);

  const response = await fetch(href);

  if (!response.ok) {
    throw new Error("The content requested could not be found");
  }

  const data = (await response.json()) as Scorecoard;

  return data;
}

export async function badge(repository: string, options: payload) {
  const { platform = CONSTANTS.kdefaultPlatform } = options;

  const { href } = new URL(
    `${CONSTANTS.kbaseUrl}/${platform}/${repository}/badge`
  );

  const response = await fetch(href);

  const text = await response.text();

  if (text.includes("openssf scorecard: invalid repo path")) {
    throw new Error("invalid repo path");
  }

  return response.url;
}
