export type ConfigSDK = {
  commit?: string;
  baseUrl?: string;
};

export type PublishRepo = {
  accessToken: "string";
  branch: "string";
  result: "string";
};

export type Uri = {
  platform: string;
  org: string;
  repo: string;
};
