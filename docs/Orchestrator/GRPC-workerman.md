---
title: Worker Manager & gRPC Server
sidebar_position: 3
---

## **Worker Manager & gRPC Server**

### **1. Worker Manager (`workerman`)**

The **Worker Manager** (`workerman.WorkerManager`) is the core orchestrator component responsible for:

* **Maintaining worker state** – keeps track of all registered workers, their health, and whether they are free, busy, or dead.
* **Worker registration and deregistration** – handles new workers joining the system and safely removes dead or disconnected workers.
* **Job assignment** – keeps a **buffered channel of free workers** to assign jobs efficiently.
* **Health checks** – periodically pings workers via gRPC to ensure they are alive and healthy.

**Core Struct:**

```go
type WorkerManager struct {
    mu          sync.Mutex          // protects workers map
    workers     map[string]*Worker  // all workers indexed by ID
    FreeWorkers chan *Worker        // buffered channel of free workers
}

type Worker struct {
    Info     *workerpb.WorkerInfo
    LastSeen time.Time
    state    string           // free, busy, dead
    GrpcConn *grpc.ClientConn // persistent gRPC connection
}
```

**Key Methods:**

* `RegisterWorker(ctx, info)` – registers a worker, opens a persistent gRPC connection, sets state to "free".
* `SetWorkerState(workerID, state)` – safely updates worker state and pushes free workers into the channel.
* `CheckHealthForAll()` – pings all workers concurrently using goroutines.
* `CloseGRPCAll()` – closes all persistent connections to clean up resources.

**Concurrency Handling:**

* Uses `sync.Mutex` to ensure **thread-safe updates** to the `workers` map.
* Uses a **buffered channel** (`FreeWorkers`) for free workers to allow asynchronous job assignment.
* Health checks and job assignment run in separate goroutines, ensuring **non-blocking operation**.

---

### **2. Orchestrator gRPC Server (`server.go`)**

The **gRPC server** exposes the **WorkerService** to allow workers to register and report their health. It interacts directly with the **Worker Manager**.

```
+---------------------+
| gRPC Server         |
| (Orchestrator)      |
+----------+----------+
           |
           ▼
+---------------------+
| Worker Manager      |
| workers map + free  |
| worker channel      |
+---------------------+
```




**Core Struct:**

```go
type OrchestratorGRPCServer struct {
    workerpb.UnimplementedWorkerServiceServer
    Manager *workerman.WorkerManager // reference to WorkerManager
}
```

**Creating the Server:**

```go
func NewServer(manager *workerman.WorkerManager) *grpc.Server {
    server := grpc.NewServer()
    workerpb.RegisterWorkerServiceServer(server, &OrchestratorGRPCServer{
        Manager: manager,
    })
    reflection.Register(server)
    return server
}
```

**Starting the Server:**

```go
func StartGRPCServer(port int, manager *workerman.WorkerManager) {
    lis, err := net.Listen("tcp", fmt.Sprintf(":%d", port))
    if err != nil {
        log.Fatalf("failed to listen: %v", err)
    }
    server := NewServer(manager)
    log.Printf("gRPC server listening on port %d", port)
    if err := server.Serve(lis); err != nil {
        log.Printf("failed to serve: %v", err)
    }
}
```

**Worker Registration Handler:**

```go
func (s *OrchestratorGRPCServer) Register(ctx context.Context, req *workerpb.WorkerInfo) (*workerpb.RegisterAck, error) {
    log.Printf("Received Register request from worker ID: %s", req.Id)
    err := s.Manager.RegisterWorker(ctx, req)
    if err != nil {
        return nil, err
    }
    return &workerpb.RegisterAck{Success: true}, nil
}
```

**Concurrency Handling:**

* gRPC **automatically spins up a new goroutine** for each incoming request.
* Each handler (like `Register`) runs independently, so multiple workers can register or ping simultaneously without blocking each other.
* Combined with `WorkerManager`’s mutex and channels, this ensures **thread-safe and scalable worker management**.




