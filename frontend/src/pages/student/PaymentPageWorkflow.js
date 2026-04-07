import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { createReservationOrder, getCourse, verifyReservationPayment } from "../../api";
import toast from "react-hot-toast";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function PaymentPageWorkflow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [failure, setFailure] = useState("");

  useEffect(() => {
    getCourse(id)
      .then((res) => setCourse(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  async function handlePayment() {
    setPaying(true);
    setFailure("");
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error("Unable to load Razorpay checkout");
      }

      const orderRes = await createReservationOrder(id);
      const { order, razorpay_key_id } = orderRes.data;
      const razorpay = new window.Razorpay({
        key: razorpay_key_id,
        amount: order.amount,
        currency: order.currency,
        name: "CourseHub",
        description: `Enroll in ${course.title}`,
        order_id: order.id,
        handler: async (response) => {
          try {
            const verifyRes = await verifyReservationPayment(id, response);
            setTransactionId(verifyRes.data.payment.razorpay_payment_id);
            setSuccess(true);
            toast.success("Payment verified and enrollment confirmed");
          } catch (error) {
            const message = error.response?.data?.error || "Payment verification failed";
            setFailure(message);
            toast.error(message);
          } finally {
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => {
            setPaying(false);
            setFailure("Payment popup closed before completion");
          },
        },
        theme: { color: "#6c47ff" },
      });
      razorpay.on("payment.failed", (response) => {
        const message = response.error?.description || "Payment failed";
        setFailure(message);
        setPaying(false);
        toast.error(message);
      });
      razorpay.open();
    } catch (error) {
      const message = error.response?.data?.error || error.message || "Unable to start payment";
      setFailure(message);
      setPaying(false);
      toast.error(message);
    }
  }

  if (loading) {
    return <DashboardLayout><div className="page-content"><p className="text-muted">Loading...</p></div></DashboardLayout>;
  }

  if (!course) {
    return <DashboardLayout><div className="page-content"><p>Course not found.</p></div></DashboardLayout>;
  }

  if (success) {
    return (
      <DashboardLayout>
        <div className="page-content fade-in" style={{ maxWidth: 540, margin: "0 auto" }}>
          <div className="card" style={{ textAlign: "center", padding: "2.5rem" }}>
            <h2 style={{ marginBottom: "0.75rem" }}>Enrollment confirmed</h2>
            <p className="text-muted" style={{ marginBottom: "1rem" }}>Razorpay payment was verified on the backend.</p>
            <div className="alert alert-success" style={{ marginBottom: "1rem" }}>Payment ID: {transactionId}</div>
            <button className="btn btn-primary" onClick={() => navigate("/student/my-courses")}>Go to My Courses</button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="page-content fade-in">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: "1rem" }}>
          Back
        </button>
        <div className="grid-2">
          <div className="card">
            <h1 style={{ marginBottom: "0.5rem" }}>Reserve This Course</h1>
            <p className="text-muted" style={{ marginBottom: "1.5rem" }}>
              Checkout opens in Razorpay. Enrollment is created only after backend verification succeeds.
            </p>
            {failure ? <div className="alert alert-error" style={{ marginBottom: "1rem" }}>{failure}</div> : null}
            <button className="btn btn-primary" disabled={paying} onClick={handlePayment}>
              {paying ? "Opening Razorpay..." : `Pay Rs ${course.price.toLocaleString()} & Enroll`}
            </button>
          </div>

          <div className="card">
            <h3>Order Summary</h3>
            <div style={{ fontWeight: 700, marginBottom: "0.5rem" }}>{course.title}</div>
            <div className="text-muted text-sm">Teacher: {course.teacher_name}</div>
            <div className="text-muted text-sm">Duration: {course.duration || `${course.duration_weeks} weeks` || "Not specified"}</div>
            <div className="text-muted text-sm">Schedule: {course.schedule || "Not specified"}</div>
            <div style={{ marginTop: "1rem", fontSize: "1.5rem", fontWeight: 800, color: "var(--primary)" }}>
              Rs {course.price.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
