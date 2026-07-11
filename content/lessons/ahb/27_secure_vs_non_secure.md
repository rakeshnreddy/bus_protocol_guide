---
id: "27_secure_vs_non_secure"
title: "Secure vs Non-Secure (AHB5)"
summary: "Understanding the HNONSEC signal and TrustZone integration."
protocol: "ahb"
tier: "1"
level: "advanced"
order: 27
tags: ["ahb", "advanced", "security", "ahb5", "trustzone"]
relatedLessons: []
prerequisites: ["15_address_data_phase"]
visualIds: []
exerciseIds: []
glossaryTerms: []
checklistIds: []
---

As embedded systems became more complex and connected to the internet, security became a primary concern. ARM introduced TrustZone technology to hardware-isolate secure code (like cryptography keys or mobile payment logic) from non-secure code (like a standard OS or user applications).

AHB5 brings this concept to the bus level via the **`HNONSEC`** signal.

## The HNONSEC Signal

`HNONSEC` is driven by the master during the Address Phase, parallel to `HADDR`.
- `HNONSEC = 0`: Secure Transfer
- `HNONSEC = 1`: Non-Secure Transfer

Note that the signal is *active low* for security. If the signal is accidentally disconnected or left floating high by an older master, it defaults to Non-Secure, preventing accidental secure access.

## Slave Enforcement

Slaves are responsible for enforcing security policies. A slave might have its memory region divided into Secure and Non-Secure halves.

If a master attempts a Non-Secure write (`HNONSEC = 1`) to a Secure address region, the slave **must** reject the transfer by returning an `ERROR` response (`HRESP = 1`).

## System-Level Isolation

This hardware-level flagging means that even if a malicious user completely compromises the Non-Secure OS and gains control of the CPU or a DMA engine, any transaction they generate will permanently have `HNONSEC = 1` attached to it. The hardware slaves will categorically reject any attempt to read or write the Secure memory regions, keeping the secure data safe regardless of software vulnerabilities.
