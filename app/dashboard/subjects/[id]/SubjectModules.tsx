"use client";

import { useState } from "react";
import { FileText, ExternalLink, ChevronDown, ChevronRight } from "lucide-react";

type Resource = { id: string; title: string; type: string; url: string };
type Module = {
  id: string;
  title: string;
  description: string | null;
  resources: Resource[];
};

export function SubjectModules({ modules }: { modules: Module[] }) {
  const [openId, setOpenId] = useState<string | null>(modules[0]?.id ?? null);

  if (modules.length === 0) return null;

  return (
    <section>
      <h2 className="font-semibold text-slate-800 mb-3">Модули</h2>
      <ul className="space-y-2">
        {modules.map((mod) => {
          const isOpen = openId === mod.id;
          return (
            <li
              key={mod.id}
              className="bg-white rounded-xl border border-primary-50 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : mod.id)}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-primary-50/50 transition-colors"
              >
                {isOpen ? (
                  <ChevronDown className="w-5 h-5 text-primary-500 shrink-0" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-primary-500 shrink-0" />
                )}
                <span className="font-medium text-slate-800">{mod.title}</span>
              </button>
              {isOpen && (
                <div className="px-4 pb-4 pt-0 border-t border-primary-50">
                  {mod.description && (
                    <p className="text-sm text-slate-600 mb-3 mt-2">
                      {mod.description}
                    </p>
                  )}
                  <ul className="space-y-2">
                    {mod.resources.map((r) => (
                      <li key={r.id}>
                        <a
                          href={r.url.startsWith("http") ? r.url : r.url}
                          target={r.url.startsWith("http") ? "_blank" : undefined}
                          rel={
                            r.url.startsWith("http") ? "noopener noreferrer" : undefined
                          }
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-primary-50 text-slate-700 text-sm"
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
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
