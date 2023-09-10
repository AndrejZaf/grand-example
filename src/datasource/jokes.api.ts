import { RESTDataSource } from "@apollo/datasource-rest";
import { GraphQLError } from "graphql";

export class JokeAPI extends RESTDataSource {
  override baseURL = "https://api.chucknorris.io/jokes/random";

  async getJoke(): Promise<any> {
    throw new GraphQLError("JOKE_NOT_FOUND");
    return this.get("");
  }
}
