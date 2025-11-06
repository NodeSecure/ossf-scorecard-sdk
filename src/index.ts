// Import Third-party Dependencies
import { get } from "@openally/httpie";
import { packument } from "@nodesecure/npm-registry-sdk";

// Import Internal Dependencies
import { repositoryFromUrl } from "./utils/repositoryFromUrl.ts";
import type { GitHubRepository, GitLabProject } from "./types.ts";

// CONSTANTS
const kDefaultPlatform = "github.com";
const kGitHubApiUrl = "https://api.github.com";
const kGitHubRequestOptions = {
  authorization: process.env.GITHUB_TOKEN ?? ""
};
const kGitLabApiUrl = "https://gitlab.com";
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
  platform?: "github.com" | "github.corp.com" | "gitlab.com";
  /**
   * @description Try to resolve the given repository on the NPM registry if its not found on the given platform.
   * @default true
   */
  resolveOnNpmRegistry?: boolean;
  /**
   * @description Try to resolve the given repository on the given platform. This can be useful when the given repository
   * is not exactly the same as the one on the given platform (case sensitive).
   * @default true
   */
  resolveOnVersionControl?: boolean;
  /**
   * @description The version of the npm package (when `resolveOnNpmRegistry` only) to retrieve the scorecard for.
   * @default "latest"
   */
  npmPackageVersion?: string;
}

async function getNpmRepository(
  repository: string,
  version: string
): Promise<string> {
  const data = await packument(repository);
  const latestVersion = data["dist-tags"].latest!;
  const packageVersion = data.versions[version === "latest" ? latestVersion : version];

  if (!packageVersion) {
    throw new Error(`Cannot find the version '${version}' of the given repository`);
  }

  const homepage = packageVersion.homepage || null;
  const repo = packageVersion.repository;
  const repoUrl = typeof repo === "string" ? repo : repo?.url;

  return repositoryFromUrl(repoUrl ?? homepage ?? "");
}

async function retrieveRepositoryOnGithub(
  owner: string,
  repo: string
): Promise<string> {
  const { data } = await get<GitHubRepository>(
    new URL(`/repos/${owner}/${repo}`, kGitHubApiUrl),
    kGitHubRequestOptions
  );

  return data.full_name;
}

async function retrieveRepositoryOnGitLab(
  owner: string,
  repo: string
): Promise<string> {
  const { data } = await get<GitLabProject>(
    new URL(`/api/v4/projects/${owner}%2F${repo}`, kGitLabApiUrl)
  );

  return data.path_with_namespace;
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
  const {
    platform = kDefaultPlatform,
    resolveOnNpmRegistry = true,
    resolveOnVersionControl = true,
    npmPackageVersion = "latest"
  } = options;
  const [owner, repo] = repository.replace("@", "").split("/");

  // We don't try to resolve repository via GitHub or NPM API when platform is GHES
  if (platform !== "github.corp.com" && resolveOnVersionControl) {
    try {
    // We try to retrieve the repository with the GitHub or GitLab API because
    // Scorecard API is case sensitive, i.e if we pass "nodesecure/cli",
    // we must reformat it to "NodeSecure/cli"
      if (platform === "github.com") {
        formattedRepository = await retrieveRepositoryOnGithub(owner, repo);
      }
      else if (platform === "gitlab.com") {
        formattedRepository = await retrieveRepositoryOnGitLab(owner, repo);
      }
    }
    catch (error) {
      const platformName = platform.split(".")[0];
      if (!resolveOnNpmRegistry) {
        throw new Error(`Invalid repository, cannot find it on ${platformName}`, {
          cause: error
        });
      }

      try {
        formattedRepository = await getNpmRepository(repository, npmPackageVersion);
      }
      catch (error) {
        throw new Error(`Invalid repository, cannot find it on ${platformName} or NPM registry`, {
          cause: error
        });
      }
    }
  }
  else if (resolveOnNpmRegistry && !resolveOnVersionControl) {
    try {
      formattedRepository = await getNpmRepository(repository, npmPackageVersion);
    }
    catch (error) {
      throw new Error("Invalid repository, cannot find it on NPM registry", {
        cause: error
      });
    }
  }

  const { data } = await get<ScorecardResult>(
    new URL(`/projects/${platform}/${formattedRepository}`, API_URL)
  );

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
