📡 Real-Time Log Streaming Service

A high-performance WebSocket-based log monitoring solution (like tail -f but remote) built from scratch without external tail libraries.

🚀 Features

Real-time streaming – Logs update instantly through WebSockets

Last N lines on connect – Shows last 10 lines right away

Multiple concurrent clients – Pub/sub architecture supports unlimited viewers

File rotation handling – Detects truncated logs and recovers

Efficient backward reading – Reads only chunks needed

Zero external tail libraries – Pure Node.js Streams + fs

Graceful shutdown – Handles SIGTERM cleanly

🛠️ Tech Stack
Layer	Technology
Runtime	Node.js
Server	Express.js
WebSocket	ws
File I/O	Native fs module + streams
📁 Project Structure
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

⚡ Quick Start
Install dependencies
npm install

Run server
node index.js

Open browser
http://localhost:3000/log

🎯 Architecture
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

🔍 Core Logic

Init
• Reads file size
• Starts poll loop (default 1s)
• Keeps pointer to last read byte

Last N Lines (reverse read)
• Reads backwards in 4KB chunks
• Stops on 10 newlines
• Sends snapshot to new client

Change Detection
• Compare last known file size to current
• Streams new bytes to subscribers

Log Rotation
• If file truncated
• Reset pointer to start
• Continue reading new content

🔌 API
HTTP
Method	Endpoint	Description
GET	/	Health check
GET	/log	UI for log streaming
GET	/health	Monitoring status
WebSocket Messages
Initial snapshot
{
  "type": "initial",
  "data": "last 10 lines..."
}

Updates
{
  "type": "update",
  "data": "new content..."
}

Errors
{
  "type": "error",
  "message": "description"
}

🧪 Testing
Manual Check
node index.js


Browser:
http://localhost:3000/log

Append new logs:

echo "Test log entry $(date)" >> src/test.log


See updates instantly ✅

Automated
npm test

🧠 Smart Design Choices
Polling vs watchers

Polling chosen for:
• Cross-platform support
• Reliability
• Flexibility

WebSockets

• Low latency
• Bi-directional
• Standard browser support

Backward Reading

• Doesn’t read whole file
• Works even with huge logs
• Fast + efficient

⚙️ Config

Edit these values in index.js:

const LOG_FILE_PATH = './src/test.log'
const PORT = 3000

// In LogTrailerService:
pollingInterval: 1000 // ms

✅ Edge Cases Covered
Scenario	Status
File missing initially	✅
File rotation (truncate)	✅
Empty log	✅
Multiple clients	✅
Client disconnect	✅
Safe shutdown	✅
🚄 Performance

• Chunk-based reading
• Streams for incremental updates
• O(1) subscriber management
• Optimized polling interval

📌 Future Enhancements

 Multi-file support

 Search & filters

 Auth + permissions

 Download logs

 Regex highlights

 Log rotation by inode detection

🤝 Contributing

Pull requests welcome! This is a pure implementation challenge of tail -f without any external tailing libraries.

📄 License

MIT

👨‍💻 Author

Built with ☕ and WebSockets ❤️
