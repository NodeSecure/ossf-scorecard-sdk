// https://docs.npmjs.com/cli/v9/configuring-npm/package-json#repository
export function repositoryFromUrl(url: string): string {
  try {
    const { protocol, host, href, pathname } = new URL(url);
    if (protocol === "gist:" || href.startsWith("gist") || host.startsWith("gist")) {
      throw new Error("Cannot get repository from a gist url");
    }

    if (pathname.startsWith("/")) {
      return pathname.slice(1).replace(".git", "");
    }

    return pathname.replace(".git", "");
  }
  catch (error) {
    if (error.code === "ERR_INVALID_URL") {
      return url;
    }

    throw error;
  }
}
