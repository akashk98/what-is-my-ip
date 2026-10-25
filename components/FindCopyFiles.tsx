"use client";

import { useRef, useState, useSyncExternalStore, type ChangeEvent } from "react";

type PermissionMode = "read" | "readwrite";
type CopyMode = "skip" | "rename" | "structure";
type ResultStatus = "Found" | "Missing" | "Copied" | "Skipped" | "Failed";

interface WritableFile {
  write(data: Blob): Promise<void>;
  close(): Promise<void>;
  abort?(): Promise<void>;
}

interface BrowserFileHandle {
  readonly kind: "file";
  readonly name: string;
  getFile(): Promise<File>;
  createWritable(): Promise<WritableFile>;
}

interface BrowserDirectoryHandle {
  readonly kind: "directory";
  readonly name: string;
  values(): AsyncIterable<BrowserFileHandle | BrowserDirectoryHandle>;
  getFileHandle(name: string, options?: { create?: boolean }): Promise<BrowserFileHandle>;
  getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<BrowserDirectoryHandle>;
  requestPermission(options: { mode: PermissionMode }): Promise<PermissionState>;
  isSameEntry(other: BrowserDirectoryHandle): Promise<boolean>;
}

interface FileSystemPickerWindow extends Window {
  showDirectoryPicker?: (options: { mode: PermissionMode }) => Promise<BrowserDirectoryHandle>;
}

interface SearchResult {
  id: string;
  filename: string;
  relativePath: string;
  extension: string;
  size: number;
  status: ResultStatus;
  selected: boolean;
  requestedName?: string;
  fileHandle?: BrowserFileHandle;
  browserFile?: File;
  sourceParentDirectory?: BrowserDirectoryHandle;
  destinationPath?: string;
}

interface CopyOutcome {
  status: "Copied" | "Skipped";
  destinationPath: string;
}

const PAGE_SIZE = 100;
const subscribeToBrowserCapabilities = () => () => {};
const getDirectoryPickerSupport = () =>
  typeof window !== "undefined" &&
  typeof (window as FileSystemPickerWindow).showDirectoryPicker === "function";

function isDirectoryHandle(
  handle: BrowserFileHandle | BrowserDirectoryHandle,
): handle is BrowserDirectoryHandle {
  return handle.kind === "directory";
}

function getExtension(filename: string): string {
  const dotIndex = filename.lastIndexOf(".");
  return dotIndex > 0 ? filename.slice(dotIndex).toLowerCase() : "";
}

function getStem(filename: string): string {
  const dotIndex = filename.lastIndexOf(".");
  return dotIndex > 0 ? filename.slice(0, dotIndex) : filename;
}

