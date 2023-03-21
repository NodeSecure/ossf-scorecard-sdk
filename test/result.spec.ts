// Import Third-party Dependencies
import assert from "node:assert";
import Undici, { Interceptable } from "undici";
import { after, afterEach, before, beforeEach, describe, it } from "node:test";
import is from "@slimio/is";


// Import Internal Dependencies
import * as scorecard from "../src/index.js";

// CONSTANTS
const kDefaultRepository = "NodeSecure/scanner";
const kOpenSSFScorecardRestApi = "https://api.securityscorecards.dev";

const kMockHttpAgent = new Undici.MockAgent();
const kOriginalHttpDispatcher = Undici.getGlobalDispatcher();

describe("#result() UT", () => {
  before(() => {
    kMockHttpAgent.disableNetConnect();
    Undici.setGlobalDispatcher(kMockHttpAgent);
  });

  after(() => {
    kMockHttpAgent.enableNetConnect();
    Undici.setGlobalDispatcher(kOriginalHttpDispatcher);
  });

  let client: Interceptable;
  beforeEach(() => {
    client = kMockHttpAgent.get(kOpenSSFScorecardRestApi);
  });

  afterEach(async() => {
    await client.close();
  });

  it("must return the ScorecardResult for a given organization and repository", async() => {
    const expectedResponse = { foo: "bar" };
    client
      .intercept({
        method: "GET",
        path: (url) => url.startsWith(getPath(kDefaultRepository))
      })
      .reply(200, expectedResponse);

    const result = await scorecard.result(kDefaultRepository);
    assert.deepEqual(result, expectedResponse);
  });

  it("should throw an error for an unknown repository", async() => {
    const expectedRepository = "NodeSecure/foobar";
    client
      .intercept({
        method: "GET",
        path: (url) => url.startsWith(getPath(expectedRepository))
      })
      .reply(404);

    await assert.rejects(
      scorecard.result(expectedRepository),
      {
        name: "Error",
        message : "Not Found"
      }
    )
  });
});

describe("#result() UT", () => {
  it("should return the ScorecardResult for NodeSecure/scanner", async() => {
    const result = await scorecard.result(kDefaultRepository);

    assert.equal(is.plainObject(result), true);
    assert.deepStrictEqual(
      Object.keys(result).sort(),
      ["date", "repo", "scorecard", "score", "checks"].sort()
    );
  });
});

function getPath(repository: string): string {
  return `/projects/github.com/${repository}`;
}
