import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";
import { MessageSquare } from "lucide-react";

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/feedback/").then(r => setFeedback(r.data)).finally(() => setLoading(false));
  }, []);

  const avg = feedback.length ? (feedback.reduce((s, f) => s + f.rating, 0) / feedback.length).toFixed(1) : null;

  const ratingCounts = [5, 4, 3, 2, 1].map(r => ({
    rating: r,
    count: feedback.filter(f => f.rating === r).length,
    pct: feedback.length ? (feedback.filter(f => f.rating === r).length / feedback.length * 100).toFixed(0) : 0
  }));

  return (
    <Layout title="Customer Feedback" subtitle={`${feedback.length} total reviews`}>
      {loading ? <div className="loading"><div className="spinner" /></div> : (
        <>
          {feedback.length > 0 && (
            <div className="grid-2" style={{ marginBottom: 24 }}>
              <div className="card" style={{ textAlign: "center" }}>
                <div style={{ fontSize: 56, fontWeight: 800, background: "linear-gradient(135deg, #F9A825, #F97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{avg}</div>
                <div className="stars" style={{ justifyContent: "center", margin: "8px 0" }}>
                  {[1,2,3,4,5].map(n => <span key={n} className={`star ${n <= Math.round(avg) ? "filled" : "empty"}`} style={{ cursor: "default" }}>★</span>)}
                </div>
                <p className="text-sm text-muted">Average rating from {feedback.length} customer{feedback.length !== 1 ? "s" : ""}</p>
              </div>
              <div className="card">
                <div className="card-title" style={{ marginBottom: 14 }}>Rating Breakdown</div>
                {ratingCounts.map(({ rating, count, pct }) => (
                  <div key={rating} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span className="text-sm" style={{ width: 20 }}>{rating}★</span>
                    <div style={{ flex: 1, height: 10, background: "#F3F4F8", borderRadius: 5, overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 5, background: "linear-gradient(90deg, #F9A825, #6C63FF)", width: `${pct}%`, transition: "width 0.5s" }} />
                    </div>
                    <span className="text-xs text-muted" style={{ width: 30 }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card">
            {feedback.length === 0 ? (
              <div className="empty-state">
                <MessageSquare />
                <h3>No feedback yet</h3>
                <p>Customer feedback will appear here once complaints are resolved and rated.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 16 }}>
                {feedback.map(f => (
                  <div key={f.id} style={{ padding: "18px 20px", background: "linear-gradient(135deg, #FAFBFF, #FFF8F9)", borderRadius: 12, border: "1px solid #EEF2FF" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div className="stars">
                        {[1,2,3,4,5].map(n => <span key={n} className={`star ${n <= f.rating ? "filled" : "empty"}`} style={{ fontSize: 16, cursor: "default" }}>★</span>)}
                        <span className="text-sm font-semibold" style={{ marginLeft: 8 }}>{f.rating}/5</span>
                      </div>
                      <span className="text-xs text-muted">{new Date(f.created_at).toLocaleDateString()}</span>
                    </div>
                    {f.comments && <p className="text-sm" style={{ color: "#374151", lineHeight: 1.6 }}>{f.comments}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </Layout>
  );
}
