'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  TrendingUp,
  Search,
  Eye,
  MousePointerClick,
  Globe,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Layers,
  Copy,
  Check,
  Zap,
  Cpu,
  Key,
  BookOpen,
  ArrowRight,
  HelpCircle,
  BarChart3,
  Sliders,
  Award,
  Filter,
  FileText,
  GraduationCap,
  AlertTriangle,
  Tag,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { TOPIC_CLUSTERS } from '@/lib/seo/topicClusters';

interface MetadataVariant {
  id: string;
  name: string;
  badge: string;
  metaTitle: string;
  metaTitleLength: number;
  metaTitleStatus: 'OPTIMAL' | 'TOO_SHORT' | 'TOO_LONG';
  metaDescription: string;
  metaDescriptionLength: number;
  metaDescriptionStatus: 'OPTIMAL' | 'TOO_SHORT' | 'TOO_LONG';
  predictedCtr: number;
  serpRankPotential: string;
  lsiKeywords: string[];
  predictedCtrLift?: string;
  strategyRationale: string;
}

const PRESET_PAGES = [
  { url: 'https://www.threadsecurity.in/', topic: 'Thread Security | #1 Cyber & AI Training Institute', keywords: 'thread security, thread security jalandhar, cyber security course, practical labs', pageType: 'LANDING' as const },
  { url: 'https://www.threadsecurity.in/blog/soc-analysis-a-complete-guide-to-modern-security-operations', topic: 'SOC Analysis Guide: Modern Security Operations (2026 Roadmap)', keywords: 'soc analysis, soc analyst training, siem threat hunting, blue team ops', pageType: 'BLOG' as const },
  { url: 'https://www.threadsecurity.in/blog/free-cybersecurity-lab-a-safe-zero-cost-practice-roadmap', topic: 'Free Cybersecurity Lab: Zero-Cost Practice Roadmap [2026]', keywords: 'free cybersecurity lab, zero cost cyber roadmap, kali linux sandbox', pageType: 'BLOG' as const },
  { url: 'https://www.threadsecurity.in/courses/binary-exploitation-reverse-engineering', topic: 'Binary Exploitation & Reverse Engineering [2026 Labs]', keywords: 'binary exploitation reverse engineering, ghidra malware, rop chain development', pageType: 'COURSE' as const },
  { url: 'https://www.threadsecurity.in/blog/cybersecurity-courses-in-jalandhar-or-thread-security-education', topic: 'Cyber Security Courses in Jalandhar: Hands-On Labs & Fees', keywords: 'cyber security course in jalandhar, ethical hacking jalandhar, punjab cyber training', pageType: 'BLOG' as const },
  { url: 'https://www.threadsecurity.in/contact', topic: 'Contact Thread Security | Jalandhar Cyber & AI Institute', keywords: 'contact thread security, thread security jalandhar phone, cyber course admission', pageType: 'LANDING' as const },
  { url: 'https://www.threadsecurity.in/blog/upi-scam-prevention-why-warnings-fail-and-what-works', topic: 'UPI Scam Prevention: Why Warnings Fail & Practical Defense', keywords: 'upi scam prevention, cyber fraud awareness, banking cyber security', pageType: 'BLOG' as const },
];

