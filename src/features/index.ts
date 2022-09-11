import { json } from "stream/consumers";
import { Base } from "../base";
import { PublishRepo, Uri } from "../utils/types";

export default class OpenSSF extends Base {
  getScorecardResultRepository(uri: Uri) {
    const endpoint = OpenSSF.builURI(uri);
    return this.invoke(endpoint);
  }

  createRepository(uri: Uri, newRepository: PublishRepo) {
    const endpoint = OpenSSF.builURI(uri);
    return this.invoke(endpoint, {
      method: "POST",
      body: JSON.stringify(newRepository),
    });
  }

  static builURI(uri: Uri): string {
    return `${uri.platform}/${uri.org}/${uri.repo}`;
  }
}
