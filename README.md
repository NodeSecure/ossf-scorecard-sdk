<p align="center"><h1 align="center">
  ossf-scorecard-sdk
</h1>

<p align="center">
  Node.js SDK for <a href="https://github.com/ossf/scorecard">OpenSSF scorecard</a>
</p>

<p align="center">
    <a href="https://github.com/NodeSecure/ossf-scorecard-sdk">
        <img src="https://img.shields.io/badge/dynamic/json.svg?url=https://raw.githubusercontent.com/NodeSecure/ossf-scorecard-sdk/master/package.json&query=$.version&label=Version">
    </a>
    <a href="https://github.com/NodeSecure/ossf-scorecard-sdk">
        <img src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" alt="maintenance">
    </a>
    <a href="https://github.com/NodeSecure/ossf-scorecard-sdk">
        <img src="https://img.shields.io/github/license/mashape/apistatus.svg" alt="license">
    </a>
    <a href="https://github.com/NodeSecure/ossf-scorecard-sdk">
        <img src="https://img.shields.io/github/workflow/status/NodeSecure/ossf-scorecard-sdk/Node.js%20CI" alt="githubaction">
    </a>
</p>

## Requirements

- [Node.js](https://nodejs.org/en/) v16 or higher

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

You can also provide a custom `platform` with the **options** payload:

```ts
const data = await scorecard.result("NodeSecure/scanner", {
  platform: "gitlab.com", // default to github.com
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
  platform?: string;
}
```

## API

### result(repository: string, options?: IResultOptions): Promise< ScorecardResult >
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
[![All Contributors](https://img.shields.io/badge/all_contributors-2-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center"><a href="https://www.linkedin.com/in/thomas-gentilhomme/"><img src="https://avatars.githubusercontent.com/u/4438263?v=4?s=100" width="100px;" alt="Gentilhomme"/><br /><sub><b>Gentilhomme</b></sub></a><br /><a href="https://github.com/NodeSecure/ossf-scorecard-sdk/commits?author=fraxken" title="Code">💻</a> <a href="https://github.com/NodeSecure/ossf-scorecard-sdk/pulls?q=is%3Apr+reviewed-by%3Afraxken" title="Reviewed Pull Requests">👀</a> <a href="#security-fraxken" title="Security">🛡️</a></td>
      <td align="center"><a href="https://github.com/fabnguess"><img src="https://avatars.githubusercontent.com/u/72697416?v=4?s=100" width="100px;" alt="Kouadio Fabrice Nguessan"/><br /><sub><b>Kouadio Fabrice Nguessan</b></sub></a><br /><a href="https://github.com/NodeSecure/ossf-scorecard-sdk/commits?author=fabnguess" title="Code">💻</a> <a href="https://github.com/NodeSecure/ossf-scorecard-sdk/commits?author=fabnguess" title="Documentation">📖</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

## License
MIT
