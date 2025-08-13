---
title: Overview
sidebar_position: 1
---


# Blacktree Orchestrator

The **Blacktree Orchestrator** is a distributed build system designed to efficiently manage Docker image builds across multiple worker nodes. It provides a reliable, scalable, and concurrent environment for building, monitoring, and managing jobs from source code repositories like GitHub.

---

## **Key Features**

* **Concurrent Builds:** Multiple jobs can run in parallel without interfering with each other.
* **Worker Health Management:** Periodic health checks ensure only healthy workers receive tasks.
* **Reliable Job Delivery:** Uses RabbitMQ to queue jobs, guaranteeing no job is lost even if workers fail.
* **Context-Aware Cancellation:** Supports safe termination or retry of in-progress jobs.
* **gRPC Coordination:** Persistent connections between orchestrator and workers improve efficiency and reduce overhead.
* **Extensible Design:** Easily extendable for custom build steps, different container runtimes, or distributed deployments.

---

## **High-Level Architecture**

```
[Job Submission API] --> \[RabbitMQ Job Queue] --> \[Dispatcher] --> \[WorkerManager] --> \[Worker Nodes]
│                                                          ▲
└-------------------\[Job Status / Response Queue] <--------┘
```

**Flow Summary:**

1. A client submits a job via the API.
2. The job is queued in RabbitMQ.
3. Dispatcher picks the job and queries WorkerManager for a free worker.
4. Job is assigned to a worker via gRPC.
5. Worker executes the build and returns results.
6. Worker state is updated and free workers are made available for new tasks.

---

## **Component Overview**

| Component         | Responsibility |
|------------------|----------------|
| Dispatcher        | Assigns jobs from RabbitMQ to free workers. |
| WorkerManager     | Tracks worker states (free, busy, dead) and handles registration/deregistration. |
| Worker Nodes      | Execute builds, return logs and image URLs, respond to health checks. |
| RabbitMQ          | Reliable message queue for job submission and status updates. |
| gRPC Server       | Enables orchestrator-worker communication for job execution and health checks. |

---

This overview provides a **bird’s-eye view** of Blacktree’s orchestrator and how it manages jobs and workers efficiently.
