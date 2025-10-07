# Security Policy

**Organization**: Verscienta Health
**Effective Date**: 2025-10-05
**Last Updated**: 2025-10-05
**Version**: 1.0
**Security Officer**: [To be designated]

---

## Table of Contents

1. [Overview](#overview)
2. [Scope](#scope)
3. [Information Security Policies](#information-security-policies)
4. [Access Control](#access-control)
5. [Data Protection](#data-protection)
6. [Incident Response](#incident-response)
7. [Vulnerability Disclosure](#vulnerability-disclosure)
8. [Employee Security](#employee-security)
9. [HIPAA Compliance](#hipaa-compliance)
10. [Audit and Monitoring](#audit-and-monitoring)
11. [Policy Enforcement](#policy-enforcement)

---

## Overview

Verscienta Health is committed to protecting the confidentiality, integrity, and availability of all information assets, especially Protected Health Information (PHI). This security policy establishes the framework for safeguarding our systems, data, and users in compliance with HIPAA Security Rule requirements.

### Objectives

- Protect user data and PHI from unauthorized access
- Ensure system availability and business continuity
- Maintain HIPAA compliance for all PHI handling
- Establish clear security responsibilities and procedures
- Enable rapid detection and response to security incidents

---

## Scope

This policy applies to:

- All Verscienta Health employees, contractors, and volunteers
- All systems, applications, and infrastructure
- All data, including PHI, PII, and business data
- All third-party vendors and business associates
- All physical and virtual locations where data is accessed

---

## Information Security Policies

### 1. Information Classification

**Public Information**:

- Herb descriptions, formulas, general health information
- Practitioner public profiles
- Published articles and research
- Marketing materials

**Confidential Information**:

- User account information
- Business strategies and financial data
- Internal communications
- System configurations

**Protected Health Information (PHI)**:

- Symptom checker submissions
- Health-related user reviews (if identifiable)
- Any health data linked to identifiable individuals

**Handling Requirements**:

- **Public**: May be freely shared
- **Confidential**: Shared only on need-to-know basis
- **PHI**: Requires HIPAA compliance controls

### 2. Acceptable Use Policy

**Permitted Uses**:

- Accessing systems and data required for job duties
- Using approved software and tools
- Reporting security incidents immediately

**Prohibited Actions**:

- Accessing PHI without business justification
- Sharing credentials or session tokens
- Installing unauthorized software
- Bypassing security controls
- Exfiltrating data to personal devices
- Using systems for illegal activities

### 3. Password Policy

**Requirements**:

- Minimum 12 characters (14+ recommended)
- Mix of uppercase, lowercase, numbers, and symbols
- No reuse of previous 6 passwords
- No common words or predictable patterns
- Unique passwords for each system

**Management**:

- Use approved password manager
- Change passwords if compromised
- Never share passwords
- Enable MFA on all accounts

---

## Access Control

### 1. User Access Management

**Principle of Least Privilege**:

- Users granted minimum access needed for role
- Regular access reviews (quarterly)
- Immediate revocation upon role change or termination

**User Roles**:

- **User**: Basic access, no PHI access
- **Herbalist**: Content creation, no PHI access
- **Practitioner**: Profile management, no PHI access
- **Editor**: Content review and approval
- **Admin**: Full system access, PHI access allowed
- **Security Officer**: Audit log access, security controls

### 2. Authentication Requirements

**All Users**:

- Strong password (12+ characters)
- Account lockout after 5 failed attempts
- Session timeout (24 hours general, 15 minutes for PHI)

**Admin and PHI Access**:

- Multi-Factor Authentication (MFA) required
- Additional verification for sensitive operations
- IP-based restrictions (if applicable)

### 3. Session Management

**General Sessions**:

- Maximum lifetime: 24 hours
- Update age: 1 hour
- Secure cookies (httpOnly, secure, sameSite)

**PHI Access Sessions**:

- Idle timeout: 15 minutes
- Warning at 13 minutes
- Automatic logout on timeout
- Session invalidation on password change

---

## Data Protection

### 1. Encryption Requirements

**Data in Transit**:

- TLS 1.3 for all connections
- HTTPS enforced via HSTS headers
- No downgrade to HTTP allowed
- Certificate pinning for mobile apps

**Data at Rest**:

- Database encryption enabled (PostgreSQL)
- Column-level encryption for PHI fields
- Encrypted backups (AES-256)
- Secure key management (HSM or KMS)

### 2. Data Retention

**Operational Data**:

- User accounts: Until deleted by user + 30 days
- Content (herbs, formulas): Indefinitely
- Media uploads: Until deleted + 90 days

**Audit Logs**:

- Minimum retention: 6 years (HIPAA requirement)
- Stored in immutable, write-once format
- Regular backups to separate location

**PHI Data**:

- Symptom checker: Anonymized immediately, logs 6 years
- Health reviews: Retained per user preference
- Right to deletion: Honored within 30 days

### 3. Data Sanitization

**Before AI Processing**:

- Remove email addresses
- Remove phone numbers
- Remove street addresses
- Remove SSN and dates of birth
- Remove names (basic pattern matching)

**Before Deletion**:

- Secure wipe (multi-pass overwrite)
- Verify deletion completion
- Update audit logs

### 4. Backup and Recovery

**Backup Schedule**:

- Database: Daily full backup, hourly incremental
- File storage: Daily backup
- Configuration: Version controlled (Git)

**Backup Security**:

- Encrypted (AES-256)
- Stored off-site (separate region)
- Access restricted to admins only
- Tested monthly (restore verification)

**Recovery Time Objectives**:

- RTO (Recovery Time): 4 hours
- RPO (Recovery Point): 1 hour
- Critical systems: 2 hours RTO

---

## Incident Response

### 1. Security Incident Classification

**Low Severity**:

- Failed login attempts (under threshold)
- Minor configuration issues
- Non-critical vulnerability reports

**Medium Severity**:

- Brute force attacks
- Suspicious user activity
- Unauthorized access attempts
- Non-PHI data exposure

**High Severity**:

- Successful unauthorized access
- PHI data breach
- System compromise
- Ransomware/malware infection
- DDoS attack affecting availability

**Critical Severity**:

- Large-scale PHI breach
- Complete system compromise
- Active data exfiltration
- Ransomware with data encryption

### 2. Incident Response Procedures

**Detection**:

1. Monitor security alerts (24/7)
2. Review audit logs daily
3. User reports via security@verscienta.health
4. Automated intrusion detection

**Response**:

1. **Immediate** (within 1 hour):
   - Isolate affected systems
   - Preserve evidence
   - Notify Security Officer
   - Begin incident log

2. **Investigation** (within 4 hours):
   - Determine scope and impact
   - Identify affected data/users
   - Assess vulnerability exploited
   - Document findings

3. **Containment** (within 8 hours):
   - Stop ongoing attack
   - Patch vulnerabilities
   - Reset compromised credentials
   - Block malicious IPs

4. **Recovery** (within 24 hours):
   - Restore from clean backups
   - Verify system integrity
   - Monitor for re-infection
   - Resume normal operations

5. **Post-Incident** (within 7 days):
   - Complete incident report
   - Notify affected users (if PHI breach)
   - Report to HHS (if HIPAA breach)
   - Update security controls
   - Conduct lessons learned

### 3. Breach Notification

**HIPAA Breach Notification Timeline**:

- **Individual Notification**: Within 60 days
- **HHS Notification**: Within 60 days (if 500+ affected)
- **Media Notification**: Within 60 days (if 500+ affected)

**Breach Report Must Include**:

- Description of incident
- Types of PHI involved
- Steps individuals should take
- Investigation and mitigation actions
- Contact information for questions

**Non-PHI Breach**:

- Notify affected users promptly
- Provide remediation steps
- Offer credit monitoring if applicable

---

## Vulnerability Disclosure

### Reporting Security Vulnerabilities

We welcome responsible disclosure of security vulnerabilities.

**How to Report**:

- Email: security@verscienta.health
- PGP Key: [Public key to be published]
- Include: Description, steps to reproduce, impact assessment

**What to Expect**:

- Acknowledgment within 24 hours
- Status update within 7 days
- Resolution timeline provided
- Credit in security advisories (if desired)

**Responsible Disclosure Guidelines**:

- Do not access or modify user data
- Do not perform DoS attacks
- Do not publicly disclose before fix
- Give us reasonable time to respond (90 days)

**Bug Bounty Program**:

- Program details: [To be established]
- Eligible vulnerabilities: All OWASP Top 10
- Rewards: Based on severity (CVSS score)

**Scope**:

- In scope: verscienta.health, api.verscienta.health
- Out of scope: Third-party services, social engineering

---

## Employee Security

### 1. Workforce Security (HIPAA §164.308(a)(3))

**Hiring**:

- Background checks for PHI access
- Confidentiality agreements signed
- Security training before access granted

**Authorization**:

- Role-based access assignment
- Documented access approvals
- Quarterly access reviews

**Termination**:

- Immediate access revocation
- Return of all devices and credentials
- Exit interview and NDA reminder

### 2. Security Training Requirements

**Initial Training** (before access):

- Security policies and procedures
- HIPAA compliance basics
- Password and authentication
- Phishing and social engineering
- Incident reporting procedures

**Annual Training**:

- Policy updates and changes
- Recent security incidents
- Emerging threats and vulnerabilities
- Compliance requirements

**Role-Specific Training**:

- Developers: Secure coding, OWASP Top 10
- Admins: System hardening, log analysis
- PHI Users: HIPAA privacy and security rules

### 3. Workstation Security

**Required Controls**:

- Full disk encryption (BitLocker/FileVault)
- Automatic screen lock (5 minutes)
- Antivirus/anti-malware software
- Firewall enabled
- OS and software updates current

**Prohibited Actions**:

- Accessing PHI on public Wi-Fi
- Storing PHI on personal devices
- Using unapproved cloud storage
- Sharing workstations

---

## HIPAA Compliance

### 1. Business Associate Agreements

**Required for All Vendors Handling PHI**:

- Cloudflare (image hosting)
- Algolia (search indexing)
- xAI/Grok (symptom analysis - if not fully anonymized)
- Email provider (Resend)
- Database hosting provider
- Backup storage provider

**BAA Must Include**:

- Permitted uses of PHI
- Safeguard requirements
- Breach notification obligations
- Subcontractor requirements
- Termination provisions

### 2. Minimum Necessary Standard

**Policy**:

- Access only PHI needed for specific task
- Limit data shared to minimum required
- Role-based access controls enforce limits

**Examples**:

- Symptom checker: No user identification sent to AI
- Support: Access only specific user's data
- Analytics: Aggregated, de-identified data only

### 3. Patient Rights

**Right to Access**:

- Users can download their data (JSON export)
- Provided within 30 days of request
- No charge for electronic copies

**Right to Amendment**:

- Users can request corrections
- Reviewed within 60 days
- Approved changes made within 30 days

**Right to Deletion**:

- Users can delete accounts
- PHI removed within 30 days
- Audit logs retained (de-identified)

---

## Audit and Monitoring

### 1. Audit Logging (HIPAA §164.312(b))

**All Logs Must Include**:

- Who: User ID, email, role
- What: Action performed
- When: Timestamp
- Where: IP address, location
- Why: Context/reason (if available)
- How: Endpoint, method, status

**Events to Log**:

- All PHI access (view, create, update, delete)
- Authentication events (login, logout, failures)
- Authorization failures
- Configuration changes
- Administrative actions
- Security events (rate limits, suspicious activity)

**Log Management**:

- Write-once storage (immutable)
- Encrypted in transit and at rest
- Retained for 6+ years
- Regular reviews (weekly)
- Alerts for critical events

### 2. Security Monitoring

**Real-Time Monitoring**:

- Failed authentication attempts
- Rate limit violations
- Suspicious IP addresses
- Unauthorized access attempts
- System resource anomalies

**Automated Alerts**:

- 5+ failed logins from same IP
- PHI access outside business hours
- Multiple users from same IP
- Unusual data export volumes
- System errors or crashes

**Log Analysis**:

- Daily review of security logs
- Weekly compliance reports
- Monthly trend analysis
- Quarterly security audits

### 3. Compliance Audits

**Internal Audits**:

- Quarterly security reviews
- Annual HIPAA compliance audit
- Bi-annual penetration testing

**External Audits**:

- Annual third-party security assessment
- HIPAA compliance validation (if applicable)
- SOC 2 Type II audit (future)

---

## Policy Enforcement

### 1. Violations and Sanctions

**Minor Violations**:

- First offense: Written warning + retraining
- Second offense: Suspension of access
- Third offense: Termination

**Major Violations**:

- Immediate suspension pending investigation
- Possible termination
- Legal action if warranted

**Examples of Major Violations**:

- Unauthorized PHI access
- Sharing credentials
- Disabling security controls
- Data theft or exfiltration
- Destroying audit logs

### 2. Policy Updates

**Review Schedule**:

- Annual comprehensive review
- As-needed for regulatory changes
- After security incidents
- When systems change

**Change Process**:

1. Security Officer proposes changes
2. Legal review (if applicable)
3. Management approval
4. Employee notification and training
5. Documentation updated
6. Effective date announced

### 3. Exceptions

**Exception Process**:

- Written request with justification
- Security Officer review
- Risk assessment
- Compensating controls required
- Time-limited approval
- Documented and logged

**No Exceptions Allowed For**:

- Encryption of PHI
- Audit logging
- Access controls
- Breach notification

---

## Contact Information

**Security Officer**: [To be designated]
**Email**: security@verscienta.health
**Phone**: [To be established]
**Incident Hotline**: [24/7 emergency contact]

**Breach Reporting**:

- Internal: security@verscienta.health
- HHS (if PHI breach): https://ocrportal.hhs.gov/ocr/breach/wizard_breach.jsf

**Resources**:

- Security Training Portal: [To be established]
- Policy Documentation: `docs/SECURITY_POLICY.md`
- Security Audit Report: `docs/SECURITY_AUDIT.md`
- Incident Response Plan: [To be created]

---

## Acknowledgment

By accessing Verscienta Health systems, you acknowledge that you have read, understood, and agree to comply with this security policy. Violations may result in disciplinary action, up to and including termination and legal action.

**Policy Version**: 1.0
**Effective Date**: 2025-10-05
**Next Review**: 2026-10-05

---

_This policy is a living document and will be updated as needed to address new threats, technologies, and regulatory requirements._
