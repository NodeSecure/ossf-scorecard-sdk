import { ConfigSDK } from "./utils/types";
import { fetch } from "undici";
import { config } from "process";

export abstract class Base {
  private commit: string;
  private baseUrl: string;

  constructor(config: ConfigSDK) {
    this.commit = config.commit || "";
    this.baseUrl =
      config.baseUrl || "https://api.securityscorecards.dev/projects";
  }

  protected invoke(endpoint: string, body?: RequestInit) {
    const url = `${this.baseUrl}${endpoint}`;

    fetch(url, body).then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(response.statusText);
      }
    });
  }
}
