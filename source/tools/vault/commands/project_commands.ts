import { Select } from "@cliffy/prompt/select";
import { createClient, getCurrentProject, setCurrentProject } from "../api.ts";
import { Command, green, red } from "../deps.ts";
import { type TUUID } from "../GuardenDefinition.ts";

// Команда для отображения текущего проекта
export async function displayCurrentProjectInfo() {
    const currentProject = await getCurrentProject();

    if (!currentProject || !currentProject.currentProject) {
        console.log(red("Текущий проект не выбран."));
        return;
    }

    console.log(green(`Текущий проект: ${currentProject.currentProject}`));
    if (currentProject.currentEnv) {
        console.log(green(`Текущее окружение: ${currentProject.currentEnv}`));
    } else {
        console.log(red("Окружение не выбрано."));
    }
}

// Команда для синхронизации проектов с сервером
export async function syncProjects() {
    try {
        const client = await createClient();
        const [response, error] = await client.get();
        response?.state.projects;
        if (error) {
            console.error(red("Ошибка при синхронизации проектов."));
            return;
        }

        // Обновляем локальные данные с актуальной информацией с сервера
        const projects = response!.state.projects!;
        if (projects.length === 0) {
            console.log(red("Проекты отсутствуют."));
            return;
        }

        for (const project of projects) {
            await setCurrentProject(project!.name!, project!.uuid!);
        }

        console.log(green("Синхронизация завершена."));
    } catch (error) {
        console.error(red("Ошибка синхронизации проектов:"), error);
    }
}

// Команда для создания проекта
export function createProjectCommand() {
    return new Command()
        .description("Создать новый проект.")
        .arguments("<projectName:string>")
        .action(async (_options: any, projectName: string) => {
            try {
                const client = await createClient();

                const response = await client.call("createProject", [
                    projectName,
                ]);

               
                if (!response.success) {
                    throw new Error(`Не удалось создать проект.`);
                }

                console.log(green(`Проект '${projectName}' успешно создан.`));
            } catch (error) {
                console.error(red(`Ошибка: ${(error as Error).message}`));
            }
        });
}

// Команда для выбора проекта
export function selectProjectCommand() {
    return new Command()
        .description("Выбрать проект.")
        .action(async () => {
            const client = await createClient();
            const [response, error] = await client.get();

            if (error) {
                console.error(red("Ошибка при получении списка проектов."));
                return;
            }

            const projects = response!.state!.projects!.map((p) => p!.name);
            if (projects.length === 0) {
                console.log(red("Проекты отсутствуют."));
                return;
            }

            const selectedProject = await Select.prompt({
                message: "Выберите проект:",
                options: projects as string[],
            });

            // Установим текущий проект в kv хранилище
            const project = response!.state!.projects!.find((p) =>
                p!.name === selectedProject
            );
            if (project) {
                await setCurrentProject(project!.name!, project.uuid!);
                console.log(green(`Проект '${project.name}' выбран.`));
            }
        });
}

// Команда для переименования проекта
export function renameProjectCommand() {
    return new Command()
        .description("Переименовать проект.")
        .arguments("<newProjectName:string>")
        .action(async (_options: any, newProjectName: string) => {
            const currentProject = await getCurrentProject();

            if (!currentProject || !currentProject.currentProjectUUID) {
                console.error(red("Текущий проект не выбран."));
                return;
            }

            const client = await createClient();
            const response = await client.call("updateProject", [
                currentProject.currentProjectUUID,
                newProjectName,
            ]);

            if (!response.success) {
                console.error(red(`Не удалось переименовать проект.`));
                return;
            }

            console.log(green(`Проект переименован в '${newProjectName}'.`));
        });
}

// Команда для удаления проекта
export function deleteProjectCommand() {
    return new Command()
        .description("Удалить проект.")
        .arguments("<projectName:string>")
        .action(async (_options: any, projectName: TUUID) => {
            const client = await createClient();
            const response = await client.call("deleteProject", [projectName]);

            if (!response.success) {
                console.error(red(`Не удалось удалить проект.`));
                return;
            }

            console.log(green(`Проект '${projectName}' успешно удален.`));
        });
}
