import { RESTDataSource } from "@apollo/datasource-rest";

export class JokeAPI extends RESTDataSource {
  override baseURL = "https://api.chucknorris.io/jokes/random";

  async getJoke(): Promise<any> {
    return this.get("");
  }
}
