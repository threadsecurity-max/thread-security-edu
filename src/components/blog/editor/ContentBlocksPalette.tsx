'use client';

import React from 'react';
import { type Editor } from '@tiptap/react';
import {
  FileText,
  Lightbulb,
  ShieldAlert,
  Table,
  AlertTriangle,
  Code2,
  Scale,
  HelpCircle,
  Flag,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ContentBlocksPaletteProps {
  editor: Editor;
}

interface BlockTemplate {
  id: string;
  label: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  html: string;
}

const TEMPLATES: BlockTemplate[] = [
  {
    id: 'intro-thesis',
    label: 'Intro & Thesis',
    badge: 'Structure',
    icon: FileText,
    description: 'Executive hook and research thesis statement',
    html: `
<h2>1. Executive Overview & Problem Statement</h2>
<p>Modern enterprise security environments face unprecedented operational velocity. As threat actors evolve their tactics, techniques, and procedures (TTPs), security teams must transition from reactive incident remediation to continuous threat telemetry and proactive intelligence.</p>
<p>This technical guide establishes the foundational principles, detection workflows, and tooling architecture essential for robust cyber defense.</p>
`,
  },
  {
    id: 'key-takeaways',
    label: 'Key Takeaways',
    badge: 'Callout',
    icon: Lightbulb,
    description: 'Highlighted key takeaway bullets with accent card',
    html: `
<blockquote>
<p><strong>💡 Key Security Takeaways:</strong></p>
<ul>
<li>Telemetry correlation across endpoint (EDR) and network streams reduces mean-time-to-detect (MTTD).</li>
<li>Detection rules should prioritize behavioral heuristics over static signature hashes.</li>
<li>Automation playbooks (SOAR) isolate infected workloads within seconds of high-fidelity alerts.</li>
</ul>
</blockquote>
`,
  },
  {
    id: 'mitre-attack',
    label: 'MITRE ATT&CK Card',
    badge: 'Cybersecurity',
    icon: ShieldAlert,
    description: 'Structured TTP matrix with tactic and mitigation',
    html: `
<h3>MITRE ATT&CK Mapping Matrix</h3>
<table class="tiptap-table border-collapse w-full my-6 text-sm text-left border border-white/20 rounded-xl overflow-hidden shadow-xl">
  <thead>
    <tr>
      <th style="background-color: rgba(198, 255, 52, 0.15); color: #C6FF34; padding: 10px; border: 1px solid rgba(255,255,255,0.15);">ATT&CK Tactic</th>
      <th style="background-color: rgba(198, 255, 52, 0.15); color: #C6FF34; padding: 10px; border: 1px solid rgba(255,255,255,0.15);">Technique ID</th>
      <th style="background-color: rgba(198, 255, 52, 0.15); color: #C6FF34; padding: 10px; border: 1px solid rgba(255,255,255,0.15);">Detection Signal</th>
      <th style="background-color: rgba(198, 255, 52, 0.15); color: #C6FF34; padding: 10px; border: 1px solid rgba(255,255,255,0.15);">Defensive Countermeasure</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 10px; border: 1px solid rgba(255,255,255,0.1);">Initial Access</td>
      <td style="padding: 10px; border: 1px solid rgba(255,255,255,0.1);"><code>T1190</code> Exploit Public Facing App</td>
      <td style="padding: 10px; border: 1px solid rgba(255,255,255,0.1);">WAF anomaly alerts & outbound reverse shells</td>
      <td style="padding: 10px; border: 1px solid rgba(255,255,255,0.1);">Virtual patching & egress filtering</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid rgba(255,255,255,0.1);">Execution</td>
      <td style="padding: 10px; border: 1px solid rgba(255,255,255,0.1);"><code>T1059</code> Command & Scripting</td>
      <td style="padding: 10px; border: 1px solid rgba(255,255,255,0.1);">Unusual PowerShell execution flags (-Enc, -W Hidden)</td>
      <td style="padding: 10px; border: 1px solid rgba(255,255,255,0.1);">Constrained Language Mode (CLM) & Script Block Logging</td>
    </tr>
  </tbody>
</table>
`,
  },
  {
    id: 'comparison-matrix',
    label: 'Comparison Table',
    badge: 'Matrix',
    icon: Table,
    description: '3-column benchmark and feature comparison',
    html: `
<h3>Technology Comparison & Architectural Evaluation</h3>
<table class="tiptap-table border-collapse w-full my-6 text-sm text-left border border-white/20 rounded-xl overflow-hidden shadow-xl">
  <thead>
    <tr>
      <th style="background-color: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 10px; border: 1px solid rgba(255,255,255,0.15);">Feature / Metric</th>
      <th style="background-color: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 10px; border: 1px solid rgba(255,255,255,0.15);">Architecture Option A</th>
      <th style="background-color: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 10px; border: 1px solid rgba(255,255,255,0.15);">Architecture Option B</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 10px; border: 1px solid rgba(255,255,255,0.1); font-weight: bold;">Telemetry Ingestion</td>
      <td style="padding: 10px; border: 1px solid rgba(255,255,255,0.1);">Real-time stream streaming</td>
      <td style="padding: 10px; border: 1px solid rgba(255,255,255,0.1);">Batch micro-polling (5 min interval)</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid rgba(255,255,255,0.1); font-weight: bold;">Query Latency</td>
      <td style="padding: 10px; border: 1px solid rgba(255,255,255,0.1);">Sub-second indexed lookups</td>
      <td style="padding: 10px; border: 1px solid rgba(255,255,255,0.1);">Variable (depends on cluster load)</td>
    </tr>
  </tbody>
</table>
`,
  },
  {
    id: 'security-advisory',
    label: 'Security Advisory',
    badge: 'Warning',
    icon: AlertTriangle,
    description: 'Critical CVE warning or operational risk alert',
    html: `
<blockquote style="border-left-color: #ef4444; background-color: rgba(239, 68, 68, 0.08);">
<p><strong style="color: #ef4444;">⚠️ Critical Security Advisory & Caveat:</strong></p>
<p>Always execute forensic memory dumps prior to initiating network isolation commands on infected virtual machines. Premature host termination purges volatility buffers and volatile ephemeral malware artifacts.</p>
</blockquote>
`,
  },
  {
    id: 'code-snippet',
    label: 'Query Snippet',
    badge: 'Terminal',
    icon: Code2,
    description: 'Pre-formatted terminal block for SPL, KQL, or Python',
    html: `
<h3>SIEM Telemetry Query (Splunk / KQL Syntax)</h3>
<pre><code class="language-bash"># Search for suspicious process tree parent-child lineage
index=security_logs sourcetype="WinEventLog:Security" EventCode=4688
| where parent_process="winword.exe" AND process="powershell.exe"
| stats count by host, user, command_line
| sort - count</code></pre>
`,
  },
  {
    id: 'pros-cons',
    label: 'Pros & Cons',
    badge: 'Analysis',
    icon: Scale,
    description: 'Side-by-side strengths and operational trade-offs',
    html: `
<h3>Engineering Trade-offs & Analysis</h3>
<ul>
<li><strong>✅ Strategic Advantage:</strong> Drastically decreases analyst fatigue by automating repetitive alert triage.</li>
<li><strong>✅ Observability:</strong> Provides end-to-end audit trails for compliance frameworks (SOC2, ISO 27001).</li>
<li><strong>❌ Operational Limitation:</strong> Requires high-fidelity baseline data to prevent initial false-positive cascades.</li>
</ul>
`,
  },
  {
    id: 'faq-section',
    label: 'FAQ Block',
    badge: 'Q&A',
    icon: HelpCircle,
    description: 'Frequently asked questions for student clarity',
    html: `
<h3>Frequently Asked Questions</h3>
<p><strong>Q: What is the primary difference between SIEM and SOAR?</strong><br>
A: SIEM focuses on log aggregation, correlation, and detection, whereas SOAR automates orchestrations and playbook actions across connected tools.</p>
<p><strong>Q: How can entry-level analysts build detection engineering experience?</strong><br>
A: Practice translating real-world threat reports into Sigma rules and test them against adversary simulation labs like Atomic Red Team.</p>
`,
  },
  {
    id: 'conclusion-next',
    label: 'Conclusion & Steps',
    badge: 'Closing',
    icon: Flag,
    description: 'Summary conclusion and recommended next actions',
    html: `
<h2>Conclusion & Next Steps</h2>
<p>Mastering modern security operations requires balancing deep telemetry inspection with disciplined, repeatable triage workflows. By establishing clear tier responsibilities and mapping detections against frameworks like MITRE ATT&CK, organizations can systematically shrink an adversary's operational dwell time.</p>
<p><strong>Recommended Action Items:</strong></p>
<ol>
<li>Review existing SIEM detection rules against the latest ATT&CK matrix updates.</li>
<li>Implement automated host quarantine playbooks for critical severity alerts.</li>
<li>Schedule monthly purple-team emulation exercises to validate detection integrity.</li>
</ol>
`,
  },
];

export function ContentBlocksPalette({ editor }: ContentBlocksPaletteProps) {
  const insertTemplate = (template: BlockTemplate) => {
    editor.chain().focus().insertContent(template.html).run();
  };

  return (
    <div className="bg-[#121216] border border-white/10 rounded-xl p-2.5 space-y-2">
      <div className="flex items-center justify-between text-xs px-1">
        <div className="flex items-center gap-1.5 font-mono font-bold text-slate-200">
          <Sparkles className="w-3.5 h-3.5 text-[#C6FF34]" />
          <span>Click-to-Type Structure Tools</span>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          Click any block to insert at cursor and start typing
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5">
        {TEMPLATES.map((tpl) => {
          const Icon = tpl.icon;
          return (
            <button
              key={tpl.id}
              type="button"
              onClick={() => insertTemplate(tpl)}
              className="p-2 rounded-lg bg-black/40 hover:bg-white/10 border border-white/10 hover:border-[#C6FF34]/40 text-left transition-all group flex flex-col justify-between"
              title={tpl.description}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <div className="p-1 rounded-md bg-white/5 text-[#C6FF34] group-hover:scale-110 transition-transform">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-white/5 text-slate-400 group-hover:text-white">
                  {tpl.badge}
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200 group-hover:text-[#C6FF34] truncate">
                  {tpl.label}
                </p>
                <p className="text-[10px] text-slate-400 line-clamp-1 leading-tight">
                  {tpl.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
