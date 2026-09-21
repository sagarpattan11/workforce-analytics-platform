# Real-Time Event Flow (Socket.IO)

## 1. Overview
WFA uses **Socket.IO** to push live operational updates to connected enterprise dashboards without client polling.

## 2. Room & Channel Architecture

```text
               Client Connections
                        │
         ┌──────────────┴──────────────┐
         ▼                             ▼
   /notifications                 /workforce
   (Private User Room)            (Organization/Dept Room)
   - Leave approval alerts        - Headcount counter updates
   - Shift change notices         - Real-time check-in counts
   - System broadcast messages    - Live attrition alerts
```

## 3. Event Namespaces & Catalog

| Event Name | Direction | Payload | Description |
|---|---|---|---|
| `workforce:headcount_updated` | Server $\rightarrow$ Client | `{ total: number, active: number }` | Real-time employee status count changes |
| `attendance:checkin` | Server $\rightarrow$ Client | `{ employeeId: string, timestamp: string }` | Live attendance logging |
| `notification:new` | Server $\rightarrow$ Client | `{ id: string, title: string, message: string, severity: string }` | Direct push notification to authenticated user |
| `roster:shift_swapped` | Server $\rightarrow$ Client | `{ shiftId: string, oldAssignee: string, newAssignee: string }` | Shift swap broadcast |

## 4. Connection Lifecycle & Security
1. **Authentication**: Handshake request validates the HTTP-only session cookie.
2. **Room Assignment**: Clients join rooms based on their verified `userId`, `role`, and `departmentId`.
3. **Disconnection**: Automatic cleanup of socket listeners and room memberships.
