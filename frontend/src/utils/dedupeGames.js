export function getGameId(game) {
  return String(game?._id || game?.gameId || game?.id || "");
}

export function dedupeGamesById(games) {
  if (!Array.isArray(games)) return [];

  const seen = new Set();
  return games.filter((game) => {
    const id = getGameId(game);
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}