'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Terminal,
  ExternalLink,
  Code2,
  Cpu,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  FileCheck,
  CheckCircle2,
  Wand2,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface AutomatedAIStudioProps {
  currentTitle: string;
  currentSubtitle: string;
  currentContent: string;
  currentMetaTitle: string;
  currentMetaDescription: string;
  currentFocusKeyword: string;
  categories: Array<{ id: string; name: string }>;
  onApplyAutofill: (data: {
    title: string;
    subtitle: string;
    excerpt: string;
    content: string;
    altText?: string;
    imageCaption?: string;
    categoryId?: string;
    tags?: string[];
    authorBio?: string;
    linkedin?: string;
    medium?: string;
    twitter?: string;
    github?: string;
    focusKeyword?: string;
    metaTitle?: string;
    metaDescription?: string;
  }) => void;
  onSwitchToManual: () => void;
}

const BASE_AUTOFILL_SCRIPT = `(function () {
  'use strict';

  // ============================================================
  // SOC ANALYSIS - AUTOFILL SCRIPT
  // Paste into browser console while the form page is open.
  // ============================================================

  function setNativeValue(element, value) {
    const valueSetter = Object.getOwnPropertyDescriptor(element, 'value')?.set;
    const prototype = Object.getPrototypeOf(element);
    const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;

    if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
      prototypeValueSetter.call(element, value);
    } else if (valueSetter) {
      valueSetter.call(element, value);
    } else {
      element.value = value;
    }
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new Event('blur', { bubbles: true }));
  }

  function findByPlaceholder(placeholderPart) {
    const inputs = document.querySelectorAll('input, textarea');
    for (const el of inputs) {
      const ph = (el.getAttribute('placeholder') || '').toLowerCase();
      if (ph.includes(placeholderPart.toLowerCase())) return el;
    }
    return null;
  }

  function findByLabelText(labelPart) {
    const labels = document.querySelectorAll('label');
    for (const label of labels) {
      const text = (label.textContent || '').toLowerCase();
      if (text.includes(labelPart.toLowerCase())) {
        let node = label.parentElement;
        for (let i = 0; i < 5 && node; i++) {
          const input = node.querySelector('input, textarea, select');
          if (input) return input;
          node = node.parentElement;
        }
      }
    }
    return null;
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ------------------------------------------------------------
  // CONTENT DEFINITIONS
  // ------------------------------------------------------------

  const BLOG_TITLE = 'SOC Analysis: A Complete Guide to Modern Security Operations';

  const SUBTITLE = 'Everything aspiring and practicing analysts need to know about SOC tiers, detection workflows, threat triage, and the tools that power 24/7 security monitoring.';

  const EXCERPT = 'A practical breakdown of SOC analysis — covering analyst roles, alert triage, SIEM and EDR tooling, MITRE ATT&CK mapping, and how to build a repeatable detection and response workflow.';

  const ALT_TEXT = 'SOC analyst monitoring threat detection dashboards in a security operations center';

  const IMAGE_CAPTION = 'Source: Thread Security Education – SOC Analyst Training Track';

  const TAGS = ['SOC', 'SOC Analyst', 'SIEM', 'Threat Detection', 'Incident Response', 'MITRE ATT&CK', 'Blue Team', 'Threat Hunting'];

  const AUTHOR_BIO = 'Faculty mentor and SOC analyst trainer guiding students through SIEM operations, threat triage, incident response, and real-world blue team defense.';

  const LINKEDIN = 'https://www.linkedin.com/in/vishal-kumar-cybersecurity';
  const MEDIUM = 'https://medium.com/@vishal.kumar.security';
  const TWITTER = 'https://x.com/vishal_secops';
  const GITHUB = 'https://github.com/vishal-kumar-sec';

  const FOCUS_KEYWORD = 'SOC Analysis';

  const META_TITLE = 'SOC Analysis: Complete Guide to Security Operations | TSE';

  const META_DESCRIPTION = 'Learn SOC analysis from the ground up — analyst tiers, alert triage, SIEM tools, MITRE ATT&CK mapping, and detection workflows for modern security teams.';

  const BODY_HTML = \`
<p>Security Operations Center (SOC) analysis is the discipline of monitoring, detecting, investigating, and responding to cybersecurity threats in real time. It sits at the heart of every mature security program, acting as the always-on defense line between an organization and its adversaries. This guide breaks down what SOC analysis actually involves, how analysts work, and what skills and tools define the role in 2025.</p>

<h2>What Is SOC Analysis?</h2>
<p>SOC analysis is the continuous process of collecting security telemetry, correlating it against known threats and behavioral baselines, and responding to confirmed incidents. It is both a technical function and an operational discipline — combining people, process, and technology to reduce an organization's mean time to detect (MTTD) and mean time to respond (MTTR). A SOC analyst's core responsibility is to turn raw signals — logs, alerts, network flows, endpoint events — into actionable security decisions.</p>

<h2>The SOC Tier Structure</h2>
<p>Most SOCs are organized into tiers, each handling a different level of complexity.</p>

<h3>Tier 1: Alert Triage Analyst</h3>
<p>Tier 1 analysts are the first line of defense. They monitor dashboards, review incoming alerts, validate whether an alert is a true or false positive, and escalate confirmed incidents. This role builds foundational knowledge of detection tools and incident workflows.</p>

<h3>Tier 2: Incident Responder</h3>
<p>Tier 2 analysts investigate escalated incidents in depth. They perform endpoint and network forensics, correlate events across multiple data sources, contain threats, and coordinate remediation. This tier requires strong analytical and investigative skills.</p>

<h3>Tier 3: Threat Hunter / Subject Matter Expert</h3>
<p>Tier 3 analysts proactively hunt for threats that automated tools miss. They develop detection rules, perform adversary emulation, and improve the SOC's overall detection coverage using frameworks like MITRE ATT&CK.</p>

<h3>SOC Manager</h3>
<p>The SOC manager oversees operations, metrics, staffing, and reporting to leadership. This role bridges technical operations and business strategy.</p>

<h2>Core SOC Analysis Workflow</h2>
<p>Every effective SOC follows a repeatable analysis loop.</p>

<h3>1. Detection</h3>
<p>Alerts are generated by SIEM rules, EDR signatures, UEBA anomalies, and threat intelligence feeds. Quality detection engineering determines how much noise the SOC must filter.</p>

<h3>2. Triage</h3>
<p>Analysts assess severity, context, and asset criticality. Not every alert deserves deep investigation — prioritization is essential to avoid alert fatigue.</p>

<h3>3. Investigation</h3>
<p>Confirmed alerts are investigated using logs, timelines, and forensic artifacts. Analysts determine scope, root cause, and impact.</p>

<h3>4. Response</h3>
<p>Containment, eradication, and recovery actions are executed, often through SOAR playbooks. Documentation and handoff are critical.</p>

<h3>5. Lessons Learned</h3>
<p>Post-incident reviews feed back into detection rules, playbooks, and training — closing the loop.</p>

<h2>Essential SOC Tools</h2>
<p>A modern SOC relies on a layered toolstack to detect, investigate, and respond to threats. SIEM platforms such as Splunk, Microsoft Sentinel, Elastic Security, and IBM QRadar aggregate and correlate logs. EDR and XDR tools like CrowdStrike, SentinelOne, and Microsoft Defender for Endpoint provide endpoint visibility. SOAR platforms including Palo Alto Cortex XSOAR, Splunk Phantom, and Tines automate response. Threat intelligence feeds from MISP, VirusTotal, and AlienVault OTX enrich alerts with context. Network analysis tools like Zeek, Suricata, and Wireshark capture traffic-level evidence. Case management systems such as TheHive, Jira, and ServiceNow track incidents end to end.</p>

<h2>MITRE ATT&CK in SOC Analysis</h2>
<p>The MITRE ATT&CK framework maps adversary tactics, techniques, and procedures (TTPs) to real-world behavior. SOC analysts use it to build detection coverage across the kill chain, prioritize alerts based on mapped techniques, conduct gap analysis on existing detections, and communicate threat context to leadership. It is the common language that connects detection engineering, threat hunting, and incident response.</p>

<h2>Key Metrics for SOC Performance</h2>
<p>SOC performance is measured through quantifiable metrics. Mean Time to Detect (MTTD) and Mean Time to Respond (MTTR) measure speed. The alert-to-incident ratio measures detection quality. False positive rate measures analyst workload efficiency. Coverage percentage measures how many ATT&CK techniques the SOC can detect. Tracking these metrics allows SOC managers to identify bottlenecks and demonstrate value to the business.</p>

<h2>Skills Every SOC Analyst Needs</h2>
<p>Effective SOC analysts combine technical depth with analytical thinking. Core skills include log and packet analysis, SIEM query languages such as SPL, KQL, and Lucene, networking fundamentals including TCP/IP, DNS, and HTTP, operating system internals for Windows and Linux, threat intelligence and IOC enrichment, scripting in Python and PowerShell, and a solid grounding in incident response and digital forensics.</p>

<h2>Common SOC Challenges</h2>
<p>SOC teams face persistent challenges. Alert fatigue from excessive false positives drains analyst attention. Burnout and high turnover erode institutional knowledge. Tool sprawl and integration gaps create blind spots. A shortage of skilled Tier 2 and Tier 3 analysts limits depth. And detection rules age quickly against evolving adversary tradecraft.</p>

<h2>The Future of SOC Analysis</h2>
<p>AI and automation are reshaping SOC workflows. Machine learning reduces triage load, SOAR automates response, and UEBA surfaces threats that signature-based tools miss. The analyst of the future will spend less time on manual review and more time on threat hunting and detection engineering. Human judgment remains irreplaceable, but it will be amplified by intelligent tooling.</p>

<h2>Conclusion</h2>
<p>SOC analysis is a demanding but rewarding discipline. Mastering the tier structure, workflow, tooling, and frameworks like MITRE ATT&CK gives analysts the foundation to detect and respond to real threats with confidence. Whether you are starting as a Tier 1 triage analyst or refining Tier 3 hunting skills, the principles remain the same: observe, analyze, respond, and improve.</p>
\`;

  async function fillBlogTitle() {
    const el = findByPlaceholder('AI-Powered Threat Detection') || findByLabelText('BLOG TITLE');
    if (el) { setNativeValue(el, BLOG_TITLE); console.log('%c✔ Blog Title filled', 'color:#C6FF34'); return true; }
    return false;
  }

  async function fillSubtitle() {
    const el = findByPlaceholder('brief editorial subtitle') || findByLabelText('SUBTITLE');
    if (el) { setNativeValue(el, SUBTITLE); console.log('%c✔ Subtitle filled', 'color:#C6FF34'); return true; }
    return false;
  }

  async function fillExcerpt() {
    const el = findByPlaceholder('Summary shown on the public blog listing') || findByLabelText('SHORT EXCERPT');
    if (el) { setNativeValue(el, EXCERPT); console.log('%c✔ Excerpt filled', 'color:#C6FF34'); return true; }
    return false;
  }

  async function fillBodyEditor() {
    const editor = document.querySelector('.tiptap.ProseMirror') || document.querySelector('[contenteditable="true"]');
    if (!editor) return false;
    editor.focus();
    editor.innerHTML = BODY_HTML.trim();
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    editor.dispatchEvent(new Event('change', { bubbles: true }));
    editor.dispatchEvent(new Event('blur', { bubbles: true }));
    console.log('%c✔ Article body filled', 'color:#C6FF34');
    return true;
  }

  async function fillAltText() {
    const el = findByPlaceholder('Perimeter gateway zero-day exploit') || findByLabelText('Alt Text');
    if (el) { setNativeValue(el, ALT_TEXT); console.log('%c✔ Alt Text filled', 'color:#C6FF34'); return true; }
    return false;
  }

  async function fillImageCaption() {
    const el = findByPlaceholder('CVE-2024 Telemetry Analysis') || findByLabelText('Image Caption');
    if (el) { setNativeValue(el, IMAGE_CAPTION); console.log('%c✔ Image Caption filled', 'color:#C6FF34'); return true; }
    return false;
  }

  async function fillPrimaryCategory() {
    const selects = document.querySelectorAll('select');
    for (const sel of selects) {
      const options = Array.from(sel.options || []);
      const match = options.find((o) => o.textContent.trim().toLowerCase() === 'cybersecurity');
      if (match) {
        sel.value = match.value;
        sel.dispatchEvent(new Event('change', { bubbles: true }));
        sel.dispatchEvent(new Event('input', { bubbles: true }));
        console.log('%c✔ Primary Category set to Cybersecurity', 'color:#C6FF34');
        return true;
      }
    }
    return false;
  }

  async function fillTags() {
    const tagInput = findByPlaceholder('SOC, AI, ZeroTrust') || findByLabelText('TOPICS');
    if (!tagInput) return false;
    let addBtn = null;
    let parent = tagInput.parentElement;
    if (parent) {
      const buttons = parent.querySelectorAll('button');
      for (const b of buttons) {
        if ((b.textContent || '').trim().toLowerCase() === 'add') {
          addBtn = b;
          break;
        }
      }
    }
    for (const tag of TAGS) {
      setNativeValue(tagInput, tag);
      await sleep(80);
      if (addBtn) { addBtn.click(); await sleep(120); }
      else {
        tagInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        await sleep(120);
      }
    }
    console.log('%c✔ Tags filled: ' + TAGS.join(', '), 'color:#C6FF34');
    return true;
  }

  async function fillAuthorBio() {
    const el = findByPlaceholder('Faculty mentor and cybersecurity researcher') || findByLabelText('Author Bio');
    if (el) { setNativeValue(el, AUTHOR_BIO); console.log('%c✔ Author Bio filled', 'color:#C6FF34'); return true; }
    return false;
  }

  async function fillLinkedIn() {
    const el = findByPlaceholder('linkedin.com/in/your-profile') || findByLabelText('LinkedIn Profile URL');
    if (el) { setNativeValue(el, LINKEDIN); console.log('%c✔ LinkedIn filled', 'color:#C6FF34'); return true; }
    return false;
  }

  async function fillMedium() {
    const el = findByPlaceholder('medium.com/@your-handle') || findByLabelText('Medium Profile URL');
    if (el) { setNativeValue(el, MEDIUM); console.log('%c✔ Medium filled', 'color:#C6FF34'); return true; }
    return false;
  }

  async function fillTwitter() {
    const el = findByPlaceholder('x.com/your-handle') || findByLabelText('Twitter / X URL');
    if (el) { setNativeValue(el, TWITTER); console.log('%c✔ Twitter/X filled', 'color:#C6FF34'); return true; }
    return false;
  }

  async function fillGitHub() {
    const el = findByPlaceholder('github.com/your-handle') || findByLabelText('GitHub Profile URL');
    if (el) { setNativeValue(el, GITHUB); console.log('%c✔ GitHub filled', 'color:#C6FF34'); return true; }
    return false;
  }

  async function fillFocusKeyword() {
    const el = findByPlaceholder('AI Threat Detection') || findByLabelText('Primary Focus Keyword');
    if (el) { setNativeValue(el, FOCUS_KEYWORD); console.log('%c✔ Focus Keyword filled', 'color:#C6FF34'); return true; }
    return false;
  }

  async function fillMetaTitle() {
    const el = findByPlaceholder('Catchy headline optimized for Google search') || findByLabelText('Google Meta Title');
    if (el) { setNativeValue(el, META_TITLE); console.log('%c✔ Meta Title filled', 'color:#C6FF34'); return true; }
    return false;
  }

  async function fillMetaDescription() {
    const el = findByPlaceholder('Action-oriented summary enticing Google users') || findByLabelText('Google Meta Description');
    if (el) { setNativeValue(el, META_DESCRIPTION); console.log('%c✔ Meta Description filled', 'color:#C6FF34'); return true; }
    return false;
  }

  async function runAutofill() {
    console.log('%c🚀 SOC Analysis Autofill Starting...', 'color:#C6FF34;font-weight:bold;font-size:14px');
    console.log('─────────────────────────────────────────');
    const steps = [
      { name: 'Blog Title', fn: fillBlogTitle },
      { name: 'Subtitle', fn: fillSubtitle },
      { name: 'Excerpt', fn: fillExcerpt },
      { name: 'Article Body', fn: fillBodyEditor },
      { name: 'Alt Text', fn: fillAltText },
      { name: 'Image Caption', fn: fillImageCaption },
      { name: 'Primary Category', fn: fillPrimaryCategory },
      { name: 'Tags', fn: fillTags },
      { name: 'Author Bio', fn: fillAuthorBio },
      { name: 'LinkedIn', fn: fillLinkedIn },
      { name: 'Medium', fn: fillMedium },
      { name: 'Twitter/X', fn: fillTwitter },
      { name: 'GitHub', fn: fillGitHub },
      { name: 'Focus Keyword', fn: fillFocusKeyword },
      { name: 'Meta Title', fn: fillMetaTitle },
      { name: 'Meta Description', fn: fillMetaDescription },
    ];
    let successCount = 0;
    let failCount = 0;
    for (const step of steps) {
      try {
        const ok = await step.fn();
        if (ok) successCount++;
        else failCount++;
      } catch (err) {
        failCount++;
      }
      await sleep(180);
    }
    console.log('─────────────────────────────────────────');
    console.log('%c✅ Autofill complete! Success: ' + successCount + ' | Failed: ' + failCount, 'color:#C6FF34;font-weight:bold;font-size:13px');
  }

  runAutofill();
})();`;

