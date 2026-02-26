export default function AdminLoading() {
  return (
    <main className="section-block">
      <div className="container admin-loading-wrap">
        <div className="admin-loading-card" role="status" aria-live="polite">
          <div className="admin-loading-ring" aria-hidden="true" />
          <p className="admin-loading-title">Opening dashboard</p>
          <div className="admin-loading-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="admin-loading-track" aria-hidden="true">
            <span />
          </div>
        </div>
      </div>
    </main>
  );
}
