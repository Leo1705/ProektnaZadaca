"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { mk } from "date-fns/locale";
import {
  MessageSquare,
  Upload,
  FileText,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Subject = {
  id: string;
  name: string;
  homework: {
    id: string;
    title: string;
    description: string | null;
    dueDate: Date | null;
  }[];
};

type Submission = {
  id: string;
  fileUrl: string | null;
  comment: string | null;
  submittedAt: Date;
  feedback: { id: string; comment: string; createdAt: Date; teacher: { name: string } }[];
};

export function HomeworkList({
  subjects,
  selectedSubjectId,
  selectedTaskId,
  userId,
}: {
  subjects: Subject[];
  selectedSubjectId?: string;
  selectedTaskId?: string;
  userId: string;
}) {
  const [submissions, setSubmissions] = useState<Record<string, Submission[]>>({});
  const [loading, setLoading] = useState<string | null>(null);

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);
  const allHomework = selectedSubject?.homework ?? [];

  async function loadSubmissions(homeworkId: string) {
    if (submissions[homeworkId]) return;
    setLoading(homeworkId);
    try {
      const res = await fetch(`/api/homework/submissions?homeworkId=${homeworkId}`);
      const data = await res.json();
      if (data.submissions) setSubmissions((prev) => ({ ...prev, [homeworkId]: data.submissions }));
    } finally {
      setLoading(null);
    }
  }

  useEffect(() => {
    if (!selectedTaskId) return;
    if (submissions[selectedTaskId]) return;
    setLoading(selectedTaskId);
    fetch(`/api/homework/submissions?homeworkId=${selectedTaskId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.submissions)
          setSubmissions((prev) => ({ ...prev, [selectedTaskId]: data.submissions }));
      })
      .finally(() => setLoading(null));
  }, [selectedTaskId]);

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="md:w-56 shrink-0">
        <p className="text-sm font-medium text-slate-600 mb-2">Предмет</p>
        <ul className="space-y-1">
          {subjects.map((s) => (
            <li key={s.id}>
              <Link
                href={`/dashboard/homework?subject=${s.id}`}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors",
                  selectedSubjectId === s.id
                    ? "bg-primary-500 text-white"
                    : "text-slate-700 hover:bg-primary-50"
                )}
              >
                <BookOpen className="w-4 h-4" />
                {s.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex-1 space-y-4">
        {allHomework.length === 0 ? (
          <p className="text-slate-500">Нема домашни за овој предмет.</p>
        ) : (
          allHomework.map((h) => (
            <div
              key={h.id}
              className="bg-white rounded-2xl border border-primary-50 shadow-soft overflow-hidden"
            >
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800">{h.title}</h3>
                  {h.dueDate && (
                    <p className="text-sm text-slate-500 mt-0.5">
                      Рок: {format(new Date(h.dueDate), "d MMM yyyy", { locale: mk })}
                    </p>
                  )}
                </div>
                <Link
                  href={`/dashboard/homework?subject=${selectedSubjectId}&task=${h.id}`}
                  className="text-primary-600 text-sm font-medium hover:underline"
                >
                  Детали
                </Link>
              </div>
              <HomeworkTaskBlock
                homeworkId={h.id}
                homeworkTitle={h.title}
                submissions={submissions[h.id]}
                loading={loading === h.id}
                onLoad={() => loadSubmissions(h.id)}
                isSelected={selectedTaskId === h.id}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function HomeworkTaskBlock({
  homeworkId,
  homeworkTitle,
  submissions,
  loading,
  onLoad,
  isSelected,
}: {
  homeworkId: string;
  homeworkTitle: string;
  submissions?: Submission[];
  loading: boolean;
  onLoad: () => void;
  isSelected?: boolean;
}) {
  const [showUpload, setShowUpload] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const hasSubmission = submissions && submissions.length > 0;
  const latestSubmission = hasSubmission ? submissions[submissions.length - 1] : null;
  const latestFeedback = latestSubmission?.feedback?.[latestSubmission.feedback.length - 1];

  return (
    <div className="border-t border-primary-50 bg-surface-50/50 p-4">
      {!submissions && !loading && (
        <button
          type="button"
          onClick={onLoad}
          className="text-sm text-primary-600 font-medium hover:underline"
        >
          Покажи ги поднесените и повратните информации
        </button>
      )}
      {loading && <p className="text-sm text-slate-500">Се вчитува...</p>}
      {submissions && (
        <>
          {latestSubmission && (
            <div className="mb-4">
              <p className="text-sm font-medium text-slate-700 mb-1">Вашето поднесено решение</p>
              <p className="text-sm text-slate-600">
                Поднесено:{" "}
                {format(new Date(latestSubmission.submittedAt), "d MMM yyyy, HH:mm", {
                  locale: mk,
                })}
              </p>
              {latestSubmission.fileUrl && (
                <a
                  href={latestSubmission.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary-600 text-sm mt-1 hover:underline"
                >
                  <FileText className="w-4 h-4" />
                  Отвори датотека
                </a>
              )}
            </div>
          )}
          {latestFeedback && (
            <div className="p-3 rounded-xl bg-primary-50 border border-primary-100 mb-4">
              <p className="flex items-center gap-2 text-sm font-medium text-slate-800 mb-1">
                <MessageSquare className="w-4 h-4 text-primary-500" />
                Повратна информација од наставник
              </p>
              <p className="text-slate-700 text-sm">{latestFeedback.comment}</p>
              <p className="text-xs text-slate-500 mt-1">
                {latestFeedback.teacher.name} ·{" "}
                {format(new Date(latestFeedback.createdAt), "d MMM yyyy", { locale: mk })}
              </p>
            </div>
          )}
          {!showUpload ? (
            <button
              type="button"
              onClick={() => setShowUpload(true)}
              className="inline-flex items-center gap-2 text-primary-600 text-sm font-medium hover:underline"
            >
              <Upload className="w-4 h-4" />
              {hasSubmission ? "Преподнеси решение" : "Поднеси решение"}
            </button>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!file) return;
                setSubmitting(true);
                const formData = new FormData();
                formData.append("file", file);
                formData.append("homeworkId", homeworkId);
                try {
                  const res = await fetch("/api/homework/submit", {
                    method: "POST",
                    body: formData,
                  });
                  if (res.ok) {
                    setShowUpload(false);
                    setFile(null);
                    onLoad();
                  }
                } finally {
                  setSubmitting(false);
                }
              }}
              className="space-y-3"
            >
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-700"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={!file || submitting}
                  className="px-4 py-2 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 disabled:opacity-50"
                >
                  {submitting ? "Се поднесува..." : "Поднеси"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUpload(false);
                    setFile(null);
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Откажи
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}