function parseCsvFirstColumn(contents: string): string[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < contents.length; index += 1) {
    const character = contents[index];

    if (quoted) {
      if (character === '"' && contents[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"' && field.length === 0) {
      quoted = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n" || character === "\r") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      if (character === "\r" && contents[index + 1] === "\n") index += 1;
    } else {
      field += character;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows
    .map((values) => values[0]?.trim() ?? "")
    .filter((name, index) => name.length > 0 && !(index === 0 && /^(file ?name|filename|name)$/i.test(name)));
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function escapeCsv(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

function yieldToBrowser(): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, 0));
}

function isNotFoundError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "NotFoundError";
}

function nextAvailableName(filename: string, attempt: number): string {
  const dotIndex = filename.lastIndexOf(".");
  if (dotIndex <= 0) return `${filename}_${attempt}`;
  return `${filename.slice(0, dotIndex)}_${attempt}${filename.slice(dotIndex)}`;
}

export default function FindCopyFiles() {
  const sourceInputRef = useRef<HTMLInputElement>(null);
  const namesFileRef = useRef<HTMLInputElement>(null);
  const sourceDirectoryRef = useRef<BrowserDirectoryHandle | null>(null);
  const destinationDirectoryRef = useRef<BrowserDirectoryHandle | null>(null);
  const [hasDestinationFolder, setHasDestinationFolder] = useState(false);
  const [sourceName, setSourceName] = useState("");
  const [destinationName, setDestinationName] = useState("");
  const [manualNames, setManualNames] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [extensionFilter, setExtensionFilter] = useState("");
  const [includeSubfolders, setIncludeSubfolders] = useState(true);
  const [copyMode, setCopyMode] = useState<CopyMode>("skip");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [statusMessage, setStatusMessage] = useState("Choose a source folder and enter the names to find.");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [page, setPage] = useState(0);
  const [fallbackFiles, setFallbackFiles] = useState<File[]>([]);

  const supportsDirectoryPicker = useSyncExternalStore(
    subscribeToBrowserCapabilities,
    getDirectoryPickerSupport,
    () => false,
  );

  const requestedNames = manualNames
    .split(/\r?\n/)
    .map((name) => name.trim())
    .filter((name, index, names) => name.length > 0 && names.findIndex((other) => other.toLowerCase() === name.toLowerCase()) === index);
  const foundCount = results.filter((result) => result.status !== "Missing").length;
  const missingCount = results.filter((result) => result.status === "Missing").length;
  const selectedCount = results.filter((result) => result.selected && result.status !== "Missing").length;
  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const visibleResults = results.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function clearStaleResults() {
    if (results.length > 0) {
      setResults([]);
      setPage(0);
      setStatusMessage("Search settings changed. Search again to refresh the results.");
    }
    setErrorMessage("");
  }

  async function chooseSourceFolder() {
    setErrorMessage("");
    if (!supportsDirectoryPicker) {
      sourceInputRef.current?.click();
      return;
    }

    try {
      const browserWindow = window as FileSystemPickerWindow;
      if (!browserWindow.showDirectoryPicker) {
        throw new Error("Your browser does not provide folder access. Choose a folder using the alternate button.");
      }
      const directory = await browserWindow.showDirectoryPicker({ mode: "read" });
      const permission = await directory.requestPermission({ mode: "read" });
      if (permission !== "granted") throw new Error("Read permission was not granted for the selected folder.");
      const destination = destinationDirectoryRef.current;
      if (destination && (await directory.isSameEntry(destination))) {
        throw new Error("Choose a source folder different from the destination folder.");
      }
      sourceDirectoryRef.current = directory;
      setFallbackFiles([]);
      setSourceName(directory.name);
      setResults([]);
      setPage(0);
      setStatusMessage("Source folder selected. Add the exact file names you want to find.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setErrorMessage(error instanceof Error ? error.message : "The source folder could not be opened.");
    }
  }

  async function chooseDestinationFolder() {
    setErrorMessage("");
    if (!supportsDirectoryPicker) {
      setDestinationName("Browser downloads");
      setStatusMessage("On this browser, matching files will be downloaded instead of copied to a chosen folder.");
      return;
    }

    try {
      const browserWindow = window as FileSystemPickerWindow;
      if (!browserWindow.showDirectoryPicker) throw new Error("Your browser does not provide destination folder access.");
      const directory = await browserWindow.showDirectoryPicker({ mode: "readwrite" });
      const permission = await directory.requestPermission({ mode: "readwrite" });
      if (permission !== "granted") throw new Error("Write permission was not granted for the selected folder.");
      const sourceDirectory = sourceDirectoryRef.current;
      if (sourceDirectory && (await sourceDirectory.isSameEntry(directory))) {
        throw new Error("Choose a destination different from the source folder to prevent copying files onto themselves.");
      }
      destinationDirectoryRef.current = directory;
      setHasDestinationFolder(true);
      setDestinationName(directory.name);
      setStatusMessage("Destination folder selected. Existing destination files will not be overwritten.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setErrorMessage(error instanceof Error ? error.message : "The destination folder could not be opened.");
    }
  }

  async function createDestinationSubfolder() {
    const parent = destinationDirectoryRef.current;
    const folderName = newFolderName.trim();
    if (!parent) {
      setErrorMessage("Choose a destination folder first.");
      return;
    }
    if (!folderName || folderName === "." || folderName === ".." || /[\\/]/.test(folderName)) {
      setErrorMessage("Enter a valid folder name without path separators.");
      return;
    }
    if (!window.confirm(`Create or use the folder "${folderName}" inside ${destinationName}?`)) return;

    try {
      const folder = await parent.getDirectoryHandle(folderName, { create: true });
      const source = sourceDirectoryRef.current;
      if (source && (await source.isSameEntry(folder))) {
        throw new Error("Choose a destination different from the source folder.");
      }
      destinationDirectoryRef.current = folder;
      setHasDestinationFolder(true);
      setDestinationName(`${destinationName}\\${folderName}`);
      setNewFolderName("");
      setErrorMessage("");
      setStatusMessage(`Destination set to ${folderName}.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "The destination subfolder could not be created.");
    }
  }

  function handleFallbackFolder(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;
    sourceDirectoryRef.current = null;
    setSourceName(files[0].webkitRelativePath.split("/")[0] || "Selected folder");
    setFallbackFiles(files);
    setDestinationName("Browser downloads");
    setResults([]);
    setPage(0);
    setStatusMessage("Folder selected. Files are read locally in your browser.");
    event.target.value = "";
  }

  async function loadNameFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const contents = (await file.text()).replace(/^\uFEFF/, "");
      const names = file.name.toLowerCase().endsWith(".csv")
        ? parseCsvFirstColumn(contents)
        : contents.split(/\r?\n/).map((name) => name.trim()).filter(Boolean);
      setManualNames(names.join("\n"));
      setResults([]);
      setPage(0);
      setErrorMessage("");
      setStatusMessage(`Loaded ${names.length} file name${names.length === 1 ? "" : "s"} from ${file.name}.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "The selected filename list could not be read.");
    } finally {
      event.target.value = "";
    }
  }

  async function searchFiles() {
    if (!sourceName || requestedNames.length === 0) return;
    setIsSearching(true);
    setErrorMessage("");
    setProgress(0);
    setResults([]);
    setPage(0);
    let scanned = 0;
    const matches: SearchResult[] = [];
    const foundNames = new Set<string>();
    const scanIssues: string[] = [];
    const normalizedFilter = extensionFilter
      .split(",")
      .map((extension) => extension.trim().toLowerCase())
      .filter(Boolean)
      .map((extension) => (extension.startsWith(".") ? extension : `.${extension}`));
    const requested = requestedNames.map((name) => name.toLowerCase());

    function matchesFile(filename: string): string | undefined {
      const lowerName = filename.toLowerCase();
      const matchIndex = requested.findIndex((name) =>
        name.includes(".") ? lowerName === name : getStem(lowerName) === name,
      );
      if (matchIndex < 0) return undefined;
      if (normalizedFilter.length > 0 && !normalizedFilter.includes(getExtension(filename))) return undefined;
      return requestedNames[matchIndex];
    }

    function addMatch(
      filename: string,
      relativePath: string,
      size: number,
      fileHandle?: BrowserFileHandle,
      browserFile?: File,
      sourceParentDirectory?: BrowserDirectoryHandle,
    ) {
      const requestedName = matchesFile(filename);
      if (!requestedName) return;
      foundNames.add(requestedName.toLowerCase());
      matches.push({
        id: `${relativePath}:${matches.length}`,
        filename,
        relativePath,
        extension: getExtension(filename) || "(none)",
        size,
        status: "Found",
        selected: true,
        requestedName,
        fileHandle,
        browserFile,
        sourceParentDirectory,
      });
    }

    try {
      const sourceDirectory = sourceDirectoryRef.current;
      if (sourceDirectory) {
        const rootDirectory = sourceDirectory;
        async function visit(directory: BrowserDirectoryHandle, parentPath: string) {
          try {
            for await (const handle of directory.values()) {
              scanned += 1;
              const relativePath = parentPath ? `${parentPath}/${handle.name}` : handle.name;
              try {
                if (isDirectoryHandle(handle)) {
                  if (includeSubfolders) await visit(handle, relativePath);
                } else {
                  const file = await handle.getFile();
                  addMatch(handle.name, relativePath, file.size, handle, undefined, directory);
                }
              } catch {
                scanIssues.push(relativePath);
              }
              if (scanned % 100 === 0) {
                setStatusMessage(`Scanned ${scanned.toLocaleString()} entries…`);
                await yieldToBrowser();
              }
            }
          } catch {
            scanIssues.push(parentPath || rootDirectory.name);
          }
        }
        await visit(sourceDirectory, "");
      } else {
        const files = includeSubfolders
          ? fallbackFiles
          : fallbackFiles.filter((file) => file.webkitRelativePath.split("/").length <= 2);
        for (const file of files) {
          scanned += 1;
          addMatch(file.name, file.webkitRelativePath || file.name, file.size, undefined, file);
          if (scanned % 100 === 0) {
            setStatusMessage(`Checked ${scanned.toLocaleString()} files…`);
            await yieldToBrowser();
          }
        }
      }

      for (const name of requestedNames) {
        if (!foundNames.has(name.toLowerCase())) {
          matches.push({
            id: `missing:${name}`,
            filename: name,
            relativePath: "—",
            extension: getExtension(name) || "(any)",
            size: 0,
            status: "Missing",
            selected: false,
            requestedName: name,
          });
        }
      }

      setResults(matches);
      setStatusMessage(
        `Search complete: ${foundNames.size} of ${requestedNames.length} requested names matched.` +
          (scanIssues.length > 0 ? ` ${scanIssues.length} unreadable entr${scanIssues.length === 1 ? "y was" : "ies were"} skipped.` : ""),
      );
      if (scanIssues.length > 0) {
        setErrorMessage(`Could not read ${scanIssues.length} item(s). First inaccessible path: ${scanIssues[0]}`);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "The folder could not be searched.");
      setStatusMessage("Search could not be completed.");
    } finally {
      setIsSearching(false);
    }
  }

  function updateResult(id: string, changes: Partial<SearchResult>) {
    setResults((current) => current.map((result) => (result.id === id ? { ...result, ...changes } : result)));
  }

  async function createDestinationPath(relativePath: string): Promise<BrowserDirectoryHandle> {
    const destination = destinationDirectoryRef.current;
    if (!destination) throw new Error("Choose a destination folder before copying.");
    if (copyMode !== "structure") return destination;

    const segments = relativePath.split("/");
    segments.pop();
    let current = destination;
    for (const segment of segments) {
      current = await current.getDirectoryHandle(segment, { create: true });
    }
    return current;
  }

  async function hasFile(directory: BrowserDirectoryHandle, filename: string): Promise<boolean> {
    try {
      await directory.getFileHandle(filename);
      return true;
    } catch (error) {
      if (isNotFoundError(error)) return false;
      throw error;
    }
  }

  async function copyToFolder(result: SearchResult): Promise<CopyOutcome> {
    const destination = await createDestinationPath(result.relativePath);
    if (result.sourceParentDirectory && (await result.sourceParentDirectory.isSameEntry(destination))) {
      throw new Error("The destination is the selected file's source folder.");
    }
    let outputName = result.filename;
    const relativeDestinationPath = copyMode === "structure"
      ? `${result.relativePath.split("/").slice(0, -1).join("/")}${result.relativePath.includes("/") ? "/" : ""}${outputName}`
      : outputName;
    const targetPath = `${destinationName}/${relativeDestinationPath}`;

    if (copyMode === "rename") {
      let suffix = 1;
      while (await hasFile(destination, outputName)) {
        outputName = nextAvailableName(result.filename, suffix);
        suffix += 1;
      }
    } else if (await hasFile(destination, outputName)) {
      return { status: "Skipped", destinationPath: targetPath };
    }

    const sourceFile = result.fileHandle ? await result.fileHandle.getFile() : result.browserFile;
    if (!sourceFile) throw new Error("The selected source file is no longer available.");
    const output = await destination.getFileHandle(outputName, { create: true });
    const writable = await output.createWritable();
    try {
      await writable.write(sourceFile);
      await writable.close();
    } catch (error) {
      if (writable.abort) await writable.abort();
      throw error;
    }
    const finalRelativePath = copyMode === "structure"
      ? `${result.relativePath.split("/").slice(0, -1).join("/")}${result.relativePath.includes("/") ? "/" : ""}${outputName}`
      : outputName;
    return { status: "Copied", destinationPath: `${destinationName}/${finalRelativePath}` };
  }

  async function copyFiles() {
    const selected = results.filter((result) => result.selected && result.status !== "Missing");
    if (selected.length === 0) return;
    if (supportsDirectoryPicker && !destinationDirectoryRef.current) {
      setErrorMessage("Choose a destination folder before copying.");
      return;
    }
    if (!window.confirm(`Copy ${selected.length} selected file${selected.length === 1 ? "" : "s"}? Original files will not be changed.`)) {
      return;
    }

    setIsCopying(true);
    setErrorMessage("");
    setProgress(0);
    let copied = 0;
    let skipped = 0;
    let failed = 0;

    for (let index = 0; index < selected.length; index += 1) {
      const result = selected[index];
      try {
        if (supportsDirectoryPicker) {
          const outcome = await copyToFolder(result);
          updateResult(result.id, { status: outcome.status, selected: false, destinationPath: outcome.destinationPath });
          if (outcome.status === "Copied") copied += 1;
          else skipped += 1;
        } else {
          const file = result.browserFile ?? (await result.fileHandle?.getFile());
          if (!file) throw new Error(`The source file ${result.filename} is no longer available.`);
          const url = URL.createObjectURL(file);
          const anchor = document.createElement("a");
          anchor.href = url;
          anchor.download = result.filename;
          anchor.click();
          window.setTimeout(() => URL.revokeObjectURL(url), 1000);
          updateResult(result.id, { status: "Copied", selected: false, destinationPath: `Browser downloads/${result.filename}` });
          copied += 1;
        }
      } catch (error) {
        console.error(`Could not copy ${result.relativePath}`, error);
        updateResult(result.id, { status: "Failed", selected: false });
        failed += 1;
      }
      setProgress(Math.round(((index + 1) / selected.length) * 100));
      if ((index + 1) % 10 === 0) await yieldToBrowser();
    }

    setIsCopying(false);
    setStatusMessage(`Copy complete: ${copied} copied, ${skipped} skipped, ${failed} failed; ${missingCount} not found.`);
  }

  function exportReport() {
    const rows = [
      ["Filename", "Original path", "Destination", "Final status"].map(escapeCsv).join(","),
      ...results.map((result) =>
        [
          result.filename,
          result.relativePath,
          result.destinationPath || "",
          result.status,
        ]
          .map(escapeCsv)
          .join(","),
      ),
    ];
    const blob = new Blob([rows.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "find-copy-files-report.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function clearNamesAndResults() {
    setManualNames("");
    setExtensionFilter("");
    setResults([]);
    setPage(0);
    setProgress(0);
    setErrorMessage("");
    setStatusMessage("Filename list and results cleared.");
  }

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <header className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Private by design</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Find &amp; Copy Files</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
          Select a folder, paste the photo or file names you need, review exact matches, then copy them to another folder.
        </p>
        <p className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm leading-6 text-emerald-950">
          Your folder names, filenames, and file contents stay in this browser session and are not uploaded by this tool.
          Nothing is saved by this feature after you leave the page. Your hosting provider may still record ordinary
          website request metadata.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-6" aria-labelledby="folders-heading">
          <h2 id="folders-heading" className="text-lg font-semibold text-slate-950">1. Choose folders</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="min-w-0">
              <button
                type="button"
                onClick={chooseSourceFolder}
                disabled={isSearching || isCopying}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-800 hover:border-emerald-500 hover:bg-emerald-50 disabled:opacity-50"
              >
                {supportsDirectoryPicker ? "Browse Source Folder" : "Choose Source Folder"}
              </button>
              <p className="mt-2 truncate text-sm text-slate-600" title={sourceName}>{sourceName || "No source folder selected"}</p>
            </div>
            <div className="min-w-0">
              <button
                type="button"
                onClick={chooseDestinationFolder}
                disabled={isSearching || isCopying}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-800 hover:border-emerald-500 hover:bg-emerald-50 disabled:opacity-50"
              >
                {supportsDirectoryPicker ? "Browse Destination Folder" : "Use Browser Downloads"}
              </button>
              <p className="mt-2 truncate text-sm text-slate-600" title={destinationName}>{destinationName || "No destination selected"}</p>
            </div>
          </div>
          {supportsDirectoryPicker && (
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <label className="min-w-0 flex-1 text-sm text-slate-600">
                Create a subfolder inside the selected destination
                <input
                  value={newFolderName}
                  onChange={(event) => setNewFolderName(event.target.value)}
                  placeholder="New folder name"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </label>
              <button
                type="button"
                onClick={createDestinationSubfolder}
                disabled={!hasDestinationFolder || isSearching || isCopying}
                className="self-end rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Set subfolder
              </button>
            </div>
          )}
          <label className="mt-5 flex items-center gap-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={includeSubfolders}
              disabled={isSearching || isCopying}
              onChange={(event) => {
                setIncludeSubfolders(event.target.checked);
                clearStaleResults();
              }}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            Include subfolders
          </label>
          {!supportsDirectoryPicker && (
            <p className="mt-4 text-xs leading-5 text-amber-800">
              This browser cannot write directly to a chosen folder. Matches will be downloaded individually; allow multiple
              downloads if your browser asks.
            </p>
          )}
          <input
            ref={sourceInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFallbackFolder}
            aria-label="Select a source folder"
            {...{ webkitdirectory: "" }}
          />
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-6" aria-labelledby="names-heading">
          <h2 id="names-heading" className="text-lg font-semibold text-slate-950">2. Enter file names</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Use one name per line. Matching ignores letter case and surrounding spaces. Names without an extension match
            the exact filename stem (use <code className="rounded bg-slate-100 px-1">IMG001</code> for
            <code className="rounded bg-slate-100 px-1">IMG001.jpg</code>).
          </p>
          <textarea
            value={manualNames}
            onChange={(event) => {
              setManualNames(event.target.value);
              clearStaleResults();
            }}
            disabled={isSearching || isCopying}
            placeholder={"IMG001.jpg\nInvoice.pdf\nA photo with spaces.png"}
            rows={5}
            className="mt-4 w-full resize-y rounded-xl border border-slate-300 px-3 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            aria-label="File names to find"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => namesFileRef.current?.click()}
              disabled={isSearching || isCopying}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Load TXT or CSV
            </button>
            <button
              type="button"
              onClick={clearNamesAndResults}
              disabled={isSearching || isCopying}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Clear Names &amp; Results
            </button>
            <input
              ref={namesFileRef}
              type="file"
              accept=".txt,.csv,text/plain,text/csv"
              onChange={loadNameFile}
              className="hidden"
              aria-label="Load a TXT or CSV filename list"
            />
          </div>
          <label className="mt-4 block text-sm font-medium text-slate-700">
            Filter by extension (optional)
            <input
              value={extensionFilter}
              onChange={(event) => {
                setExtensionFilter(event.target.value);
                clearStaleResults();
              }}
              disabled={isSearching || isCopying}
              placeholder=".jpg, .png"
              className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
        </section>
      </div>

      <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-6" aria-labelledby="copy-options-heading">
        <h2 id="copy-options-heading" className="text-lg font-semibold text-slate-950">3. Review and copy</h2>
        <label className="mt-4 block max-w-md text-sm font-medium text-slate-700">
          If a filename already exists in the destination
          <select
            value={copyMode}
            onChange={(event) => setCopyMode(event.target.value as CopyMode)}
            disabled={isSearching || isCopying}
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          >
            <option value="skip">Skip the duplicate (safest)</option>
            <option value="rename">Automatically rename the copy</option>
            <option value="structure" disabled={!supportsDirectoryPicker}>Preserve source folders; skip conflicts</option>
          </select>
        </label>
        {!supportsDirectoryPicker && (
          <p className="mt-2 text-xs text-slate-500">
            Conflict options apply when writing directly to a folder; downloads use your browser&apos;s filename handling.
          </p>
        )}
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={searchFiles}
            disabled={isSearching || isCopying || !sourceName || requestedNames.length === 0}
            className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSearching ? "Searching…" : "Search Files"}
          </button>
          <button
            type="button"
            onClick={copyFiles}
            disabled={isSearching || isCopying || selectedCount === 0}
            className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCopying ? "Copying…" : `Copy Selected Files (${selectedCount})`}
          </button>
          <button
            type="button"
            onClick={exportReport}
            disabled={results.length === 0 || isSearching || isCopying}
            className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Export Report
          </button>
        </div>

        {(isSearching || isCopying) && (
          <div className="mt-5" aria-live="polite">
            <div className="mb-2 flex justify-between text-xs text-slate-600">
              <span>{isSearching ? "Searching selected folder…" : "Copying selected files…"}</span>
              {isCopying && <span>{progress}%</span>}
            </div>
            <progress value={isCopying ? progress : undefined} max={100} className="h-2 w-full accent-emerald-600" />
          </div>
        )}

        <p className="mt-4 text-sm text-slate-600" role="status">{statusMessage}</p>
        {errorMessage && <p className="mt-2 text-sm font-medium text-red-700" role="alert">{errorMessage}</p>}

        {results.length > 0 && (
          <>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {[
                ["Requested", requestedNames.length],
                ["Found", foundCount],
                ["Not found", missingCount],
                ["Copied", results.filter((result) => result.status === "Copied").length],
                ["Failed", results.filter((result) => result.status === "Failed").length],
              ].map(([label, count]) => (
                <div key={label} className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{count}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th scope="col" className="px-3 py-3">Select</th>
                    <th scope="col" className="px-3 py-3">Filename</th>
                    <th scope="col" className="px-3 py-3">Original path</th>
                    <th scope="col" className="px-3 py-3">Extension</th>
                    <th scope="col" className="px-3 py-3">Size</th>
                    <th scope="col" className="px-3 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleResults.map((result) => (
                    <tr key={result.id} className="align-top">
                      <td className="px-3 py-3">
                        {result.status !== "Missing" && (
                          <input
                            type="checkbox"
                            checked={result.selected}
                            onChange={(event) => updateResult(result.id, { selected: event.target.checked })}
                            aria-label={`Select ${result.filename}`}
                            className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                          />
                        )}
                      </td>
                      <td className="max-w-56 break-all px-3 py-3 font-medium text-slate-900">{result.filename}</td>
                      <td className="max-w-80 break-all px-3 py-3 text-slate-600">{result.relativePath}</td>
                      <td className="px-3 py-3 text-slate-600">{result.extension}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-slate-600">{result.status === "Missing" ? "—" : formatBytes(result.size)}</td>
                      <td className="px-3 py-3">
                        <span className={result.status === "Missing" || result.status === "Failed" ? "font-medium text-red-700" : "font-medium text-emerald-700"}>
                          {result.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pageCount > 1 && (
              <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                <span>Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, results.length)} of {results.length}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.max(0, current - 1))}
                    disabled={page === 0}
                    className="rounded-lg border border-slate-300 px-3 py-2 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))}
                    disabled={page >= pageCount - 1}
                    className="rounded-lg border border-slate-300 px-3 py-2 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </section>
  );
}
