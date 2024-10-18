// deno-lint-ignore-file no-case-declarations
import { Command } from "@cliffy/command";
import {
    createEnvCommand,
    deleteEnvCommand,
    renameEnvCommand,
    selectEnvCommand,
} from "./env_commands.ts";
import { Select } from "@cliffy/prompt/select";
import { Input } from "../deps.ts";

// Главное меню для работы с окружениями
const envMenu = async () => {
    const action = await Select.prompt({
        message: "Что вы хотите сделать с окружениями?",
        options: [
            { name: "Создать окружение", value: "create" },
            { name: "Выбрать окружение", value: "select" },
            { name: "Переименовать окружение", value: "rename" },
            { name: "Удалить окружение", value: "delete" },
        ],
    });

    switch (action) {
        case "create":
            const envName = await Input.prompt("Введите имя окружения:");
            await createEnvCommand().parse([envName]);
            break;
        case "select":
            await selectEnvCommand().parse([]);
            break;
        case "rename":
            const newName = await Input.prompt("Введите новое имя окружения:");
            await renameEnvCommand().parse([newName]);
            break;
        case "delete":
            const deleteName = await Input.prompt(
                "Введите имя окружения для удаления:",
            );
            await deleteEnvCommand().parse([deleteName]);
            break;
    }
};

const envCommand = new Command()
    .description("Управление окружениями")
    .action(envMenu);

export default envCommand;