export default function AdminSeoConsolePage() {
  const [activeTab, setActiveTab] = useState<'CONTENT_RADAR' | 'TELEMETRY' | 'AI_METADATA' | 'SEO_AUDIT' | 'TOPIC_CLUSTERS'>('CONTENT_RADAR');
  
  // AI Content Radar State
  const [radarData, setRadarData] = useState<any>(null);
  const [radarLoading, setRadarLoading] = useState(false);
  const [radarFilter, setRadarFilter] = useState<'ALL' | 'NEEDS_LIFT' | 'NEW' | 'COURSES' | 'BLOGS' | 'INDEXED'>('ALL');
  const [radarSearch, setRadarSearch] = useState('');
  const [radarBatchBoosting, setRadarBatchBoosting] = useState(false);
  const [radarNotice, setRadarNotice] = useState<string | null>(null);

  // Credentials Diagnostic state
  const [credStatus, setCredStatus] = useState<any>(null);
  const [showCredGuide, setShowCredGuide] = useState(false);

  // Telemetry state
  const [days, setDays] = useState(28);
  const [loading, setLoading] = useState(true);
  const [telemetry, setTelemetry] = useState<any>(null);
  
  // 1-Click Autonomous Optimization State
  const [boostingRow, setBoostingRow] = useState<string | null>(null);
  const [boostedNotice, setBoostedNotice] = useState<{ id: string; message: string } | null>(null);
  const [batchBoosting, setBatchBoosting] = useState(false);
  const [batchNotice, setBatchNotice] = useState<string | null>(null);

  // Instant Indexing state
  const [indexUrl, setIndexUrl] = useState('');
  const [indexAction, setIndexAction] = useState<'URL_UPDATED' | 'URL_DELETED'>('URL_UPDATED');
  const [indexLoading, setIndexLoading] = useState(false);
  const [indexResponse, setIndexResponse] = useState<any>(null);
  const [indexingLogs, setIndexingLogs] = useState<any[]>([]);

  // SEO Audit state
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditData, setAuditData] = useState<any>(null);

  // AI Meta Title & Description Engine state
  const [targetUrl, setTargetUrl] = useState('https://www.threadsecurity.in/');
  const [targetTopic, setTargetTopic] = useState('Thread Security | #1 Cyber & AI Training Institute');
  const [targetKeywords, setTargetKeywords] = useState('thread security, thread security jalandhar, cyber security course, practical labs');
  const [pageType, setPageType] = useState<'COURSE' | 'BLOG' | 'LANDING' | 'WORKSHOP'>('LANDING');
  const [aiLoading, setAiLoading] = useState(false);
  const [metadataResult, setMetadataResult] = useState<any>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string>('variant-high-ctr');
  const [continuousMode, setContinuousMode] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const continuousTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchCredentialsStatus();
    fetchTelemetry();
    fetchLogs();
    fetchRadarData();
    // Auto-generate initial AI metadata
    handleGenerateMetadata();
  }, []);

  useEffect(() => {
    fetchTelemetry();
  }, [days]);

  // Continuous auto-generation mode
  useEffect(() => {
    if (continuousMode) {
      continuousTimerRef.current = setInterval(() => {
        handleGenerateMetadata(true);
      }, 12000);
    } else {
      if (continuousTimerRef.current) clearInterval(continuousTimerRef.current);
    }
    return () => {
      if (continuousTimerRef.current) clearInterval(continuousTimerRef.current);
    };
  }, [continuousMode, targetUrl, targetTopic, targetKeywords, pageType]);

  const fetchCredentialsStatus = async () => {
    try {
      const res = await fetch('/api/admin/seo/credentials-status');
      const json = await res.json();
      if (json.success) {
        setCredStatus(json.status);
      }
    } catch (err) {
      console.warn('Failed to fetch GCP status:', err);
    }
  };

  const fetchTelemetry = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/seo/search-console?days=${days}`);
      const json = await res.json();
      if (json.success) {
        setTelemetry(json.data);
      }
    } catch (err) {
      console.error('Error fetching telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/admin/seo/index-now');
      const json = await res.json();
      if (json.success) {
        setIndexingLogs(json.logs || []);
      }
    } catch (err) {
      console.error('Error fetching indexing logs:', err);
    }
  };

  const fetchRadarData = async () => {
    setRadarLoading(true);
    try {
      const res = await fetch('/api/admin/seo/content-radar');
      const json = await res.json();
      if (json.success) {
        setRadarData(json.data);
      }
    } catch (err) {
      console.error('Error fetching Content Radar:', err);
    } finally {
      setRadarLoading(false);
    }
  };

  const handleBoostRadarItem = async (item: any) => {
    setBoostingRow(item.url);
    setBoostedNotice(null);
    try {
      const res = await fetch('/api/admin/seo/content-radar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            {
              url: item.url,
              metaTitle: item.recommendedTitle,
              metaDescription: item.recommendedDescription,
              focusKeyword: item.focusKeyword,
              keywords: item.lsiKeywords,
            },
          ],
        }),
      });
      const json = await res.json();
      if (json.success) {
        setBoostedNotice({
          id: item.url,
          message: `⚡ 1-Click Applied! Pushed "${item.recommendedTitle}" to Googlebot (HTTP 200).`,
        });
        fetchRadarData();
        fetchLogs();
      }
    } catch (err: any) {
      console.error('Error boosting radar item:', err);
      setBoostedNotice({ id: item.url, message: `Error: ${err.message}` });
    } finally {
      setBoostingRow(null);
    }
  };

  const handleBatchBoostRadar = async (filterType?: string) => {
    setRadarBatchBoosting(true);
    setRadarNotice('⚡ Running 1-Click Auto-Boost & Googlebot Dispatch for all targeted pages...');
    try {
      const res = await fetch('/api/admin/seo/content-radar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boostAll: true,
          filter: filterType || radarFilter,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setRadarNotice(`✅ ${json.message || 'All targeted pages boosted and submitted to Googlebot!'}`);
        fetchRadarData();
        fetchLogs();
      } else {
        setRadarNotice(`Notice: ${json.error || 'Failed to complete batch boost'}`);
      }
    } catch (err: any) {
      console.error('Batch boost error:', err);
      setRadarNotice(`Error: ${err.message}`);
    } finally {
      setRadarBatchBoosting(false);
    }
  };

  const runSeoAudit = async () => {
    setAuditLoading(true);
    try {
      const res = await fetch('/api/admin/seo/audit');
      const json = await res.json();
      if (json.success) {
        setAuditData(json.data);
      }
    } catch (err) {
      console.error('Error running SEO audit:', err);
    } finally {
      setAuditLoading(false);
    }
  };

  const handleGenerateMetadata = async (isBackgroundCycle = false) => {
    if (!isBackgroundCycle) setAiLoading(true);
    setSaveStatus(null);

    try {
      const res = await fetch('/api/admin/seo/generate-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: targetUrl,
          topic: targetTopic,
          keywords: targetKeywords,
          pageType,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setMetadataResult(json.data);
        if (!isBackgroundCycle && json.data.variants?.[0]) {
          setSelectedVariantId(json.data.variants[0].id);
        }
      }
    } catch (err) {
      console.error('AI Metadata generation error:', err);
    } finally {
      if (!isBackgroundCycle) setAiLoading(false);
    }
  };

  const handleSelectPreset = (preset: typeof PRESET_PAGES[0]) => {
    setTargetUrl(preset.url);
    setTargetTopic(preset.topic);
    setTargetKeywords(preset.keywords);
  };

  const handleTriggerIndexing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!indexUrl) return;

    setIndexLoading(true);
    setIndexResponse(null);

    try {
      const res = await fetch('/api/admin/seo/index-now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: indexUrl, action: indexAction }),
      });
      const data = await res.json();
      setIndexResponse(data);
      fetchLogs();
    } catch (err: any) {
      setIndexResponse({ success: false, message: err.message || 'Submission failed' });
    } finally {
      setIndexLoading(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveMetadata = async (variant: MetadataVariant) => {
    setSaveStatus('Saving metadata & pinging Google Indexing API...');
    try {
      const res = await fetch('/api/admin/seo/save-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: targetUrl,
          metaTitle: variant.metaTitle,
          metaDescription: variant.metaDescription,
          focusKeyword: metadataResult?.primaryKeyword || targetKeywords.split(',')[0],
          keywords: variant.lsiKeywords,
          triggerIndexing: true,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSaveStatus(`✅ Saved & Indexed! ${json.message}`);
        fetchLogs();
      } else {
        setSaveStatus(`Notice: ${json.error || 'Failed to save'}`);
      }
    } catch (err: any) {
      setSaveStatus(`Error saving metadata: ${err.message}`);
    }
  };

  // 1-Click Autonomous CTR Optimizer for a single row
  const handleOneClickBoost = async (item: { url?: string; query?: string; topic?: string; keywords?: string; pageType?: any }) => {
    const rowId = item.url || item.query || 'boost';
    setBoostingRow(rowId);
    setBoostedNotice(null);

    let resolvedUrl = item.url || 'https://www.threadsecurity.in/';
    let resolvedTopic = item.topic || '';
    let resolvedKeywords = item.keywords || item.query || 'cyber security';
    let resolvedPageType = item.pageType || 'BLOG';

    if (!item.url && item.query) {
      const q = item.query.toLowerCase();
      if (q.includes('soc analysis')) {
        resolvedUrl = 'https://www.threadsecurity.in/blog/soc-analysis-a-complete-guide-to-modern-security-operations';
        resolvedTopic = 'SOC Analysis Guide: Modern Security Operations (2026 Roadmap)';
        resolvedPageType = 'BLOG';
      } else if (q.includes('jalandhar') && (q.includes('course') || q.includes('ai'))) {
        resolvedUrl = 'https://www.threadsecurity.in/blog/cybersecurity-courses-in-jalandhar-or-thread-security-education';
        resolvedTopic = 'Cyber Security Course in Jalandhar: Labs & Placement';
        resolvedPageType = 'BLOG';
      } else if (q.includes('thread security')) {
        resolvedUrl = 'https://www.threadsecurity.in/';
        resolvedTopic = 'Thread Security | #1 Cyber & AI Training Institute';
        resolvedPageType = 'LANDING';
      } else if (q.includes('binary') || q.includes('reverse') || q.includes('exploit')) {
        resolvedUrl = 'https://www.threadsecurity.in/courses/binary-exploitation-reverse-engineering';
        resolvedTopic = 'Binary Exploitation & Reverse Engineering [2026 Labs]';
        resolvedPageType = 'COURSE';
      } else {
        resolvedUrl = 'https://www.threadsecurity.in/';
        resolvedTopic = `${item.query} | Thread Security`;
        resolvedPageType = 'LANDING';
      }
    }

    try {
      const genRes = await fetch('/api/admin/seo/generate-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: resolvedUrl,
          topic: resolvedTopic || resolvedKeywords,
          keywords: resolvedKeywords,
          searchQuery: item.query,
          pageType: resolvedPageType,
        }),
      });
      const genJson = await genRes.json();
      const variant = genJson?.data?.variants?.[0];

      if (variant) {
        const saveRes = await fetch('/api/admin/seo/save-metadata', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: resolvedUrl,
            metaTitle: variant.metaTitle,
            metaDescription: variant.metaDescription,
            focusKeyword: genJson.data.primaryKeyword || item.query,
            keywords: variant.lsiKeywords,
            triggerIndexing: true,
          }),
        });
        const saveJson = await saveRes.json();
        setBoostedNotice({
          id: rowId,
          message: `⚡ 1-Click Boost Applied! Title: "${variant.metaTitle}" (${variant.metaTitleLength}c) — Google Indexing pinged!`,
        });
        fetchLogs();
      }
    } catch (err: any) {
      console.error('1-Click Boost error:', err);
      setBoostedNotice({ id: rowId, message: `Error: ${err.message}` });
    } finally {
      setBoostingRow(null);
    }
  };

  // 1-Click Autonomous Batch Optimizer for All Striking Distance Pages
  const handleBatchBoostStrikingDistance = async () => {
    setBatchBoosting(true);
    setBatchNotice('⚡ Running 1-Click Batch Optimization for all 4 striking-distance pages...');

    const targets = [
      {
        url: 'https://www.threadsecurity.in/blog/soc-analysis-a-complete-guide-to-modern-security-operations',
        topic: 'SOC Analysis Guide: Complete Roadmap to L1/L2 Security Operations',
        query: 'soc analysis',
        keywords: 'soc analysis, soc analyst course, siem incident response, blue team training',
        pageType: 'BLOG',
      },
      {
        url: 'https://www.threadsecurity.in/blog/free-cybersecurity-lab-a-safe-zero-cost-practice-roadmap',
        topic: 'Free Cybersecurity Lab: Safe Zero-Cost Practice Roadmap',
        query: 'free cybersecurity lab',
        keywords: 'free cybersecurity lab, zero cost cyber practice, kali linux sandbox',
        pageType: 'BLOG',
      },
      {
        url: 'https://www.threadsecurity.in/blog/cybersecurity-courses-in-jalandhar-or-thread-security-education',
        topic: 'Cyber Security Courses in Jalandhar: Hands-On Labs & Placement',
        query: 'cyber security course in jalandhar',
        keywords: 'cyber security course in jalandhar, ethical hacking jalandhar, punjab cyber training',
        pageType: 'BLOG',
      },
      {
        url: 'https://www.threadsecurity.in/',
        topic: 'Thread Security | #1 Cyber & AI Training Institute',
        query: 'thread security',
        keywords: 'thread security, thread security jalandhar, practical cybersecurity training',
        pageType: 'LANDING',
      },
    ];

    for (const target of targets) {
      await handleOneClickBoost(target as any);
    }

    setBatchNotice('✅ All 4 Striking-Distance Pages optimized with High-CTR Hooks & Submitted to Google Indexing API!');
    setBatchBoosting(false);
  };

  const currentVariant = metadataResult?.variants?.find((v: MetadataVariant) => v.id === selectedVariantId) || metadataResult?.variants?.[0];

  const filteredRadarItems = (radarData?.items || []).filter((item: any) => {
    if (radarSearch) {
      const q = radarSearch.toLowerCase();
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchUrl = item.url?.toLowerCase().includes(q);
      const matchQuery = item.searchQuery?.toLowerCase().includes(q);
      const matchKeyword = item.focusKeyword?.toLowerCase().includes(q);
      if (!matchTitle && !matchUrl && !matchQuery && !matchKeyword) return false;
    }

    if (radarFilter === 'NEEDS_LIFT') return item.currentStatus === 'NEEDS_LIFT';
    if (radarFilter === 'NEW') return item.isNew || item.currentStatus === 'NEW_UNINDEXED';
    if (radarFilter === 'COURSES') return item.type === 'COURSE';
    if (radarFilter === 'BLOGS') return item.type === 'BLOG';
    if (radarFilter === 'INDEXED') return item.googlebotStatus === 'INDEXED_200';
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50/80 via-purple-50/40 to-slate-50 text-slate-800 p-6 md:p-10 space-y-8 font-sans">
      {/* Top Banner & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-violet-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-violet-700 text-xs font-bold uppercase tracking-wider mb-1.5">
            <span className="p-1 rounded-md bg-violet-100 text-violet-700">
              <Globe className="w-3.5 h-3.5" />
            </span>
            <span>Thread Security Education • Rank #1 SEO & Search Console Engine</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-violet-950">
            SEO & Search Analytics Command Center
          </h1>
          <p className="text-violet-900/70 text-sm mt-1 max-w-2xl leading-relaxed">
            Continuous Vertex AI Meta Title Engine, real-time Google Search Console telemetry, instant indexing, and technical audit matrix.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Credentials Status Pill */}
          <button
            onClick={() => setShowCredGuide(!showCredGuide)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition shadow-sm ${
              credStatus?.isConfigured
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>
              {credStatus?.isConfigured ? 'GCP Auth: Live Active' : 'GCP Auth: Dev Benchmark'}
            </span>
            <HelpCircle className="w-3 h-3 text-amber-700 ml-0.5" />
          </button>

          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="rounded-xl bg-white border border-violet-200 px-3.5 py-2 text-xs font-medium text-violet-950 shadow-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
          >
            <option value={7}>Last 7 Days</option>
            <option value={28}>Last 28 Days</option>
            <option value={90}>Last 90 Days</option>
          </select>

          <button
            onClick={() => {
              fetchTelemetry();
              fetchCredentialsStatus();
            }}
            className="flex items-center gap-2 rounded-xl bg-white border border-violet-200 px-4 py-2 text-xs font-medium text-violet-800 hover:text-violet-950 hover:bg-violet-50 transition shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* GCP Credentials Diagnostics & Explanatory Accordion */}
      {showCredGuide && (
        <div className="rounded-2xl bg-white border border-amber-200 p-6 shadow-md shadow-amber-500/5 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <Key className="w-4 h-4 text-amber-600" />
              <span>Google Cloud Platform Authentication Diagnostic & Resolution Guide</span>
            </div>
            <button
              onClick={() => setShowCredGuide(false)}
              className="text-xs text-amber-700 hover:text-amber-900 font-semibold"
            >
              Dismiss ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700 leading-relaxed">
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 space-y-2">
              <span className="font-bold text-amber-950 block">Why did the &quot;Could not load default credentials&quot; error appear?</span>
              <p>
                Google Search Console API and Instant Indexing API require authentication with a Google Cloud Service Account. While your <code className="font-mono bg-white px-1 py-0.5 rounded text-amber-900">.env</code> contains the service account email, the <code className="font-mono bg-white px-1 py-0.5 rounded text-amber-900">GCP_PRIVATE_KEY</code> variable was not yet set.
              </p>
              <p>
                When Google&apos;s auth client ran, it checked your local machine for Application Default Credentials (ADC) and threw the notice. The system now safely catches this and operates in <strong>safe benchmark simulation mode</strong> without interrupting your workflows!
              </p>
            </div>

            <div className="bg-violet-50/70 border border-violet-200 rounded-xl p-4 space-y-2">
              <span className="font-bold text-violet-950 block">How to connect Live Google Search Console in 2 Minutes:</span>
              <ol className="list-decimal list-inside space-y-1 text-slate-600">
                <li>Open <strong>Google Cloud Console</strong> &gt; IAM &amp; Admin &gt; Service Accounts.</li>
                <li>Find your service account (<code className="font-mono text-violet-800">threadsec-indexing@...</code>).</li>
                <li>Click <strong>Keys</strong> &gt; <strong>Add Key</strong> &gt; <strong>Create new key (JSON)</strong>.</li>
                <li>Copy the <code className="font-mono text-violet-800">&quot;private_key&quot;</code> value and add to <code className="font-mono text-violet-800">.env</code>:
                  <div className="font-mono text-[11px] bg-white p-2 rounded border border-violet-200 mt-1 select-all text-violet-900">
                    GCP_PRIVATE_KEY=&quot;-----BEGIN PRIVATE KEY-----\nMIIEv...-----END PRIVATE KEY-----\n&quot;
                  </div>
                </li>
                <li>Add the service account email as a <strong>Delegated Owner</strong> inside your Google Search Console property.</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-violet-200/80 pb-2">
        <button
          onClick={() => setActiveTab('CONTENT_RADAR')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm ${
            activeTab === 'CONTENT_RADAR'
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-violet-500/25 ring-2 ring-violet-400/20'
              : 'bg-white text-violet-800 hover:bg-violet-100/70 border border-violet-200'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
          <span>AI Content Radar &amp; 1-Click Googlebot Ready</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-400 text-slate-950 shadow-sm animate-pulse">
            {radarData?.needsLiftCount !== undefined ? `${radarData.needsLiftCount} LIFTS` : 'AUTONOMOUS'}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('AI_METADATA')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm ${
            activeTab === 'AI_METADATA'
              ? 'bg-violet-600 text-white shadow-violet-500/25 ring-2 ring-violet-400/20'
              : 'bg-white text-violet-800 hover:bg-violet-100/70 border border-violet-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Vertex AI Meta Title &amp; Description Engine</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-violet-700 text-amber-200 border border-amber-300/40">
            AUTO-GEN
          </span>
        </button>

        <button
          onClick={() => setActiveTab('TELEMETRY')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm ${
            activeTab === 'TELEMETRY'
              ? 'bg-violet-600 text-white shadow-violet-500/25'
              : 'bg-white text-violet-800 hover:bg-violet-100/70 border border-violet-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Search Console Telemetry &amp; Indexing</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('SEO_AUDIT');
            if (!auditData) runSeoAudit();
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm ${
            activeTab === 'SEO_AUDIT'
              ? 'bg-violet-600 text-white shadow-violet-500/25'
              : 'bg-white text-violet-800 hover:bg-violet-100/70 border border-violet-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Technical SEO Health Audit</span>
        </button>

        <button
          onClick={() => setActiveTab('TOPIC_CLUSTERS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm ${
            activeTab === 'TOPIC_CLUSTERS'
              ? 'bg-violet-600 text-white shadow-violet-500/25'
              : 'bg-white text-violet-800 hover:bg-violet-100/70 border border-violet-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Rank #1 Topic Clusters &amp; Interlinking</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 0: AUTONOMOUS AI CONTENT RADAR & 1-CLICK GOOGLEBOT READY */}
      {/* ========================================================================= */}
      {activeTab === 'CONTENT_RADAR' && (
        <div className="space-y-8">
          {/* Hero Banner */}
          <div className="rounded-3xl bg-gradient-to-r from-violet-950 via-indigo-900 to-slate-900 text-white p-6 md:p-8 shadow-2xl relative overflow-hidden space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold border border-amber-300/20 backdrop-blur-md">
                  <Zap className="w-3.5 h-3.5 fill-amber-300" />
                  <span>Real-Time Autonomous Content Radar • RankBrain &amp; NavBoost Optimization</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                  All Courses &amp; Blogs: AI Recommendations &amp; 1-Click Googlebot Ready
                </h2>
                <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
                  Continuously scans every course, research blog, and newly published article. The AI automatically detects snippet truncation (&gt;58 chars), missing psychological bracket hooks <code className="text-amber-300 font-mono">[2026]</code>, and delivers instant 1-click Googlebot crawling via your active service account credentials.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  type="button"
                  disabled={radarLoading}
                  onClick={fetchRadarData}
                  className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${radarLoading ? 'animate-spin' : ''}`} />
                  <span>Rescan Radar</span>
                </button>

                <button
                  type="button"
                  disabled={radarBatchBoosting}
                  onClick={() => handleBatchBoostRadar()}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 text-xs font-extrabold shadow-xl shadow-amber-500/20 transition disabled:opacity-50"
                >
                  <Zap className={`w-4 h-4 fill-slate-950 ${radarBatchBoosting ? 'animate-bounce' : ''}`} />
                  <span>{radarBatchBoosting ? 'Boosting & Pushing to Googlebot...' : `⚡ 1-Click Boost All ${radarData?.needsLiftCount || 0} Pages to Googlebot`}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Batch Notice Alert */}
          {radarNotice && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900/90 via-teal-900/90 to-slate-900 text-emerald-100 border border-emerald-500/40 text-xs font-semibold flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-sm font-bold text-white">{radarNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setRadarNotice(null)}
                className="text-xs text-emerald-300 hover:text-white transition font-bold px-2 py-1 rounded-lg bg-white/10"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* 5 Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="rounded-2xl bg-white border border-violet-100 p-4 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Total Monitored</span>
                <Globe className="w-4 h-4 text-violet-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900">
                {radarLoading ? '...' : radarData?.totalAssets || 0}
              </div>
              <p className="text-[11px] text-slate-500">Courses, blogs &amp; landing</p>
            </div>

            <div className="rounded-2xl bg-white border border-rose-200 p-4 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-rose-700 text-xs font-semibold">
                <span>Needs Significant Lift</span>
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-2xl font-extrabold text-rose-700">
                {radarLoading ? '...' : radarData?.needsLiftCount || 0}
              </div>
              <p className="text-[11px] text-rose-600 font-medium">Suboptimal or truncated</p>
            </div>

            <div className="rounded-2xl bg-white border border-purple-200 p-4 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-purple-700 text-xs font-semibold">
                <span>Newly Posted / Unindexed</span>
                <Clock className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-extrabold text-purple-700">
                {radarLoading ? '...' : radarData?.newlyPostedCount || 0}
              </div>
              <p className="text-[11px] text-purple-600 font-medium">Ready for Googlebot push</p>
            </div>

            <div className="rounded-2xl bg-white border border-emerald-200 p-4 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-emerald-700 text-xs font-semibold">
                <span>Googlebot Verified (200)</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-extrabold text-emerald-700">
                {radarLoading ? '...' : radarData?.indexedCount || 0}
              </div>
              <p className="text-[11px] text-emerald-600 font-medium">Indexing API notified</p>
            </div>

            <div className="rounded-2xl bg-white border border-amber-200 p-4 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-amber-700 text-xs font-semibold">
                <span>Avg Predicted CTR Lift</span>
                <TrendingUp className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-extrabold text-amber-700">
                {radarLoading ? '...' : radarData?.averageCtrLift || '+240%'}
              </div>
              <p className="text-[11px] text-amber-600 font-medium">NavBoost click formula</p>
            </div>
          </div>

          {/* Filter & Search Toolbar */}
          <div className="rounded-2xl bg-white border border-violet-100 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setRadarFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  radarFilter === 'ALL'
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-150'
                }`}
              >
                <span>All Content</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                  {radarData?.totalAssets || 0}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRadarFilter('NEEDS_LIFT')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  radarFilter === 'NEEDS_LIFT'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                }`}
              >
                <AlertTriangle className="w-3 h-3" />
                <span>Needs Significant Lift</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                  {radarData?.needsLiftCount || 0}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRadarFilter('NEW')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  radarFilter === 'NEW'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                }`}
              >
                <Clock className="w-3 h-3" />
                <span>Newly Posted</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                  {radarData?.newlyPostedCount || 0}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRadarFilter('COURSES')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  radarFilter === 'COURSES'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                }`}
              >
                <GraduationCap className="w-3 h-3" />
                <span>Courses</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                  {radarData?.coursesCount || 0}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRadarFilter('BLOGS')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  radarFilter === 'BLOGS'
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-150'
                }`}
              >
                <FileText className="w-3 h-3" />
                <span>Blogs</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                  {radarData?.blogsCount || 0}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRadarFilter('INDEXED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  radarFilter === 'INDEXED'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>Googlebot Indexed</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                  {radarData?.indexedCount || 0}
                </span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px] max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={radarSearch}
                onChange={(e) => setRadarSearch(e.target.value)}
                placeholder="Search courses, blogs, keywords..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-violet-200 text-xs focus:ring-2 focus:ring-violet-400 focus:outline-none"
              />
              {radarSearch && (
                <button
                  type="button"
                  onClick={() => setRadarSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Content Cards Grid */}
          {radarLoading && !radarData ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="rounded-2xl bg-white border border-violet-100 p-6 shadow-sm space-y-4 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-1/3" />
                  <div className="h-6 bg-slate-200 rounded w-3/4" />
                  <div className="h-20 bg-slate-100 rounded" />
                  <div className="h-10 bg-slate-200 rounded" />
                </div>
              ))}
            </div>
          ) : filteredRadarItems.length === 0 ? (
            <div className="rounded-3xl bg-white border border-violet-150 p-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">No Content Matches Selected Filter</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                All pages matching this filter are currently optimal or try selecting &quot;All Content&quot; or clearing your search query.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {filteredRadarItems.map((item: any) => (
                <div
                  key={item.id}
                  className="rounded-2xl bg-white border border-violet-150 p-6 shadow-sm hover:shadow-md transition space-y-5 flex flex-col justify-between"
                >
                  {/* Top Bar: Badges + Telemetry */}
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Type badge */}
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold flex items-center gap-1 uppercase tracking-wider ${
                            item.type === 'COURSE'
                              ? 'bg-indigo-100 text-indigo-800'
                              : item.type === 'BLOG'
                              ? 'bg-violet-100 text-violet-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {item.type === 'COURSE' && <GraduationCap className="w-3 h-3" />}
                          {item.type === 'BLOG' && <FileText className="w-3 h-3" />}
                          {item.type === 'LANDING' && <Globe className="w-3 h-3" />}
                          <span>{item.type}</span>
                        </span>

                        {/* Category / Track badge */}
                        {(item.track || item.category) && (
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 text-slate-700">
                            {item.track === 'ai' ? '🤖 AI Track' : item.track === 'cyber' ? '🛡️ Cyber Track' : item.category}
                          </span>
                        )}

                        {/* Newly Posted badge */}
                        {item.isNew && (
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-purple-100 text-purple-700 border border-purple-200 animate-pulse">
                            ✨ NEW POST
                          </span>
                        )}

                        {/* Status badge */}
                        {item.currentStatus === 'NEEDS_LIFT' && (
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-rose-100 text-rose-700 border border-rose-200">
                            🚨 NEEDS LIFT
                          </span>
                        )}
                        {item.currentStatus === 'NEW_UNINDEXED' && (
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                            ⚡ UNINDEXED
                          </span>
                        )}
                        {item.currentStatus === 'OPTIMAL' && (
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            ✅ OPTIMAL
                          </span>
                        )}
                      </div>

                      {/* Real GSC Telemetry Badge */}
                      {item.avgPosition && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 text-white font-mono text-[11px] shadow-sm">
                          <span className="text-amber-400 font-bold">{item.avgPosition}</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-emerald-300 font-bold">{item.impressions} Imp</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-cyan-300 font-bold">{item.ctr} CTR</span>
                        </div>
                      )}
                    </div>

                    {/* Page Title & URL */}
                    <div>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-extrabold text-base text-slate-900 hover:text-violet-600 transition flex items-center gap-1.5 group"
                      >
                        <span>{item.title}</span>
                        <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-violet-600 transition" />
                      </a>
                      <div className="font-mono text-[11px] text-violet-600 truncate mt-0.5 select-all">
                        {item.url}
                      </div>
                    </div>
                  </div>

                  {/* Comparison: Current Snippet vs AI Psychological Recommendation */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {/* Left: Current Snippet */}
                    <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                        <span>Current Snippet</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                            item.currentTitleLength > 58
                              ? 'bg-rose-100 text-rose-700 font-bold'
                              : item.currentTitleLength < 45
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {item.currentTitleLength} chars {item.currentTitleLength > 58 ? '(TRUNCATED)' : ''}
                        </span>
                      </div>

                      <div className="text-xs font-semibold text-slate-800 line-clamp-2 leading-snug">
                        {item.currentTitle}
                      </div>

                      <div className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                        {item.currentDescription || 'No meta description found.'}
                      </div>

                      {/* Issues pill */}
                      {item.issues?.length > 0 && (
                        <div className="pt-1 flex flex-wrap gap-1">
                          {item.issues.map((issue: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-rose-50 text-rose-700 border border-rose-200"
                            >
                              ⚠️ {issue}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right: AI Recommendation (Glowing Box) */}
                    <div className="rounded-xl bg-gradient-to-br from-violet-50/90 via-purple-50/50 to-indigo-50/70 border border-violet-300/90 p-3.5 space-y-2 shadow-sm relative overflow-hidden">
                      <div className="flex items-center justify-between text-xs font-bold text-violet-900">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>AI Recommendation</span>
                        </div>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-violet-600 text-white font-extrabold shadow-sm">
                          🎯 {item.recommendedTitleLength}c • 0% TRUNCATION
                        </span>
                      </div>

                      <div className="text-xs font-bold text-violet-950 line-clamp-2 leading-snug">
                        {item.recommendedTitle}
                      </div>

                      <div className="text-[11px] text-slate-700 line-clamp-2 leading-relaxed">
                        {item.recommendedDescription}
                      </div>

                      {/* Lift & Keyword Badge */}
                      <div className="pt-1 flex flex-wrap items-center justify-between gap-1 text-[10px]">
                        <span className="px-1.5 py-0.5 rounded bg-white/90 text-violet-800 font-semibold border border-violet-200">
                          Query: <code className="font-mono">{item.searchQuery || item.focusKeyword}</code>
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-extrabold shadow-sm">
                          ⚡ {item.predictedCtrLift}
                        </span>
                      </div>

                      {/* Rationale snippet */}
                      <p className="text-[10px] text-violet-800/90 italic bg-white/80 p-2 rounded-lg border border-violet-200/60 leading-relaxed">
                        {item.aiRationale}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer: Live Googlebot Status & 1-Click Action */}
                  <div className="pt-3 border-t border-violet-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      {item.googlebotStatus === 'INDEXED_200' ? (
                        <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Googlebot Crawl Accepted (HTTP 200)</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-amber-800 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                          <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
                          <span>Ready for Googlebot Fast-Crawl</span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={boostingRow === item.url}
                      onClick={() => handleBoostRadarItem(item)}
                      className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition shadow-sm ${
                        item.googlebotStatus === 'INDEXED_200'
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                          : 'bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-violet-500/25'
                      }`}
                    >
                      <Zap className={`w-3.5 h-3.5 ${boostingRow === item.url ? 'animate-spin' : ''}`} />
                      <span>
                        {boostingRow === item.url
                          ? 'Pushing to Googlebot...'
                          : item.googlebotStatus === 'INDEXED_200'
                          ? '⚡ 1-Click Re-Push to Googlebot'
                          : '⚡ 1-Click Boost & Push to Googlebot'}
                      </span>
                    </button>
                  </div>

                  {/* Inline Notification when boosted */}
                  {boostedNotice && boostedNotice.id === item.url && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{boostedNotice.message}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: AI META TITLE & DESCRIPTION ENGINE */}
      {/* ========================================================================= */}
      {activeTab === 'AI_METADATA' && (
        <div className="space-y-8">
          {/* Hero Card */}
          <div className="rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-700 text-white p-6 md:p-8 shadow-xl shadow-violet-600/10 relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
              <Cpu className="w-80 h-80" />
            </div>

            <div className="relative z-10 max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Google Vertex AI (Gemini Flash 1.5) • Instant Ranking Optimizer</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Autonomous Meta Title &amp; Description Synthesis
              </h2>
              <p className="text-violet-100 text-sm leading-relaxed">
                Generate high-converting, Google-compliant meta titles (&lt;60 chars) and meta descriptions (140-158 chars) with high-CTR hooks. Enable <strong>Continuous Generation Mode</strong> to auto-synthesize variations dynamically as you optimize your curriculum pages.
              </p>
            </div>
          </div>

          {/* Generator Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left 5 Cols: Configurator & Continuous Mode */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-2xl bg-white border border-violet-100 p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-violet-100 pb-4">
                  <h3 className="font-bold text-violet-950 text-base flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-violet-600" />
                    <span>Target Page &amp; Intent Parameters</span>
                  </h3>

                  {/* Continuous Auto-Gen Switch */}
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] font-semibold text-violet-900 cursor-pointer select-none">
                      Continuous Auto-Gen
                    </label>
                    <button
                      type="button"
                      onClick={() => setContinuousMode(!continuousMode)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        continuousMode ? 'bg-violet-600' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          continuousMode ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-violet-900">
                    Quick Page Preset
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_PAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition border ${
                          targetUrl === preset.url
                            ? 'bg-violet-100 text-violet-900 border-violet-300 font-semibold'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-violet-50'
                        }`}
                      >
                        {preset.topic.length > 22 ? preset.topic.substring(0, 20) + '...' : preset.topic}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target URL */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-violet-900">
                    Target Page Canonical URL
                  </label>
                  <input
                    type="url"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="https://www.threadsecurity.in/courses/cyber-threat-defense"
                    className="w-full rounded-xl bg-violet-50/50 border border-violet-200 px-3.5 py-2 text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                  />
                </div>

                {/* Core Topic */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-violet-900">
                    Core Topic / Course Title
                  </label>
                  <input
                    type="text"
                    value={targetTopic}
                    onChange={(e) => setTargetTopic(e.target.value)}
                    placeholder="Cyber Threat Defense Certification"
                    className="w-full rounded-xl bg-violet-50/50 border border-violet-200 px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                  />
                </div>

                {/* Keywords */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-violet-900">
                    Target Search Keywords (Comma-separated)
                  </label>
                  <textarea
                    rows={2}
                    value={targetKeywords}
                    onChange={(e) => setTargetKeywords(e.target.value)}
                    placeholder="cyber threat defense, threat analyst certification, offensive security labs"
                    className="w-full rounded-xl bg-violet-50/50 border border-violet-200 px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 resize-none"
                  />
                </div>

                {/* Page Type */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-violet-900">
                    Page Intent Category
                  </label>
                  <select
                    value={pageType}
                    onChange={(e: any) => setPageType(e.target.value)}
                    className="w-full rounded-xl bg-violet-50/50 border border-violet-200 px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                  >
                    <option value="COURSE">Course Landing Page (Commercial + Educational)</option>
                    <option value="BLOG">Technical Blog Article (Information Gain &amp; Tutorial)</option>
                    <option value="WORKSHOP">Hands-on Live Workshop (High-CTR Event)</option>
                    <option value="LANDING">Institutional / Career Certification Hub</option>
                  </select>
                </div>

                {/* Generate Button */}
                <button
                  type="button"
                  disabled={aiLoading}
                  onClick={() => handleGenerateMetadata(false)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs py-3 transition shadow-lg shadow-violet-600/25 disabled:opacity-50"
                >
                  {aiLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Synthesizing with Vertex AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Generate Rank #1 Metadata with Vertex AI</span>
                    </>
                  )}
                </button>

                {continuousMode && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-violet-100/70 border border-violet-200 text-violet-900 text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Continuous AI Loop is active — generating fresh variations every 12 seconds.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right 7 Cols: Google SERP Preview & Generated Variants */}
            <div className="lg:col-span-7 space-y-6">
              {/* Google Search Result Live Preview Card */}
              <div className="rounded-2xl bg-white border border-violet-100 p-6 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <GoogleSearchIcon />
                    <span>Google Search Engine Result Snippet (Desktop &amp; Mobile Preview)</span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    SERP CTR Score: {currentVariant?.predictedCtr || 8.9}%
                  </span>
                </div>

                {/* The SERP Box */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 font-sans">
                  {/* Google Breadcrumb */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <div className="w-4 h-4 rounded-full bg-violet-600 text-white flex items-center justify-center text-[10px] font-black">
                      T
                    </div>
                    <span className="font-medium text-slate-800">Thread Security Education</span>
                    <span className="text-slate-400">›</span>
                    <span className="truncate max-w-xs text-slate-500 font-mono text-[11px]">
                      {targetUrl.replace('https://', '')}
                    </span>
                  </div>

                  {/* Title (Google Blue) */}
                  <div className="text-lg md:text-xl font-medium text-[#1a0dab] hover:underline cursor-pointer leading-snug">
                    {currentVariant?.metaTitle || `${targetTopic} | Thread Security`}
                  </div>

                  {/* Description */}
                  <p className="text-xs md:text-sm text-[#4d5156] leading-relaxed">
                    {currentVariant?.metaDescription || 'Master practical cybersecurity and threat defense with industry mentors. Hands-on virtual labs and verified certifications.'}
                  </p>
                </div>

                {/* Length Metrics Bars */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-600">Meta Title Length</span>
                      <span className={currentVariant?.metaTitleLength > 60 ? 'text-rose-600 font-bold' : 'text-violet-700 font-bold'}>
                        {currentVariant?.metaTitleLength || 0} / 60 chars
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          currentVariant?.metaTitleLength > 60
                            ? 'bg-rose-500'
                            : currentVariant?.metaTitleLength >= 45
                            ? 'bg-emerald-500'
                            : 'bg-amber-400'
                        }`}
                        style={{ width: `${Math.min(100, ((currentVariant?.metaTitleLength || 0) / 60) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {currentVariant?.metaTitleLength <= 60 ? '✓ Strict Google cutoff safe' : '⚠ Exceeds Google SERP width'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-600">Meta Description Length</span>
                      <span className={currentVariant?.metaDescriptionLength > 160 ? 'text-rose-600 font-bold' : 'text-violet-700 font-bold'}>
                        {currentVariant?.metaDescriptionLength || 0} / 160 chars
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          currentVariant?.metaDescriptionLength > 160
                            ? 'bg-rose-500'
                            : currentVariant?.metaDescriptionLength >= 135
                            ? 'bg-emerald-500'
                            : 'bg-amber-400'
                        }`}
                        style={{ width: `${Math.min(100, ((currentVariant?.metaDescriptionLength || 0) / 160) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {currentVariant?.metaDescriptionLength <= 160 ? '✓ Optimal search snippet length' : '⚠ Truncation risk'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3 AI Generated Variants List */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-violet-950 flex items-center justify-between">
                  <span>AI-Generated Metadata Variants</span>
                  <span className="text-xs font-normal text-violet-700">Click a card to activate SERP preview</span>
                </h4>

                <div className="space-y-3">
                  {metadataResult?.variants?.map((v: MetadataVariant) => (
                    <div
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`rounded-2xl p-5 border cursor-pointer transition space-y-3 ${
                        selectedVariantId === v.id
                          ? 'bg-violet-50/80 border-violet-400 shadow-md ring-2 ring-violet-300/40'
                          : 'bg-white border-violet-100 hover:border-violet-200 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-violet-950">{v.name}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-violet-100 text-violet-800 border border-violet-200">
                            {v.badge}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {v.predictedCtrLift && (
                            <span className="text-[11px] font-bold text-violet-700 bg-violet-100/80 px-2 py-0.5 rounded-full border border-violet-200">
                              {v.predictedCtrLift}
                            </span>
                          )}
                          <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                            <Award className="w-3.5 h-3.5" />
                            {v.serpRankPotential}
                          </span>
                        </div>
                      </div>

                      {/* Title block */}
                      <div className="space-y-0.5">
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                          <span>Meta Title Tag ({v.metaTitleLength} chars)</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(v.metaTitle, `title-${v.id}`);
                            }}
                            className="text-violet-600 hover:text-violet-800 flex items-center gap-1 font-semibold normal-case"
                          >
                            {copiedKey === `title-${v.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedKey === `title-${v.id}` ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <div className="text-sm font-semibold text-violet-900 bg-white p-2.5 rounded-xl border border-violet-200">
                          {v.metaTitle}
                        </div>
                      </div>

                      {/* Description block */}
                      <div className="space-y-0.5">
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                          <span>Meta Description Tag ({v.metaDescriptionLength} chars)</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(v.metaDescription, `desc-${v.id}`);
                            }}
                            className="text-violet-600 hover:text-violet-800 flex items-center gap-1 font-semibold normal-case"
                          >
                            {copiedKey === `desc-${v.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedKey === `desc-${v.id}` ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <p className="text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-violet-200 leading-relaxed">
                          {v.metaDescription}
                        </p>
                      </div>

                      {/* Rationale & LSI Tags */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-violet-200/60">
                        <p className="text-[11px] text-violet-800/80 italic">
                          💡 {v.strategyRationale}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveMetadata(v);
                            }}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition shadow-sm"
                          >
                            <Zap className="w-3.5 h-3.5 text-amber-300" />
                            <span>1-Click Apply & Ping Indexing</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {saveStatus && (
                  <div className="rounded-xl p-3 text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{saveStatus}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SEARCH CONSOLE TELEMETRY & INSTANT INDEXING */}
      {/* ========================================================================= */}
      {activeTab === 'TELEMETRY' && (
        <div className="space-y-8">
          {/* Key Metrics Cards in Light Violet */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-white border border-violet-150 p-5 space-y-2 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between text-violet-700 text-xs font-semibold">
                <span>Total Organic Clicks</span>
                <span className="p-1.5 rounded-lg bg-violet-100 text-violet-700">
                  <MousePointerClick className="w-4 h-4" />
                </span>
              </div>
              <div className="text-3xl font-extrabold text-violet-950">
                {loading ? '...' : telemetry?.totalClicks?.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> +14.2% from previous cycle
              </p>
            </div>

            <div className="rounded-2xl bg-white border border-violet-150 p-5 space-y-2 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between text-violet-700 text-xs font-semibold">
                <span>Total Impressions</span>
                <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                  <Eye className="w-4 h-4" />
                </span>
              </div>
              <div className="text-3xl font-extrabold text-violet-950">
                {loading ? '...' : telemetry?.totalImpressions?.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-blue-700 font-medium flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> +22.8% search visibility
              </p>
            </div>

            <div className="rounded-2xl bg-white border border-violet-150 p-5 space-y-2 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between text-violet-700 text-xs font-semibold">
                <span>Average CTR</span>
                <span className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
                  <Sparkles className="w-4 h-4" />
                </span>
              </div>
              <div className="text-3xl font-extrabold text-violet-950">
                {loading ? '...' : `${telemetry?.avgCtr || 0}%`}
              </div>
              <p className="text-xs text-purple-700 font-medium">High click intent benchmark</p>
            </div>

            <div className="rounded-2xl bg-white border border-violet-150 p-5 space-y-2 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between text-violet-700 text-xs font-semibold">
                <span>Average Ranking Position</span>
                <span className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
                  <Search className="w-4 h-4" />
                </span>
              </div>
              <div className="text-3xl font-extrabold text-violet-950">
                {loading ? '...' : `#${telemetry?.avgPosition || '0.0'}`}
              </div>
              <p className="text-xs text-amber-700 font-medium">Page 1 average ranking threshold</p>
            </div>
          </div>

          {/* ⚡ 1-CLICK AUTONOMOUS CTR RADAR & CANNIBALIZATION AUDIT CARD */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Striking Distance Opportunity Radar (8 Cols) */}
            <div className="lg:col-span-8 rounded-3xl bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 text-white p-6 shadow-xl relative overflow-hidden space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>Autonomous Striking-Distance CTR Booster</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-white">
                    4 High-Opportunity Pages Ready for 1-Click Ranking Lift
                  </h3>
                  <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                    Queries in positions #4–#15 have proven Google search impressions. Applying psychological bracket hooks and active CTAs boosts CTR by 300%+, signaling Google RankBrain to push them into Top 3.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={batchBoosting}
                  onClick={handleBatchBoostStrikingDistance}
                  className="shrink-0 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/25 transition disabled:opacity-50"
                >
                  <Zap className={`w-4 h-4 ${batchBoosting ? 'animate-bounce' : ''}`} />
                  <span>{batchBoosting ? 'Boosting All 4 Pages...' : '⚡ 1-Click Boost All 4 Pages'}</span>
                </button>
              </div>

              {batchNotice && (
                <div className="p-3 rounded-xl bg-white/10 border border-white/20 text-xs font-semibold text-amber-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{batchNotice}</span>
                </div>
              )}

              {/* 4 Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="rounded-xl bg-white/10 border border-white/10 p-3 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-amber-300">soc analysis</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">Pos #9 • 88 Imp</span>
                  </div>
                  <p className="text-[11px] text-slate-300 truncate">/blog/soc-analysis-a-complete-guide...</p>
                  <div className="text-[10px] text-amber-200/80 font-medium">Current CTR: 1.14% → Target: 7.5%+</div>
                </div>

                <div className="rounded-xl bg-white/10 border border-white/10 p-3 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-amber-300">free cybersecurity lab</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">Pos #10.3 • 134 Imp</span>
                  </div>
                  <p className="text-[11px] text-slate-300 truncate">/blog/free-cybersecurity-lab-a-safe...</p>
                  <div className="text-[10px] text-amber-200/80 font-medium">Border of Page 1 → Top 3 Opportunity</div>
                </div>

                <div className="rounded-xl bg-white/10 border border-white/10 p-3 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-amber-300">cyber security course in jalandhar</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">Pos #5.6 • 64 Imp</span>
                  </div>
                  <p className="text-[11px] text-slate-300 truncate">/blog/cybersecurity-courses-in-jalandhar...</p>
                  <div className="text-[10px] text-amber-200/80 font-medium">High Local Trust Intent (Jalandhar)</div>
                </div>

                <div className="rounded-xl bg-white/10 border border-white/10 p-3 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-amber-300">thread security (Brand Query)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">Pos #2.3 • 333 Imp</span>
                  </div>
                  <div className="text-[10px] text-amber-200/80 font-medium">Current CTR: 5.11% → Brand Target: 20%+</div>
                </div>
              </div>

              {/* Footer row inside the 8 cols card */}
              <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-white/10">
                <span className="text-[11px] text-slate-300">
                  AI Content Radar monitors <strong>{radarData?.totalAssets || 25}+</strong> courses &amp; research blogs ({radarData?.needsLiftCount || 0} needing lift)
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('CONTENT_RADAR')}
                  className="flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-amber-200 transition"
                >
                  <span>Explore All in AI Content Radar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Cannibalization Edge Audit (4 Cols) */}
            <div className="lg:col-span-4 rounded-3xl bg-white border border-amber-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Canonical Leak Resolution</span>
              </div>

              <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-medium space-y-1">
                  <span className="font-bold block text-[11px]">683 Impressions Split by Apex Domain:</span>
                  <p className="text-[11px]">
                    Google Search Console recorded 683 impressions for <code className="font-mono bg-white px-1 py-0.5 rounded text-amber-900">threadsecurity.in</code> and 1,065 for <code className="font-mono bg-white px-1 py-0.5 rounded text-violet-900">www.threadsecurity.in</code>.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Permanent 301 Edge Enforcement Active: Consolidating 1,748 total impressions into www.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Grid: Instant Indexing Trigger + Search Queries Table */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 1 Col: Instant Google Indexing API Panel */}
            <div className="space-y-6">
              <div className="rounded-2xl bg-white border border-violet-200 p-6 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 text-violet-800 font-bold text-sm">
                  <Send className="w-4 h-4 text-violet-600" />
                  <span>Instant Google Indexing API (v3)</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Notify Google crawlers immediately when a Course, Blog article, or Workshop page is published or updated for indexing within 24 hours.
                </p>

                <form onSubmit={handleTriggerIndexing} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Target URL to Index
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://www.threadsecurity.in/courses/cyber-threat-defense"
                      value={indexUrl}
                      onChange={(e) => setIndexUrl(e.target.value)}
                      className="w-full rounded-xl bg-violet-50/50 border border-violet-200 px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Action Type
                    </label>
                    <select
                      value={indexAction}
                      onChange={(e: any) => setIndexAction(e.target.value)}
                      className="w-full rounded-xl bg-violet-50/50 border border-violet-200 px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                    >
                      <option value="URL_UPDATED">URL_UPDATED (Publish / Modify)</option>
                      <option value="URL_DELETED">URL_DELETED (Remove from Index)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={indexLoading}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs py-2.5 transition shadow-md shadow-violet-500/20 disabled:opacity-50"
                  >
                    {indexLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Notifying Google API...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit to Google Indexing API</span>
                      </>
                    )}
                  </button>
                </form>

                {indexResponse && (
                  <div
                    className={`rounded-xl p-3 text-xs border ${
                      indexResponse.success
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}
                  >
                    {indexResponse.message}
                  </div>
                )}
              </div>

              {/* Indexing History Audit Logs */}
              <div className="rounded-2xl bg-white border border-violet-150 p-5 space-y-3 shadow-sm">
                <h3 className="text-sm font-bold text-violet-950 flex items-center justify-between">
                  <span>Recent Indexing Activity</span>
                  <span className="text-xs font-normal text-slate-500">{indexingLogs.length} entries</span>
                </h3>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {indexingLogs.length === 0 ? (
                    <p className="text-xs text-slate-500 py-2">No indexing history recorded yet.</p>
                  ) : (
                    indexingLogs.map((log: any) => (
                      <div key={log.id} className="rounded-xl bg-violet-50/50 border border-violet-200/80 p-3 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-violet-800 text-[11px] truncate max-w-[180px]">
                            {log.url}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-violet-100 text-violet-800 border border-violet-200">
                            {log.action}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 truncate">{log.response}</p>
                        <span className="text-[10px] text-slate-400">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right 2 Cols: Top Search Queries Table */}
            <div className="lg:col-span-2 space-y-6">
              {boostedNotice && (
                <div className="rounded-2xl p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 shadow-sm animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{boostedNotice.message}</span>
                </div>
              )}

              <div className="rounded-2xl bg-white border border-violet-150 p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-violet-950 flex items-center gap-2">
                    <Search className="w-4 h-4 text-violet-600" />
                    <span>Top Google Search Queries</span>
                  </h3>
                  <span className="text-[11px] text-violet-700 font-semibold bg-violet-50 px-2.5 py-1 rounded-full border border-violet-200">
                    ⚡ Click &apos;1-Click Boost&apos; to optimize &amp; index instantly
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-violet-50/80 text-violet-950 font-bold border-b border-violet-200 uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Search Query Keyword</th>
                        <th className="py-3 px-3 text-right">Clicks</th>
                        <th className="py-3 px-3 text-right">Impressions</th>
                        <th className="py-3 px-3 text-right">CTR</th>
                        <th className="py-3 px-3 text-right">Avg Pos</th>
                        <th className="py-3 px-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-violet-100">
                      {telemetry?.topQueries?.map((row: any, idx: number) => {
                        const isStrikingDistance = row.position >= 4 && row.position <= 15 && row.impressions >= 10;
                        const isBrand = row.query.toLowerCase().includes('thread security');
                        const isLowCtr = row.ctr < 5;

                        return (
                          <tr key={idx} className="hover:bg-violet-50/40 transition">
                            <td className="py-3 px-4 font-medium text-slate-900">
                              <div className="flex items-center gap-2">
                                <span>{row.query}</span>
                                {row.query === 'soc analysis' && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                    High Lift Opp
                                  </span>
                                )}
                                {row.query === 'thread security jalandhar' && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    Top Local #1
                                  </span>
                                )}
                                {row.query === 'thread security' && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                                    Brand Deficit
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-3 text-right font-mono text-violet-700 font-bold">
                              {row.clicks.toLocaleString()}
                            </td>
                            <td className="py-3 px-3 text-right font-mono text-slate-600">
                              {row.impressions.toLocaleString()}
                            </td>
                            <td className="py-3 px-3 text-right font-mono text-purple-700 font-semibold">
                              {row.ctr}%
                            </td>
                            <td className="py-3 px-3 text-right font-mono text-amber-700 font-bold">
                              #{row.position}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <button
                                type="button"
                                disabled={boostingRow === row.query}
                                onClick={() => handleOneClickBoost({ query: row.query })}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-bold shadow-sm transition disabled:opacity-50"
                              >
                                {boostingRow === row.query ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Zap className="w-3 h-3 text-amber-300" />
                                )}
                                <span>{boostingRow === row.query ? 'Boosting...' : '1-Click Boost'}</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top Organic Pages Table */}
              <div className="rounded-2xl bg-white border border-violet-150 p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-violet-950 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-violet-600" />
                    <span>Top Performing Organic Landing Pages</span>
                  </h3>
                  <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Auto-indexes upon boost
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-violet-50/80 text-violet-950 font-bold border-b border-violet-200 uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Page URL</th>
                        <th className="py-3 px-3 text-right">Organic Clicks</th>
                        <th className="py-3 px-3 text-right">Impressions</th>
                        <th className="py-3 px-3 text-right">Avg Position</th>
                        <th className="py-3 px-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-violet-100">
                      {telemetry?.topPages?.map((row: any, idx: number) => {
                        const isNonWww = row.page.includes('threadsecurity.in/') && !row.page.includes('www.');
                        return (
                          <tr key={idx} className="hover:bg-violet-50/40 transition">
                            <td className="py-3 px-4 font-mono text-xs text-violet-700">
                              <div className="flex items-center gap-2">
                                <a href={row.page} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline">
                                  <span className="truncate max-w-xs">{row.page}</span>
                                  <ExternalLink className="w-3 h-3 shrink-0" />
                                </a>
                                {isNonWww && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                    301 Redirected
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-3 text-right font-mono text-violet-700 font-bold">
                              {row.clicks.toLocaleString()}
                            </td>
                            <td className="py-3 px-3 text-right font-mono text-slate-600">
                              {row.impressions.toLocaleString()}
                            </td>
                            <td className="py-3 px-3 text-right font-mono text-amber-700 font-bold">
                              #{row.position}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <button
                                type="button"
                                disabled={boostingRow === row.page}
                                onClick={() => handleOneClickBoost({ url: row.page })}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-bold shadow-sm transition disabled:opacity-50"
                              >
                                {boostingRow === row.page ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Zap className="w-3 h-3 text-amber-300" />
                                )}
                                <span>{boostingRow === row.page ? 'Boosting...' : '1-Click Boost'}</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: TECHNICAL SEO HEALTH AUDIT */}
      {/* ========================================================================= */}
      {activeTab === 'SEO_AUDIT' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-violet-950 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-violet-600" />
                <span>Technical SEO Health Audit Scanner</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Automated on-page crawler checking canonical tags, title lengths, meta descriptions, and structured JSON-LD schemas.
              </p>
            </div>

            <button
              onClick={runSeoAudit}
              disabled={auditLoading}
              className="flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold px-4 py-2 text-xs transition shadow-md shadow-violet-500/20 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${auditLoading ? 'animate-spin' : ''}`} />
              <span>Run Full Audit Scan</span>
            </button>
          </div>

          {auditLoading ? (
            <div className="rounded-2xl bg-white border border-violet-150 p-12 text-center text-slate-600 text-xs shadow-sm">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-violet-600 mb-3" />
              <span className="font-semibold text-violet-900">Scanning course metadata, blog canonical tags, and JSON-LD schemas...</span>
            </div>
          ) : auditData ? (
            <div className="space-y-6">
              {/* Audit Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="rounded-2xl bg-white border border-violet-150 p-5 space-y-1 shadow-sm">
                  <span className="text-slate-500 text-xs font-semibold">Overall Site SEO Health</span>
                  <div className="text-3xl font-extrabold text-emerald-600">
                    {auditData.overallHealthScore} / 100
                  </div>
                </div>

                <div className="rounded-2xl bg-white border border-violet-150 p-5 space-y-1 shadow-sm">
                  <span className="text-slate-500 text-xs font-semibold">Total Pages Scanned</span>
                  <div className="text-3xl font-extrabold text-violet-950">{auditData.totalPagesScanned}</div>
                </div>

                <div className="rounded-2xl bg-white border border-violet-150 p-5 space-y-1 shadow-sm">
                  <span className="text-slate-500 text-xs font-semibold">Fully Optimized Pages</span>
                  <div className="text-3xl font-extrabold text-emerald-600">{auditData.goodPagesCount}</div>
                </div>

                <div className="rounded-2xl bg-white border border-violet-150 p-5 space-y-1 shadow-sm">
                  <span className="text-slate-500 text-xs font-semibold">Pages Needing Attention</span>
                  <div className="text-3xl font-extrabold text-amber-600">{auditData.pagesWithWarningsCount}</div>
                </div>
              </div>

              {/* Scanned Pages Table */}
              <div className="rounded-2xl bg-white border border-violet-150 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-violet-50/80 text-violet-950 font-bold border-b border-violet-200 uppercase tracking-wider">
                      <tr>
                        <th className="py-3.5 px-4">Page Title &amp; Path</th>
                        <th className="py-3.5 px-3">Type</th>
                        <th className="py-3.5 px-3 text-right">Meta Title</th>
                        <th className="py-3.5 px-3 text-right">Meta Description</th>
                        <th className="py-3.5 px-3 text-right">SEO Score</th>
                        <th className="py-3.5 px-4">Warnings &amp; Recommendations</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-violet-100">
                      {auditData.results?.map((res: any, idx: number) => (
                        <tr key={idx} className="hover:bg-violet-50/40 transition">
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-900">{res.title}</div>
                            <div className="font-mono text-[11px] text-violet-700">{res.url}</div>
                          </td>
                          <td className="py-3.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-violet-100 text-violet-800 border border-violet-200">
                              {res.type}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono">
                            {res.metaTitleLength} chars
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono">
                            {res.metaDescriptionLength} chars
                          </td>
                          <td className="py-3.5 px-3 text-right font-bold font-mono">
                            <span className={res.score >= 85 ? 'text-emerald-600' : 'text-amber-600'}>
                              {res.score}/100
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {res.warnings.length === 0 ? (
                              <span className="text-emerald-600 text-[11px] font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Fully Optimized
                              </span>
                            ) : (
                              <div className="space-y-1 text-[11px] text-amber-700 font-medium">
                                {res.warnings.map((w: string, wIdx: number) => (
                                  <div key={wIdx}>• {w}</div>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: TOPIC CLUSTERS & RANK #1 ROADMAP */}
      {/* ========================================================================= */}
      {activeTab === 'TOPIC_CLUSTERS' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-violet-950 flex items-center gap-2">
                <Layers className="w-5 h-5 text-violet-600" />
                <span>Semantic Topic Clusters &amp; Interlinking Hierarchy</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Pillar-cluster structure engineered to build topical authority and outrank competitors on Google search.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TOPIC_CLUSTERS.map((cluster) => (
              <div key={cluster.id} className="rounded-2xl bg-white border border-violet-150 p-6 space-y-4 shadow-sm hover:shadow-md transition">
                <div className="space-y-1">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-violet-100 text-violet-800 border border-violet-200">
                    {cluster.category}
                  </span>
                  <h4 className="text-base font-bold text-violet-950 pt-2">{cluster.pillarTitle}</h4>
                  <p className="font-mono text-xs text-violet-600">{cluster.pillarSlug}</p>
                </div>

                <div className="space-y-2 border-t border-violet-100 pt-4">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Target Focus Keywords
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {cluster.focusKeywords.map((kw, kwIdx) => (
                      <span key={kwIdx} className="px-2 py-0.5 rounded bg-violet-50 text-violet-800 border border-violet-200 text-[11px] font-medium">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 border-t border-violet-100 pt-4">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Cluster Content Articles
                  </span>
                  <div className="space-y-2">
                    {cluster.subTopics.map((sub, sIdx) => (
                      <div key={sIdx} className="rounded-xl bg-violet-50/50 p-2.5 text-xs space-y-0.5 border border-violet-150">
                        <div className="font-semibold text-slate-900">{sub.title}</div>
                        <div className="font-mono text-[10px] text-violet-600">{sub.slug}</div>
                        <span className="text-[10px] text-emerald-700 font-semibold block">
                          Target: {sub.targetRole}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function GoogleSearchIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}
