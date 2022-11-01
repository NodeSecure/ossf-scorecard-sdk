/* eslint-disable comma-dangle */
export type payload = {
  platform?: string;
};

export type Repo = {
  name: string;
  commit: string;
};

export type Metadata = {
  version: string;
  commit: string;
};

export type Documentation = {
  short: string;
  url: string;
};

export type Checks = {
  name: string;
  score: number;
  reason: string;
  details: string[];
  documentation: Documentation[];
};

export type Scorecoard = {
  date: string;
  repo: Repo;
  scorecard: Metadata;
  score: number;
  checks: Checks[];
};

export const CONSTANTS = {
  kbaseUrl: "https://api.securityscorecards.dev/projects",
  kdefaultPlatform: "github.com",
};
