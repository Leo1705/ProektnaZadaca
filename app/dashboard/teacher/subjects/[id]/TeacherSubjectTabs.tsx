"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  ClipboardList,
  FileText,
  Plus,
  MessageSquare,
  ExternalLink,
  User,
  CheckCircle,
} from "lucide-react";
import { format } from "date-fns";
import { mk } from "date-fns/locale";
import { cn } from "@/lib/utils";

type Module = {
  id: string;
  title: string;
  description: string | null;
  order: number;
  resources: { id: string; title: string; type: string; url: string }[];
};
type Resource = { id: string; title: string; type: string; url: string };
type Homework = {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  maxPoints?: number | null;
  published: boolean;
  resources: { id: string; title: string; type: string; url: string }[];
  submissions: {
    id: string;
    fileUrl: string | null;
    submittedAt: Date;
    student: { id: string; name: string };
    feedback: { id: string; comment: string; teacherId: string }[];
  }[];
};
type Subject = {
  id: string;
  name: string;
  modules: Module[];
  resources: Resource[];
  homework: Homework[];
  students: { student: { id: string; name: string } }[];
};

export function TeacherSubjectTabs({
  subject,
  activeTab,
  highlightSubmissionId,
}: {
  subject: Subject;
  activeTab: string;
  highlightSubmissionId?: string;
}) {
  const router = useRouter();
  const [tab, setTab] = useState(activeTab);
  const [feedbackText, setFeedbackText] = useState<Record<string, string>>({});
  const [submittingFeedback, setSubmittingFeedback] = useState<string | null>(null);
  const [showAddModule, setShowAddModule] = useState(false);
  const [showAddResource, setShowAddResource] = useState<string | null>(null);
  const [showAddHomework, setShowAddHomework] = useState(false);
  const [loading, setLoading] = useState(false);
  const [moduleForm, setModuleForm] = useState({ title: "", description: "" });
  const [resourceForm, setResourceForm] = useState({
    title: "",
    type: "link" as "link" | "file",
    url: "",
    file: null as File | null,
  });
  const [homeworkForm, setHomeworkForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    maxPoints: "",
    publishNow: false,
  });
  const [showAddHomeworkResource, setShowAddHomeworkResource] = useState<string | null>(null);
  const [homeworkResourceForm, setHomeworkResourceForm] = useState({
    title: "",
    type: "link" as "link" | "file",
    url: "",
    file: null as File | null,
  });
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const tabs = [
    { id: "content", label: "Содржина и модули", icon: BookOpen },
    { id: "homework", label: "Домашни", icon: ClipboardList },
  ];

  async function submitFeedback(submissionId: string) {
    const comment = feedbackText[submissionId]?.trim();
    if (!comment) return;
    setSubmittingFeedback(submissionId);
    try {
      const res = await fetch("/api/teacher/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId, comment }),
      });
      if (res.ok) {
        setFeedbackText((prev) => ({ ...prev, [submissionId]: "" }));
        router.refresh();
      }
    } finally {
      setSubmittingFeedback(null);
    }
  }

  async function addModule() {
    if (!moduleForm.title.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/teacher/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: subject.id,
          title: moduleForm.title.trim(),
          description: moduleForm.description.trim() || null,
        }),
      });
      if (res.ok) {
        setModuleForm({ title: "", description: "" });
        setShowAddModule(false);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  async function addResource(moduleId: string | null) {
    const title = resourceForm.title.trim();
    if (!title) return;
    if (resourceForm.type === "link" && !resourceForm.url.trim()) return;
    if (resourceForm.type === "file" && !resourceForm.file) return;
    setLoading(true);
    try {
      if (resourceForm.type === "file" && resourceForm.file) {
        const fd = new FormData();
        fd.append("subjectId", subject.id);
        if (moduleId) fd.append("moduleId", moduleId);
        fd.append("title", title);
        fd.append("type", "file");
        fd.append("file", resourceForm.file);
        const res = await fetch("/api/teacher/resources", { method: "POST", body: fd });
        if (res.ok) {
          setResourceForm({ title: "", type: "link", url: "", file: null });
          setShowAddResource(null);
          router.refresh();
        }
      } else {
        const res = await fetch("/api/teacher/resources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subjectId: subject.id,
            moduleId: moduleId || undefined,
            title,
            type: "link",
            url: resourceForm.url.trim(),
          }),
        });
        if (res.ok) {
          setResourceForm({ title: "", type: "link", url: "", file: null });
          setShowAddResource(null);
          router.refresh();
        }
      }
    } finally {
      setLoading(false);
    }
  }

  async function createHomework() {
    if (!homeworkForm.title.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/teacher/homework", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: subject.id,
          title: homeworkForm.title.trim(),
          description: homeworkForm.description.trim() || null,
          dueDate: homeworkForm.dueDate || null,
          maxPoints: homeworkForm.maxPoints ? Number(homeworkForm.maxPoints) : null,
          published: homeworkForm.publishNow,
        }),
      });
      if (res.ok) {
        setHomeworkForm({ title: "", description: "", dueDate: "", maxPoints: "", publishNow: false });
        setShowAddHomework(false);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  async function addHomeworkResource(homeworkId: string) {
    const title = homeworkResourceForm.title.trim();
    if (!title) return;
    if (homeworkResourceForm.type === "link" && !homeworkResourceForm.url.trim()) return;
    if (homeworkResourceForm.type === "file" && !homeworkResourceForm.file) return;
    setLoading(true);
    try {
      if (homeworkResourceForm.type === "file" && homeworkResourceForm.file) {
        const fd = new FormData();
        fd.append("homeworkId", homeworkId);
        fd.append("title", title);
        fd.append("type", "file");
        fd.append("file", homeworkResourceForm.file);
        const res = await fetch("/api/teacher/homework-resources", { method: "POST", body: fd });
        if (res.ok) {
          setHomeworkResourceForm({ title: "", type: "link", url: "", file: null });
          setShowAddHomeworkResource(null);
          router.refresh();
        }
      } else {
        const res = await fetch("/api/teacher/homework-resources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            homeworkId,
            title,
            type: "link",
            url: homeworkResourceForm.url.trim(),
          }),
        });
        if (res.ok) {
          setHomeworkResourceForm({ title: "", type: "link", url: "", file: null });
          setShowAddHomeworkResource(null);
          router.refresh();
        }
      }
    } finally {
      setLoading(false);
    }
  }

  async function publishHomework(homeworkId: string) {
    setPublishingId(homeworkId);
    try {
      const res = await fetch(`/api/teacher/homework/${homeworkId}/publish`, { method: "PATCH" });
      if (res.ok) router.refresh();
    } finally {
      setPublishingId(null);
    }
  }

  return (
    <div>
      <div className="flex gap-2 border-b border-primary-100 mb-6">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-t-xl text-sm font-medium transition-colors",
              tab === t.id
                ? "bg-primary-500 text-white"
                : "text-slate-600 hover:bg-primary-50 hover:text-primary-700"
            )}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "content" && (
        <div className="space-y-8">
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-500" />
                Документи и линкови на предметот
              </h3>
              <button
                type="button"
                onClick={() => setShowAddResource(showAddResource === "subject" ? null : "subject")}
                className="text-sm text-primary-600 font-medium hover:underline flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Додај документ или линк
              </button>
            </div>
            {showAddResource === "subject" && (
              <div className="p-4 rounded-xl bg-primary-50/50 border border-primary-100 mb-4 space-y-3">
                <input
                  type="text"
                  placeholder="Наслов"
                  value={resourceForm.title}
                  onChange={(e) => setResourceForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                />
                <select
                  value={resourceForm.type}
                  onChange={(e) =>
                    setResourceForm((f) => ({ ...f, type: e.target.value as "link" | "file" }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                >
                  <option value="link">Линк</option>
                  <option value="file">Датотека</option>
                </select>
                {resourceForm.type === "link" && (
                  <input
                    type="url"
                    placeholder="URL (напр. https://...)"
                    value={resourceForm.url}
                    onChange={(e) => setResourceForm((f) => ({ ...f, url: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  />
                )}
                {resourceForm.type === "file" && (
                  <input
                    type="file"
                    onChange={(e) =>
                      setResourceForm((f) => ({ ...f, file: e.target.files?.[0] ?? null }))
                    }
                    className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-100 file:text-primary-700"
                  />
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => addResource(null)}
                    disabled={loading}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 disabled:opacity-50"
                  >
                    {loading ? "Се зачувува..." : "Зачувај"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddResource(null);
                      setResourceForm({ title: "", type: "link", url: "", file: null });
                    }}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-sm"
                  >
                    Откажи
                  </button>
                </div>
              </div>
            )}
            {subject.resources && subject.resources.length > 0 && (
              <ul className="space-y-2">
                {subject.resources.map((r) => (
                  <li key={r.id}>
                    <a
                      href={r.url.startsWith("http") ? r.url : r.url}
                      target={r.url.startsWith("http") ? "_blank" : undefined}
                      rel={r.url.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="flex items-center gap-2 p-3 rounded-xl bg-white border border-primary-50 hover:bg-primary-50/50"
                    >
                      {r.type === "link" ? (
                        <ExternalLink className="w-4 h-4 text-primary-500" />
                      ) : (
                        <FileText className="w-4 h-4 text-primary-500" />
                      )}
                      {r.title}
                    </a>
                  </li>
                ))}
              </ul>
            )}
            {(!subject.resources || subject.resources.length === 0) && !showAddResource && (
              <p className="text-slate-500 text-sm">Нема документи. Додајте линк или датотека.</p>
            )}
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-800">Модули</h3>
              <button
                type="button"
                onClick={() => setShowAddModule(!showAddModule)}
                className="text-sm text-primary-600 font-medium hover:underline flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Додај модул
              </button>
            </div>
            {showAddModule && (
              <div className="p-4 rounded-xl bg-primary-50/50 border border-primary-100 mb-4 space-y-3">
                <input
                  type="text"
                  placeholder="Наслов на модул"
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                />
                <input
                  type="text"
                  placeholder="Опис (опционално)"
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={addModule}
                    disabled={loading}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 disabled:opacity-50"
                  >
                    {loading ? "Се зачувува..." : "Зачувај модул"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModule(false);
                      setModuleForm({ title: "", description: "" });
                    }}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-sm"
                  >
                    Откажи
                  </button>
                </div>
              </div>
            )}
            {subject.modules.length === 0 && !showAddModule ? (
              <p className="text-slate-500 text-sm">Нема модули. Додајте нов модул.</p>
            ) : (
              <ul className="space-y-3">
                {subject.modules.map((mod) => (
                  <li key={mod.id} className="p-4 rounded-xl bg-white border border-primary-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-800">{mod.title}</p>
                        {mod.description && (
                          <p className="text-sm text-slate-600 mt-1">{mod.description}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setShowAddResource(showAddResource === mod.id ? null : mod.id)
                        }
                        className="text-xs text-primary-600 font-medium hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Додај ресурс
                      </button>
                    </div>
                    {showAddResource === mod.id && (
                      <div className="mt-3 p-3 rounded-lg bg-slate-50 space-y-2">
                        <input
                          type="text"
                          placeholder="Наслов"
                          value={resourceForm.title}
                          onChange={(e) =>
                            setResourceForm((f) => ({ ...f, title: e.target.value }))
                          }
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                        />
                        <select
                          value={resourceForm.type}
                          onChange={(e) =>
                            setResourceForm((f) => ({
                              ...f,
                              type: e.target.value as "link" | "file",
                            }))
                          }
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                        >
                          <option value="link">Линк</option>
                          <option value="file">Датотека</option>
                        </select>
                        {resourceForm.type === "link" && (
                          <input
                            type="url"
                            placeholder="URL"
                            value={resourceForm.url}
                            onChange={(e) =>
                              setResourceForm((f) => ({ ...f, url: e.target.value }))
                            }
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                          />
                        )}
                        {resourceForm.type === "file" && (
                          <input
                            type="file"
                            onChange={(e) =>
                              setResourceForm((f) => ({
                                ...f,
                                file: e.target.files?.[0] ?? null,
                              }))
                            }
                            className="block w-full text-sm"
                          />
                        )}
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => addResource(mod.id)}
                            disabled={loading}
                            className="px-3 py-1.5 bg-primary-500 text-white rounded-lg text-sm disabled:opacity-50"
                          >
                            Зачувај
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddResource(null);
                              setResourceForm({ title: "", type: "link", url: "", file: null });
                            }}
                            className="px-3 py-1.5 border rounded-lg text-sm"
                          >
                            Откажи
                          </button>
                        </div>
                      </div>
                    )}
                    <ul className="mt-2 space-y-1">
                      {mod.resources.map((r) => (
                        <li key={r.id} className="flex items-center gap-2 text-sm text-slate-600">
                          <FileText className="w-4 h-4 text-primary-500" />
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary-600"
                          >
                            {r.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}

      {tab === "homework" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Домашни задачи</h3>
            <button
              type="button"
              onClick={() => setShowAddHomework(!showAddHomework)}
              className="text-sm text-primary-600 font-medium hover:underline flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Нова домашна
            </button>
          </div>
          {showAddHomework && (
            <div className="p-5 rounded-2xl bg-primary-50/50 border border-primary-100 space-y-3">
              <input
                type="text"
                placeholder="Наслов на домашна"
                value={homeworkForm.title}
                onChange={(e) =>
                  setHomeworkForm((f) => ({ ...f, title: e.target.value }))
                }
                className="w-full px-4 py-2 rounded-xl border border-slate-200"
              />
              <textarea
                placeholder="Опис / упатство (опционално)"
                value={homeworkForm.description}
                onChange={(e) =>
                  setHomeworkForm((f) => ({ ...f, description: e.target.value }))
                }
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm min-h-[80px]"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Рок за предавање</label>
                  <input
                    type="datetime-local"
                    value={homeworkForm.dueDate}
                    onChange={(e) =>
                      setHomeworkForm((f) => ({ ...f, dueDate: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Макс. поени (опционално)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="напр. 100"
                    value={homeworkForm.maxPoints}
                    onChange={(e) =>
                      setHomeworkForm((f) => ({ ...f, maxPoints: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={homeworkForm.publishNow}
                  onChange={(e) =>
                    setHomeworkForm((f) => ({ ...f, publishNow: e.target.checked }))
                  }
                  className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                Објави веднаш (студентите ќе ја видат домашната)
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={createHomework}
                  disabled={loading}
                  className="px-4 py-2 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 disabled:opacity-50"
                >
                  {loading ? "Се зачувува..." : "Креирај домашна"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddHomework(false);
                    setHomeworkForm({ title: "", description: "", dueDate: "", maxPoints: "", publishNow: false });
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm"
                >
                  Откажи
                </button>
              </div>
            </div>
          )}
          {subject.homework.length === 0 && !showAddHomework ? (
            <p className="text-slate-500">Нема домашни. Додајте нова домашна задача.</p>
          ) : (
            subject.homework.map((h) => (
              <div
                key={h.id}
                className="rounded-2xl border border-primary-50 bg-white overflow-hidden"
              >
                <div className="p-4 border-b border-primary-50">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-slate-800">{h.title}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-sm text-slate-500 mt-0.5">
                        {h.dueDate && (
                          <span>
                            Рок: {format(new Date(h.dueDate), "d MMM yyyy, HH:mm", { locale: mk })}
                          </span>
                        )}
                        {h.maxPoints != null && (
                          <span>Макс. поени: {h.maxPoints}</span>
                        )}
                        {h.published ? (
                          <span className="text-green-600 font-medium">Објавена</span>
                        ) : (
                          <span className="text-amber-600 font-medium">Необјавена</span>
                        )}
                      </div>
                    </div>
                    {!h.published && (
                      <button
                        type="button"
                        onClick={() => publishHomework(h.id)}
                        disabled={publishingId === h.id}
                        className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {publishingId === h.id ? "Се објавува..." : "Објави"}
                      </button>
                    )}
                  </div>
                  {(h.resources?.length ?? 0) > 0 && (
                    <div className="mt-3 pt-3 border-t border-primary-50">
                      <p className="text-xs font-medium text-slate-500 mb-1">Датотеки / линкови на домашната</p>
                      <ul className="space-y-1">
                        {h.resources.map((r) => (
                          <li key={r.id}>
                            <a
                              href={r.url.startsWith("http") ? r.url : r.url}
                              target={r.url.startsWith("http") ? "_blank" : undefined}
                              rel={r.url.startsWith("http") ? "noopener noreferrer" : undefined}
                              className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:underline"
                            >
                              {r.type === "link" ? (
                                <ExternalLink className="w-3.5 h-3.5" />
                              ) : (
                                <FileText className="w-3.5 h-3.5" />
                              )}
                              {r.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() =>
                        setShowAddHomeworkResource(showAddHomeworkResource === h.id ? null : h.id)
                      }
                      className="text-xs text-primary-600 font-medium hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Додај датотека или линк
                    </button>
                    {showAddHomeworkResource === h.id && (
                      <div className="mt-2 p-3 rounded-lg bg-slate-50 space-y-2">
                        <input
                          type="text"
                          placeholder="Наслов"
                          value={homeworkResourceForm.title}
                          onChange={(e) =>
                            setHomeworkResourceForm((f) => ({ ...f, title: e.target.value }))
                          }
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                        />
                        <select
                          value={homeworkResourceForm.type}
                          onChange={(e) =>
                            setHomeworkResourceForm((f) => ({
                              ...f,
                              type: e.target.value as "link" | "file",
                            }))
                          }
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                        >
                          <option value="link">Линк</option>
                          <option value="file">Датотека</option>
                        </select>
                        {homeworkResourceForm.type === "link" && (
                          <input
                            type="url"
                            placeholder="URL"
                            value={homeworkResourceForm.url}
                            onChange={(e) =>
                              setHomeworkResourceForm((f) => ({ ...f, url: e.target.value }))
                            }
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                          />
                        )}
                        {homeworkResourceForm.type === "file" && (
                          <input
                            type="file"
                            onChange={(e) =>
                              setHomeworkResourceForm((f) => ({
                                ...f,
                                file: e.target.files?.[0] ?? null,
                              }))
                            }
                            className="block w-full text-sm"
                          />
                        )}
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => addHomeworkResource(h.id)}
                            disabled={loading}
                            className="px-3 py-1.5 bg-primary-500 text-white rounded-lg text-sm disabled:opacity-50"
                          >
                            Зачувај
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddHomeworkResource(null);
                              setHomeworkResourceForm({ title: "", type: "link", url: "", file: null });
                            }}
                            className="px-3 py-1.5 border rounded-lg text-sm"
                          >
                            Откажи
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <ul className="divide-y divide-primary-50">
                  {h.submissions.length === 0 ? (
                    <li className="p-4 text-slate-500 text-sm">Нема поднесени решенија.</li>
                  ) : (
                    h.submissions.map((sub) => (
                      <li
                        key={sub.id}
                        className={cn(
                          "p-4",
                          highlightSubmissionId === sub.id && "bg-primary-50/50"
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="flex items-center gap-2 font-medium text-slate-800">
                            <User className="w-4 h-4 text-slate-500" />
                            {sub.student.name}
                          </span>
                          <span className="text-sm text-slate-500">
                            {format(new Date(sub.submittedAt), "d MMM yyyy, HH:mm", {
                              locale: mk,
                            })}
                          </span>
                        </div>
                        {sub.fileUrl && (
                          <a
                            href={sub.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary-600 hover:underline mb-2"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Отвори датотека
                          </a>
                        )}
                        {sub.feedback.length > 0 ? (
                          <div className="p-3 rounded-lg bg-primary-50 text-sm text-slate-700">
                            {sub.feedback[sub.feedback.length - 1].comment}
                          </div>
                        ) : (
                          <div className="mt-2 flex gap-2">
                            <input
                              type="text"
                              value={feedbackText[sub.id] ?? ""}
                              onChange={(e) =>
                                setFeedbackText((prev) => ({
                                  ...prev,
                                  [sub.id]: e.target.value,
                                }))
                              }
                              placeholder="Додај повратна информација..."
                              className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-primary-400 focus:ring-1 focus:ring-primary-100 outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => submitFeedback(sub.id)}
                              disabled={
                                !feedbackText[sub.id]?.trim() ||
                                submittingFeedback === sub.id
                              }
                              className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 disabled:opacity-50 flex items-center gap-1"
                            >
                              <MessageSquare className="w-4 h-4" />
                              {submittingFeedback === sub.id ? "Се зачувува..." : "Зачувај"}
                            </button>
                          </div>
                        )}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
