<p align="center">
  <img src="https://github-production-user-asset-6210df.s3.amazonaws.com/4438263/265200624-394fd7a2-3824-4fd4-845a-b53d0c7a6352.jpg" alt="@nodesecure/ossf-scorecard-sdk">
</p>

<p align="center">
    <a href="https://github.com/NodeSecure/ossf-scorecard-sdk">
      <img src="https://img.shields.io/github/package-json/v/NodeSecure/ossf-scorecard-sdk?style=for-the-badge" alt="npm version">
    </a>
     <a href="https://github.com/NodeSecure/ossf-scorecard-sdk">
      <img src="https://img.shields.io/badge/Maintained%3F-yes-green.svg?style=for-the-badge" alt="maintained">
    </a>
    <a href="https://github.com/NodeSecure/ossf-scorecard-sdk">
      <img src="https://img.shields.io/github/license/NodeSecure/ossf-scorecard-sdk?style=for-the-badge" alt="license">
    </a>
    <a href="https://api.securityscorecards.dev/projects/github.com/NodeSecure/ossf-scorecard-sdk">
      <img src="https://api.securityscorecards.dev/projects/github.com/NodeSecure/ossf-scorecard-sdk/badge?style=for-the-badge" alt="ossf scorecard">
    </a>
    <a href="https://github.com/NodeSecure/vulnera/actions?query=workflow%3A%22Node.js+CI%22">
      <img src="https://img.shields.io/github/actions/workflow/status/NodeSecure/ossf-scorecard-sdk/main.yml?style=for-the-badge" alt="github ci workflow">
    </a>
</p>


## Requirements

- [Node.js](https://nodejs.org/en/) v20 or higher

## Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i @nodesecure/ossf-scorecard-sdk
# or
$ yarn add @nodesecure/ossf-scorecard-sdk
```

## Usage example

```ts
import * as scorecard from "@nodesecure/ossf-scorecard-sdk";

const data = await scorecard.result("NodeSecure/scanner");
console.log(data);
```

You can provide either **GitHub** (`github.com`), **GitHub Enterprise Server (GHES)** (`github.corp.com`) or **GitLab** (`gitlab.com`) platform with the options payload:

```ts
const data = await scorecard.result("gitlab-org/gitlab-ui", {
  platform: "gitlab.com", // default to github.com
});
console.log(data);
```

You can provide a NPM library:
```ts
const data = await scorecard.result("@nodesecure/scanner");
console.log(data);
```

You can disable `resolveOnNpmRegistry` option which is `true` by default.

> [!TIP]
> You can disable version control resolve when you are sure the given repository is well formatted using `resolveOnVersionControl: false`.
> This can save you from GitHub/GitLab rate limit when working with lots of repositories.

```ts
const data = await scorecard.result("NodeSecure/scanner", {
  resolveOnNpmRegistry: false, // default to true
});
console.log(data);
```
Options are described with the following TypeScript interface:

```ts
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
```

## API

### result(repository: string, options?: IResultOptions): Promise< ScorecardResult >

> [!TIP]
> You can use `GITHUB_TOKEN` environment variable to avoid rate-limit when `resolveOnVersionControl` is true.

Return the OpenSSF ScorecardResult for a given organization and repository.

The response is typed using the following set of types:

```ts
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
```

### badge(repository: string, options?: IBadgeOptions): Promise< BadgeResult >

Return a string URL to the badge image of a given organization and repository.

The badge method has an additional `style` options.

```ts
export interface IBadgeOptions extends IResultOptions {
  /**
   * Style to render the badge
   *
   * @default flat
   */
  style?: "plastic" | "flat" | "flat-square" | "for-the-badge" | "social";
}
```

Then the response is described by the `BadgeResult` interface:

```ts
export interface BadgeResult {
  /**
   * HTTPS link to shields.io
   *
   * @example
   * https://img.shields.io/ossf-scorecard/github.com/NodeSecure/scanner?label=openssf%20scorecard&style=flat
   */
  image: string;
  /**
   * HTML SVG balise
   */
  svg: string;
}
```

## Contributors ✨

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-5-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://www.linkedin.com/in/thomas-gentilhomme/"><img src="https://avatars.githubusercontent.com/u/4438263?v=4?s=100" width="100px;" alt="Gentilhomme"/><br /><sub><b>Gentilhomme</b></sub></a><br /><a href="https://github.com/NodeSecure/ossf-scorecard-sdk/commits?author=fraxken" title="Code">💻</a> <a href="https://github.com/NodeSecure/ossf-scorecard-sdk/pulls?q=is%3Apr+reviewed-by%3Afraxken" title="Reviewed Pull Requests">👀</a> <a href="#security-fraxken" title="Security">🛡️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/fabnguess"><img src="https://avatars.githubusercontent.com/u/72697416?v=4?s=100" width="100px;" alt="Kouadio Fabrice Nguessan"/><br /><sub><b>Kouadio Fabrice Nguessan</b></sub></a><br /><a href="https://github.com/NodeSecure/ossf-scorecard-sdk/commits?author=fabnguess" title="Code">💻</a> <a href="https://github.com/NodeSecure/ossf-scorecard-sdk/commits?author=fabnguess" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/PierreDemailly"><img src="https://avatars.githubusercontent.com/u/39910767?v=4?s=100" width="100px;" alt="PierreDemailly"/><br /><sub><b>PierreDemailly</b></sub></a><br /><a href="https://github.com/NodeSecure/ossf-scorecard-sdk/commits?author=PierreDemailly" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/abbesAlexandre"><img src="https://avatars.githubusercontent.com/u/34767221?v=4?s=100" width="100px;" alt="yurifa"/><br /><sub><b>yurifa</b></sub></a><br /><a href="https://github.com/NodeSecure/ossf-scorecard-sdk/commits?author=abbesAlexandre" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/LouisAntoninLesieur"><img src="https://avatars.githubusercontent.com/u/170421915?v=4?s=100" width="100px;" alt="Louis-Antonin Lesieur"/><br /><sub><b>Louis-Antonin Lesieur</b></sub></a><br /><a href="https://github.com/NodeSecure/ossf-scorecard-sdk/commits?author=LouisAntoninLesieur" title="Code">💻</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

## License

MIT
