"use client"

import { useQuery } from "@tanstack/react-query"

export interface TradingEvent {
  id: string
  user: string
  size: string
  price: string
  side: string
  blockTimestamp: string
  transactionHash: string
}

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "http://localhost:8080/v1/graphql"
const HASURA_ADMIN_SECRET = process.env.NEXT_PUBLIC_HASURA_ADMIN_SECRET

const QUERY = `
  query GetTradingEvents($user: String, $limit: Int = 50, $offset: Int = 0) {
    tradingEvents(
      where: { user: { _eq: $user } }
      order_by: { blockTimestamp: desc }
      limit: $limit
      offset: $offset
    ) {
      id
      user
      size
      price
      side
      blockTimestamp
      transactionHash
    }
  }
`

async function fetchTradingEvents(vars: { user?: string; limit: number; offset: number }) {
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(HASURA_ADMIN_SECRET ? { "X-Hasura-Admin-Secret": HASURA_ADMIN_SECRET } : {}),
    },
    body: JSON.stringify({ query: QUERY, variables: vars }),
  })
  if (!res.ok) throw new Error(`GraphQL error: ${res.status}`)
  const json = await res.json()
  if (json.errors) throw new Error(json.errors[0]?.message || "GraphQL query failed")
  return json.data as { tradingEvents: TradingEvent[] }
}

export function useTradingEvents(options?: { user?: string; limit?: number; offset?: number; refetchMs?: number }) {
  const { user, limit = 50, offset = 0, refetchMs = 5000 } = options || {}
  const lower = user?.toLowerCase()

  const query = useQuery({
    queryKey: ["tradingEvents", lower, limit, offset],
    queryFn: () => fetchTradingEvents({ user: lower, limit, offset }),
    refetchInterval: refetchMs,
  })

  return {
    events: query.data?.tradingEvents ?? [],
    loading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  }
}
