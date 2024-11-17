# TUNNEL MANUAL

## **What is tunnel and why do you need it?**

The tunnel tool is designed to simplify the creation and management of HTTP tunnels, which are useful for exposing local development environments to the internet. This can be essential for testing webhooks, sharing work in progress with teammates, or providing temporary public access to your local applications.

With tunnel, you can:

1. **Create and manage tunnels**: Assign aliases to tunnels for easier reference.
2. **Start and stop tunnels**: Quickly start or remove tunnels as needed.
3. **Seamless sharing**: Allow others to access your local server through a public URL.

---

## **Example Use Case**

### **Scenario: Developing a Telegram Bot Using Webhooks**

Suppose you are developing a Telegram bot and need to expose your local server to receive webhook events. You can:

1. Create an alias for the tunnel to expose your local server.
2. Start the tunnel and obtain the public URL.
3. Set the Telegram webhook URL to the public URL provided by the tunnel.
4. Test your bot locally with real-time updates from Telegram.
5. Remove the tunnel once development is complete.

For example:

1. Set an alias for your tunnel:

   ```bash
   tunnel set telegram-bot my-bot 3000
   ```

2. Start the tunnel:

   ```bash
   tunnel start telegram-bot
   ```

3. Use the public URL to set the Telegram webhook (replace `<PUBLIC_URL>` with the URL provided by the tunnel tool):

   ```bash
   curl https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=<PUBLIC_URL>
   ```

4. Test the bot by sending messages to see if the webhook works correctly.

5. Remove the tunnel when you no longer need it:

   ```bash
   tunnel remove telegram-bot
   ```

---

### **1. Setting a Tunnel Alias**

You can assign an alias to your tunnel for easy identification.

#### Command:

```bash
tunnel set <alias> <tunnel_name> <port>
```

For example:

```bash
tunnel set dev-server my-app 8080
```

This will create a tunnel named "my-app" running on port 8080, accessible using the alias "dev-server".

#### Interactive Mode:

```bash
tunnel
```

Choose "set tunnel alias" and provide the alias, tunnel name, and port.

---

### **2. Starting a Tunnel**

To start a tunnel and expose your local service:

#### Command:

```bash
tunnel start <alias>
```

For example:

```bash
tunnel start dev-server
```

This will start the tunnel for the alias "dev-server" and make it accessible via a public URL.

#### Interactive Mode:

```bash
tunnel
```

Choose "start a tunnel" and select the alias you want to start.

---

### **3. Removing a Tunnel Alias**

When you no longer need a tunnel, you can remove its alias:

#### Command:

```bash
tunnel remove <alias>
```

For example:

```bash
tunnel remove dev-server
```

This will remove the alias "dev-server" and stop the associated tunnel.

#### Interactive Mode:

```bash
tunnel
```

Choose "remove tunnel alias" and select the alias to remove.

---

### **4. Listing Available Tunnels**

You can see all active tunnel aliases and their details:

#### Command:

```bash
tunnel list
```

This will display a table with the aliases, tunnel names, and ports of all the currently available tunnels.

#### Interactive Mode:

```bash
tunnel
```

Choose "show list of tunnels" to view all active tunnels.

---

## **Complete Usage Scenarios**

### **1. Managing Tunnels**

#### Set a Tunnel Alias:

```bash
tunnel set <alias> <tunnel_name> <port>
```

#### Start a Tunnel:

```bash
tunnel start <alias>
```

#### Remove a Tunnel Alias:

```bash
tunnel remove <alias>
```

#### Show List of Tunnels:

```bash
tunnel list
```

---

The tunnel tool provides a simple and effective way to manage HTTP tunnels, making it easy to expose local servers for testing, sharing, and collaboration.
