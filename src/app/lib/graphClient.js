// The single GraphQL endpoint for all data queries
const GRAPHQL_ENDPOINT = "https://learn.reboot01.com/api/graphql-engine/v1/graphql";

/**
 * Sends a GraphQL query to the Reboot01 API
 * @param {string} query - The GraphQL query string
 * @param {object} variables - Optional variables for the query
 * @returns {object} The data from the response
 */
export async function graphqlRequest(query, variables = {}) {
  // Get the JWT token from localStorage (saved during login)
  const token = localStorage.getItem("jwt_token");

  // Send the POST request
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  // Parse the JSON response
  const result = await response.json();

  // GraphQL always returns 200, so check for errors in the body
  if (result.errors) {
    // Check if it's an auth error (expired/invalid token)
    const isAuthError = result.errors.some(
      (e) =>
        e.message.includes("JWT") ||
        e.message.includes("unauthorized") ||
        e.message.includes("Malformed")
    );

    // If auth error, clear token and redirect to login
    if (isAuthError) {
      localStorage.removeItem("jwt_token");
      window.location.href = "/";
      return;
    }

    // Otherwise, throw the error so the caller can handle it
    throw new Error(result.errors[0].message);
  }

  // Return just the data (not the wrapper)
  return result.data;
}