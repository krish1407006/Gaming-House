import { clerkClient } from "@clerk/express";

export const initializeSuperAdmin = async () => {
  try {
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;

    if (!superAdminEmail) {
      console.log("⚠️  No SUPER_ADMIN_EMAIL found in environment variables");
      return;
    }

    const users = await clerkClient.users.getUserList({
      emailAddress: [superAdminEmail],
    });

    if (users.data.length === 0) {
      console.log(`❌ No user found with email: ${superAdminEmail}`);
      return;
    }

    const user = users.data[0];

    if (user.publicMetadata?.role === "admin") {
      console.log(`✅ User ${superAdminEmail} is already an admin`);
      return;
    }

    await clerkClient.users.updateUser(user.id, {
      publicMetadata: {
        ...user.publicMetadata,
        role: "admin",
        isFounder: true,
        promotedAt: new Date().toISOString(),
      },
    });

    console.log(`🎉 Successfully promoted ${superAdminEmail} to admin!`);
    console.log(`   User ID: ${user.id}`);
    console.log(`   Name: ${user.firstName} ${user.lastName}`);
  } catch (error) {
    console.error("❌ Error initializing super admin:", error);
  }
};

export const checkSuperAdmin = async () => {
  try {
    if (
      process.env.NODE_ENV === "development" &&
      process.env.SUPER_ADMIN_EMAIL
    ) {
      console.log("🔍 Checking for super admin...");
      await initializeSuperAdmin();
    }
  } catch (error) {
    console.error("Error checking super admin:", error);
  }
};
