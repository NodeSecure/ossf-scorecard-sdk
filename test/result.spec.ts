// Import Node.js Dependencies
import assert from "node:assert";
import { after, afterEach, before, beforeEach, describe, it } from "node:test";

// Import Third-party Dependencies
import { MockAgent, getGlobalDispatcher, setGlobalDispatcher, Interceptable } from "@myunisoft/httpie";
import is from "@slimio/is";
import * as npmRegistrySdk from "@nodesecure/npm-registry-sdk";
import { tspl, type Plan } from "@matteo.collina/tspl";

// Import Internal Dependencies
import * as scorecard from "../src/index.js";

// CONSTANTS
const kDefaultRepository = "NodeSecure/scanner";
const kOpenSSFScorecardRestApi = "https://api.securityscorecards.dev";
const kNpmApi = "https://registry.npmjs.org";

const kMockHttpAgent = new MockAgent({
  connections: 2
});
const kOriginalHttpDispatcher = getGlobalDispatcher();

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
    setGlobalDispatcher(kMockHttpAgent);
    npmRegistrySdk.setHttpAgent(kMockHttpAgent);
  });

  after(() => {
    kMockHttpAgent.enableNetConnect();
    setGlobalDispatcher(kOriginalHttpDispatcher);
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
      .reply(200, expectedResponse, { headers: { "content-type": "application/json" } });
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
        name: "HttpieOnHttpError",
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

  it("should return the ScorecardResult for NodeSecure/scanner when not resolving on GitHub", async() => {
    const result = await scorecard.result("NodeSecure/scanner", {
      resolveOnVersionControl: false,
      resolveOnNpmRegistry: false
    });

    assert.equal(is.plainObject(result), true);
    assert.equal(result.repo.name, `github.com/${kDefaultRepository}`);
    assert.deepStrictEqual(
      Object.keys(result).sort(),
      ["date", "repo", "scorecard", "score", "checks"].sort()
    );
  });

  it("should throw for nodesecure/scanner when not resolving on GitHub", async() => {
    // throws because the repository is malformed (should be exactly NodeSecure/scanner)
    await assert.rejects(async() => await scorecard.result("nodesecure/scanner", {
      resolveOnVersionControl: false,
      resolveOnNpmRegistry: false
    }), {
      name: "HttpieOnHttpError",
      message: "Not Found"
    });
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

  it("should return the ScorecardResult for @nodesecure/scanner when not resolving version control", async() => {
    const result = await scorecard.result(`@${kDefaultRepository.toLowerCase()}`, { resolveOnVersionControl: false });

    assert.equal(is.plainObject(result), true);
    assert.equal(result.repo.name, `github.com/${kDefaultRepository}`);
    assert.deepStrictEqual(
      Object.keys(result).sort(),
      ["date", "repo", "scorecard", "score", "checks"].sort()
    );
  });

  it("should return the ScorecardResult for gitlab-org/gitlab-ui (GitLab)", async() => {
    const result = await scorecard.result("gitlab-org/gitlab-ui", { platform: "gitlab.com", resolveOnNpmRegistry: false });

    assert.equal(is.plainObject(result), true);
    assert.equal(result.repo.name, "gitlab.com/gitlab-org/gitlab-ui");
    assert.deepStrictEqual(
      Object.keys(result).sort(),
      ["date", "repo", "scorecard", "score", "checks"].sort()
    );
  });

  it("should return the ScorecardResult for @gitlab/ui (npm lib hosted on GitLab)", async() => {
    const result = await scorecard.result("@gitlab/ui", { platform: "gitlab.com" });

    assert.equal(is.plainObject(result), true);
    assert.equal(result.repo.name, "gitlab.com/gitlab-org/gitlab-ui");
    assert.deepStrictEqual(
      Object.keys(result).sort(),
      ["date", "repo", "scorecard", "score", "checks"].sort()
    );
  });

  it("should throw when given a package and npm resolve is falsy", async() => {
    await assert.rejects(async() => scorecard.result("@unknown-package/for-sure", { resolveOnNpmRegistry: false }), {
      name: "Error",
      message: "Invalid repository, cannot find it on github"
    });
  });

  it("should throw when given a package and npm resolve is falsy (GitLab)", async() => {
    await assert.rejects(async() => scorecard.result("@unknown-package/for-sure", {
      platform: "gitlab.com",
      resolveOnNpmRegistry: false
    }), {
      name: "Error",
      message: "Invalid repository, cannot find it on gitlab"
    });
  });

  it("should throw when given an unknown npm package", async() => {
    await assert.rejects(async() => await scorecard.result("@unknown-package/for-sure", { resolveOnNpmRegistry: true }), {
      name: "Error",
      message: "Invalid repository, cannot find it on github or NPM registry"
    });
  });

  it("should throw when given an unknown npm package (GitLab)", async() => {
    await assert.rejects(async() => await scorecard.result("@unknown-package/for-sure", {
      platform: "gitlab.com",
      resolveOnNpmRegistry: true
    }), {
      name: "Error",
      message: "Invalid repository, cannot find it on gitlab or NPM registry"
    });
  });

  it("Should return a specific npm package ScorecardResult that does not have the repository set but has a homepage", async() => {
    const result = await scorecard.result(`@topcli/prompts`, { resolveOnVersionControl: false, version: "1.9.0" });

    assert.equal(is.plainObject(result), true);
    assert.equal(result.repo.name, `github.com/TopCli/prompts`);
    assert.deepStrictEqual(
      Object.keys(result).sort(),
      ["date", "repo", "scorecard", "score", "checks"].sort()
    );
  });

  it("Should throws when the given package version does not exists", async(testContext) => {
    const tsplAssert: Plan = tspl(testContext, { plan: 3 });

    // We cannot use assert.rejects to test Error.cause
    try {
      await scorecard.result(`@topcli/prompts`, {
        resolveOnVersionControl: false,
        version: "99999.0.0"
      });
    }
    catch (error) {
      tsplAssert.strictEqual(error.name, "Error");
      tsplAssert.strictEqual(error.message, "Invalid repository, cannot find it on NPM registry");
      tsplAssert.match(error.cause.message, /^Cannot find the version '99999.0.0' of the given repository/);
    }
  });
});

function getPath(repository: string): string {
  return `/projects/github.com/${repository}`;
}
