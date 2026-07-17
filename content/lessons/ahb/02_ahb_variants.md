---
id: "02_ahb_variants"
title: "AHB Variants & Evolution"
summary: "Understand the differences between AHB2, AHB-Lite, and AHB5, and why modern systems use AHB5."
protocol: "ahb"
tier: "1"
level: "beginner"
order: 2
tags: ["ahb", "versions", "ahb5", "ahb-lite"]
relatedLessons: []
prerequisites: ["01_ahb_overview"]
visualIds: ["sig-ahb-variants"]
exerciseIds: []
glossaryTerms: ["AHB-Lite", "AHB5"]
checklistIds: []
---

## The Evolution of AHB

The AHB specification has evolved over the past two decades. As a Design Verification engineer, you must know which variant you are verifying, as the rules change significantly!

### 1. Original AHB — AMBA Specification IHI 0011A
The original AHB specification supports multiple managers directly on a shared bus. Per-manager `HBUSREQx`, `HGRANTx`, and `HLOCKx` participate in arbitration; bus-level `HMASTER` and `HMASTLOCK` identify the active owner and locked status. It also defines `RETRY` and `SPLIT` responses. These features are revision-specific verification modes, regardless of how frequently a particular product uses them.

### 2. AHB-Lite — the Single-Manager Interface Model
**[glossary:AHB-Lite]** removes original shared-bus request/grant arbitration and the legacy `SPLIT`/`RETRY` response encodings from an interface. A matrix can connect multiple such manager-side interfaces and arbitrate internally. `HMASTLOCK` remains a defined interface signal, so “Lite” does not mean that all lock signaling disappeared. The interface responses are `OKAY` and `ERROR`.

### 3. AHB5 — AMBA 5 AHB IHI 0033B.b
**[glossary:AHB5]** retains the single-manager interface model and defines optional declared interface properties, including:
- **Extended Memory Types:** `HPROT[6:4]` extends the base protection attributes when `Extended_Memory_Types` is declared.
- **Secure Transfers:** `HNONSEC` is present when the security property is declared.
- **Exclusive Accesses:** `HEXCL`, `HEXOKAY`, and the required identity context are present when `Exclusive_Transfers` is declared.
- **Single-Copy Atomicity:** Stricter rules on how data is accessed.

Open each variant below and compare the verification contract—not just the release date. In particular, notice that AHB5 adds attributes and exclusives without restoring original AHB's shared-bus arbitration model.

![Interactive comparison of original AHB, AHB-Lite, and AHB5](visual:sig-ahb-variants)

## Which one should I care about?

Verification begins by selecting the exact revision and declared properties. Do not generate `SPLIT`, `RETRY`, `HNONSEC`, extended `HPROT`, or exclusives merely because the umbrella name says AHB. Unless a lesson explicitly says “original AHB,” the transfer examples use the AHB-Lite/AHB5 single-manager interface; revision comparison lessons call out original shared-bus behavior separately.
