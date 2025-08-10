## Situation
### The worker was not registering with the orchestrator.

*Reason: Deadlock becauase of bad mutex handling*

The deadlock occurred because the RegisterWorker method locked wm.mu and, before unlocking, called another method (SetWorkerState) that also tried to lock wm.mu in the same goroutine. Go’s sync.Mutex is non-reentrant, meaning that a mutex cannot be locked twice by the same goroutine without unlocking in between. This caused a self-deadlock — the goroutine was waiting on itself to release the lock, which never happened.

### What was happening
- The orchestrator is on and is listening on localhost:5051
- When I start the worker, The worker starts a grpc server ready to listen and after few milliseconds after waiting for grpc server to start on another goroutine fires an rpc at orchestrator. (done by starting a temp connection to orchestrator at localhost:5051 which closes after registeration is done)
- When the orchestrator recieve the rpc, it logs that yeah we recieved and also logs the data that it recieves, worker's IP, port etc but when it tries to connect to the worker it got stuck at this code block
```go
    // ---- Connect outside the lock ----
    conn, err := grpc.NewClient("localhost:6000", grpc.WithTransportCredentials(insecure.NewCredentials()))
    if err != nil {
        log.Printf("❌ Failed to dial worker %s: %v", info.Id, err)
        wm.SetWorkerState(info.Id, "dead")
        return err
    }

```
- The reason was using this on top of the RegisterWorker func
```go
wm.mu.lock()
defer wm.mu.unlock() 
```
- the goroutine that was actually handling the request locked the wm.mu.lock() on top of the RegisterWorker func()
- when inside this func we called wm.SetWorkerState() it also uses something like the block with defer we said. SO in same goroutine we were trying to lock thee sync.Mutex() twice. 
- Usually when there is one goroutine that locks the mutex and another that locks it to, that goroutine stops its execution unless the lock is lifted by the goroutine that locked it
- but here the goroutine that that was waiting for the lock to be lifted waited endlessely. See every time a new request comes to the grpc server that is running on separate goroutine on orchestrator a new goroutine pops up to complete that request. SO whenever new worker spawns, it waits for its execution to be completed
- When that goroutine locks the mutex and in the same func we call the lock on mutex again it waits endlessly for earlier lock to be free causing the deadlock situation

### Findings (only for sync.Mutex and sync.RWMutex write)
- even if there are 1000s goroutine one mutex can be locked by any ~~but only that same goroutine that locked it~~ and can goroutine can unlock it but unlocking from different goroutine can always be problamitic 
- If any other goroutine tries to lock it, it will wait for the earlier goroutine to free it 
- if the same goroutine tries to lock it again, it will cause a deadlock sitation

>Once a goroutine has acquired the lock, if that same goroutine tries to acquire it again before releasing it, it will block forever (deadlock) — because the lock doesn’t “recognize” that it’s the same owner, it just sees “this lock is already taken” and waits.


>[!NOTE]
the mutex isnt aware which goroutine locked it. meaning if u unlock it from different goroutine no issue and if you lock it in same goroutine it will wait for it to complete its execution 
