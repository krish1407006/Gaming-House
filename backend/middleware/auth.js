import { getAuth } from "@clerk/express";

export const requireAuth = () => {
  return (req, res, next) => {
    try {
      const { userId } = getAuth(req);

      if (!userId) {
        return res.status(401).json({
          error: "Authentication required",
        });
      }

      req.userId = userId;
      next();
    } catch (error) {
      console.error("Error in auth middleware:", error);
      res.status(401).json({
        error: "Authentication required",
      });
    }
  };
};
