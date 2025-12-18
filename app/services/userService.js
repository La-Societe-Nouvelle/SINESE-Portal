// User Service - Client-side API calls for user profile management

/**
 * Fetch current user profile data
 * @returns {Promise<Object>} User profile data
 */
export async function getUserProfile() {
  const res = await fetch("/api/user/profile", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Erreur lors de la récupération du profil.");
  }

  return await res.json();
}

/**
 * Update user profile information
 * @param {Object} profileData - { firstName, lastName, profile }
 * @returns {Promise<Object>} Response with success status
 */
export async function updateUserProfile(profileData) {
  const res = await fetch("/api/user/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profileData),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Erreur lors de la mise à jour du profil.");
  }

  return await res.json();
}

/**
 * Update user password
 * @param {Object} passwordData - { currentPassword, newPassword }
 * @returns {Promise<Object>} Response with success status
 */
export async function updateUserPassword(passwordData) {
  const res = await fetch("/api/user/password", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(passwordData),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Erreur lors de la mise à jour du mot de passe.");
  }

  return await res.json();
}
