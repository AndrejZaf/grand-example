import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import neo4j from "neo4j-driver";
import { Neo4jGraphQL } from "@neo4j/graphql";
import { JokeAPI } from "./datasource/jokes.api.js";

const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  type Book {
    title: String
    author: String
  }

  type Joke @query(read: false, aggregate: false) @mutation(operations: []) {
    value: String
    created_at: String
  }

  type Query {
    joke: Joke!
  }
`;

const resolvers = {
  Query: {
    joke: async (_, __, { dataSources }) => {
      return dataSources.jokeAPI.getJoke();
    },
  },
};

const driver = neo4j.driver(
  "bolt://localhost:7687",
  neo4j.auth.basic("neo4j", "testtest")
);

const neoSchema = new Neo4jGraphQL({ typeDefs, driver, resolvers });

interface CustomContext {
  dataSources: {
    jokeAPI: JokeAPI;
  };
}

const server = new ApolloServer<CustomContext>({
  schema: await neoSchema.getSchema(),
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async () => {
    const { cache } = server;
    return {
      dataSources: {
        jokeAPI: new JokeAPI({ cache }),
      },
    };
  },
});

console.log(`🚀  Server ready at: ${url}`);
