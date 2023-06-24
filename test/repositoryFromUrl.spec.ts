// Import Node.js Dependencies
import { describe, it } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { repositoryFromUrl } from "../src/utils/repositoryFromUrl.js";

describe("getRepositoryFromUrl()", () => {
  it("should return the repository given an url equal to the repository", () => {
    const url = "foo/bar";

    assert.strictEqual(repositoryFromUrl(url), url);
  });

  it("should return the repository given an url with 'github:' shortcut syntax", () => {
    const url = "github:foo/bar";

    assert.strictEqual(repositoryFromUrl(url), "foo/bar");
  });

  it("should return the repository given an url with 'bitbucket:' shortcut syntax", () => {
    const url = "gitlab:foo/bar";

    assert.strictEqual(repositoryFromUrl(url), "foo/bar");
  });

  it("should return the repository given an url with 'gitlab:' shortcut syntax", () => {
    const url = "bitbucket:foo/bar";

    assert.strictEqual(repositoryFromUrl(url), "foo/bar");
  });

  it("should return the repository given a classic (http) git url", () => {
    const url = "https://github.com/foo/bar.git";

    assert.strictEqual(repositoryFromUrl(url), "foo/bar");
  });

  it("should return the repository given a classic (https) git url", () => {
    const url = "https://github.com/foo/bar.git";

    assert.strictEqual(repositoryFromUrl(url), "foo/bar");
  });

  it("should throw given a gist (http) url", () => {
    const url = "http://gist.github.com/foo/bar";

    assert.throws(() => repositoryFromUrl(url), {
      message: "Cannot get repository from a gist url"
    });
  });

  it("should throw given a gist (https) url", () => {
    const url = "https://gist.github.com/foo/bar";

    assert.throws(() => repositoryFromUrl(url), {
      message: "Cannot get repository from a gist url"
    });
  });

  it("should throw given a gist url using 'gist:' shortcut syntax", () => {
    const url = "gist:foo/bar";

    assert.throws(() => repositoryFromUrl(url), {
      message: "Cannot get repository from a gist url"
    });
  });

  it("should return empty repository given an empty url", () => {
    assert.strictEqual(repositoryFromUrl(""), "");
  });
});

