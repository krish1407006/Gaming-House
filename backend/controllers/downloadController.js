import { getAuth } from "@clerk/express";
import Download from "../models/Download.js";
import Game from "../models/Game.js";

export const getGameDownloads = async (req, res) => {
  try {
    const { id } = req.params;
    const game = await Game.findById(id);
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    const downloads = await Download.find({ gameId: id, isActive: true }).sort({ createdAt: -1 });

    res.json({
      steamAppId: game.steamAppId || null,
      downloads,
    });
  } catch (error) {
    console.error("Error in getGameDownloads:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ─── Admin endpoints ───

export const adminGetDownloads = async (req, res) => {
  try {
    const { id } = req.params;
    const game = await Game.findById(id);
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    const downloads = await Download.find({ gameId: id }).sort({ createdAt: -1 });

    res.json({
      steamAppId: game.steamAppId || null,
      downloads,
    });
  } catch (error) {
    console.error("Error in adminGetDownloads:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const addDownload = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = getAuth(req);
    const { url, label, type, isActive } = req.body;

    const game = await Game.findById(id);
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    if (!url || !url.trim()) {
      return res.status(400).json({ error: "URL is required" });
    }

    const downloadType = type === "genuine" ? "genuine" : "piracy";

    const download = await Download.create({
      gameId: id,
      type: downloadType,
      url: url.trim(),
      label: label?.trim() || "Download",
      isActive: isActive !== undefined ? isActive : true,
      addedBy: userId,
    });

    res.status(201).json({
      message: "Download link added successfully",
      data: download,
    });
  } catch (error) {
    console.error("Error in addDownload:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateDownload = async (req, res) => {
  try {
    const { id, downloadId } = req.params;
    const { url, label, type, isActive } = req.body;

    const download = await Download.findOne({ _id: downloadId, gameId: id });
    if (!download) {
      return res.status(404).json({ error: "Download link not found" });
    }

    if (url !== undefined) download.url = url.trim();
    if (label !== undefined) download.label = label.trim();
    if (type !== undefined) download.type = type;
    if (isActive !== undefined) download.isActive = isActive;

    await download.save();

    res.json({
      message: "Download link updated successfully",
      data: download,
    });
  } catch (error) {
    console.error("Error in updateDownload:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteDownload = async (req, res) => {
  try {
    const { id, downloadId } = req.params;

    const download = await Download.findOneAndDelete({ _id: downloadId, gameId: id });
    if (!download) {
      return res.status(404).json({ error: "Download link not found" });
    }

    res.json({ message: "Download link deleted successfully" });
  } catch (error) {
    console.error("Error in deleteDownload:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateSteamAppId = async (req, res) => {
  try {
    const { id } = req.params;
    const { steamAppId } = req.body;

    const game = await Game.findById(id);
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    game.steamAppId = steamAppId !== undefined ? steamAppId : undefined;
    await game.save();

    res.json({
      message: "Steam App ID updated successfully",
      steamAppId: game.steamAppId,
    });
  } catch (error) {
    console.error("Error in updateSteamAppId:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
