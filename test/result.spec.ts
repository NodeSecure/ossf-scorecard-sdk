// Import Third-party Dependencies
import { expect } from "chai";
import Undici, { Interceptable } from "undici";
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
    expect(result).to.deep.eq(expectedResponse);
  });

  it("should throw an error for an unknown repository", async() => {
    const expectedRepository = "NodeSecure/foobar";
    client
      .intercept({
        method: "GET",
        path: (url) => url.startsWith(getPath(expectedRepository))
      })
      .reply(404);

    try {
      await scorecard.result(expectedRepository);
      expect(true).to.equal(false, "the test should never execute this assertion");
    }
    catch (e) {
      expect(e.message, "Not Found");
    }
  });
});

describe("#result() UT", () => {
  it("should return the ScorecardResult for NodeSecure/scanner", async() => {
    const result = await scorecard.result(kDefaultRepository);

    expect(is.plainObject(result)).to.eq(true);
    expect(
      Object.keys(result).sort()
    ).to.deep.equal(["date", "repo", "scorecard", "score", "checks"].sort());
  });
});

function getPath(repository: string): string {
  return `/projects/github.com/${repository}`;
}
