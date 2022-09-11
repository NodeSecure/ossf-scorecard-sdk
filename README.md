# ossf-scorecard-sdk

![version](https://img.shields.io/badge/dynamic/json.svg?url=https://raw.githubusercontent.com/NodeSecure/ossf-scorecard-sdk/master/package.json&query=$.version&label=Version)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/NodeSecure/ossf-scorecard-sdk/commit-activity)
[![mit](https://img.shields.io/github/license/Naereen/StrapDown.js.svg)](https://github.com/NodeSecure/ossf-scorecard-sdk/blob/master/LICENSE)

Node.js SDK for [OpenSSF scorecard](https://github.com/ossf/scorecard)

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

Basic usage example:

```ts
import * as scorecard from "@nodesecure/ossf-scorecard-sdk";

const data = await scorecard.result("NodeSecure/scanner");
console.log(data);
```

You can pass options to the result method `Result` as::

```ts
import * as scorecard from "@nodesecure/ossf-scorecard-sdk";

const data = await scorecard.result("NodeSecure/scanner", {
  platform: "gitlab.com", // default to github.com
});
console.log(data);
```

## API

The OpenSSFOptions is described by the following interface:
```ts
export interface OpenSSFOptions {
  /**
   * @description VCS platform. eg. github.com
   * @default github.com
   */
  platform?: string;
}
```

### result(repository: string, options?: OpenSSFOptions): Promise< ScorecardResult >
Return the OpenSSF ScorecardResult payload described by the following TS interface:

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

### result(repository: string, options?: OpenSSFOptions): Promise< string >
Return a string URL to the badge image.

## Contributors ✨

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-3-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

## License
MIT
