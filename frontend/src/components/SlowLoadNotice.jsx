export default function SlowLoadNotice({ show }) {
  if (!show) return null;

  return (
    <div className="mb-4 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-3 text-center">
      <p className="text-sm text-[var(--text-secondary)]">
        Waking up the server — first load can take up to a minute on free hosting.
      </p>
      <p className="text-xs text-[var(--text-muted)] mt-1">
        Hang tight, your games are on the way.
      </p>
    </div>
  );
}