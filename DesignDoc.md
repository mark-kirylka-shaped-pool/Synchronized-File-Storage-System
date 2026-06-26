# Synchronized File Storage System

## Overview

This document outlines the design and architecture for a distributed file synchronization system that maintains repository consistency across multiple registered user devices. The system enables seamless file management by automatically synchronizing updates across all connected endpoints while providing robust conflict resolution mechanisms.

## Project Objectives

The primary goal is to develop a server-based system that:
- Maintains synchronized file repositories across all registered client devices
- Implements an Observer design pattern for efficient change propagation
- Supports multiple concurrent users with independent send and receive capabilities
- Triggers automatic download and update operations on client devices when changes occur
- Provides conflict resolution and handling for concurrent modifications

## Architecture

### Design Pattern

The system employs an **Observer** architectural pattern to ensure:
- Centralized management of file state on the server
- Decoupled communication between multiple users and devices

### Key Components

- **Server**: Central repository managing file versions and synchronization
- **Clients**: Registered devices that can upload, download, and update files
- **Change Management**: Mechanism for detecting, propagating, and resolving file updates

## Planned Features

- Automatic synchronization upon file upload
- Conflict detection and resolution mechanisms

## API Endpoints

### File Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/files/upload` | Upload a new file or update an existing file |
| GET | `/api/files/{fileId}/download` | Download a file from the server |
| DELETE | `/api/files/{fileId}` | Delete a file from the repository |
| GET | `/api/files` | List all files in the repository |
| GET | `/api/files/{fileId}/metadata` | Retrieve file metadata (size, modification time, version) |
| GET | `/api/files/{fileId}/versions` | Get version history for a specific file |


### Conflict Resolution

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/files/{fileId}/conflicts` | Retrieve conflict information for a file |
| POST | `/api/files/{fileId}/resolve-conflict` | Resolve a conflict by selecting a version |

### User & Device Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/devices/register` | Register a new device |
| GET | `/api/devices` | List all registered devices for a user |
| DELETE | `/api/devices/{deviceId}` | Unregister a device |