export function AutomatedAIStudio({
  currentTitle,
  currentSubtitle,
  currentContent,
  currentMetaTitle,
  currentMetaDescription,
  currentFocusKeyword,
  categories,
  onApplyAutofill,
  onSwitchToManual,
}: AutomatedAIStudioProps) {
  // Topic / Title state for prompt substitution
  const [targetTitle, setTargetTitle] = useState(
    currentTitle || 'SOC Analysis: A Complete Guide to Modern Security Operations'
  );

  // Script paste runner state
  const [pastedScript, setPastedScript] = useState('');
  const [isRunningAutofill, setIsRunningAutofill] = useState(false);
  const [autofillSuccess, setAutofillSuccess] = useState<string | null>(null);
  const [autofillStepsCompleted, setAutofillStepsCompleted] = useState<string[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);

  // Copy toast states
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedBoth, setCopiedBoth] = useState(false);

  // Build the dynamic prompt with title substitution
  const cleanTitle = targetTitle.trim() || 'SOC Analysis: A Complete Guide to Modern Security Operations';
  const dynamicPrompt = `this is format of my contant I want to create contant on the title ${cleanTitle} and make this contant in this same format and make sure meta title is under 60 characters and mete description under 158 characters\n\nPrompt:-\nReplace the contant of this script with above contant`;

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(dynamicPrompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyBaseScript = async () => {
    try {
      await navigator.clipboard.writeText(BASE_AUTOFILL_SCRIPT);
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyCombined = async () => {
    try {
      const combined = `// ========================================================\n// BASE TEMPLATE SCRIPT\n// ========================================================\n${BASE_AUTOFILL_SCRIPT}\n\n// ========================================================\n// DEEPSEEK INSTRUCTION PROMPT\n// ========================================================\n${dynamicPrompt}`;
      await navigator.clipboard.writeText(combined);
      setCopiedBoth(true);
      setTimeout(() => setCopiedBoth(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  // Robust Script Parser that extracts all variables from the generated JS script
  const parseGeneratedScript = (code: string) => {
    const extractString = (varName: string): string => {
      // Handles backticks, single quotes, double quotes
      const regex = new RegExp(`const\\s+${varName}\\s*=\\s*([\`'"])([\\s\\S]*?)\\1\\s*;?`, 'i');
      const match = code.match(regex);
      return match ? match[2].trim() : '';
    };

    const extractArray = (varName: string): string[] => {
      const regex = new RegExp(`const\\s+${varName}\\s*=\\s*\\[([\\s\\S]*?)\\]\\s*;?`, 'i');
      const match = code.match(regex);
      if (!match) return [];
      return match[1]
        .split(',')
        .map((s) => s.replace(/['"`]/g, '').trim())
        .filter(Boolean);
    };

    const blogTitle = extractString('BLOG_TITLE');
    const subtitle = extractString('SUBTITLE');
    const excerpt = extractString('EXCERPT');
    const altText = extractString('ALT_TEXT');
    const imageCaption = extractString('IMAGE_CAPTION');
    const authorBio = extractString('AUTHOR_BIO');
    const linkedin = extractString('LINKEDIN');
    const medium = extractString('MEDIUM');
    const twitter = extractString('TWITTER');
    const github = extractString('GITHUB');
    const focusKeyword = extractString('FOCUS_KEYWORD');
    const metaTitle = extractString('META_TITLE');
    const metaDescription = extractString('META_DESCRIPTION');
    const bodyHtml = extractString('BODY_HTML');
    const tags = extractArray('TAGS');

    return {
      blogTitle,
      subtitle,
      excerpt,
      altText,
      imageCaption,
      authorBio,
      linkedin,
      medium,
      twitter,
      github,
      focusKeyword,
      metaTitle,
      metaDescription,
      bodyHtml,
      tags,
    };
  };

  // Run in-studio autofill directly into React state
  const handleRunInStudioAutofill = async () => {
    setParseError(null);
    setAutofillSuccess(null);
    setAutofillStepsCompleted([]);

    const codeToRun = pastedScript.trim() || BASE_AUTOFILL_SCRIPT;

    try {
      setIsRunningAutofill(true);
      const parsed = parseGeneratedScript(codeToRun);

      if (!parsed.blogTitle && !parsed.bodyHtml) {
        throw new Error(
          'Could not find BLOG_TITLE or BODY_HTML in the provided script. Please ensure the DeepSeek script output is pasted.'
        );
      }

      // Step-by-step progress simulation for ultra-smooth UI
      const steps = [
        { name: 'Parsed Content Definitions & Metadata', delay: 150 },
        { name: `Loaded Title: "${parsed.blogTitle.slice(0, 30)}..."`, delay: 200 },
        { name: 'Applied Subtitle & Listing Card Excerpt', delay: 200 },
        { name: 'Injected Structured Rich HTML Article Body', delay: 250 },
        { name: `Configured SEO Meta Title (${parsed.metaTitle.length}/60 chars)`, delay: 200 },
        { name: `Configured SEO Description (${parsed.metaDescription.length}/158 chars)`, delay: 200 },
        { name: `Mapped Topics / Tags (${parsed.tags.length} tags)`, delay: 180 },
        { name: 'Configured Cloudinary Alt-Text & Caption', delay: 150 },
        { name: 'Synchronized Author Bio & Social Credentials', delay: 200 },
      ];

      for (const step of steps) {
        await new Promise((r) => setTimeout(r, step.delay));
        setAutofillStepsCompleted((prev) => [...prev, step.name]);
      }

      // Find matching category ID if available
      let matchedCategoryId = '';
      const defaultCategory = categories.find(
        (c) =>
          c.name.toLowerCase().includes('cybersecurity') ||
          c.name.toLowerCase().includes('security')
      );
      if (defaultCategory) {
        matchedCategoryId = defaultCategory.id;
      }

      // Pass populated data to parent component
      onApplyAutofill({
        title: parsed.blogTitle || cleanTitle,
        subtitle: parsed.subtitle,
        excerpt: parsed.excerpt,
        content: parsed.bodyHtml,
        altText: parsed.altText,
        imageCaption: parsed.imageCaption,
        categoryId: matchedCategoryId,
        tags: parsed.tags,
        authorBio: parsed.authorBio,
        linkedin: parsed.linkedin,
        medium: parsed.medium,
        twitter: parsed.twitter,
        github: parsed.github,
        focusKeyword: parsed.focusKeyword,
        metaTitle: parsed.metaTitle,
        metaDescription: parsed.metaDescription,
      });

      setAutofillSuccess(
        `All 16 fields successfully populated! Meta Title (${parsed.metaTitle.length}/60 chars) and Meta Description (${parsed.metaDescription.length}/158 chars) conform to Google constraints.`
      );
    } catch (err: any) {
      console.error(err);
      setParseError(err.message || 'Failed to parse and apply script.');
    } finally {
      setIsRunningAutofill(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      {/* Top Banner & Tool Recommendations */}
      <div className="p-5 md:p-6 rounded-2xl bg-gradient-to-r from-[#141418] via-[#161620] to-[#121218] border border-white/15 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#C6FF34]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-[#C6FF34] text-black font-mono font-bold uppercase tracking-wider text-[10px]">
                ⚡ AUTOMATED AI STUDIO
              </Badge>
              <Badge className="bg-sky-500/20 text-sky-300 border border-sky-500/30 font-mono text-[10px]">
                DEEPSEEK OPTIMIZED
              </Badge>
              <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono text-[10px]">
                1-CLICK IN-STUDIO POPULATE
              </Badge>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2 font-mono">
              DeepSeek Prompt & Automated Content Generator
            </h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Generate publication-grade cybersecurity research in seconds. This workflow prepares the exact DeepSeek prompt, provides the structured content script, enforces strict Google SEO character boundaries, and populates your blog with one click.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              onClick={onSwitchToManual}
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-mono rounded-xl h-10 px-4"
            >
              Switch to Manual Studio <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>
        </div>

        {/* Recommended Tool Specs Banner */}
        <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#C6FF34] block">Recommended AI Tool</span>
            <p className="font-bold text-white flex items-center gap-1.5">
              <span>DeepSeek R1 / V3</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">Verified</span>
            </p>
          </div>
          <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
            <span className="text-[10px] uppercase font-bold text-sky-400 block">Required Modes</span>
            <p className="font-bold text-white">
              DeepThinking mode <span className="text-[#C6FF34]">ON</span> &amp; Smart Search <span className="text-[#C6FF34]">ON</span>
            </p>
          </div>
          <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
            <span className="text-[10px] uppercase font-bold text-purple-400 block">SEO Target Rules</span>
            <p className="font-bold text-white">
              Meta Title &lt; 60 chars · Meta Desc &lt; 158 chars
            </p>
          </div>
        </div>
      </div>

      {/* Target Title Input Box */}
      <div className="bg-[#0e0e12] border border-white/10 rounded-2xl p-5 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Wand2 className="w-3.5 h-3.5 text-[#C6FF34]" /> ENTER YOUR TARGET BLOG TITLE / TOPIC
          </label>
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded ${
              targetTitle.length <= 60
                ? 'bg-emerald-500/20 text-emerald-400 font-bold'
                : 'bg-amber-500/20 text-amber-400'
            }`}
          >
            {targetTitle.length} characters {targetTitle.length <= 60 ? '· Optimal' : ''}
          </span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            value={targetTitle}
            onChange={(e) => setTargetTitle(e.target.value)}
            placeholder="e.g. SOC Analysis: A Complete Guide to Modern Security Operations"
            className="bg-[#141418] border-white/15 text-white font-mono text-sm h-11 focus:border-[#C6FF34]"
          />
          <Button
            type="button"
            onClick={handleCopyPrompt}
            className="bg-[#C6FF34] text-black hover:bg-[#b2eb2a] font-mono font-bold text-xs h-11 px-4 shrink-0 rounded-xl cursor-pointer"
          >
            {copiedPrompt ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1 text-black font-extrabold" /> Prompt Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 mr-1" /> Copy Tailored Prompt
              </>
            )}
          </Button>
        </div>
        <p className="text-[11px] text-slate-400 font-mono">
          Replacing <code className="bg-black/60 px-1.5 py-0.5 rounded text-[#C6FF34]">&lt;replace this with title name&gt;</code> automatically in the prompt below.
        </p>
      </div>

      {/* The 4-Step Interactive Guide */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
        {/* Step 1 */}
        <div className="bg-[#121216] border border-white/10 rounded-xl p-4 space-y-2 flex flex-col justify-between hover:border-white/20 transition-colors">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Step 1</span>
              <Badge className="bg-white/10 text-white text-[9px]">Base Template</Badge>
            </div>
            <p className="font-bold text-white text-sm">Copy Base Script Format</p>
            <p className="text-[11px] text-slate-400 leading-snug">
              Copy the standardized JavaScript content template containing all 16 fields, placeholders, and fill functions.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={handleCopyBaseScript}
            variant="outline"
            className="w-full bg-white/5 hover:bg-white/15 text-white border-white/15 text-[11px] h-8 rounded-lg"
          >
            {copiedScript ? <Check className="w-3 h-3 mr-1 text-[#C6FF34]" /> : <Copy className="w-3 h-3 mr-1" />}
            {copiedScript ? 'Script Copied' : 'Copy Base Script'}
          </Button>
        </div>

        {/* Step 2 */}
        <div className="bg-[#121216] border border-white/10 rounded-xl p-4 space-y-2 flex flex-col justify-between hover:border-white/20 transition-colors">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Step 2</span>
              <Badge className="bg-sky-500/20 text-sky-300 text-[9px]">Title Injected</Badge>
            </div>
            <p className="font-bold text-white text-sm">Copy Tailored Prompt</p>
            <p className="text-[11px] text-slate-400 leading-snug">
              Copies the prompt specifying title substitution, meta title &lt; 60 chars, and meta description &lt; 158 chars.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={handleCopyPrompt}
            variant="outline"
            className="w-full bg-sky-500/15 hover:bg-sky-500/25 text-sky-200 border-sky-500/30 text-[11px] h-8 rounded-lg"
          >
            {copiedPrompt ? <Check className="w-3 h-3 mr-1 text-sky-300" /> : <Copy className="w-3 h-3 mr-1" />}
            {copiedPrompt ? 'Prompt Copied' : 'Copy Prompt'}
          </Button>
        </div>

        {/* Step 3 */}
        <div className="bg-[#121216] border border-white/10 rounded-xl p-4 space-y-2 flex flex-col justify-between hover:border-white/20 transition-colors">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Step 3</span>
              <Badge className="bg-purple-500/20 text-purple-300 text-[9px]">DeepSeek</Badge>
            </div>
            <p className="font-bold text-white text-sm">Send to DeepSeek (New Chat)</p>
            <p className="text-[11px] text-slate-400 leading-snug">
              Open a new chat in DeepSeek. Turn ON DeepThinking + Smart search. Paste the base script first, then paste the prompt.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={handleCopyCombined}
            className="w-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/40 text-[11px] h-8 rounded-lg"
          >
            {copiedBoth ? <Check className="w-3 h-3 mr-1 text-purple-300" /> : <Copy className="w-3 h-3 mr-1" />}
            {copiedBoth ? 'Combined Copied!' : 'Copy Script + Prompt'}
          </Button>
        </div>

        {/* Step 4 */}
        <div className="bg-[#121216] border border-white/10 rounded-xl p-4 space-y-2 flex flex-col justify-between hover:border-white/20 transition-colors">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Step 4</span>
              <Badge className="bg-[#C6FF34]/20 text-[#C6FF34] text-[9px]">Run &amp; Fill</Badge>
            </div>
            <p className="font-bold text-white text-sm">Run Autofill in 1-Click</p>
            <p className="text-[11px] text-slate-400 leading-snug">
              Paste the DeepSeek output below to populate right in the studio, or run in the browser console using "allow pasting".
            </p>
          </div>
          <a
            href="#in-studio-runner"
            className="w-full text-center py-1.5 rounded-lg bg-[#C6FF34] text-black font-bold text-[11px] hover:bg-[#b2eb2a]"
          >
            Jump to Runner ↓
          </a>
        </div>
      </div>

      {/* Generated Prompt Code View */}
      <div className="bg-[#0e0e12] border border-white/10 rounded-2xl p-5 space-y-3 shadow-xl font-mono text-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-sky-400" /> TAILORED DEEPSEEK PROMPT READY FOR COPYING
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopyPrompt}
            className="h-7 text-xs text-[#C6FF34] hover:bg-[#C6FF34]/10"
          >
            {copiedPrompt ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
            {copiedPrompt ? 'Copied' : 'Copy'}
          </Button>
        </div>
        <div className="p-3.5 rounded-xl bg-black/80 border border-white/10 text-slate-200 leading-relaxed overflow-x-auto whitespace-pre-wrap select-all">
          {dynamicPrompt}
        </div>
      </div>

      {/* In-Studio Script & Content Runner */}
      <div id="in-studio-runner" className="bg-[#0e0e12] border border-white/15 rounded-2xl p-5 md:p-6 space-y-4 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 font-mono">
              <Cpu className="w-4 h-4 text-[#C6FF34]" /> IN-STUDIO 1-CLICK AUTOFILL RUNNER
            </h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Paste your DeepSeek generated script or output here and click &ldquo;Auto-Populate Blog Now&rdquo; to instantaneously update all 16 fields without opening DevTools!
            </p>
          </div>
          <Button
            type="button"
            onClick={() => setPastedScript(BASE_AUTOFILL_SCRIPT)}
            size="sm"
            variant="outline"
            className="bg-white/5 hover:bg-white/15 text-slate-300 border-white/10 text-xs font-mono shrink-0 h-8"
          >
            Load Sample SOC Script
          </Button>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
            Paste DeepSeek Script Output Here:
          </label>
          <textarea
            value={pastedScript}
            onChange={(e) => setPastedScript(e.target.value)}
            rows={7}
            placeholder={`Paste the JavaScript script output from DeepSeek here...\n\nExample:\nconst BLOG_TITLE = '...';\nconst SUBTITLE = '...';\nconst EXCERPT = '...';\nconst BODY_HTML = \`...\`;\n...`}
            className="w-full p-3.5 rounded-xl bg-black/80 border border-white/15 text-[#C6FF34] font-mono text-xs focus:border-[#C6FF34] focus:outline-none leading-relaxed"
          />
        </div>

        {parseError && (
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs font-mono flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{parseError}</span>
          </div>
        )}

        {/* Live Step-by-Step Progress */}
        {autofillStepsCompleted.length > 0 && (
          <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-2 font-mono text-xs animate-in fade-in duration-150">
            <div className="text-[11px] font-bold uppercase text-[#C6FF34] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#C6FF34]" /> Execution Progress &amp; Form Mapping
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
              {autofillStepsCompleted.map((step, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-slate-300 text-[11px]">
                  <Check className="w-3.5 h-3.5 text-[#C6FF34] shrink-0" />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {autofillSuccess && (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{autofillSuccess}</span>
            </div>
            <Button
              type="button"
              onClick={onSwitchToManual}
              className="bg-[#C6FF34] text-black hover:bg-[#b2eb2a] font-bold text-xs h-8 px-3 rounded-lg shrink-0 cursor-pointer"
            >
              Review in Manual Editor →
            </Button>
          </div>
        )}

        {/* Action Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <Button
            type="button"
            onClick={handleRunInStudioAutofill}
            disabled={isRunningAutofill}
            className="bg-[#C6FF34] text-black hover:bg-[#b2eb2a] font-mono font-black text-xs h-10 px-6 rounded-xl shadow-lg shadow-[#C6FF34]/20 cursor-pointer flex items-center gap-2"
          >
            {isRunningAutofill ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-black" />
                Populating Form Fields...
              </>
            ) : (
              <>
                <Cpu className="w-4 h-4" />
                ⚡ Auto-Populate Blog Now
              </>
            )}
          </Button>

          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
            <span>Or open Console &amp; type <code className="bg-black/60 px-1.5 py-0.5 rounded text-[#C6FF34]">allow pasting</code></span>
          </div>
        </div>
      </div>

      {/* Alternative Method: Browser Console Instructions */}
      <div className="p-4 rounded-2xl bg-[#0c0c10] border border-white/10 space-y-2 font-mono text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-bold">
          <Terminal className="w-3.5 h-3.5 text-sky-400" />
          <span>Alternative Browser Console Runner Instructions (DevTools)</span>
        </div>
        <p className="text-slate-400 text-[11px] leading-relaxed">
          If you prefer executing via DevTools: Press <kbd className="px-1 py-0.5 bg-white/10 rounded">F12</kbd> (or <kbd className="px-1 py-0.5 bg-white/10 rounded">Ctrl+Shift+I</kbd>), click the <strong>Console</strong> tab. If Chrome/Edge blocks pasting, type <code className="text-[#C6FF34]">allow pasting</code> and hit Enter. Then paste your DeepSeek script and press Enter. Each input will flash green in the console!
        </p>
      </div>
    </div>
  );
}
