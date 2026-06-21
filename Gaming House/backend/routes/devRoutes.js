import express from "express";
import { clerkClient } from "@clerk/express";

const router = express.Router();

router.post("/make-admin", async (req, res) => {
  if (process.env.NODE_ENV !== "development") {
    return res.status(404).json({ error: "Route not found" });
  }

  try {
    const { email, userId } = req.body;

    if (!email && !userId) {
      return res.status(400).json({
        error: "Either email or userId is required",
        example: {
          byEmail: { email: "admin@example.com" },
          byUserId: { userId: "user_xyz123" },
        },
      });
    }

    let user;

    if (email) {
      const users = await clerkClient.users.getUserList({
        emailAddress: [email],
      });

      if (users.data.length === 0) {
        return res
          .status(404)
          .json({ error: `User not found with email: ${email}` });
      }
      user = users.data[0];
    } else {
      try {
        user = await clerkClient.users.getUser(userId);
      } catch (error) {
        return res
          .status(404)
          .json({ error: `User not found with ID: ${userId}` });
      }
    }

    if (user.publicMetadata?.role === "admin") {
      return res.status(400).json({
        error: `User ${user.emailAddresses[0]?.emailAddress} is already an admin`,
        userData: {
          id: user.id,
          email: user.emailAddresses[0]?.emailAddress,
          name: `${user.firstName} ${user.lastName}`.trim(),
          role: user.publicMetadata?.role,
          promotedAt: user.publicMetadata?.promotedAt,
        },
      });
    }

    const updatedUser = await clerkClient.users.updateUser(user.id, {
      publicMetadata: {
        ...user.publicMetadata,
        role: "admin",
        promotedAt: new Date().toISOString(),
        promotedBy: "development-endpoint",
      },
    });

    res.status(200).json({
      message: "User successfully promoted to admin",
      userData: {
        id: updatedUser.id,
        email: updatedUser.emailAddresses[0]?.emailAddress,
        name: `${updatedUser.firstName} ${updatedUser.lastName}`.trim(),
        role: updatedUser.publicMetadata?.role,
        promotedAt: updatedUser.publicMetadata?.promotedAt,
      },
    });
  } catch (error) {
    console.error("Error promoting user to admin:", error);
    res.status(500).json({ error: "Failed to promote user to admin" });
  }
});

router.get("/admin-status/:userId", async (req, res) => {
  if (process.env.NODE_ENV !== "development") {
    return res.status(404).json({ error: "Route not found" });
  }

  try {
    const { userId } = req.params;
    const user = await clerkClient.users.getUser(userId);

    res.json({
      userId: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      name: `${user.firstName} ${user.lastName}`.trim(),
      isAdmin: user.publicMetadata?.role === "admin",
      role: user.publicMetadata?.role || "user",
      metadata: user.publicMetadata,
    });
  } catch (error) {
    res.status(404).json({ error: "User not found" });
  }
});

router.get("/list-admins", async (req, res) => {
  if (process.env.NODE_ENV !== "development") {
    return res.status(404).json({ error: "Route not found" });
  }

  try {
    const allUsers = await clerkClient.users.getUserList({ limit: 500 });

    const admins = allUsers.data
      .filter((user) => user.publicMetadata?.role === "admin")
      .map((user) => ({
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        name: `${user.firstName} ${user.lastName}`.trim(),
        role: user.publicMetadata?.role,
        promotedAt: user.publicMetadata?.promotedAt,
        isFounder: user.publicMetadata?.isFounder || false,
      }));

    res.json({
      totalAdmins: admins.length,
      admins,
    });
  } catch (error) {
    console.error("Error listing admins:", error);
    res.status(500).json({ error: "Failed to list admins" });
  }
});

export default router;
