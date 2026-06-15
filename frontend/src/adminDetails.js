// Admin Configuration
// Add admin email addresses here to grant admin access

export const ADMIN_EMAILS = [
  "krish14072006@gmail.com"
  // Added current user email
  // Add your email here to become admin
  // Add more admin emails here as needed
  // "admin2@example.com", 
  // "admin3@example.com",
  // "manager@company.com",
  // "superuser@domain.com",
];

// Admin roles that can be set in Clerk user metadata
export const ADMIN_ROLES = [
  "admin",
  "super_admin",
  "moderator"
];

/**
 * Check if a user is an admin based on email or role
 * @param {Object} user - Clerk user object
 * @returns {boolean} - True if user is admin
 */
export const isUserAdmin = (user) => {
  if (!user) return false;

  // Check if user has admin role in metadata
  const userRole = user?.publicMetadata?.role;
  if (userRole && ADMIN_ROLES.includes(userRole)) {
    return true;
  }

  // Check if user email is in admin emails list
  const userEmail = user?.emailAddresses?.[0]?.emailAddress;
  if (userEmail && ADMIN_EMAILS.includes(userEmail)) {
    return true;
  }

  return false;
};

/**
 * Get admin level based on role or email
 * @param {Object} user - Clerk user object
 * @returns {string} - Admin level (super_admin, admin, moderator, or null)
 */
export const getAdminLevel = (user) => {
  if (!isUserAdmin(user)) return null;

  const userRole = user?.publicMetadata?.role;
  if (userRole && ADMIN_ROLES.includes(userRole)) {
    return userRole;
  }

  // Default to 'admin' for email-based access
  return "admin";
};

/**
 * Add a new admin email to the list
 * Note: This is for development/testing. In production, manage this through environment variables or database
 * @param {string} email - Email to add
 */
export const addAdminEmail = (email) => {
  if (email && !ADMIN_EMAILS.includes(email)) {
    ADMIN_EMAILS.push(email);
    console.log(`Added admin email: ${email}`);
  }
};

/**
 * Remove an admin email from the list
 * @param {string} email - Email to remove
 */
export const removeAdminEmail = (email) => {
  const index = ADMIN_EMAILS.indexOf(email);
  if (index > -1) {
    ADMIN_EMAILS.splice(index, 1);
    console.log(`Removed admin email: ${email}`);
  }
};

export default {
  ADMIN_EMAILS,
  ADMIN_ROLES,
  isUserAdmin,
  getAdminLevel,
  addAdminEmail,
  removeAdminEmail
};