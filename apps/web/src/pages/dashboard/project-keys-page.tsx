import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "../../components/card";
import { apiGet, apiPost } from "../../lib/api";
import type { ProjectItem } from "../../types/project";

interface ProjectApiKey {
  id: string;
  name: string;
  keyPreview: string;
  createdAt: string;
  revokedAt?: string;
  lastUsedAt?: string;
}

type ProjectsResponse = {
  projects: ProjectItem[];
};

type KeysResponse = {
  keys: ProjectApiKey[];
};

type CreateKeyResponse = {
  message: string;
  apiKey: ProjectApiKey & {
    rawKey: string;
  };
};

export function ProjectKeysPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [keys, setKeys] = useState<ProjectApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdRawKey, setCreatedRawKey] = useState("");
  const [error, setError] = useState("");

  const selectedProjectId = searchParams.get("projectId") || "";

  const loadProjects = async () => {
    const data = await apiGet<ProjectsResponse>("/projects");
    setProjects(data.projects);

    if (!selectedProjectId && data.projects.length > 0) {
      setSearchParams({ projectId: data.projects[0].id });
    }
  };

  const loadKeys = async (projectId: string) => {
    const data = await apiGet<KeysResponse>(`/projects/${projectId}/keys`);
    setKeys(data.keys);
  };

  useEffect(() => {
    void loadProjects().catch(() => {
      setError("Projekte konnten nicht geladen werden.");
    });
  }, []);

  useEffect(() => {
    if (!selectedProjectId) return;

    void loadKeys(selectedProjectId).catch(() => {
      setError("API Keys konnten nicht geladen werden.");
    });
  }, [selectedProjectId]);

  const handleCreateKey = async () => {
    if (!selectedProjectId) return;

    try {
      const data = await apiPost<CreateKeyResponse>(`/projects/${selectedProjectId}/keys`, JSON.stringify({
        name: newKeyName || "Default Key",
      }), {
        headers: {
          "Content-Type": "application/json",
        },
      });

      setCreatedRawKey(data.apiKey.rawKey);
      setNewKeyName("");
      await loadKeys(selectedProjectId);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Key konnte nicht erstellt werden.");
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (!selectedProjectId) return;

    try {
      await apiPost(`/projects/${selectedProjectId}/keys/${keyId}/revoke`);
      await loadKeys(selectedProjectId);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Key konnte nicht widerrufen werden.");
    }
  };

  const selectedProject =
    projects.find((project) => project.id === selectedProjectId) || null;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
          API Keys
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-50">
          Projekt-Keys
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Erstelle und verwalte API Keys pro Projekt. Nur mit gültigem Key ist
          ein Zugriff über `/v1/&lt;slug&gt;/...` möglich.
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      {createdRawKey ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-4">
          <p className="text-sm font-medium text-emerald-300">
            Neuer API Key
          </p>
          <p className="mt-2 break-all font-mono text-sm text-zinc-100">
            {createdRawKey}
          </p>
          <p className="mt-2 text-xs text-zinc-400">
            Nur jetzt sichtbar. Danach nur noch Preview.
          </p>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <Card title="Projekte" description="Wähle ein Projekt aus.">
          <div className="space-y-3">
            {projects.map((project) => {
              const isActive = project.id === selectedProjectId;

              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => setSearchParams({ projectId: project.id })}
                  className={[
                    "w-full rounded-2xl border px-4 py-4 text-left transition",
                    isActive
                      ? "border-zinc-700 bg-zinc-950 text-zinc-50"
                      : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700",
                  ].join(" ")}
                >
                  <p className="font-medium">{project.name}</p>
                  <p className="mt-1 text-sm text-zinc-500">/{project.slug}</p>
                </button>
              );
            })}
          </div>
        </Card>

        <div className="space-y-6">
          <Card
            title={selectedProject ? `${selectedProject.name} Keys` : "Keys"}
            description="Neuen Key erzeugen oder bestehende widerrufen."
          >
            <div className="flex flex-col gap-3 md:flex-row">
              <input
                value={newKeyName}
                onChange={(event) => setNewKeyName(event.target.value)}
                placeholder="z. B. Production Key"
                className="flex-1 rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-zinc-600"
              />
              <button
                type="button"
                onClick={() => void handleCreateKey()}
                disabled={!selectedProjectId}
                className="rounded-2xl bg-zinc-50 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Key erstellen
              </button>
            </div>
          </Card>

          <Card title="Aktive / alte Keys">
            <div className="space-y-3">
              {keys.map((key) => (
                <div
                  key={key.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-medium text-zinc-100">{key.name}</p>
                      <p className="mt-1 font-mono text-sm text-zinc-400">
                        {key.keyPreview}
                      </p>
                      <p className="mt-2 text-xs text-zinc-500">
                        erstellt: {new Date(key.createdAt).toLocaleString()}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        zuletzt genutzt:{" "}
                        {key.lastUsedAt
                          ? new Date(key.lastUsedAt).toLocaleString()
                          : "-"}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        status: {key.revokedAt ? "revoked" : "active"}
                      </p>
                    </div>

                    {!key.revokedAt ? (
                      <button
                        type="button"
                        onClick={() => void handleRevokeKey(key.id)}
                        className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-zinc-700"
                      >
                        Widerrufen
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}

              {!keys.length ? (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4 text-sm text-zinc-400">
                  Noch keine API Keys vorhanden.
                </div>
              ) : null}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}