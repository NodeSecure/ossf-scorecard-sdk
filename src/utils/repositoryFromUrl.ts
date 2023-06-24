// https://docs.npmjs.com/cli/v9/configuring-npm/package-json#repository
export function repositoryFromUrl(url: string): string {
  if (url.startsWith("gist:") || url.includes("gist.github.com")) {
    throw new Error("Cannot get repository from a gist url");
  }

  if (url.startsWith("github:") || url.startsWith("bitbucket:") || url.startsWith("gitlab:")) {
    return url.split(":")[1];
  }

  if (!url.includes("http") && !url.includes(".git")) {
    return url;
  }

  const formattedUrl = url.replace("http:", "https:");
  const { pathname } = new URL(formattedUrl);

  if (pathname.endsWith(".git")) {
    return pathname.slice(1).replace(".git", "");
  }

  return pathname;
}
