// Определяем пути для хранения данных в локальной среде
const CONFIG_DIR = Deno.env.get("GUARDEN_CONFIG_DIR") ||
  `${Deno.env.get("HOME")}/.guarden`;
const TOKEN_FILE = `${CONFIG_DIR}/token.txt`;
const CONFIG_FILE = `${CONFIG_DIR}/config.json`;

// Интерфейс для хранения текущего проекта и окружения
interface Config {
  currentProject?: string;
  currentEnv?: string;
}

// Чтение конфигурации из переменных окружения или файловой системы
async function readConfig(): Promise<Config> {
  // Сначала ищем в переменных окружения
  const envProject = Deno.env.get("GUARDEN_CURRENT_PROJECT");
  const envEnv = Deno.env.get("GUARDEN_CURRENT_ENV");

  // Если данные есть в переменных окружения, возвращаем их
  if (envProject || envEnv) {
    return {
      currentProject: envProject || undefined,
      currentEnv: envEnv || undefined,
    };
  }

  // Если в env нет, читаем данные из файлов
  try {
    const data = await Deno.readTextFile(CONFIG_FILE);
    return JSON.parse(data);
  } catch (e) {
    return {};
  }
}

// Сохранение конфигурации в переменные окружения и файловую систему
async function saveConfig(config: Config) {
  // Обновляем переменные окружения
  if (config.currentProject) {
    Deno.env.set("GUARDEN_CURRENT_PROJECT", config.currentProject);
  }

  if (config.currentEnv) {
    Deno.env.set("GUARDEN_CURRENT_ENV", config.currentEnv);
  }

  // Сохраняем в файлы
  const data = JSON.stringify(config, null, 2);
  await Deno.writeTextFile(CONFIG_FILE, data);
}

// Установка текущего проекта
export async function setCurrentProject(project: string) {
  const config = await readConfig();
  config.currentProject = project;
  await saveConfig(config);
}

// Установка текущего окружения
export async function setCurrentEnv(env: string) {
  const config = await readConfig();
  config.currentEnv = env;
  await saveConfig(config);
}

// Получение текущего проекта
export async function getCurrentProject(): Promise<string | null> {
  const envProject = Deno.env.get("GUARDEN_CURRENT_PROJECT");
  if (envProject) {
    return envProject;
  }

  const config = await readConfig();
  return config.currentProject || null;
}

// Получение текущего окружения
export async function getCurrentEnv(): Promise<string | null> {
  const envEnv = Deno.env.get("GUARDEN_CURRENT_ENV");
  if (envEnv) {
    return envEnv;
  }

  const config = await readConfig();
  return config.currentEnv || null;
}

// Создание конфигурационной директории (если нужно)
async function ensureConfigDir() {
  try {
    await Deno.stat(CONFIG_DIR);
  } catch {
    await Deno.mkdir(CONFIG_DIR, { recursive: true });
  }
}

// Сохранение токена
export async function saveToken(token: string) {
  // Обновляем переменные окружения
  Deno.env.set("GUARDEN_TOKEN", token);

  // Сохраняем в файл
  await ensureConfigDir();
  await Deno.writeTextFile(TOKEN_FILE, token);
}

// Получение токена
export async function getToken(): Promise<string | null> {
  const envToken = Deno.env.get("GUARDEN_TOKEN");
  if (envToken) {
    return envToken;
  }

  // Если нет токена в переменных окружения, ищем в файле
  try {
    const token = await Deno.readTextFile(TOKEN_FILE);
    Deno.env.set("GUARDEN_TOKEN", token); // Записываем токен в env для дальнейшего использования
    return token;
  } catch {
    return null;
  }
}

// Удаление токена
export async function removeToken() {
  // Удаляем переменную окружения
  Deno.env.delete("GUARDEN_TOKEN");

  // Удаляем файл с токеном
  try {
    await Deno.remove(TOKEN_FILE);
  } catch {}
}
