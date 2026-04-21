import { useState } from "react";
import { env } from "../lib/env";
import type { ProjectRuntime } from "../types/project";

const runtimes: ProjectRuntime[] = ["node", "python"];

export function ProjectForm() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [runtime, setRuntime] = useState<ProjectRuntime>("node");
  const [entryFile, setEntryFile] = useState("");
  const [installCommand, setInstallCommand] = useState("");
  const [startCommand, setStartCommand] = useState("");
  const [port, setPort] = useState("4010");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState("");

  const handleSubmit = async () => {
    if (!file) {
      setResultMessage("Bitte ZIP-Datei auswählen.");
      return;
    }

    try {
      setIsSubmitting(true);
      setResultMessage("");

      const formData = new FormData();
      formData.append("name", name);
      formData.append("slug", slug);
      formData.append("runtime", runtime);
      formData.append("entryFile", entryFile);
      formData.append("installCommand", installCommand);
      formData.append("startCommand", startCommand);
      formData.append("port", port);
      formData.append("description", description);
      formData.append("file", file);

      const response = await fetch(`${env.apiUrl}/projects`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setResultMessage(data.error || "Projekt konnte nicht erstellt werden.");
        return;
      }

      setResultMessage(`Projekt erstellt: ${data.project.name}`);
      setName("");
      setSlug("");
      setRuntime("node");
      setEntryFile("");
      setInstallCommand("");
      setStartCommand("");
      setPort("4010");
      setDescription("");
      setFile(null);
    } catch {
      setResultMessage("Fehler beim Hochladen des Projekts.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit();
      }}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Name
          </label>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Mail API"
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-zinc-600"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Slug
          </label>
          <input
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            placeholder="mail"
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-zinc-600"
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Runtime
          </label>
          <select
            value={runtime}
            onChange={(event) => setRuntime(event.target.value as ProjectRuntime)}
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-zinc-600"
          >
            {runtimes.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Port
          </label>
          <input
            value={port}
            onChange={(event) => setPort(event.target.value)}
            placeholder="4010"
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-zinc-600"
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Entry File
          </label>
          <input
            value={entryFile}
            onChange={(event) => setEntryFile(event.target.value)}
            placeholder="server.js oder main.py"
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-zinc-600"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Install Command
          </label>
          <input
            value={installCommand}
            onChange={(event) => setInstallCommand(event.target.value)}
            placeholder="npm install oder pip install -r requirements.txt"
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-zinc-600"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-300">
          Start Command
        </label>
        <input
          value={startCommand}
          onChange={(event) => setStartCommand(event.target.value)}
          placeholder="node server.js oder python main.py"
          className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-zinc-600"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-300">
          Beschreibung
        </label>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={5}
          placeholder="Kurz beschreiben, was das Projekt macht..."
          className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-zinc-600"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-300">
          Projektdateien als ZIP
        </label>
        <input
          type="file"
          accept=".zip"
          onChange={(event) => {
            const nextFile = event.target.files?.[0] || null;
            setFile(nextFile);
          }}
          className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-400 file:mr-4 file:rounded-xl file:border-0 file:bg-zinc-800 file:px-4 file:py-2 file:text-sm file:font-medium file:text-zinc-100"
        />
      </div>

      {resultMessage ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-300">
          {resultMessage}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-2xl bg-zinc-50 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Wird erstellt..." : "Projekt erstellen"}
        </button>
      </div>
    </form>
  );
}