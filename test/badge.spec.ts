// Import Third-party Dependencies
import assert from 'node:assert';
import { after, afterEach, before, beforeEach, describe, it } from 'node:test'
import Undici, { Interceptable } from 'undici';
import isSvg from "is-svg";
import is from "@slimio/is";

// Import Internal Dependencies
import * as scorecard from "../src/index.js";

// CONSTANTS
const kDefaultRepository = "NodeSecure/scanner";
const kOpenSSFScorecardRestApi = "https://api.securityscorecards.dev";

const kMockHttpAgent = new Undici.MockAgent();
const kOriginalHttpDispatcher = Undici.getGlobalDispatcher();

describe("#badge() UT", () => {
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
    try {
      await scorecard.badge("NodeSecure/foobar");
      assert.strictEqual(true,false, "the test should never execute this assertion");
    }
    catch (e) {
      assert(e.message, "Invalid repo path");
    }
  });
});


function getPath(repository: string): string {
  return `/projects/github.com/${repository}/badge`;
}
