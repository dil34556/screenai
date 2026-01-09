import React, { useState } from "react";
import api from "../api/axios";
import { CheckCircle2, ArrowRight, UploadCloud, FileText } from "lucide-react";

export default function ApplyForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    years_of_experience: "",
    motivation: "",
    preferred_schedule: "",
  });

  const [resumeFile, setResumeFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setResumeFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        data.append(key, value);
      });
      if (resumeFile) data.append("resume", resumeFile);

      await api.post("candidates/applications/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess(true);
      setForm({
        name: "",
        email: "",
        phone: "",
        years_of_experience: "",
        motivation: "",
        preferred_schedule: "",
      });
      setResumeFile(null);
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-6 animate-fade-in">
        <div className="bg-white rounded-3xl p-12 text-center max-w-md w-full shadow-2xl shadow-indigo-500/10 border border-slate-100">

          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100">
            <CheckCircle2 size={40} className="text-emerald-500" />
          </div>

          <h2 className="text-3xl font-bold text-slate-800 mb-2 tracking-tight">Application Sent!</h2>
          <p className="text-slate-500 mb-8">
            Thanks for applying to <br />
            <strong className="text-slate-800">Senior Frontend Developer</strong>
          </p>

          <div className="space-y-4">
            <button
              onClick={() => window.location.href = '/'}
              className="w-full py-3.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5"
            >
              Return to Home
            </button>

            <button
              onClick={() => { setSuccess(false); window.scrollY = 0; }}
              className="w-full text-indigo-500 font-semibold text-sm hover:text-indigo-600 py-2 transition-colors"
            >
              Apply to another role
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-12 animate-slide-up">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Senior Frontend Developer</h2>
        <p className="text-slate-500 flex items-center gap-2 text-sm font-medium uppercase tracking-wide">
          <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md border border-indigo-100">Engineering</span>
          •
          <span>Remote</span>
          •
          <span>Full-time</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6">Personal Information</h3>

          <div className="grid md:grid-cols-2 gap-6">
            <label className="block">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Full Name *</span>
              <input
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                placeholder="John Doe"
              />
            </label>

            <label className="block">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Email *</span>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                placeholder="john@example.com"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Phone *</span>
              <input
                name="phone"
                required
                value={form.phone}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                placeholder="+1 (555) 000-0000"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Resume *</span>
            <div className="relative group cursor-pointer">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                required
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${resumeFile ? 'border-emerald-500/50 bg-emerald-50/50' : 'border-slate-200 group-hover:border-indigo-400 group-hover:bg-slate-50'}`}>
                {resumeFile ? (
                  <div className="flex flex-col items-center text-emerald-600">
                    <FileText size={32} className="mb-2" />
                    <span className="font-bold text-sm">{resumeFile.name}</span>
                    <span className="text-xs mt-1 opacity-75">Click to replace</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-slate-400 group-hover:text-indigo-500">
                    <UploadCloud size={32} className="mb-2" />
                    <span className="font-bold text-sm">Upload Resume</span>
                    <span className="text-xs mt-1">PDF, DOC, DOCX</span>
                  </div>
                )}
              </div>
            </div>
          </label>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6">Application Questions</h3>

          <label className="block">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Years of experience with React? *</span>
            <input
              type="number"
              name="years_of_experience"
              required
              value={form.years_of_experience}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
            />
          </label>

          <label className="block">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Why do you want to join our team? *</span>
            <textarea
              name="motivation"
              required
              rows={4}
              value={form.motivation}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium resize-none"
            />
          </label>

          <label className="block">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Preferred work schedule *</span>
            <div className="relative">
              <select
                name="preferred_schedule"
                required
                value={form.preferred_schedule}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium appearance-none cursor-pointer"
              >
                <option value="">Select an option</option>
                <option value="full_time">Full-time</option>
                <option value="part_time">Part-time</option>
                <option value="flexible">Flexible</option>
              </select>
              <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" size={16} />
            </div>
          </label>
        </div>

        {error && <div className="p-4 bg-red-50 text-red-500 rounded-xl text-sm font-bold border border-red-100">{error}</div>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 rounded-xl font-bold text-lg bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-1 shadow-xl shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {submitting ? "Submitting Application..." : "Submit Application"}
        </button>
      </form>
    </div>
  );
}
