"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  PROPERTY_TYPES, AGREEMENT_TYPES, AGREEMENT_STATUSES, ACQUISITION_AGENTS,
  OPS_OWNERS, YES_NO_NA, STAFFING_STATUSES, STAFF_INV_AGENTS, INVENTORY_STATUSES,
  TECH_STATUSES, TECH_AGENTS, ACCOUNT_MANAGERS, OPS_SIM_STATUSES,
  overallStatus, preOnboardingComplete,
} from "../lib/constants";

function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d)) return "—";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function todayISO() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
function statusPillClass(s) {
  if (s === "On-Track") return "ontrack";
  if (s === "At-Risk") return "atrisk";
  return "blocked";
}
const BOX_CYCLE = ["box-sky", "box-shine", "box-bloom"];
function boxColor(i) { return BOX_CYCLE[i % BOX_CYCLE.length]; }

function Options({ list, includeBlank }) {
  return (
    <>
      {includeBlank && <option value="">—</option>}
      {list.map((v) => <option key={v} value={v}>{v}</option>)}
    </>
  );
}

export default function Page() {
  const [properties, setProperties] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [conn, setConn] = useState("connecting");
  const [view, setView] = useState("dashboard"); // "dashboard" | property id
  const [toastMsg, setToastMsg] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const toastTimer = useRef(null);

  const toast = useCallback((msg) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(""), 2800);
  }, []);

  const load = useCallback(async (silent) => {
    try {
      const res = await fetch("/api/properties", { cache: "no-store" });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setProperties(json.properties || []);
      setConn("live");
    } catch {
      if (!silent) setConn("offline");
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    load(false);
    const t = setInterval(() => load(true), 8000);
    return () => clearInterval(t);
  }, [load]);

  async function createProperty(data) {
    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Couldn't add property");
      setModalOpen(false);
      toast("Added " + data.propertyName + ".");
      load(true);
    } catch (err) {
      toast(err.message || "Couldn't add property — try again.");
    }
  }

  async function saveField(id, patch) {
    setProperties((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    try {
      const res = await fetch("/api/properties/" + id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error();
    } catch {
      toast("Couldn't save — try again.");
    }
  }

  const current = view !== "dashboard" ? properties.find((p) => p.id === view) : null;

  return (
    <div className="wrap">
      <header className="top">
        <div>
          <p className="eyebrow">StayVista Operations · Self-Operated Properties</p>
          <h1 className="title">Onboarding Ledger</h1>
          <p className="sub">Acquisition through go-live — one record per property, from signed agreement to post-launch trackers.</p>
        </div>
        <div className="top-actions">
          <button className="primary" type="button" onClick={() => setModalOpen(true)}>+ New property</button>
        </div>
      </header>

      <p className="status-line">
        <span className={"dot" + (conn === "live" ? " live" : "")} />
        <span>{conn === "live" ? "Synced" : conn === "connecting" ? "Connecting…" : "Offline — changes won't save"}</span>
      </p>

      {!current && loaded && <Dashboard properties={properties} onOpen={setView} onAdd={() => setModalOpen(true)} />}
      {current && (
        <Detail
          property={current}
          onBack={() => setView("dashboard")}
          onSave={(patch) => saveField(current.id, patch)}
          toast={toast}
        />
      )}

      {modalOpen && (
        <NewPropertyModal
          onClose={() => setModalOpen(false)}
          onSave={createProperty}
        />
      )}

      {toastMsg && <div className="toast show">{toastMsg}</div>}
    </div>
  );
}

function Dashboard({ properties, onOpen, onAdd }) {
  if (!properties.length) {
    return (
      <div className="grid">
        <div className="empty">
          <p>No properties yet. Add one to start tracking it from acquisition through go-live.</p>
          <button className="primary" type="button" onClick={onAdd}>+ New property</button>
        </div>
      </div>
    );
  }

  let onTrack = 0, atRisk = 0, blocked = 0, complete = 0;
  properties.forEach((p) => {
    const s = overallStatus(p);
    if (s === "On-Track") onTrack++; else if (s === "At-Risk") atRisk++; else blocked++;
    if (preOnboardingComplete(p) === "Complete") complete++;
  });

  return (
    <>
      <section className="stats">
        <div className="stat box-sky"><div className="n">{properties.length}</div><div className="l">Properties tracked</div></div>
        <div className="stat box-shine"><div className="n">{onTrack}</div><div className="l">On-track</div></div>
        <div className="stat box-bloom"><div className="n">{atRisk + blocked}</div><div className="l">At-risk or blocked</div></div>
        <div className="stat box-sky"><div className="n">{complete}</div><div className="l">Onboarding complete</div></div>
      </section>
      <div className="grid">
        {properties.map((p, i) => {
          const os = overallStatus(p);
          const poc = preOnboardingComplete(p);
          return (
            <div className={"card " + boxColor(i)} tabIndex={0} role="button" key={p.id}
              onClick={() => onOpen(p.id)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(p.id); } }}>
              <div className="card-top">
                <div>
                  <h3>{p.propertyName || "Untitled property"}</h3>
                  <div className="loc">{p.location || "—"}{p.bedrooms ? " · " + p.bedrooms + " BR" : ""}</div>
                </div>
                <span className={"pill " + statusPillClass(os)}>{os}</span>
              </div>
              <div className="card-chips">
                <span className="chip">{p.propertyType || "Type —"}</span>
                <span className="chip">{p.agreementType || "Agreement —"}</span>
                <span className="chip">{p.agreementStatus === "Signed" ? "✓ Signed" : (p.agreementStatus || "Not signed")}</span>
                <span className="chip">Onboarding: {poc}</span>
              </div>
              <div className="card-foot">
                <span>{p.accountManager || "No AM assigned"}</span>
                <span>{p.targetGoLiveDate ? "Target " + fmtDate(p.targetGoLiveDate) : ""}</span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function NewPropertyModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    propertyName: "", propertyType: "", bedrooms: "", location: "",
    acquisitionAgent: "", acquisitionDate: todayISO(), agreementType: "", agreementStatus: "Not Signed",
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <h3>New property</h3>
        <p className="msub">Part 1 — acquisition. You can fill onboarding and launch details after.</p>
        <div className="field"><label>Property name</label><input autoFocus value={form.propertyName} onChange={set("propertyName")} placeholder="e.g. Ridgeview Manor" /></div>
        <div className="field"><label>Property type</label><select value={form.propertyType} onChange={set("propertyType")}><Options list={PROPERTY_TYPES} includeBlank /></select></div>
        <div className="field"><label>Bedrooms</label><input type="number" min="0" step="1" value={form.bedrooms} onChange={set("bedrooms")} placeholder="e.g. 6" /></div>
        <div className="field"><label>Location</label><input value={form.location} onChange={set("location")} placeholder="e.g. Kasauli, Himachal Pradesh" /></div>
        <div className="field"><label>Acquisition agent</label><select value={form.acquisitionAgent} onChange={set("acquisitionAgent")}><Options list={ACQUISITION_AGENTS} includeBlank /></select></div>
        <div className="field"><label>Acquisition date</label><input type="date" value={form.acquisitionDate} onChange={set("acquisitionDate")} /></div>
        <div className="field"><label>Agreement type</label><select value={form.agreementType} onChange={set("agreementType")}><Options list={AGREEMENT_TYPES} includeBlank /></select></div>
        <div className="field"><label>Agreement status</label><select value={form.agreementStatus} onChange={set("agreementStatus")}><Options list={AGREEMENT_STATUSES} /></select></div>
        <div className="modal-actions">
          <button className="ghost" type="button" onClick={onClose}>Cancel</button>
          <button className="primary" type="button" onClick={() => form.propertyName.trim() && onSave(form)}>Add property</button>
        </div>
      </div>
    </div>
  );
}

function useDebouncedSave(onSave, delay = 700) {
  const timers = useRef({});
  return (field, value) => {
    clearTimeout(timers.current[field]);
    timers.current[field] = setTimeout(() => onSave({ [field]: value }), delay);
  };
}

function Detail({ property: p, onBack, onSave, toast }) {
  const debouncedSave = useDebouncedSave(onSave);
  const [noteText, setNoteText] = useState("");
  const os = overallStatus(p);
  const poc = preOnboardingComplete(p);

  function field(field, value) { onSave({ [field]: value }); }
  function debField(f) { return (e) => debouncedSave(f, e.target.value); }
  function selField(f) { return (e) => field(f, e.target.value); }

  function addNote() {
    const text = noteText.trim();
    if (!text) return;
    const notes = (p.agmNotes || []).concat([{ date: new Date().toISOString(), text }]);
    onSave({ agmNotes: notes });
    setNoteText("");
  }

  const sortedNotes = (p.agmNotes || []).slice().sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div>
      <div className="back-row"><button className="ghost" type="button" onClick={onBack}>← All properties</button></div>
      <div className="detail-head">
        <div>
          <h2>{p.propertyName || "Untitled property"}</h2>
          <div className="loc">{p.location || "—"}{p.bedrooms ? " · " + p.bedrooms + " BR" : ""} · {p.propertyType || ""}</div>
        </div>
        <div className="detail-pills">
          <span className={"pill " + statusPillClass(os)}>{os}</span>
          <span className={"pill " + (poc === "Complete" ? "complete" : "pending")}>{poc}</span>
        </div>
      </div>
      <p className="save-note">Changes save automatically as you edit.</p>

      <div className="section">
        <h4>Part 1 — Acquisition</h4>
        <p className="section-sub">Where this property came from and its agreement.</p>
        <div className="field-grid">
          <div className="field"><label>Property name</label><input defaultValue={p.propertyName} onChange={debField("propertyName")} /></div>
          <div className="field"><label>Property type</label><select defaultValue={p.propertyType || ""} onChange={selField("propertyType")}><Options list={PROPERTY_TYPES} includeBlank /></select></div>
          <div className="field"><label>Bedrooms</label><input type="number" defaultValue={p.bedrooms || ""} onChange={debField("bedrooms")} /></div>
          <div className="field"><label>Location</label><input defaultValue={p.location} onChange={debField("location")} /></div>
          <div className="field"><label>Acquisition agent</label><select defaultValue={p.acquisitionAgent || ""} onChange={selField("acquisitionAgent")}><Options list={ACQUISITION_AGENTS} includeBlank /></select></div>
          <div className="field"><label>Acquisition date</label><input type="date" defaultValue={p.acquisitionDate || ""} onChange={selField("acquisitionDate")} /></div>
          <div className="field"><label>Agreement type</label><select defaultValue={p.agreementType || ""} onChange={selField("agreementType")}><Options list={AGREEMENT_TYPES} includeBlank /></select></div>
          <div className="field"><label>Agreement status</label><select defaultValue={p.agreementStatus || ""} onChange={selField("agreementStatus")}><Options list={AGREEMENT_STATUSES} includeBlank /></select></div>
        </div>
      </div>

      <div className="section">
        <h4>Part 2 — Pre-onboarding</h4>
        <p className="section-sub">Audits, staffing, inventory and tech sign-off before go-live.</p>
        <div className="formula-row">
          <div className="formula-card box-sky"><div className="fl">Overall status</div><span className={"pill " + statusPillClass(os)}>{os}</span></div>
          <div className="formula-card box-shine"><div className="fl">Pre-onboarding complete</div><span className={"pill " + (poc === "Complete" ? "complete" : "pending")}>{poc}</span></div>
        </div>

        <div className="field-grid">
          <div className="field"><label>Ops pre-handover date</label><input type="date" defaultValue={p.opsPreHandoverDate || ""} onChange={selField("opsPreHandoverDate")} /></div>
          <div className="field"><label>Ops pre-handover owner</label><select defaultValue={p.opsPreHandoverOwner || ""} onChange={selField("opsPreHandoverOwner")}><Options list={OPS_OWNERS} includeBlank /></select></div>
        </div>
        {p.opsPreHandoverOwner === "Others" && (
          <div className="field" style={{ marginTop: 12 }}><label>Owner name</label><input defaultValue={p.opsPreHandoverOwnerOther} onChange={debField("opsPreHandoverOwnerOther")} placeholder="Name" /></div>
        )}

        <div className="field-grid" style={{ marginTop: 14 }}>
          <div className="field"><label>Pre-onboarding team to be deployed</label><select defaultValue={p.teamDeploy || ""} onChange={selField("teamDeploy")}><Options list={YES_NO_NA} includeBlank /></select></div>
        </div>
        {p.teamDeploy === "Yes" && (
          <div className="subgroup">
            <div className="field"><label>Ops</label><input defaultValue={p.teamDeployOps} onChange={debField("teamDeployOps")} placeholder="Who / what" /></div>
            <div className="field"><label>Tech</label><input defaultValue={p.teamDeployTech} onChange={debField("teamDeployTech")} placeholder="Who / what" /></div>
            <div className="field"><label>Events &amp; F&amp;B</label><input defaultValue={p.teamDeployEventsFnb} onChange={debField("teamDeployEventsFnb")} placeholder="Who / what" /></div>
          </div>
        )}
        {p.teamDeploy === "No" && (
          <div className="subgroup"><div className="field span2"><label>Reason / remarks</label><input defaultValue={p.teamDeployReason} onChange={debField("teamDeployReason")} placeholder="Why the team isn't deployed" /></div></div>
        )}
        {p.teamDeploy === "NA" && (
          <div className="subgroup"><span style={{ fontSize: 12.5, color: "var(--ink-faint)" }}>Marked not applicable.</span></div>
        )}

        <div className="field-grid" style={{ marginTop: 14 }}>
          <div className="field"><label>Staffing audit status</label><select defaultValue={p.staffingAuditStatus || ""} onChange={selField("staffingAuditStatus")}><Options list={STAFFING_STATUSES} includeBlank /></select></div>
          <div className="field"><label>Staffing audit agent</label><select defaultValue={p.staffingAuditAgent || ""} onChange={selField("staffingAuditAgent")}><Options list={STAFF_INV_AGENTS} includeBlank /></select></div>
          <div className="field"><label>Staffing audit details / link</label><input defaultValue={p.staffingAuditDetails} onChange={debField("staffingAuditDetails")} /></div>
        </div>
        {p.staffingAuditAgent === "Others" && (
          <div className="field" style={{ marginTop: 12 }}><label>Agent name</label><input defaultValue={p.staffingAuditAgentOther} onChange={debField("staffingAuditAgentOther")} placeholder="Name" /></div>
        )}

        <div className="field-grid" style={{ marginTop: 14 }}>
          <div className="field"><label>Inventory report status</label><select defaultValue={p.inventoryReportStatus || ""} onChange={selField("inventoryReportStatus")}><Options list={INVENTORY_STATUSES} includeBlank /></select></div>
          <div className="field"><label>Inventory report agent</label><select defaultValue={p.inventoryReportAgent || ""} onChange={selField("inventoryReportAgent")}><Options list={STAFF_INV_AGENTS} includeBlank /></select></div>
          <div className="field"><label>Inventory report details / link</label><input defaultValue={p.inventoryReportDetails} onChange={debField("inventoryReportDetails")} /></div>
        </div>
        {p.inventoryReportAgent === "Others" && (
          <div className="field" style={{ marginTop: 12 }}><label>Agent name</label><input defaultValue={p.inventoryReportAgentOther} onChange={debField("inventoryReportAgentOther")} placeholder="Name" /></div>
        )}

        <div className="field-grid" style={{ marginTop: 14 }}>
          <div className="field"><label>Technical audit status</label><select defaultValue={p.technicalAuditStatus || ""} onChange={selField("technicalAuditStatus")}><Options list={TECH_STATUSES} includeBlank /></select></div>
          <div className="field"><label>Technical audit agent</label><select defaultValue={p.technicalAuditAgent || ""} onChange={selField("technicalAuditAgent")}><Options list={TECH_AGENTS} includeBlank /></select></div>
          <div className="field"><label>Technical audit details / link</label><input defaultValue={p.technicalAuditDetails} onChange={debField("technicalAuditDetails")} /></div>
        </div>
        {p.technicalAuditAgent === "Others" && (
          <div className="field" style={{ marginTop: 12 }}><label>Agent name</label><input defaultValue={p.technicalAuditAgentOther} onChange={debField("technicalAuditAgentOther")} placeholder="Name" /></div>
        )}

        <div className="field-grid" style={{ marginTop: 14 }}>
          <div className="field"><label>Account manager</label><select defaultValue={p.accountManager || ""} onChange={selField("accountManager")}><Options list={ACCOUNT_MANAGERS} includeBlank /></select></div>
          <div className="field"><label>Assigned PM</label><input defaultValue={p.assignedPM} onChange={debField("assignedPM")} /></div>
          <div className="field"><label>Target go-live date</label><input type="date" defaultValue={p.targetGoLiveDate || ""} onChange={selField("targetGoLiveDate")} /></div>
          <div className="field"><label>Go-live start date</label><input type="date" defaultValue={p.goLiveStartDate || ""} onChange={selField("goLiveStartDate")} /></div>
        </div>

        <div style={{ marginTop: 18 }}>
          <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--ink-soft)" }}>AGM notes</label>
          <div className="notes-log">
            {sortedNotes.length === 0 && <div style={{ fontSize: 12.5, color: "var(--ink-faint)" }}>No notes yet.</div>}
            {sortedNotes.map((n, i) => (
              <div className={"note-entry " + boxColor(i)} key={i}>
                <div className="nd">{fmtDate(n.date ? n.date.slice(0, 10) : "")}</div>
                <div className="nt">{n.text}</div>
              </div>
            ))}
          </div>
          <div className="note-add">
            <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Add a note — it's appended with today's date, existing notes are never overwritten" />
            <button className="mini" type="button" onClick={addNote}>Add note</button>
          </div>
        </div>
      </div>

      <div className="section">
        <h4>Part 3 — Launch</h4>
        <p className="section-sub">Ops simulation and post-launch handoff.</p>
        <div className="field-grid">
          <div className="field"><label>Ops simulation audit status</label><select defaultValue={p.opsSimAuditStatus || ""} onChange={selField("opsSimAuditStatus")}><Options list={OPS_SIM_STATUSES} includeBlank /></select></div>
          <div className="field"><label>Done by (names &amp; roles)</label><input defaultValue={p.opsSimAuditDoneBy} onChange={debField("opsSimAuditDoneBy")} /></div>
          <div className="field"><label>Ops simulation details / link</label><input defaultValue={p.opsSimDetails} onChange={debField("opsSimDetails")} /></div>
          <div className="field"><label>Post-launch trackers created</label><select defaultValue={p.postLaunchTrackersCreated || ""} onChange={selField("postLaunchTrackersCreated")}><Options list={YES_NO_NA} includeBlank /></select></div>
          <div className="field"><label>Post-launch trackers link</label><input defaultValue={p.postLaunchTrackersLink} onChange={debField("postLaunchTrackersLink")} /></div>
        </div>
      </div>
    </div>
  );
}
