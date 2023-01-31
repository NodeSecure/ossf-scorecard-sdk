// Import Third-party Dependencies
import { fetch } from "undici";

// CONSTANTS
const kDefaultPlatform = "github.com";
export const kOpenSSFScorecardRestApi = "https://api.securityscorecards.dev";

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

export interface IResultOptions {
  /**
   * @description VCS platform. eg. github.com
   * @default github.com
   */
  platform?: string;
}

/**
 * @description Get a repository's ScorecardResult
 * @see https://api.securityscorecards.dev/#/results/getResult
 */
export async function result(
  repository: string,
  options: IResultOptions = {}
): Promise<ScorecardResult> {
  const { platform = kDefaultPlatform } = options;

  const response = await fetch(
    new URL(`/projects/${platform}/${repository}`, kOpenSSFScorecardRestApi)
  );
  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const data = (await response.json()) as ScorecardResult;

  return data;
}

export interface IBadgeOptions extends IResultOptions {
  /**
   * Style to render the badge
   *
   * @default flat
   */
  style?: "plastic" | "flat" | "flat-square" | "for-the-badge" | "social";
}

export interface BadgeResult {
  image: string;
  svg: string;
}

/**
 * @description Get a repository's Scorecard badge URL
 * @see https://api.securityscorecards.dev/#/badge/getBadge
 */
export async function badge(
  repository: string,
  options: IBadgeOptions = {}
): Promise<BadgeResult> {
  const { platform = kDefaultPlatform, style = "flat" } = options;

  const apiUrl = new URL(`/projects/${platform}/${repository}/badge`, kOpenSSFScorecardRestApi);
  apiUrl.searchParams.set("style", style);

  const response = await fetch(apiUrl);
  const svg = await response.text();
  if (svg.includes("invalid repo path")) {
    throw new Error("Invalid repo path");
  }

  return {
    image: response.url,
    svg
  };
}
