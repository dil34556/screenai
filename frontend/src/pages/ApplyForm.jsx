import React, { useState } from "react";
import api from "../api/axios";

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
  const [success, setSuccess] = useState("");

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
    setSuccess("");
    setSubmitting(true);

    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        data.append(key, value);
      });
      if (resumeFile) data.append("resume", resumeFile);

      const res = await api.post("candidates/applications/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("Application submitted successfully!");
      setForm({
        name: "",
        email: "",
        phone: "",
        years_of_experience: "",
        motivation: "",
        preferred_schedule: "",
      });
      setResumeFile(null);
      e.target.reset(); // clear file input
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "40px auto" }}>
      <h2>Senior Frontend Developer</h2>
      <p>Engineering • Remote • Full-time</p>

      <form onSubmit={handleSubmit}>
        <h3>Personal Information</h3>

        <label>
          Full Name *
          <input
            name="name"
            required
            value={form.name}
            onChange={handleChange}
          />
        </label>

        <label>
          Email *
          <input
            type="email"
            name="email"
            required
            value={form.email}
            onChange={handleChange}
          />
        </label>

        <label>
          Phone *
          <input
            name="phone"
            required
            value={form.phone}
            onChange={handleChange}
          />
        </label>

        <label>
          Resume *
          <input type="file" accept=".pdf,.doc,.docx" required onChange={handleFileChange} />
        </label>

        <h3>Application Questions</h3>

        <label>
          Years of experience with React? *
          <input
            type="number"
            name="years_of_experience"
            required
            value={form.years_of_experience}
            onChange={handleChange}
          />
        </label>

        <label>
          Why do you want to join our team? *
          <textarea
            name="motivation"
            required
            value={form.motivation}
            onChange={handleChange}
          />
        </label>

        <label>
          Preferred work schedule *
          <select
            name="preferred_schedule"
            required
            value={form.preferred_schedule}
            onChange={handleChange}
          >
            <option value="">Select an option</option>
            <option value="full_time">Full-time</option>
            <option value="part_time">Part-time</option>
            <option value="flexible">Flexible</option>
          </select>
        </label>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Application"}
        </button>
      </form>
    </div>
  );
}
