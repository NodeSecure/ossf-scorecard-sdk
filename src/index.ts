// Import Third-party Dependencies
import { fetch } from "undici";
import { packument } from "@nodesecure/npm-registry-sdk";
import { Octokit } from "octokit";
import { restEndpointMethods } from "@octokit/plugin-rest-endpoint-methods";

// Import Internal Dependencies
import { repositoryFromUrl } from "./utils/repositoryFromUrl.js";

// CONSTANTS
const kDefaultPlatform = "github.com";
export const API_URL = "https://api.securityscorecards.dev";

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
  let formattedRepository = repository;
  const { platform = kDefaultPlatform } = options;
  const [owner, repo] = repository.replace("@", "").split("/");
  const octokit = new (Octokit.plugin(restEndpointMethods))({ auth: process.env.GITHUB_TOKEN });

  try {
    // We try to retrieve the repository with the GitHub API because
    // Scorecard API is case sensitive, i.e if we pass "nodesecure/cli",
    // we must reformat it to "NodeSecure/cli"
    const { data } = await octokit.rest.repos.get({
      owner,
      repo
    });
    formattedRepository = data.full_name;
  }
  catch {
    // If the repository is not found, we try to retrieve it from the NPM registry
    // i.e: if given repository is "@nodesecure/cli"
    try {
      const data = await packument(repository);
      const latestVersion = data["dist-tags"].latest;
      if (latestVersion) {
        const repository = data.versions[latestVersion].repository;
        const url = typeof repository === "string" ? repository : repository?.url;
        formattedRepository = repositoryFromUrl(url ?? "");
      }
    }
    catch {
      throw new Error("Invalid repository, cannot find it on GitHub or NPM registry");
    }
  }

  const response = await fetch(
    new URL(`/projects/${platform}/${formattedRepository}`, API_URL)
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

  const apiUrl = new URL(`/projects/${platform}/${repository}/badge`, API_URL);
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
