import { createReadStream } from 'fs'
import fs from 'fs/promises'


class LogTrailerService{

constructor(filepath,pollingInterval =1000){
this.filepath =filepath
this.pollingInterval = pollingInterval
this.lastPostion = 0
this.lastModified = 0
this.intervalId = null
this.subscribers = new Set()

}

subscribe(callback){
    this.subscribers.add(callback)
}
unsubscribe(callback){
    this.subscribers.delete(callback)
}

broadcast(data){
    this.subscribers.forEach(callback =>{
        try{
            callback(data)
        }catch(e){
            console.error('error broadcasting to client')
        }
    })
}

async start(){
    try{
        const stats = await fs.stat(this.filepath)
        this.lastPostion = stats.size
        this.lastModified = stats.mtime.getTime()
        
        // i will be polling for changes
        this.intervalId = setInterval(()=> this.checkForUpdates(), this.pollingInterval)
        console.log(`monitoring ${this.filepath}`) 
    }catch(e){
         console.error(`failed to log tailer`) 
         throw e
    }
}
async checkForUpdates(){
   try{ 
    const stats = await fs.stat(this.filepath)
    // check for update if there is any

    if(stats.mtime.getTime()>this.lastModified){
        await this.readNewContent(stats.size)
        this.lastModified =   stats.mtime.getTime() 
    }
}catch(e){
 console.error(`error checking file updates`) 
 this.broadcast({error: 'log file not available'})
    }

}

async readNewContent(currentSize){
    if(currentSize<this.lastPostion){
        // handling file roation 

      this.lastPostion =0

    }
    // no updates
    if(currentSize === this.lastPostion){
        return 
    }
    // new updates

    return new Promise((resolve,reject)=>{
        const stream = createReadStream(this.filepath,{start: this.lastPostion, end:currentSize})
        let newContent = ''
        stream.on('data',chunk => {
            newContent += chunk.toString() 

        })
        stream.on('end',()=>{
            if(newContent){
                this.broadcast(newContent)
            }
            this.lastPostion = currentSize
            resolve()
})
    stream.on('error',reject)

    })
}


async getLastNLines(n=10){
    try{
        const stats = await fs.stat(this.filepath)
        const fileSize = stats.size
        if(fileSize === 0){
            return 
        }
const CHUNCKSIZE = 4096

let lines = []
let position = fileSize
let buffer = ''


while(lines.length<n && position>0){
const readSize = Math.min(CHUNCKSIZE,position)
position -= readSize
const chunk = await this.readChunk(position,readSize)
buffer = chunk+buffer
const allLines = buffer.split('\n')
buffer = allLines[0]
lines = allLines.slice(1).concat(lines)
}
//reading last 10 lines of the file in the loop

return lines.slice(-n).join('\n')

    }catch(e){
        console.error('error reading last n lines')
        return ''
    }
}

async readChunk(start,length){
    return new Promise((resolve,reject)=>{
        const stream = createReadStream(this.filepath, {start,end:start+length})
        let data =''
        stream.on('data',chunk=>{
            data +=chunk.toString()

        })

        stream.on('end',()=>{
            resolve(data)
        })

        stream.on('error',reject)



    })
}


stop(){
    if(this.intervalId ){
        clearInterval(this.intervalId)
        this.intervalId = null
    }
}
}


export default LogTrailerService