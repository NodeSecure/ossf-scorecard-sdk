// Import Node.js Dependencies
import assert from "node:assert";

// Import Internal Dependencies
import { result, badge } from "../src/index.js";

// CONSTANTS
const kDefaultRepository = "NodeSecure/scanner";

describe("ossf-scorecard-sdk", () => {
  describe("#result()", () => {
    it("should return the Score of a repository", async() => {
      const { checks, date, repo, score, scorecard } = await result(
        kDefaultRepository
      );
      assert.ok(checks);
      assert.ok(date);
      assert.ok(repo);
      assert.ok(score);
      assert.ok(scorecard);
    });

    it("should throw an error for unknown repositories", async() => {
      try {
        await result("NodeSecure/scanners");
      }
      catch (e) {
        assert.equal(e.message, "The content requested could not be found");
      }
    });
  });

  describe("#badge()", () => {
    it("must return the value of the bage of a repository", async() => {
      const url = await badge(kDefaultRepository);
      assert.ok(url);
    });

    it("should throw an error for unknown repositories", async() => {
      try {
        await badge("NodeSecure/scanners");
      }
      catch (e) {
        assert.equal(e.message, "invalid repo path");
      }
    });
  });
});
