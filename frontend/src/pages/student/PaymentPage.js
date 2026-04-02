import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { getCourse, enroll } from "../../api";
import toast from "react-hot-toast";

export default function PaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [txnId, setTxnId] = useState("");
  const [card, setCard] = useState({ number: "4242 4242 4242 4242", name: "", expiry: "12/26", cvv: "123" });

  useEffect(() => {
    getCourse(id)
      .then((r) => setCourse(r.data))
      .finally(() => setLoading(false));
  }, [id]);

  async function handlePay(e) {
    e.preventDefault();
    if (!card.name.trim()) { toast.error("Please enter cardholder name"); return; }
    setPaying(true);
    try {
      const rawNumber = card.number.replace(/\s/g, "");
      const res = await enroll({ course_id: parseInt(id), card_number: rawNumber, payment_method: "mock_card" });
      setTxnId(res.data.transaction_id);
      setSuccess(true);
      toast.success("Payment successful! 🎉");
    } catch (err) {
      const msg = err.response?.data?.error || "Payment failed";
      toast.error(msg);
    } finally {
      setPaying(false);
    }
  }

  function formatCard(val) {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  }

  if (loading) return <DashboardLayout><div className="page-content"><p className="text-muted">Loading...</p></div></DashboardLayout>;
  if (!course) return <DashboardLayout><div className="page-content"><p>Course not found.</p></div></DashboardLayout>;

  if (success) {
    return (
      <DashboardLayout>
        <div className="page-content fade-in" style={{ maxWidth: 480, margin: "0 auto" }}>
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🎉</div>
            <h2 style={{ color: "var(--success)", marginBottom: "0.5rem" }}>Payment Successful!</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              You're now enrolled in <strong>{course.title}</strong>
            </p>
            <div className="alert alert-success" style={{ marginBottom: "1.5rem", justifyContent: "center" }}>
              Transaction ID: <strong style={{ marginLeft: "0.5rem" }}>{txnId}</strong>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
              <button className="btn btn-primary" onClick={() => navigate("/student/my-courses")}>
                Go to My Courses
              </button>
              <button className="btn btn-ghost" onClick={() => navigate("/student/courses")}>
                Browse More
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="page-content fade-in">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: "1rem" }}>
          ← Back
        </button>
        <h1 style={{ marginBottom: "0.25rem" }}>Complete Enrollment</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>Secure mock payment checkout</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "2rem", alignItems: "start" }}>
          {/* Payment form */}
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem", padding: "0.75rem", background: "var(--primary-light)", borderRadius: "var(--radius)" }}>
              <span style={{ fontSize: "1.25rem" }}>🔒</span>
              <span style={{ fontSize: "0.85rem", color: "var(--primary)", fontWeight: 600 }}>
                This is a mock payment — no real charges will be made
              </span>
            </div>

            <div style={{ background: "linear-gradient(135deg, #1a1530, #3d2d8a)", borderRadius: "var(--radius-lg)", padding: "1.5rem", color: "white", marginBottom: "1.5rem" }}>
              <div style={{ fontSize: "0.75rem", opacity: 0.7, marginBottom: "1rem", letterSpacing: "0.1em" }}>MOCK CARD</div>
              <div style={{ fontSize: "1.1rem", letterSpacing: "0.2em", marginBottom: "1.25rem", fontFamily: "JetBrains Mono, monospace" }}>
                {card.number || "•••• •••• •••• ••••"}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                <div><div style={{ opacity: 0.7, marginBottom: "0.25rem" }}>CARDHOLDER</div><div>{card.name || "YOUR NAME"}</div></div>
                <div><div style={{ opacity: 0.7, marginBottom: "0.25rem" }}>EXPIRES</div><div>{card.expiry}</div></div>
              </div>
            </div>

            <form onSubmit={handlePay}>
              <div className="form-group">
                <label className="form-label">Card Number</label>
                <input className="form-input" placeholder="4242 4242 4242 4242" value={card.number}
                  onChange={(e) => setCard((p) => ({ ...p, number: formatCard(e.target.value) }))}
                  style={{ fontFamily: "JetBrains Mono, monospace" }} />
                <div className="form-hint">Use ending 0000 to simulate a failed payment</div>
              </div>
              <div className="form-group">
                <label className="form-label">Cardholder Name</label>
                <input className="form-input" placeholder="John Doe" value={card.name}
                  onChange={(e) => setCard((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Expiry Date</label>
                  <input className="form-input" placeholder="MM/YY" value={card.expiry}
                    onChange={(e) => setCard((p) => ({ ...p, expiry: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">CVV</label>
                  <input className="form-input" placeholder="123" value={card.cvv} maxLength={4}
                    onChange={(e) => setCard((p) => ({ ...p, cvv: e.target.value }))} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary w-full" style={{ justifyContent: "center", padding: "0.875rem", fontSize: "1rem" }} disabled={paying}>
                {paying ? "Processing..." : `Pay ₹${course.price.toLocaleString()}`}
              </button>
            </form>
          </div>

          {/* Order summary */}
          <div className="card" style={{ padding: "1.5rem" }}>
            <h4 style={{ marginBottom: "1.25rem" }}>Order Summary</h4>
            {course.thumbnail_url && (
              <img src={course.thumbnail_url} alt="" style={{ width: "100%", borderRadius: "var(--radius)", marginBottom: "1rem", height: 140, objectFit: "cover" }} />
            )}
            <div style={{ fontWeight: 700, marginBottom: "0.5rem" }}>{course.title}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>by {course.teacher_name}</div>
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
              {[
                ["Course fee", `₹${course.price.toLocaleString()}`],
                ["Platform fee", "₹0"],
                ["Tax", "₹0"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                  <span style={{ color: "var(--text-secondary)" }}>{k}</span>
                  <span style={{ fontWeight: 600 }}>{v}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: "1.1rem", borderTop: "1px solid var(--border)", paddingTop: "0.75rem", marginTop: "0.5rem" }}>
                <span>Total</span>
                <span style={{ color: "var(--primary)" }}>₹{course.price.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}