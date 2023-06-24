// Import Node.js Dependencies
import assert from "node:assert";
import { after, afterEach, before, beforeEach, describe, it } from "node:test";

// Import Third-party Dependencies
import Undici, { Interceptable } from "undici";
import is from "@slimio/is";
import * as npmRegistrySdk from "@nodesecure/npm-registry-sdk";

// Import Internal Dependencies
import * as scorecard from "../src/index.js";

// CONSTANTS
const kDefaultRepository = "NodeSecure/scanner";
const kOpenSSFScorecardRestApi = "https://api.securityscorecards.dev";
const kNpmApi = "https://registry.npmjs.org";

const kMockHttpAgent = new Undici.MockAgent({
  connections: 2
});
const kOriginalHttpDispatcher = Undici.getGlobalDispatcher();

function npmApiExpectedResponse(repository: string): any {
  return () => {
    return {
      "dist-tags": { latest: "1.0.0" },
      versions: { "1.0.0": { repository } }
    };
  };
}

describe("#result() UT", () => {
  before(() => {
    kMockHttpAgent.disableNetConnect();
    Undici.setGlobalDispatcher(kMockHttpAgent);
    npmRegistrySdk.setHttpAgent(kMockHttpAgent);
  });

  after(() => {
    kMockHttpAgent.enableNetConnect();
    Undici.setGlobalDispatcher(kOriginalHttpDispatcher);
  });

  let ossfScorecardClient: Interceptable;
  let npmClient: Interceptable;

  beforeEach(() => {
    ossfScorecardClient = kMockHttpAgent.get(kOpenSSFScorecardRestApi);
    npmClient = kMockHttpAgent.get(kNpmApi);
  });

  afterEach(async() => {
    await ossfScorecardClient.close();
    await npmClient.close();
  });

  it("must return the ScorecardResult for a given organization and repository", async() => {
    const expectedResponse = { foo: "bar" };
    ossfScorecardClient
      .intercept({
        method: "GET",
        path: (url) => url.startsWith(getPath(kDefaultRepository))
      })
      .reply(200, expectedResponse);
    npmClient
      .intercept({ path: `/${kDefaultRepository}`, method: "GET" })
      .reply(200, npmApiExpectedResponse(kDefaultRepository), { headers: { "content-type": "application/json" } });

    const result = await scorecard.result(kDefaultRepository);
    assert.deepEqual(result, expectedResponse);
  });

  it("should throw an error for an unknown repository", async() => {
    const expectedRepository = "NodeSecure/foobar";
    ossfScorecardClient
      .intercept({
        method: "GET",
        path: (url) => url.startsWith(getPath(expectedRepository))
      })
      .reply(404);
    npmClient
      .intercept({
        method: "GET",
        path: `/${expectedRepository}`
      })
      .reply(200, npmApiExpectedResponse(expectedRepository), { headers: { "content-type": "application/json" } });

    await assert.rejects(
      scorecard.result(expectedRepository),
      {
        name: "Error",
        message: "Not Found"
      }
    );
  });
});

describe("#result() FT", () => {
  it("should return the ScorecardResult for NodeSecure/scanner", async() => {
    const result = await scorecard.result(kDefaultRepository);

    assert.equal(is.plainObject(result), true);
    assert.equal(result.repo.name, `github.com/${kDefaultRepository}`);
    assert.deepStrictEqual(
      Object.keys(result).sort(),
      ["date", "repo", "scorecard", "score", "checks"].sort()
    );
  });

  it("should return the ScorecardResult for nodesecure/scanner", async() => {
    const result = await scorecard.result(kDefaultRepository.toLowerCase());

    assert.equal(is.plainObject(result), true);
    assert.equal(result.repo.name, `github.com/${kDefaultRepository}`);
    assert.deepStrictEqual(
      Object.keys(result).sort(),
      ["date", "repo", "scorecard", "score", "checks"].sort()
    );
  });

  it("should return the ScorecardResult for @nodesecure/scanner", async() => {
    const result = await scorecard.result(`@${kDefaultRepository.toLowerCase()}`);

    assert.equal(is.plainObject(result), true);
    assert.equal(result.repo.name, `github.com/${kDefaultRepository}`);
    assert.deepStrictEqual(
      Object.keys(result).sort(),
      ["date", "repo", "scorecard", "score", "checks"].sort()
    );
  });
});

function getPath(repository: string): string {
  return `/projects/github.com/${repository}`;
}
