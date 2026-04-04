import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ClinicInfo {
  id: string;
  name: string;
  address?: string;
}

type Step = "form" | "loading" | "success" | "error";

// ─── Component ────────────────────────────────────────────────────────────────
const WalkinQueue = () => {
  // QR codes should link to /walkin?clinic_id=XYZ
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const qrClinicId = searchParams.get("clinic_id") || "";

  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [clinicInfo, setClinicInfo] = useState<ClinicInfo | null>(null);
  const [clinicLoading, setClinicLoading] = useState(true);
  const [tokenResult, setTokenResult] = useState<{
    token_label: string;
    position: number;
    patient_name: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // ── Fetch clinic info when clinic_id is known ────────────────────────────
  useEffect(() => {
    if (!qrClinicId) {
      setClinicLoading(false);
      return;
    }

    fetch(`http://localhost:8000/auth/clinics/${qrClinicId}`)
      .then((r) => r.json())
      .then((data) => {
        setClinicInfo({
          id: data.id || qrClinicId,
          name: data.name || "Clinic",
          address: data.address,
        });
      })
      .catch(() => {
        setClinicInfo({ id: qrClinicId, name: "Clinic" });
      })
      .finally(() => setClinicLoading(false));
  }, [qrClinicId]);

  // ── Validation ───────────────────────────────────────────────────────────
  const phoneRegex = /^[6-9]\d{9}$/;
  const isValid =
    name.trim().length >= 2 &&
    phoneRegex.test(phone.trim());

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleJoin = async () => {
    if (!isValid || !clinicInfo) return;
    setStep("loading");

    try {
      const res = await fetch("http://localhost:8000/auth/queue/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinic_id: clinicInfo.id,
          doctor_id: "1", // Default doctor for walk-ins
          patient_name: name.trim(),
          phone: phone.trim(),
          source: "walkin",
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to join queue");
      }

      const data = await res.json();
      setTokenResult({
        token_label: data.token_label,
        position: data.position,
        patient_name: data.patient_name,
      });
      setStep("success");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setErrorMsg(errorMessage);
      setStep("error");
    }
  };

  // ── Go back to home ─────────────────────────────────────────────────────
  const handleGoHome = () => {
    navigate("/");
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  // Invalid QR code
  if (!qrClinicId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F5F5] px-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm text-center">
          <p className="text-gray-500 text-sm">
            Invalid QR code. Please scan the clinic's QR code again.
          </p>
        </div>
      </div>
    );
  }

  // Loading clinic info
  if (clinicLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F5F5] px-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm text-center">
          <div className="h-6 w-32 mx-auto rounded bg-gray-100 animate-pulse mb-2" />
          <div className="h-4 w-24 mx-auto rounded bg-gray-100 animate-pulse" />
        </div>
      </div>
    );
  }

  // Success screen
  if (step === "success" && tokenResult) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F5F5] px-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm text-center">
          {/* Tick icon */}
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#00555A]/10">
            <svg className="h-7 w-7 text-[#00555A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-lg font-semibold text-[#0F172A] mb-1">You're in the queue!</h2>
          {clinicInfo && (
            <p className="text-sm text-gray-500 mb-6">{clinicInfo.name}</p>
          )}

          {/* Token badge */}
          <div className="rounded-2xl bg-[#FFC107] px-6 py-6 mb-6">
            <p className="text-xs font-medium uppercase tracking-widest text-[#0F172A] mb-1">
              Your Token
            </p>
            <p className="text-5xl font-extrabold tracking-widest text-[#0F172A]">
              {tokenResult.token_label}
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-[#0F172A] mb-6">
            <span className="text-gray-500">Patients ahead of you: </span>
            <span className="font-semibold">{Math.max(0, tokenResult.position - 1)}</span>
          </div>

          <p className="text-xs text-gray-400 mb-4">
            Please wait for your token to be called.
          </p>

          <button
            onClick={handleGoHome}
            className="w-full rounded-xl bg-[#00555A] px-4 py-3 text-sm font-medium text-white hover:opacity-90 transition-all duration-200"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Error screen
  if (step === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F5F5] px-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <svg className="h-7 w-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-[#0F172A] mb-2">Couldn't join queue</h2>
          <p className="text-sm text-gray-500 mb-6">{errorMsg}</p>
          <button
            onClick={() => { setStep("form"); setErrorMsg(""); }}
            className="w-full rounded-xl bg-[#00555A] px-4 py-3 text-sm font-medium text-white hover:opacity-90 transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Form screen
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F5F5] px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">

        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-lg font-semibold text-[#0F172A]">
            {clinicInfo?.name || "Join Queue"}
          </h1>
          {clinicInfo?.address && (
            <p className="text-xs text-gray-400 mt-0.5">{clinicInfo.address}</p>
          )}
          <p className="text-sm text-gray-500 mt-2">Enter your details to get a token</p>
        </div>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Full name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ravi Kumar"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-[#0F172A] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FFF0] transition-all duration-200 text-sm"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Mobile number</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="10-digit mobile number"
              type="tel"
              inputMode="numeric"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-[#0F172A] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FFF0] transition-all duration-200 text-sm"
            />
            {phone.length > 0 && !phoneRegex.test(phone) && (
              <p className="text-xs text-red-500 mt-1">Enter a valid 10-digit mobile number</p>
            )}
          </div>
        </div>

        <button
          onClick={handleJoin}
          disabled={!isValid || step === "loading"}
          className="mt-8 w-full rounded-xl bg-[#00555A] px-4 py-3 text-sm font-medium text-white transition-all duration-200 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {step === "loading" ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Getting your token...
            </span>
          ) : (
            "Get Token & Join Queue"
          )}
        </button>
      </div>
    </div>
  );
};

export default WalkinQueue;
