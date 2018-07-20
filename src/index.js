import { ApolloClient } from "apollo-client";
import { HttpLink } from "apollo-link-http";
import { ApolloLink } from "apollo-link";
import { withClientState } from "apollo-link-state";
import { InMemoryCache } from "apollo-cache-inmemory";
import gql from "graphql-tag";

function log(thing) {
  var log = document.getElementById("log");
  log.innerText = log.innerText + "\n" + thing;
}

var cache = new InMemoryCache();

var stateLink = withClientState({
  cache,
  resolvers: {
    Query: {
      example: (_1, _2, { cache }) => {
        log("Simple query cache miss");
        return true;
      }
    },
    Droid: {
      isSelected: (_1, _2, _3) => {
        log("Mixed query cache miss");
        return true;
      }
    }
  }
});

var httpLink = new HttpLink({
  uri: "https://mpjk0plp9.lp.gql.zone/graphql"
});

var client = new ApolloClient({
  link: ApolloLink.from([stateLink, httpLink]),
  cache
});

function runQuery(name, query) {
  client
    .query({ query })
    .then(value => log(name + ": " + JSON.stringify(value.data, null, 2)))
    .catch(error => log(name + ": Error: " + JSON.stringify(error, null, 2)));
}

runQuery(
  "Simple query",
  gql`
    {
      droid(id: "2000") {
        name
      }
      example @client
    }
  `
);

setTimeout(() => {
  runQuery(
    "Mixed query",
    gql`
      {
        droid(id: "2000") {
          name
          isSelected @client
        }
      }
    `
  );
}, 3000);
