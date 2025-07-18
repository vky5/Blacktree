# 🧱 SYSTEM COMPONENT ROLES

| Component           | Responsibility                                                  |
| ------------------- | --------------------------------------------------------------- |
| 🧠 **Backend**      | Accepts job requests, stores metadata, triggers execution (ECS) |
| ⚙️ **Orchestrator** | Pull-based build job dispatcher, tracks which workers are free  |
| 🔧 **Worker**       | Clones repo, builds Docker image, pushes to ECR                 |
| ☁️ **ECS Task**     | Executes container built from image pushed to ECR               |



## Day 1 – Orchestrator & Message Flow 
| Task                                      | Description                                                  | Status |
| ----------------------------------------- | ------------------------------------------------------------ | ------ |
| Implement pull-based job assignment       | Orchestrator pulls from job queue only when workers are free | ✅      |
| Trigger `BuildJob()` on worker            | Use goroutines, channels to execute work concurrently        | ✅      |
| Send build result back to backend         | Via NATS / MQ / gRPC / HTTP callback                         | ✅      |
| Handle retries on failure                 | Retry N times if clone/build fails                           | ✅      |
| Design build message structure            | `repo`, `branch`, `dockerfile`, `imageName`, etc.            | ✅      |
| Create build queue + response queue types | `queue.JobMessage`, `queue.JobResult`                        | ✅      |

## Day 2 – Build System Bootstrapping 
| Task                              | Description                                    | Status |
| --------------------------------- | ---------------------------------------------- | ------ |
| Set up base worker in Go          | Skeleton to receive job, clone repo, run build | ✅      |
| Implement repo clone logic        | Clone repo into `/tmp/repo-{timestamp}`        | ✅      |
| Build Docker image using BuildKit | Shell-based builder using `DOCKER_BUILDKIT=1`  | ✅      |
| Push image to ECR                 | Tag + push image to correct ECR URI            | ✅      |
| Clean up temp files               | Remove cloned dirs, Docker contexts            | ✅      |
| Log every step                    | Add clear logging for all ops                  | ✅      |

## Day 3 – ECS Integration (Execution Phase)
| Task                              | Description                                                       | Status |
| --------------------------------- | ----------------------------------------------------------------- | ------ |
| Finalize `Deployment` entity      | Added resourceVersion, envVars, portNumber, autoDeploy flags      | ✅      |
| Create `DeploymentVersion` entity | Stores image URL, taskDefArn, taskArn, build/runtime logs         | ✅      |
| Register ECS Task Definition      | Implemented `AwsService.registerTaskDefinition()` with config map | ✅      |
| Run ECS container                 | Implemented `AwsService.runContainer()`                           | ✅      |
| Stop ECS container                | Implemented `AwsService.stopContainer()` using taskArn            | ✅      |
| Soft delete deployment            | Added `cleanResources()` method and controller route              | ✅      |
| Build image trigger endpoint      | `/deployment/:id/build` via orchestrator pipeline                 | ✅      |
| Trigger deploy endpoint           | `/deployment/:id/trigger` — launches container using ECS taskDef  | ✅      |
| Stop deployment endpoint          | `/deployment/:id/stop` — updates status to STOPPED                | ✅      |
| Delete deployment endpoint        | `/deployment/:id/delete` — soft deletes and clears task info      | ✅      |
| Update `AwsService`               | Broke into register/run methods, added error handling             | ✅      |

## Day 4 – Worker ↔ Orchestrator gRPC Interface (Runtime Coordination)| **Task**                                  | **Description**                                                    | **Status** |
| ----------------------------------------- | ------------------------------------------------------------------ | ---------- |
| Implement pull-based job assignment       | Orchestrator pulls from job queue only when workers are free       | ✅          |
| Trigger `BuildJob()` on worker            | Use goroutines, channels to execute work concurrently              | ✅          |
| Send build result back to backend         | Via NATS / MQ / gRPC / HTTP callback                               | ✅          |
| Handle retries on failure                 | Retry N times if clone/build fails                                 | ✅          |
| Design build message structure            | Includes repo, branch, dockerfile, imageName, etc.                 | ✅          |
| Create build queue + response queue types | `queue.JobMessage`, `queue.JobResult` structures for communication | ✅          |


## Day 5 – Monitoring, Logs, Scaling & Polish
| Task                                      | Description                                |
| ----------------------------------------- | ------------------------------------------ |
| 📊 Stream logs from CloudWatch (ECS task) | Show stdout/stderr of running containers   |
| 🧠 Add job status polling                 | Mark job as done/failed in DB              |
| 💬 Push logs to orchestrator/backend      | Realtime logs or final dump                |
| 🔁 Retry on container crash               | Use ECS Task exit code or `StoppedReason`  |
| 📦 Optional: Support multi-region         | Run workers/orchestrator in multiple zones |
| 🔐 Add IAM + VPC boundaries               | Secure ECR, ECS roles, log access          |
| ⚙️ Optional: TTLs for job cleanup         | Clean up job metadata/images after X days  |





