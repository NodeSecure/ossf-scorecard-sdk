// Import Third-party Dependencies
import { fetch } from "undici";

// CONSTANTS
const kDefaultPlatform = "github.com";
const kOpenSSFScorecardRestApi = "https://api.securityscorecards.dev/projects";

export interface OpenSSFOptions {
  /**
   * @description VCS platform. eg. github.com
   * @default github.com
   */
  platform?: string;
}

export type ScorecardCheck = {
  name: string;
  score: number;
  reason: string;
  details: null | string[];
  documentation: {
    short: string;
    url: string;
  };
};

export type ScorecardResult = {
  date: string;
  metadata: string;
  repo: {
    name: string;
    commit: string;
  };
  scorecard: {
    version: string;
    commit: string;
  };
  score: number;
  checks: ScorecardCheck[];
};

/**
 * @description Get a repository's ScorecardResult
 * @see https://api.securityscorecards.dev/#/results/getResult
 */
export async function result(
  repository: string,
  options: OpenSSFOptions = {}
): Promise<ScorecardResult> {
  const { platform = kDefaultPlatform } = options;

  const { href } = new URL(`${kOpenSSFScorecardRestApi}/${platform}/${repository}`);

  const response = await fetch(href);
  if (!response.ok) {
    throw new Error("The content requested could not be found");
  }

  const data = (await response.json()) as ScorecardResult;

  return data;
}

/**
 * @description Get a repository's Scorecard badge URL
 * @see https://api.securityscorecards.dev/#/badge/getBadge
 */
export async function badge(
  repository: string,
  options: OpenSSFOptions = {}
) {
  const { platform = kDefaultPlatform } = options;

  const { href } = new URL(
    `${kOpenSSFScorecardRestApi}/${platform}/${repository}/badge`
  );

  const response = await fetch(href);

  const text = await response.text();
  if (text.includes("openssf scorecard: invalid repo path")) {
    throw new Error("invalid repo path");
  }

  return response.url;
}
