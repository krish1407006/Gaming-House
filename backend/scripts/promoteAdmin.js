import "dotenv/config";
import { clerkClient } from "@clerk/express";

const email = process.argv[2] || process.env.SUPER_ADMIN_EMAIL || process.env.ADMIN_EMAILS?.split(",")[0]?.trim();

if (!email) {
  console.error("Usage: node scripts/promoteAdmin.js <email>");
  process.exit(1);
}

async function promoteAdmin() {
  const users = await clerkClient.users.getUserList({ emailAddress: [email] });

  if (!users.data.length) {
    console.error(`No Clerk user found for: ${email}`);
    process.exit(1);
  }

  const user = users.data[0];
  const updated = await clerkClient.users.updateUser(user.id, {
    publicMetadata: {
      ...user.publicMetadata,
      role: "admin",
      promotedAt: new Date().toISOString(),
      promotedBy: "promoteAdmin-script",
    },
  });

  console.log("Promoted to admin:");
  console.log(`  email: ${updated.emailAddresses[0]?.emailAddress}`);
  console.log(`  userId: ${updated.id}`);
  console.log(`  role: ${updated.publicMetadata?.role}`);
}

promoteAdmin().catch((error) => {
  console.error("Failed to promote admin:", error.message);
  process.exit(1);
});