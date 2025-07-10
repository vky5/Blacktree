# 🧠 Build Orchestrator - Blacktree

The **Build Orchestrator** is the central controller for Blacktree's build pipeline.  
It listens to build jobs from a queue (RabbitMQ), validates them, and dynamically schedules short-lived **build workers** (on ECS Fargate or EC2) to process those jobs.

---

## 🚀 Features

| Task                        | Description                                                             |
| --------------------------- | ----------------------------------------------------------------------- |
| ✅ Job Listener             | Subscribes to `execute.queue` (RabbitMQ) for incoming build/deploy jobs |
| 📦 Worker Dispatcher        | Launches ECS Fargate containers (build-workers) for each job            |
| 🧾 Job Validation           | Ensures job payload is valid, complete, and secure                      |
| 📤 Build Result Publisher   | Publishes status updates to `status.queue` or Redis pubsub              |
| 🔁 Retry on Failure         | Requeues failed jobs (configurable max attempts and delay)              |
| ⏰ Timeout Detection        | Marks stale jobs as failed if they run too long                         |
| 🔒 Rate Limiting            | Optional logic to control max concurrent builds                         |
| 📊 Metrics & Healthcheck    | Exposes `/health` and optionally `/metrics` endpoints                   |
| 🌱 Extensible Message Types | Supports different task types: build, deploy, stop, test, etc.          |

---

## 🧱 Architecture

            +------------------+
            |    Backend API   |
            +--------+---------+
                     |
                     v
            +------------------+
            |   RabbitMQ Queue |
            |   (execute.queue)|
            +--------+---------+
                     |
                     v
      +--------------+--------------+
      |   Build Orchestrator        |
      |-----------------------------|
      |  - Listens for build jobs   |
      |  - Validates input          |
      |  - Launches ECS task        |
      |  - Publishes build logs     |
      +--------------+--------------+
                     |
            +--------v--------+
            |   ECS Fargate   |
            |  build-worker   |
            +----------------+
                     |
                     v
         +------------------------+
         | ECR / Status Logs      |
         +------------------------+

---

## 📦 Message Format (DeploymentMessage)

```json
{
  "type": "build",
  "deploymentId": "abc123",
  "repository": "https://github.com/user/repo",
  "branch": "main",
  "dockerFilePath": "./Dockerfile",
  "composeFilePath": "",
  "contextDir": ".",
  "createdAt": "2025-07-09T12:00:00Z",
  "portNumber": "3000",
  "autoDeploy": true
}
```


## Emojis in logs meaning 
#### And YES I choose to use these emojis
- ✅ Success

- ⚠️ Warning

- ❌ Failure

- 🔄 In progress
