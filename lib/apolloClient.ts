import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client"

const GRAPHQL_URI = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "http://localhost:8080/v1/graphql"
const HASURA_ADMIN_SECRET = process.env.NEXT_PUBLIC_HASURA_ADMIN_SECRET

const link = new HttpLink({
  uri: GRAPHQL_URI,
  headers: HASURA_ADMIN_SECRET ? { "X-Hasura-Admin-Secret": HASURA_ADMIN_SECRET } : undefined,
})

const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
})

export default client
