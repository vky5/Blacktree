# Blacktree

**Blacktree** is a distributed build and deployment orchestrator designed to streamline Docker image creation, deployment, and execution across multiple workers with robust concurrency and failure handling. Built with **Go**, **FastAPI**, **RabbitMQ**, and **Docker**, Blacktree enables developers to deploy code efficiently while maintaining full observability and control.

---

## Table of Contents

1. [Motivation]()
2. [Architecture](#)
3. [Core Components](#core-components)
4. [Features](#features)
5. [Getting Started](#getting-started)
6. [Usage](#usage)
7. [Contributing](#contributing)
8. [License](#license)

---

## Motivation

Managing builds and deployments in a microservices environment can be tedious and error-prone. Blacktree automates this process by orchestrating worker nodes that handle building Docker images, running containers, and reporting their status back to the orchestrator. It’s designed to be **resilient, observable, and easy to integrate** into any development workflow.

---

## Architecture

Blacktree follows a **central orchestrator + distributed worker model**:

* **Orchestrator**:
  Handles job scheduling, worker registration, health checks, and deployment monitoring.
* **Workers**:
  Execute build jobs, push images to ECR or any registry, and report status back to the orchestrator.
* **Message Queue**:
  RabbitMQ is used to send real-time updates between orchestrator and workers.
* **Docker Integration**:
  Each worker builds Docker images in isolation and runs containers dynamically.
* **Logging & Observability**:
  Every event—from worker registration to build failure—is logged and can be monitored live.

---

## Core Components

| Component        | Responsibility                                                   |
| ---------------- | ---------------------------------------------------------------- |
| **Orchestrator** | Job scheduling, worker health checks, logging                    |
| **Worker**       | Build Docker images, run containers, send status                 |
| **RabbitMQ**         | Event-based communication between orchestrator & workers         |
| **Docker**       | Image building and container orchestration                       |
| **NestJS**  | Exposes endpoints for job submission, status checks, and metrics |

---

## Features

* **Dynamic worker scaling**
* **Concurrent builds with safe cancellation**
* **Automatic retry and error handling**
* **Push-to-ECR integration**
* **Context-aware job cancellation**
* **Real-time logging of builds and deployments**

---

## Getting Started

**Prerequisites:**

* Go >= 1.21
* Docker >= 24
* RabbitMQ
* NodeJS

**Steps:**

1. Clone the repository:

   ```bash
   git clone https://github.com/<username>/blacktree.git
   cd blacktree
   ```

2. Create the docker images

   ```bash
   make docker-build-orchestrator
   make docker-build-worker
   ```

3. Run the RabbitMQ, Worker & Orchestrator

   ```bash
   make Run-Compose
   ```

---



## Contributing

Blacktree is open for contributions! You can:

* Add new worker integrations
* Improve orchestrator scheduling algorithms
* Enhance logging and observability
* Submit PRs and open issues


