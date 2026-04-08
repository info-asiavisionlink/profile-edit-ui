document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  const FETCH_WEBHOOK = "https://nextasia.app.n8n.cloud/webhook/afcf2cf6-974d-455c-ac5e-ccec5f30703b";
  const SAVE_WEBHOOK = "https://nextasia.app.n8n.cloud/webhook/d64f9ddc-13c6-4d3b-9813-3de5b987ac0b";

  const fieldIds = [
    "name",
    "company_name_input",
    "job_title",
    "target_people",
    "ng_people",
    "hobby",
    "line_opt_in",
    "self_pr",
    "ai_summary",
    "tags"
  ];

  const statusText = document.getElementById("statusText");
  const saveButton = document.getElementById("saveButton");

  function setStatus(message, type) {
    if (!statusText) return;
    statusText.textContent = message || "";
    statusText.classList.remove("error", "success");
    if (type) statusText.classList.add(type);
  }

  function getLineId() {
    const params = new URLSearchParams(window.location.search);
    return (params.get("line_id") || "").trim();
  }

  function normalizeData(raw) {
    if (!raw) return {};
    if (Array.isArray(raw)) return raw[0] || {};
    if (typeof raw !== "object") return {};

    if (raw.data && typeof raw.data === "object") {
      return Array.isArray(raw.data) ? (raw.data[0] || {}) : raw.data;
    }
    if (raw.result && typeof raw.result === "object") {
      return Array.isArray(raw.result) ? (raw.result[0] || {}) : raw.result;
    }
    return raw;
  }

  function setFormValues(data) {
    fieldIds.forEach(function (id) {
      const el = document.getElementById(id);
      if (!el) return;
      el.value = data[id] == null ? "" : String(data[id]);
    });
  }

  function collectPayload(lineId) {
    const payload = { line_id: lineId };
    fieldIds.forEach(function (id) {
      const el = document.getElementById(id);
      payload[id] = el ? el.value : "";
    });
    return payload;
  }

  function buildQuery(params) {
    return Object.keys(params)
      .map(function (key) {
        return key + "=" + encodeURIComponent(params[key] == null ? "" : String(params[key]));
      })
      .join("&");
  }

  async function loadProfile(lineId) {
    setStatus("読み込み中...");
    try {
      const url = FETCH_WEBHOOK + "?line_id=" + encodeURIComponent(lineId);
      const response = await fetch(url, { method: "GET" });
      if (!response.ok) {
        throw new Error("HTTP " + response.status);
      }

      const json = await response.json();
      const userData = normalizeData(json);
      setFormValues(userData);
      setStatus("");
    } catch (error) {
      setStatus("データ取得失敗", "error");
    }
  }

  async function saveProfile(lineId) {
    if (saveButton) saveButton.disabled = true;
    setStatus("保存中...");

    try {
      const payload = collectPayload(lineId);
      const url = SAVE_WEBHOOK + "?" + buildQuery(payload);
      const response = await fetch(url, { method: "GET" });
      if (!response.ok) {
        throw new Error("HTTP " + response.status);
      }

      setStatus("保存しました", "success");
      alert("保存しました");
    } catch (error) {
      setStatus("保存失敗", "error");
      alert("保存失敗");
    } finally {
      if (saveButton) saveButton.disabled = false;
    }
  }

  const lineId = getLineId();
  if (!lineId) {
    setStatus("line_id が見つかりません", "error");
    return;
  }

  loadProfile(lineId);

  if (saveButton) {
    saveButton.addEventListener("click", function () {
      saveProfile(lineId);
    });
  }
});
