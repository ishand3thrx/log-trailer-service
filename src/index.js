import express from "express";
import { WebSocketServer } from "ws";
import cors from "cors";
import dotenv from "dotenv";
import LogTrailerService from './services/logTrailerService.js';



dotenv.config();
const app = express();
const PORT = 3000;

const LOG_FILE_PATH =  './src/test.log'

app.use(cors());
app.use(express.json());
app.use(express.static('public'))

app.get('/log',(req,res)=>{
  res.sendFile('log.html',{root:'./public'})
})


// REST endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok",monitoring: LOG_FILE_PATH });
});


// Start server
const server = app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);


// initilaise log tailer

const logTrailer = new LogTrailerService(LOG_FILE_PATH)

logTrailer.start().catch(e=>{
  console.error('failed to start monitoring logs',e)
  process.exit(1)

})



// websocket server


const wss = new WebSocketServer({server})

wss.on('connection',async (ws)=>{
  console.log('connection success')

  try{
    const lastLines = await logTrailer.getLastNLines(10)
    ws.send(JSON.stringify({type:'initial',data:lastLines})) 
  }catch(e){
    console.error('error sending initial lines',e)
  ws.send(JSON.stringify({type:'error',message:'failed to load initial content'})) 
  }

// subscribe to log updates
  const updateHandler = (newContent)=>{
    if(ws.readyState === ws.OPEN){
       ws.send(JSON.stringify({type:'update',data:newContent}))
    }
  }

  logTrailer.subscribe(updateHandler)


  // CLIENT DISCONNECTION
  ws.on('close', ()=>{
    console.log('client disconnected')
    logTrailer.unsubscribe(updateHandler)

  })

  ws.on('error',(e)=>{
    console.error('websocekt error',e)
    logTrailer.unsubscribe(updateHandler)
  })
})



process.on('SIGTERM',()=>{
  console.log('SIGTERM recived,shutting down')
  
  logTrailer.stop()

  server.close(()=>{
    console.log('server closed')
    process.exit(0)
    
  })
})

// Export app for testing
export default app;

