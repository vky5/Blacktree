---
title: Overview
sidebar_position: 1
---


# Orchestrator Overview

The **Blacktree Orchestrator** manages job distribution across multiple Docker build workers, ensuring parallel execution, reliable communication, and continuous health tracking.

---

## **Key Features**
- **RabbitMQ-powered Job Queue:** Ensures reliable delivery of deployment/build jobs.
- **Dynamic Worker Assignment:** Tracks worker availability and assigns jobs to free workers automatically.
- **Job Response Flow:** Collects results and marks workers free for the next job.
- **Periodic Health Checks:** Detects and removes unresponsive workers from the free pool.
- **Context-aware Cancellation:** Allows jobs to be stopped mid-execution without breaking the pipeline.

---

## **Architecture Flow**

```mermaid
flowchart TD
    subgraph API
        A[Client / Deployment Request]
    end

    subgraph MQ[RabbitMQ]
        B[Job Queue]
    end

    subgraph Orchestrator
        C[Dispatcher]
        D[Worker Manager]
        E[Health Checker]
    end

    subgraph Workers
        F1[Worker 1]
        F2[Worker 2]
        F3[Worker N]
    end

    A -->|Submit Job| B
    B -->|Fetch Job| C
    C -->|Assign Job| D
    D -->|Send Job via gRPC| F1
    F1 -->|Send Result| D
    D -->|Mark Worker Free| C

    E -->|Ping Workers| F1
    E -->|Ping Workers| F2
    E -->|Ping Workers| F3
    F1 -->|Health Response| E
    F2 -->|Health Response| E
    F3 -->|Health Response| E
````

---

## **Step-by-Step Flow**

1. **Job Submission** – API pushes deployment job to RabbitMQ queue.
2. **Job Retrieval** – Dispatcher continuously polls RabbitMQ for pending jobs.
3. **Worker Assignment** – Worker Manager picks a free worker and sends job via gRPC.
4. **Job Execution** – Worker builds the Docker image, runs tests, etc.
5. **Result Handling** – Worker sends result back to orchestrator; orchestrator marks worker free.
6. **Health Checks** – Health Checker periodically pings all workers; unhealthy ones are removed from free pool until they recover.

---

## **Core Components**

| Component          | Responsibility                                                  |
| ------------------ | --------------------------------------------------------------- |
| **Dispatcher**     | Reads jobs from RabbitMQ and assigns them to workers.           |
| **Worker Manager** | Tracks which workers are free/busy and manages job dispatching. |
| **Health Checker** | Periodically checks if workers are alive and responsive.        |
| **Workers**        | Receive jobs, perform builds, and return results.               |

---

