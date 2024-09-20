const API_URL = "https://api.oejp-kraken.energy/v1/graphql/";

export const requestGraphql = async <T>({
  query,
  variables,
  headers,
}: {
  query: string;
  variables?: Record<string, unknown>;
  headers?: Record<string, string>;
}) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...headers,
    },
    body: JSON.stringify({
      query: query.trim(),
      variables,
    }),
  });
  return await response.json() as Promise<{ data: T }>;
};
