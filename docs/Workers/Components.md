---
title: Implementation
sidebar_position: 4
---

# **Implementation Details — Worker**

## **1. Environment Initialization**

**File:** `main.go`

* Loads environment variables from `.env` using `utils.EnvInit`.
* Reads:

  * `WORKER_ID` — unique identifier (auto-generated if not set).
  * `ORCHESTRATOR_ADDR` — gRPC endpoint for the orchestrator.
  * `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` — needed later for ECR login.
* Determines the worker’s **local IP** using `utils.GetLocalIP`.

---

## **2. gRPC Server Startup**

**File:** `internal/grpc/server.go`

* `StartGRPCServer(port, workerID)`

  * Opens TCP listener on the given port.
  * Creates a new gRPC server instance (`NewServer`).
  * Registers the **JobService** implementation.
  * Starts serving requests in its own goroutine.
* Reflection is enabled for easier debugging (`grpc/reflection`).

---

## **3. Registration with Orchestrator**

**File:** `main.go` → `registerWithOrchestrator()`

* Creates insecure gRPC connection to orchestrator.
* Calls `WorkerService.Register()` with:

  * Worker ID
  * IP address
  * Listening port
  * Region
* On success, the worker stays running in a `select{}` block, waiting for jobs.

---

## **4. Handling Incoming Jobs**

**File:** `internal/grpc/server.go` → `RunJob()`

* Uses a mutex to ensure **only one job runs at a time**.
* Calls `RunJobLogic()` for actual execution.
* Returns error if worker is already busy.

---

## **5. Job Execution Pipeline**

**File:** `internal/grpc/job_logic.go` → `RunJobLogic()`

### **Step 1 — Clone Repository**

**File:** `internal/repo/clone.go`

* `CloneRepo()`:

  * Injects GitHub token into URL if provided.
  * Creates `tmp/repos` directory.
  * Clones the specified branch into a unique timestamped folder.

### **Step 2 — Build Docker Image**

**File:** `internal/builder/build.go`

* `BuildImage()`:

  * Logs start of build.
  * Calls `scripts/build.sh` using `exec.Command` with:

    * Image name
    * Build context directory
    * Dockerfile path
    * Unique folder name
  * Uses **BuildKit** for faster and cache-friendly builds.

### **Step 3 — Login to AWS ECR**

**File:** `internal/aws/login.go`

* `LoginDockerToAWS()`:

  * Uses AWS SDK to request an **authorization token** from ECR.
  * Decodes Base64 token into username/password.
  * Creates Docker client from environment.
  * Performs `docker login` programmatically.
  * Stores credentials in global variables for later push.

### **Step 4 — Tag & Push Image**

**File:** `internal/builder/push.go`

* `TagAndPushImage()`:

  * Prepends ECR registry URL to image name.
  * Calls `dockerCli.ImageTag()` to tag locally built image.
  * Base64-encodes credentials and pushes to ECR.
  * Streams push logs to stdout.

---

## **6. Health Checks**

**File:** `internal/grpc/server.go` → `Ping()`

* Responds with:

  * Worker ID
  * Current status (`FREE` / `BUSY`)
* Allows orchestrator to skip busy or unresponsive workers.

---

## **7. Cleanup**

**File:** `internal/dirManager/delete.go`

* `DeleteFolder()`:

  * Removes temp build directory recursively after job completion.
* Called at the end of job execution to maintain statelessness.

---

## **8. Error Handling**

* **Clone Failure** → Returns `JobResponse` with error details.
* **Build Failure** → Captures `exec.Command` error and logs it.
* **AWS Auth Failure** → Stops pipeline and reports to orchestrator.
* **Push Failure** → Returns detailed message from Docker API.
* **Context Cancellation** → If orchestrator cancels job mid-execution, worker stops and reports `Execution cancelled`.

