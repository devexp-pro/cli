# CLIP MANUAL

## **What is `clip` and why do you need it?**

When working across multiple devices, it can be inconvenient to transfer text, such as code snippets, links, or notes, from one device to another. Traditional methods like email or messaging apps are cumbersome and time-consuming.

`clip` simplifies this process by providing:
1. **A cloud-based clipboard**: Share text seamlessly between devices.
2. **Cross-platform support**: Works across operating systems like Windows, macOS, and Linux.
3. **Command-line simplicity**: Store and retrieve text with simple commands.

---

## **Example Use Case**

### **Scenario**

You are working on a project across multiple devices and need to:
1. Copy a piece of text from your current device.
2. Share it with another device using the cloud clipboard.
3. Retrieve the text on the target device and paste it into your application.

---

### **1. Storing Text in the Cloud**

You can store text in the cloud clipboard using the `store` command. This can be done in two ways:
1. Provide the text directly as an argument.
2. Automatically read the clipboard contents from your current device.

#### Command:
```bash
clip store "This is a sample text."
```
---

### **2. Loading Text from the Cloud**

You can retrieve the stored text on another device using the `load` command. The text is automatically written to your local clipboard.

#### Command:
```bash
clip load
```


---

## **Complete Usage Scenarios**


### Store Text Directly:
```bash
clip store "Sample text to share."
```

### Store Clipboard Contents:
```bash
clip store
```

---

## **How It Works**

### **Clipboard Commands**
- **`read`**: Reads the current clipboard contents from the operating system.
- **`write`**: Writes the specified text to the system clipboard.

### **Cross-Platform Support**
The `clip` tool leverages platform-specific clipboard utilities:
- macOS: `pbpaste` and `pbcopy`
- Linux: `xsel`
- Windows: `powershell` with `Get-Clipboard`

If your platform does not support these commands, `clip` will return `null` for unsupported operations.

---

## **Command Reference**

### **Store Text**
Store text in the cloud clipboard.
```bash
clip store [text...]
```
- `text`: The text to store. If omitted, the current clipboard contents are used.
- Options:
  - `--show, -s`: Display the stored text in the terminal.

---

### **Load Text**
Retrieve text from the cloud clipboard and write it to the local clipboard.
```bash
clip load
```

---

`clip` provides a simple and effective way to manage text sharing between devices, streamlining your workflow across platforms.
