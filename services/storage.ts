type StorageDriver<T> = {
  load: () => Promise<T[]>;
  save: (items: T[]) => Promise<void>;
};

const globalKey = "__AK_INVITATION_STORE";

function memoryDriver<T>(): StorageDriver<T> {
  const globalStore = (globalThis as any)[globalKey] as T[] | undefined;
  if (!globalStore) {
    (globalThis as any)[globalKey] = [];
  }

  return {
    async load() {
      return (globalThis as any)[globalKey] as T[];
    },
    async save(items: T[]) {
      (globalThis as any)[globalKey] = items;
    },
  };
}

async function jsonDriver<T>(): Promise<StorageDriver<T>> {
  const { readFile, writeFile, mkdir, access } = await import("fs/promises");
  const { constants } = await import("fs");
  const { dirname, join } = await import("path");
  const filePath = process.env.INVITATIONS_JSON_PATH ?? join(process.cwd(), "invitations.json");
  const fallbackPath = join(process.cwd(), ".next", "invitations.json");
  const directory = dirname(filePath);

  async function fileExists(path: string) {
    try {
      await access(path, constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }

  return {
    async load() {
      try {
        const pathToRead = (await fileExists(filePath)) ? filePath : fallbackPath;
        const content = await readFile(pathToRead, "utf8");
        return JSON.parse(content) as T[];
      } catch (error: unknown) {
        if ((error as { code?: string })?.code === "ENOENT") {
          await mkdir(directory, { recursive: true });
          await writeFile(filePath, "[]", "utf8");
          return [];
        }
        return [];
      }
    },
    async save(items: T[]) {
      await mkdir(directory, { recursive: true });
      await writeFile(filePath, JSON.stringify(items, null, 2), "utf8");
    },
  };
}

async function getStorage<T>(): Promise<StorageDriver<T>> {
  const mode = process.env.INVITATIONS_STORAGE_MODE;
  if (mode === "memory") {
    return memoryDriver<T>();
  }

  // Default to JSON-backed storage so invitations persist across API and SSR requests
  return jsonDriver<T>();
}

export async function loadRecords<T>() {
  return (await getStorage<T>()).load();
}

export async function saveRecords<T>(records: T[]) {
  return (await getStorage<T>()).save(records);
}
