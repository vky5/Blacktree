# Project Progress Log: Distributed Build System

---

## Day 1 – Build Orchestrator & Queue Setup

| Task                  | Description                                             | Status  |
| --------------------- | ------------------------------------------------------- | ------- |
| Setup .env loading    | Environment setup utility for managing secrets          | ✅ Done |
| Integrated RabbitMQ   | Exchange/Queue declaration and channel handling         | ✅ Done |
| Routing Keys & Queues | Defined routes for task distribution and result logging | ✅ Done |
| Consumer Logic        | Blocking listener (non-auto-ack) with timeouts          | ✅ Done |
| Publisher Logic       | Send result/status back to the backend                  | ✅ Done |
| Logging and Shutdown  | Graceful shutdowns and error-resilient logging          | ✅ Done |

---

## Day 2 – Worker System (Dynamic Build Execution)

| Task                               | Description                                                              | Status      |
| ---------------------------------- | ------------------------------------------------------------------------ | ----------- |
| Write base worker in Go            | Set up the container process that listens for tasks and builds the image | ❌ Not Done |
| Test Git cloning inside worker     | Clone repos using provided repository and branch and handle errors       | ❌ Not Done |
| Implement Docker image build logic | Use Go’s os/exec to run docker build using Dockerfile path and context   | ❌ Not Done |
| Push to ECR or S3                  | Push built image to AWS ECR or upload archive to S3                      | ❌ Not Done |
| Send back status via RabbitMQ      | Notify backend of build result via response message                      | ❌ Not Done |
| Trigger worker from orchestrator   | On new message, spin off build job using goroutine or container          | ❌ Not Done |
| Handle retries and failures        | Retry failed builds or log errors appropriately                          | ❌ Not Done |
| Clean up intermediate files        | Remove cloned repos and temporary files after build                      | ❌ Not Done |
| Log progress                       | Provide logs with timestamps for visibility                              | ❌ Not Done |

---

Optional (Day 2):

- Parse Docker build logs and include structured progress updates.
- Add build timeouts and memory usage guardrails.
- Parameterize all config paths and secrets.
