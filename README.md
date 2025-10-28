# 📡 Real-Time Log Streaming Service

A high-performance WebSocket-based log monitoring solution (like `tail -f` but remote) built from scratch without external tail libraries.

## 🚀 Features

- **Real-time streaming** – Logs update instantly through WebSockets  
- **Last N lines on connect** – Shows last 10 lines right away  
- **Multiple concurrent clients** – Pub/sub architecture supports unlimited viewers  
- **File rotation handling** – Detects truncated logs and recovers  
- **Efficient backward reading** – Reads only chunks needed  
- **Zero external tail libraries** – Pure Node.js Streams + fs  
- **Graceful shutdown** – Handles SIGTERM cleanly  

## 🛠️ Tech Stack

| Layer | Technology |
|------|------------|
| Runtime | Node.js |
| Server | Express.js |
| WebSocket | ws |
| File I/O | Native fs module + streams |

## 📁 Project Structure

```
browserStack/
├── src/
│   ├── services/
│   │   └── logTrailerService.js    # Core log monitoring logic
│   └── test.log                    # Sample log file
├── public/
│   └── log.html                    # WebSocket client UI
├── index.js                        # Server entry point
├── package.json
└── README.md
```

## ⚡ Quick Start

### Install dependencies
```bash
npm install
```

### Run server
```bash
node index.js
```

### Open browser
```
http://localhost:3000/log
```

## 🎯 Architecture

```
┌─────────────┐          WebSocket         ┌──────────────┐
│   Browser   │◄──────────────────────────│ Express/WS   │
│   Client    │                           │   Server     │
└─────────────┘                           └───────┬──────┘
                                                │
                                        ┌───────▼──────┐
                                        │ LogTrailer   │
                                        │   Service    │
                                        └───────┬──────┘
                                                │
                                           Polling Loop
                                                │
                                        ┌───────▼──────┐
                                        │   test.log   │
                                        │  (File I/O)  │
                                        └──────────────┘
```

## 🔍 Core Logic

1. **Init**
   - Reads file size  
   - Starts poll loop (default 1s)  
   - Stores pointer to last read byte  

2. **Last N lines**
   - Reads file backwards in 4KB chunks  
   - Counts newlines until 10 found  
   - Sends snapshot to new client  

3. **Change Detection**
   - Compares file size changes  
   - Streams new bytes to clients  

4. **Log Rotation**
   - Detects truncation  
   - Resets pointer  
   - Continues watching  

## 🔌 API

### HTTP Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/` | Health check |
| GET | `/log` | Web UI for log stream |
| GET | `/health` | Status JSON |

### WebSocket Messages

```json
{
  "type": "initial",
  "data": "last 10 lines..."
}
```

```json
{
  "type": "update",
  "data": "new content..."
}
```

```json
{
  "type": "error",
  "message": "description"
}
```

## 🧪 Testing

### Manual Test
```bash
node index.js
```

Browser:
```
http://localhost:3000/log
```

Append new logs:
```bash
echo "Test log entry $(date)" >> src/test.log
```

Watch UI update ✅

## ⚙️ Config

Modify inside `index.js`:

```js
const LOG_FILE_PATH = './src/test.log'
const PORT = 3000

// In LogTrailerService
pollingInterval: 1000  // ms
```

## ✅ Edge Cases Covered

| Case | Status |
|------|--------|
| File missing initially | ✅ |
| File truncated | ✅ |
| Empty log | ✅ |
| Multiple clients | ✅ |
| Disconnects | ✅ |
| SIGTERM graceful shutdown | ✅ |

## 🚄 Performance

- Efficient chunked reads  
- Non-blocking streaming  
- O(1) pub/sub operations  

## 📌 Future Enhancements

- [ ] Multi-file monitoring  
- [ ] Filters + search  
- [ ] Regex coloring  
- [ ] Download logs  
- [ ] Auth + roles  

---

## 👨‍💻 Author

Built with ☕ and WebSockets ❤️  
MIT License

---

⭐ Star this repo if real-time magic excites you! ✨
