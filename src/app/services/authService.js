// Auth endpoint (separate from GraphQL)
const AUTH_ENDPOINT = "https://learn.reboot01.com/api/auth/signin";

/**
 * Authenticates a user and stores the JWT token
 * @param {string} identifier - Username or email
 * @param {string} password - User's password
 * @returns {string} The JWT token
 */
export async function loginUser(identifier, password) {
    // Encode credentials as Base64 for Basic Auth
    // btoa("johndoe:pass123") → "am9obmRvZTpwYXNzMTIz"
    const credentials = btoa(`${identifier}:${password}`);

    // Send the login request
    const response = await fetch(AUTH_ENDPOINT, {
        method: "POST",
        headers: {
            "Authorization": `Basic ${credentials}`,
            "Content-Type": "application/json",
        },
    });

    // If the server returns an error status (401, 403, etc.)
    if (!response.ok) {
        throw new Error("Invalid credentials");
    }

    // The response body IS the JWT token (a string)
    const token = await response.json();

    // Save it to localStorage so graphClient.js can use it later
    localStorage.setItem("jwt_token", token);

    return token;
}

/**
 * Logs the user out by clearing the token
 */
export function logoutUser() {
    localStorage.removeItem("jwt_token");
    window.location.href = "/";
}

/**
 * Checks if a user is currently logged in
 * @returns {boolean}
 */
export function isLoggedIn() {
    const token = localStorage.getItem("jwt_token");
    if (!token) return false;

    try {
        // JWT has 3 parts: header.payload.signature
        // Decode the payload (middle part)
        const payload = JSON.parse(atob(token.split(".")[1]));

        // Check if expired (exp is in seconds, Date.now() is in ms)
        return payload.exp * 1000 > Date.now();
    } catch {
        // If the token can't be decoded, it's not valid
        return false;
    }
}