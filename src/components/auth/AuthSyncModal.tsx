"use client";

import React, { useState, useRef } from "react";
import {
  Download,
  Upload,
  ShieldCheck,
  Cloud,
  CheckCircle,
  AlertTriangle,
  X,
  Mail,
  Key,
  RefreshCw } from "lucide-react";
import { useCFAStore } from "@/store/useCFAStore";
import { supabaseRest } from "@/lib/supabase/client";
import { sound } from "@/components/common/SoundEffects";
import { BackupPayload, validateBackupPayload } from "@/lib/backup/schema";
import { useAccessibleDialog } from "@/hooks/useAccessibleDialog";

interface AuthSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthSyncModal: React.FC<AuthSyncModalProps> = ({ isOpen, onClose }) => {
  const {
    completedTopicIds,
    inProgressTopicId,
    vignetteResults,
    practiceAttempts,
    practiceSessions,
    activePracticeSessionId,
    trapLogs,
    customVignettes,
    leitnerCards,
    soundEnabled } = useCFAStore();

  const [activeTab, setActiveTab] = useState<"backup" | "cloud">("backup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingBackup, setPendingBackup] = useState<BackupPayload | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useAccessibleDialog<HTMLDivElement>(isOpen, onClose);

  if (!isOpen) return null;

  // 1-Click JSON Export
  const handleExportJSON = () => {
    if (soundEnabled) sound.playSuccessChime();
    const backupData = {
      product: "cfa-wizard",
      schemaVersion: 4,
      exportedAt: new Date().toISOString(),
      restoreMode: "replace",
      data: {
        completedTopicIds,
        inProgressTopicId,
        vignetteResults,
        practiceAttempts,
        practiceSessions,
        activePracticeSessionId,
        trapLogs,
        customVignettes,
        leitnerCards } };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cfa-wizard-progress-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setStatusMessage({
      type: "success",
      text: "Progress backup JSON successfully downloaded to your device." });
  };

  // 1-Click JSON Import
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        let parsed: unknown;
        try {
          parsed = JSON.parse(content);
        } catch {
          setStatusMessage({
            type: "error",
            text: "Invalid JSON syntax. Please check the backup file." });
          return;
        }

        const validation = validateBackupPayload(parsed);
        if (!validation.success || !validation.data) {
          setStatusMessage({
            type: "error",
            text: validation.error || "Invalid backup envelope structure." });
          return;
        }

        setPendingBackup(validation.data);
        setStatusMessage({
          type: "info",
          text: `Backup validated. Review the replacement summary before applying.${validation.warnings?.length ? ` ${validation.warnings.join(" ")}` : ""}` });
      } catch {
        setStatusMessage({
          type: "error",
          text: "Unexpected error restoring backup. Please verify the file." });
      }
    };
    reader.readAsText(file);
  };

  const applyPendingBackup = () => {
    if (!pendingBackup) return;
    const valid = pendingBackup.data;
    useCFAStore.setState({
      completedTopicIds: valid.completedTopicIds,
      inProgressTopicId: valid.inProgressTopicId || "01",
      vignetteResults: valid.vignetteResults,
      practiceAttempts: valid.practiceAttempts,
      practiceSessions: valid.practiceSessions,
      activePracticeSessionId: valid.activePracticeSessionId,
      practiceDraft: null,
      mockExamDraft: null,
      trapLogs: valid.trapLogs,
      customVignettes: valid.customVignettes,
      leitnerCards: valid.leitnerCards,
    });
    if (soundEnabled) sound.playSuccessChime();
    setPendingBackup(null);
    setStatusMessage({ type: "success", text: "Backup applied. Existing local study data was replaced." });
  };

  // Cloud Auth (Supabase)
  const handleCloudAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    setStatusMessage(null);

    if (authMode === "signin") {
      const res = await supabaseRest.signInWithEmail(email, password);
      if (res.error) {
        setStatusMessage({ type: "error", text: res.error });
      } else if (res.session) {
        setStatusMessage({ type: "success", text: "Successfully authenticated with Supabase!" });
        // Trigger initial sync
        await supabaseRest.syncUserData(res.session.access_token, {
          id: res.session.user.id,
          completed_topic_ids: completedTopicIds,
          updated_at: new Date().toISOString(),
        });
      }
    } else {
      const res = await supabaseRest.signUpWithEmail(email, password);
      if (res.error) {
        setStatusMessage({ type: "error", text: res.error });
      } else {
        setStatusMessage({
          type: "success",
          text: "Account registered! Check email for confirmation or sign in.",
        });
      }
    }
    setIsLoading(false);
  };

  return (
    <div
      ref={dialogRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-sync-title"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="liquid-glass-card rounded-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.04]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-accent/20 flex items-center justify-center text-accent font-bold tabular-nums">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h2 id="auth-sync-title" className="text-base font-bold text-white tracking-wide">
                Progress Persistence & Cloud Sync
              </h2>
              <p className="text-xs text-muted tabular-nums">
                Local-First Architecture • Zero-Risk JSON Backup • Optional Supabase Sync
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-muted hover:text-white p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 bg-surface-interactive p-1 rounded-xl border border-control tabular-nums text-xs">
          <button
            onClick={() => {
              setActiveTab("backup");
              setStatusMessage(null);
            }}
            className={`py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "backup"
                ? "bg-accent text-accent-ink "
                : "text-muted hover:text-white"
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Backup file</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("cloud");
              setStatusMessage(null);
            }}
            className={`py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "cloud"
                ? "bg-accent text-accent-ink "
                : "text-muted hover:text-white"
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Cloud sync</span>
          </button>
        </div>

        {/* Status Alerts */}
        {statusMessage && (
          <div
            className={`p-3 rounded-xl border tabular-nums text-xs flex items-center gap-2 ${
              statusMessage.type === "success"
                ? "bg-accent/10 border-accent/40 text-accent"
                : "bg-danger/10 border-danger/40 text-danger"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Tab 1: 1-Click JSON Backup & Restore (Zero Risk) */}
        {activeTab === "backup" && (
          <div className="space-y-4 tabular-nums text-xs">
            <div className="p-4 bg-surface-interactive border border-control rounded-xl space-y-3">
              <div className="flex items-center justify-between font-bold text-white">
                <span className="flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-accent" />
                  <span>Export Study Progress JSON</span>
                </span>
                <span className="text-[10px] text-muted">Pure Local File</span>
              </div>
              <p className="text-[11px] font-sans text-muted-strong leading-relaxed">
                Download a clean JSON archive containing your complete drill history, topic mastery, logged error autopsies, and Leitner flashcard intervals.
              </p>
              <button
                onClick={handleExportJSON}
                className="w-full py-2.5 rounded-lg bg-accent text-accent-ink font-semibold hover:bg-accent-strong transition-all"
              >
                Download backup
              </button>
            </div>

            <div className="p-4 bg-surface-interactive border border-control rounded-xl space-y-3">
              <div className="flex items-center justify-between font-bold text-white">
                <span className="flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-info" />
                  <span>Restore from JSON File</span>
                </span>
                <span className="text-[10px] text-muted">Validated Replace</span>
              </div>
              <p className="text-[11px] font-sans text-muted-strong leading-relaxed">
                Validate a backup, review its summary, then explicitly replace the study data stored in this browser.
              </p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportJSON}
                accept=".json"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 rounded-lg bg-surface-raised text-foreground border border-control hover:bg-surface-raised font-bold transition-all"
              >
                Restore from a backup file
              </button>
              {pendingBackup && (
                <div className="space-y-3 rounded-lg border border-warning/40 bg-warning/10 p-3 text-warning">
                  <p className="font-sans leading-relaxed">
                    This will replace local data with {pendingBackup.data.practiceAttempts.length} attempts, {pendingBackup.data.completedTopicIds.length} completed topics, {pendingBackup.data.leitnerCards.length} review cards, and {pendingBackup.data.customVignettes.length} generated drafts.
                  </p>
                  <div className="flex gap-2">
                    <button onClick={applyPendingBackup} className="min-h-11 flex-1 rounded-lg bg-warning px-3 text-black font-bold">Replace local data</button>
                    <button onClick={() => setPendingBackup(null)} className="min-h-11 rounded-lg border border-warning/40 px-3">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Supabase Cloud Sync */}
        {activeTab === "cloud" && (
          <div className="space-y-4">
            <div className="p-3 bg-surface-interactive border border-control rounded-xl space-y-1 tabular-nums text-[11px] text-muted-strong">
              <div className="flex items-center gap-2 font-bold text-white">
                <ShieldCheck className="w-4 h-4 text-accent shrink-0" />
                <span>Cloud Sync Scope & Local-First Storage</span>
              </div>
              <p className="text-[11px] font-sans text-muted leading-relaxed">
                Supabase cloud sync secures topic completions across devices with PostgreSQL RLS. Detailed attempt records, distractor autopsies, and Leitner flashcards remain securely stored on your device and can be backed up via the JSON Export tab.
              </p>
            </div>

            <form onSubmit={handleCloudAuth} className="space-y-3 tabular-nums text-xs">
              <div className="space-y-1">
                <label className="text-muted block">Candidate Email:</label>
                <div className="flex items-center bg-surface-interactive border border-control rounded-lg px-3 py-2">
                  <Mail className="w-4 h-4 text-muted mr-2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="candidate@apexcapital.com"
                    required
                    className="w-full bg-transparent text-white placeholder:text-muted focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-muted block">Password:</label>
                <div className="flex items-center bg-surface-interactive border border-control rounded-lg px-3 py-2">
                  <Key className="w-4 h-4 text-muted mr-2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full bg-transparent text-white placeholder:text-muted focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === "signin" ? "signup" : "signin")}
                  className="text-accent text-[11px] hover:underline"
                >
                  {authMode === "signin"
                    ? "Need an account? Register"
                    : "Already registered? Sign In"}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-accent text-accent-ink font-semibold hover:bg-accent-strong transition-all flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <span>{authMode === "signin" ? "Sign in and sync" : "Create account"}</span>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Footer Security Transparency Banner */}
        <div className="p-3 bg-background-elevated border border-white/5 rounded-xl flex items-center justify-between tabular-nums text-[10px] text-muted">
          <span>Encrypted in transit (HTTPS)</span>
          <span>Your data stays on this device unless you sync</span>
        </div>
      </div>
    </div>
  );
};
