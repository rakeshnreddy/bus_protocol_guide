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
visualIds: ["topo-ahb-security-filter"]
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

The asserted state means *Non-secure*, which is why the signal is named `HNONSEC`. AHB5 only adds it when the interface declares the `Secure_Transfers` property. Integration between components that do and do not support that property must be handled explicitly; a design must not rely on an unconnected signal as a security policy.

Trace the highlighted denied path, then inspect the Secure and shared-target routes. AHB5 defines the attribute, while the SoC chooses where policy is enforced.

![AHB5 security topology showing HNONSEC routing, allowed targets, and a denied transfer returning ERROR](visual:topo-ahb-security-filter)

## Slave Enforcement

The system must enforce security policy at an appropriate point, which can be a slave, an interconnect protection controller, or another implementation-defined component. A slave might have its memory region divided into Secure and Non-Secure halves.

If a master attempts a Non-Secure write (`HNONSEC = 1`) to a Secure address region, the slave **must** reject the transfer by returning an `ERROR` response (`HRESP = 1`).

## System-Level Isolation

This hardware-level attribution lets a correctly designed system prevent software executing in a Non-secure context, or a Non-secure DMA agent, from accessing Secure-only regions. That guarantee depends on correct source attribution, routing, policy configuration, and target enforcement. Verification must therefore test both allowed and denied paths, including reset defaults and adapters between security-aware and security-unaware interfaces.
