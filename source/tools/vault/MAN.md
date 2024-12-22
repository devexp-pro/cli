# VAULT MANUAL

## **What is `vault` and why do you need it?**

`.env` files are commonly used to store sensitive data such as tokens and keys.
However, this approach is inconvenient and insecure:

- `.env` files are hard to sync across a team.
- They can accidentally be committed to a repository, leading to data leaks.
- Separate `.env` files are needed for each environment, which can be easily
  mixed up.

`vault` solves these problems by offering:

1. **Centralized secret storage**: All data is stored in one place.
2. **Environment isolation**: Each environment is separated and managed
   individually.
3. **Team collaboration**: Easily invite team members and control their access.
4. **Seamless integration**: Secrets can be easily loaded into your application.

---

## **Example Use Case**

### **Scenario**

Suppose you are developing a Telegram bot in a small team. You need to:

1. Create a project `<project_name>`.
2. Set up two environments: `dev` for development and `prod` for production.
3. Add bot tokens to the appropriate environments.
4. Invite team members to collaborate on the project.
5. Upload secrets from a `.env` file into the required environment.

---

### **1. Creating a Project**

When creating a project:

- The project is automatically set as the current project.
- Two default environments are created: `dev` (set as the current environment)
  and `prod`.

#### Command:

```bash
vault project --action=create --project-name=<project_name>
```

#### Interactive Mode:

```bash
vault project
```

Choose "Create a Project" and enter the name.

---

### **2. Managing Environments**

#### Creating a New Environment

##### Command:

```bash
vault env --action=create --env-name=<env_name>
```

##### Interactive Mode:

```bash
vault env
```

Choose "Create Environment" and enter the name.

#### Selecting an Environment

##### Command:

```bash
vault env --action=select --env-name=<env_name>
```

##### Interactive Mode:

```bash
vault env
```

Choose "Select Environment" and specify the name.

---

### **3. Managing Secrets**

#### Adding a Secret

##### Command:

```bash
vault secret --action=add --key=<key_name> --value=<value>
```

##### Interactive Mode:

```bash
vault secret
```

Choose "Add a Secret" and provide the key and value.

#### Uploading Secrets from a `.env` File

You can load all data from a `.env` file into the selected environment.

##### Command:

```bash
vault secret --action=loadEnvFile --file=<path_to_env_file> --env-name=<env_name>
```

##### Interactive Mode:

```bash
vault secret
```

Choose "Load Secrets from a File" and specify the file path and environment.

---

### **4. Inviting Team Members**

#### Command:

```bash
vault invite --project-name=<project_name> --email=<email_address>
```

#### Interactive Mode:

```bash
vault invite
```

Choose a project and enter the user's email address.

---

### **5. Running an Application with Secrets**

You can execute an application by specifying a command. `vault` automatically
loads secrets from the current environment.

#### Command:

```bash
vault run "<command>"
```

_Important_: There is **no interactive mode** for `vault run`.

---

## **Complete Usage Scenarios**

### **1. Managing Projects**

#### Create a Project:

When you create a project:

- It is automatically set as the current project.
- Two default environments (`dev` and `prod`) are created.
- The `dev` environment is set as the current environment.

```bash
vault project --action=create --project-name=<project_name>
```

#### Select a Project:

```bash
vault project --action=select --project-name=<project_name>
```

#### Rename a Project:

```bash
vault project --action=rename --old-name=<old_project_name> --new-name=<new_project_name>
```

#### Delete a Project:

```bash
vault project --action=delete --project-name=<project_name>
```

---

### **2. Managing Environments**

#### Create an Environment:

```bash
vault env --action=create --env-name=<env_name>
```

#### Select an Environment:

```bash
vault env --action=select --env-name=<env_name>
```

#### Rename an Environment:

```bash
vault env --action=rename --old-name=<old_env_name> --new-name=<new_env_name>
```

#### Delete an Environment:

```bash
vault env --action=delete --env-name=<env_name>
```

---

### **3. Managing Secrets**

#### Add a Secret:

```bash
vault secret --action=add --key=<key_name> --value=<value>
```

#### Update a Secret:

```bash
vault secret --action=update --key=<key_name> --value=<new_value>
```

#### Delete a Secret:

```bash
vault secret --action=delete --key=<key_name>
```

#### View All Secrets:

```bash
vault secret --action=fetch
```

#### Load Secrets from a `.env` File:

```bash
vault secret --action=loadEnvFile --file=<path_to_env_file> --env-name=<env_name>
```

---

### **4. Inviting Users**

#### Invite a User to a Project:

```bash
vault invite --project-name=<project_name> --email=<email_address>
```

---

### **5. Running an Application**

#### Run a Command:

```bash
vault run "<command>"
```
