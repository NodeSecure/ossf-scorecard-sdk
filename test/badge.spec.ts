// Import Node.js Dependencies
import assert from "node:assert";
import { after, afterEach, before, beforeEach, describe, it } from "node:test";

// Import Third-party Dependencies
import {
  MockAgent,
  setGlobalDispatcher,
  getGlobalDispatcher,
  type Interceptable
} from "@openally/httpie";
import isSvg from "is-svg";
import is from "@slimio/is";

// Import Internal Dependencies
import * as scorecard from "../src/index.ts";

// CONSTANTS
const kDefaultRepository = "NodeSecure/scanner";
const kOpenSSFScorecardRestApi = "https://api.securityscorecards.dev";

const kMockHttpAgent = new MockAgent();
const kOriginalHttpDispatcher = getGlobalDispatcher();

describe("#badge() UT", () => {
  before(() => {
    kMockHttpAgent.disableNetConnect();
    setGlobalDispatcher(kMockHttpAgent);
  });

  after(() => {
    kMockHttpAgent.enableNetConnect();
    setGlobalDispatcher(kOriginalHttpDispatcher);
  });

  let client: Interceptable;
  beforeEach(() => {
    client = kMockHttpAgent.get(kOpenSSFScorecardRestApi);
  });

  afterEach(async() => {
    await client.close();
  });

  it("must return the BadgeResult for a given organization and repository", async() => {
    const expectedData = {
      svg: "foobar",
      image: "https://api.securityscorecards.dev/projects/github.com/NodeSecure/scanner/badge?style=flat"
    };
    client
      .intercept({
        method: "GET",
        path: (url) => url.startsWith(getPath(kDefaultRepository))
      })
      .reply(200, expectedData.svg);

    const data = await scorecard.badge(kDefaultRepository);
    assert.deepEqual(data, expectedData);
  });
});

describe("#badge() FT", () => {
  it("should return the BadgeResult for NodeSecure/scanner", async() => {
    const result = await scorecard.badge(kDefaultRepository);

    assert.equal(is.plainObject(result), true);
    assert.equal(isSvg(result.svg), true);

    const imageUrl = new URL(result.image);
    assert.strictEqual(imageUrl.origin, "https://img.shields.io");
  });

  it("should throw an error for an unknown repository", async() => {
    await assert.rejects(
      scorecard.badge("NodeSecure/foobar"),
      {
        name: "Error",
        message: "Invalid repo path"
      }
    );
  });
});

function getPath(repository: string): string {
  return `/projects/github.com/${repository}/badge`;
}
