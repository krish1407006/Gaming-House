import { clerkClient } from "@clerk/express";

export const getUserById = async (userId) => {
  try {
    const user = await clerkClient.users.getUser(userId);
    return {
      success: true,
      data: {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`.trim(),
        imageUrl: user.imageUrl,
        createdAt: user.createdAt,
        lastSignInAt: user.lastSignInAt,
        emailVerified:
          user.emailAddresses[0]?.verification?.status === "verified",
      },
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    return {
      success: false,
      error: "Failed to fetch user information",
    };
  }
};

export const getUserProfile = async (userId) => {
  try {
    const user = await clerkClient.users.getUser(userId);
    return {
      success: true,
      data: {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`.trim(),
        imageUrl: user.imageUrl,
        createdAt: user.createdAt,
        lastSignInAt: user.lastSignInAt,
        emailVerified:
          user.emailAddresses[0]?.verification?.status === "verified",
        phoneNumbers: user.phoneNumbers.map((phone) => ({
          number: phone.phoneNumber,
          verified: phone.verification?.status === "verified",
        })),
        externalAccounts: user.externalAccounts.map((account) => ({
          provider: account.provider,
          emailAddress: account.emailAddress,
        })),
        publicMetadata: user.publicMetadata,
        privateMetadata: user.privateMetadata,
      },
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return {
      success: false,
      error: "Failed to fetch user profile",
    };
  }
};

export const updateUserMetadata = async (userId, updates) => {
  try {
    const updateData = {};

    if (updates.publicMetadata) {
      updateData.publicMetadata = updates.publicMetadata;
    }

    if (updates.privateMetadata) {
      updateData.privateMetadata = updates.privateMetadata;
    }

    const updatedUser = await clerkClient.users.updateUser(userId, updateData);

    return {
      success: true,
      data: {
        id: updatedUser.id,
        publicMetadata: updatedUser.publicMetadata,
        privateMetadata: updatedUser.privateMetadata,
      },
    };
  } catch (error) {
    console.error("Error updating user metadata:", error);
    return {
      success: false,
      error: "Failed to update user metadata",
    };
  }
};

export const getUsers = async (options = {}) => {
  try {
    const { limit = 10, offset = 0, emailAddress } = options;

    const queryParams = {
      limit,
      offset,
    };

    if (emailAddress) {
      queryParams.emailAddress = [emailAddress];
    }

    const users = await clerkClient.users.getUserList(queryParams);

    return {
      success: true,
      data: users.data.map((user) => ({
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`.trim(),
        imageUrl: user.imageUrl,
        createdAt: user.createdAt,
        lastSignInAt: user.lastSignInAt,
        emailVerified:
          user.emailAddresses[0]?.verification?.status === "verified",
      })),
      totalCount: users.totalCount,
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      success: false,
      error: "Failed to fetch users",
    };
  }
};

export const banUser = async (userId, banned = true) => {
  try {
    const updatedUser = await clerkClient.users.updateUser(userId, {
      banned,
    });

    return {
      success: true,
      data: {
        id: updatedUser.id,
        banned: updatedUser.banned,
      },
    };
  } catch (error) {
    console.error("Error updating user ban status:", error);
    return {
      success: false,
      error: "Failed to update user ban status",
    };
  }
};

export const deleteUser = async (userId) => {
  try {
    await clerkClient.users.deleteUser(userId);

    return {
      success: true,
      message: "User deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      success: false,
      error: "Failed to delete user",
    };
  }
};

export const isUserAdmin = async (userId) => {
  try {
    const user = await clerkClient.users.getUser(userId);
    
    // Get admin emails from environment variable
    const adminEmailsString = process.env.ADMIN_EMAILS || "";
    const ADMIN_EMAILS = adminEmailsString.split(",").map(email => email.trim()).filter(email => email);
    
    // Check if user email is in admin emails list
    const userEmail = user.emailAddresses?.[0]?.emailAddress;
    if (userEmail && ADMIN_EMAILS.includes(userEmail)) {
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
};

export const setUserAdminStatus = async (userId, isAdmin = true) => {
  try {
    const currentUser = await clerkClient.users.getUser(userId);
    const updatedPublicMetadata = {
      ...currentUser.publicMetadata,
      role: isAdmin ? "admin" : "user",
    };

    const updatedUser = await clerkClient.users.updateUser(userId, {
      publicMetadata: updatedPublicMetadata,
    });

    return {
      success: true,
      data: {
        id: updatedUser.id,
        role: updatedUser.publicMetadata?.role,
      },
    };
  } catch (error) {
    console.error("Error updating admin status:", error);
    return {
      success: false,
      error: "Failed to update admin status",
    };
  }
};
