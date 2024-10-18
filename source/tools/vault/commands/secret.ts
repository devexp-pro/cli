// deno-lint-ignore-file no-case-declarations
import { Command } from "@cliffy/command";
import {
    addSecretCommand,
    deleteSecretCommand,
    fetchSecretsCommand,
    updateSecretCommand,
} from "./secret_commands.ts";
import { Select } from "@cliffy/prompt/select";
import { Input } from "../deps.ts";

// Главное меню для работы с секретами
const secretMenu = async () => {
    const action = await Select.prompt({
        message: "Что вы хотите сделать с секретами?",
        options: [
            { name: "Добавить секрет", value: "add" },
            { name: "Обновить секрет", value: "update" },
            { name: "Удалить секрет", value: "delete" },
            { name: "Посмотреть секреты", value: "fetch" },
        ],
    });

    switch (action) {
        case "add":
            const key = await Input.prompt("Введите ключ секрета:");
            const value = await Input.prompt("Введите значение секрета:");
            await addSecretCommand().parse([key, value]);
            break;
        case "update":
            const updateKey = await Input.prompt(
                "Введите ключ секрета для обновления:",
            );
            const updateValue = await Input.prompt("Введите новое значение:");
            await updateSecretCommand().parse([updateKey, updateValue]);
            break;
        case "delete":
            const deleteKey = await Input.prompt(
                "Введите ключ секрета для удаления:",
            );
            await deleteSecretCommand().parse([deleteKey]);
            break;
        case "fetch":
            await fetchSecretsCommand().parse([]);
            break;
    }
};

const secretCommand = new Command()
    .description("Управление секретами")
    .action(secretMenu);

export default secretCommand;
