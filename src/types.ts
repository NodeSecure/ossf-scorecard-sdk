// Theses interfaces are used internally by unexposed functions, theses are not supposed
// to be exported / documented.

export interface GitLabProject {
  last_activity_at: string;
  description: string;
  container_registry_enabled: boolean;
  archived: boolean;
  avatar_url: string;
  creator_id: number;
  created_at: string;
  default_branch: string;
  import_error: string;
  http_url_to_repo: string;
  forks_count: number;
  id: number;
  issues_enabled: boolean;
  import_status: string;
  jobs_enabled: boolean;
  name: string;
  merge_requests_enabled: boolean;
  name_with_namespace: string;
  only_allow_merge_if_pipeline_succeeds?: boolean | null;
  only_allow_merge_if_all_discussions_are_resolved?: boolean | null;
  open_issues_count: number;
  public_jobs: boolean;
  path_with_namespace: string;
  path: string;
  permissions: GitHubPermissions;
  runners_token: string;
  request_access_enabled: boolean;
  shared_runners_enabled: boolean;
  ssh_url_to_repo: string;
  snippets_enabled: boolean;
  star_count: number;
  tag_list: string[];
  web_url: string;
  wiki_enabled: boolean;
}

export interface GitHubRepository {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  owner: GitHubUser;
  private: boolean;
  html_url: string;
  description: string | null;
  fork: boolean;
  url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string | null;
  homepage: string | null;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  forks_count: number;
  open_issues_count: number;
  default_branch: string;
  archived: boolean;
  disabled: boolean;
  visibility: string;
  license: GitHubLicense | null;
  permissions: GitHubPermissions;
}

interface GitHubUser {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
}

interface GitHubLicense {
  key: string;
  name: string;
  spdx_id: string;
  url: string;
  node_id: string;
}

interface GitHubPermissions {
  admin: boolean;
  push: boolean;
  pull: boolean;
}
