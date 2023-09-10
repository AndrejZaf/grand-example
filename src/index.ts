import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import neo4j from "neo4j-driver";
import { Neo4jGraphQL } from "@neo4j/graphql";
import { JokeAPI } from "./datasource/jokes.api.js";

const typeDefs = `#graphql
  type Book {
    id: ID! @id @unique
    title: String! @unique(constraintName: "unique_book_title")
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

await neoSchema.assertIndexesAndConstraints({ options: { create: true } });

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
