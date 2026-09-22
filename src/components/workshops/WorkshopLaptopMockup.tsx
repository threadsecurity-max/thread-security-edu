'use client';

import React, { useState } from 'react';
import { Terminal, Shield, Play, CheckCircle, Cpu, Wifi, Lock, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export function WorkshopLaptopMockup() {
  const [activeTab, setActiveTab] = useState<'terminal' | 'architecture' | 'telemetry'>('terminal');
  const [isRunningCommand, setIsRunningCommand] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    '[INIT] Connecting to Thread Ephemeral Lab Cluster (Region: ap-south-1)...',
    '[SUCCESS] Cloud Sandbox Provisioned: pod-vulnerable-k8s-node-04 (IP: 10.244.1.84)',
    '[INFO] Loading eBPF Kernel Probe: tetragon_sys_execve.o...',
    '[STATUS] BPF Map Mounted at /sys/fs/bpf/thread_execve_map (Size: 4096 entries)',
    '[READY] Listening for unauthorized syscalls and container escape vectors...',
  ]);

  const handleRunNextStep = () => {
    if (isRunningCommand) return;
    setIsRunningCommand(true);
    
    setTimeout(() => {
      setTerminalOutput((prev) => [
        ...prev,
        `[ATTACK TRACE] DETECTED: Process unhooked from namespace pid=84920 (Container Escape Attempt)`,
        `[ALARM] eBPF RingBuffer Event: sys_ptrace invoked targeting host kernel (Severity: HIGH)`,
        `[ENFORCE] OPA Security Guardrail Triggered -> Terminated Pod 10.244.1.84 [BLOCKED 100%]`,
      ]);
      setIsRunningCommand(false);
    }, 800);
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-6 relative">
      {/* ── LAPTOP OUTER GLOW ── */}
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/30 via-fuchsia-500/20 to-indigo-600/30 rounded-[32px] blur-2xl opacity-70 pointer-events-none" />

      {/* ── LAPTOP TOP DISPLAY FRAME ── */}
      <div className="relative rounded-t-[24px] bg-[#0d0816] border-2 border-purple-900/60 p-3 sm:p-4 shadow-[0_25px_60px_rgba(14,8,25,0.9)] backdrop-blur-xl">
        
        {/* Bezel Camera Notch */}
        <div className="flex items-center justify-center gap-1.5 pb-2">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-purple-800 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-purple-400 animate-pulse" />
          </div>
        </div>

        {/* ── LAPTOP SCREEN DISPLAY ── */}
        <div className="rounded-xl bg-[#06030a] border border-purple-900/50 overflow-hidden shadow-inner font-mono text-xs">
          
          {/* Mac Window Control Titlebar */}
          <div className="bg-[#0b0614] border-b border-purple-950 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
            
            {/* Window Buttons */}
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/90 inline-block border border-rose-600/40" />
              <span className="w-3 h-3 rounded-full bg-amber-500/90 inline-block border border-amber-600/40" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/90 inline-block border border-emerald-600/40" />
              
              {/* Tab Selector */}
              <div className="ml-3 flex items-center gap-1 bg-[#050208] p-1 rounded-lg border border-purple-900/50">
                <button
                  onClick={() => setActiveTab('terminal')}
                  className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    activeTab === 'terminal'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                      : 'text-purple-300/70 hover:text-white'
                  }`}
                >
                  live_lab_terminal.sh
                </button>
                <button
                  onClick={() => setActiveTab('architecture')}
                  className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    activeTab === 'architecture'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                      : 'text-purple-300/70 hover:text-white'
                  }`}
                >
                  target_topology.k8s
                </button>
                <button
                  onClick={() => setActiveTab('telemetry')}
                  className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    activeTab === 'telemetry'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                      : 'text-purple-300/70 hover:text-white'
                  }`}
                >
                  ebpf_telemetry.json
                </button>
              </div>
            </div>

            {/* Right Status Indicator */}
            <div className="flex items-center gap-3 text-[11px] text-purple-300/70">
              <span className="flex items-center gap-1.5 text-purple-300 font-bold">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                <span>EPHEMERAL LAB ONLINE</span>
              </span>
              <span className="hidden sm:inline text-purple-900">|</span>
              <span className="hidden sm:inline font-mono text-purple-300/60">LATENCY: 12ms</span>
            </div>

          </div>

          {/* Screen Content Body */}
          <div className="p-4 sm:p-6 min-h-[300px] max-h-[380px] overflow-y-auto bg-[#040207] text-purple-100 flex flex-col justify-between">
            
            {activeTab === 'terminal' && (
              <div className="space-y-4">
                {/* Lab Module Header */}
                <div className="p-3 rounded-lg bg-[#0a0515] border border-purple-800/40 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-purple-300 font-bold text-xs uppercase tracking-wider">
                      Module 04: eBPF Kernel Probe Instrumentation &amp; Container Breakout Mitigation
                    </p>
                    <p className="text-[11px] text-purple-300/70 font-sans mt-0.5">
                      Target Pod: <code className="text-purple-200 bg-purple-950/80 px-1.5 py-0.5 rounded border border-purple-800/40">auth-service-v3.2</code> • Sandbox ID: <code className="text-purple-300 font-bold">TS-LAB-89402</code>
                    </p>
                  </div>

                  <button
                    onClick={handleRunNextStep}
                    disabled={isRunningCommand}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold text-xs hover:from-purple-400 hover:to-indigo-500 transition-all cursor-pointer shadow-[0_0_20px_rgba(168,85,247,0.4)] disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>{isRunningCommand ? 'Executing...' : 'Trigger Exploit Payload'}</span>
                  </button>
                </div>

                {/* Live Console Output */}
                <div className="space-y-1.5 font-mono text-xs pt-1">
                  {terminalOutput.map((line, index) => (
                    <div
                      key={index}
                      className={`leading-relaxed ${
                        line.includes('[ALARM]')
                          ? 'text-rose-400 font-bold bg-rose-950/20 p-1 rounded border-l-2 border-rose-500'
                          : line.includes('[ENFORCE]')
                          ? 'text-purple-300 font-bold bg-purple-950/40 p-1 rounded border-l-2 border-purple-400'
                          : line.includes('[SUCCESS]')
                          ? 'text-purple-400 font-bold'
                          : line.includes('[INIT]')
                          ? 'text-purple-300/60'
                          : 'text-purple-200'
                      }`}
                    >
                      {line}
                    </div>
                  ))}
                  <div className="flex items-center gap-2 text-purple-400 pt-2">
                    <span>root@thread-sandbox:~#</span>
                    <span className="w-2 h-4 bg-purple-400 animate-pulse inline-block" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'architecture' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#090513] border border-purple-900/50 space-y-3">
                  <p className="text-xs font-bold text-purple-200 uppercase tracking-wider">
                    Target Infrastructure Topology:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-[#06030b] border border-purple-900/40 text-center">
                      <p className="text-purple-300/60 text-[10px]">INGRESS WAF GATEWAY</p>
                      <p className="font-bold text-purple-300 mt-1">Nginx + OPA Engine</p>
                      <p className="text-[10px] text-purple-400 mt-0.5">● SECURE (TLS 1.3)</p>
                    </div>
                    <div className="p-3 rounded-lg bg-[#06030b] border border-rose-900/50 text-center">
                      <p className="text-purple-300/60 text-[10px]">TARGET MICROSERVICE</p>
                      <p className="font-bold text-rose-400 mt-1">auth-service-v3.2</p>
                      <p className="text-[10px] text-rose-400 mt-0.5">⚠ EXPLOIT VECTOR ACTIVE</p>
                    </div>
                    <div className="p-3 rounded-lg bg-[#06030b] border border-purple-900/40 text-center">
                      <p className="text-purple-300/60 text-[10px]">KERNEL PROBE ENGINE</p>
                      <p className="font-bold text-white mt-1">eBPF Tetragon 1.2</p>
                      <p className="text-[10px] text-purple-300 mt-0.5">● MONITORING (0.2% CPU)</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'telemetry' && (
              <div className="bg-[#080410] p-4 rounded-xl border border-purple-900/50 space-y-2 text-xs font-mono text-purple-200">
                <p className="text-purple-300 font-bold">// REAL-TIME EVENT STREAM HASH:</p>
                <pre className="overflow-x-auto text-[11px] text-purple-300/80 leading-relaxed">
{`{
  "event_type": "K8S_CONTAINER_ESCAPE_ATTEMPT",
  "syscall": "sys_ptrace",
  "target_pid": 84920,
  "source_ip": "10.244.1.84",
  "hash_verification": "0x98f4e92a184f09d84e2098f410",
  "action_taken": "POD_TERMINATED_BY_EBPF_GUARD"
}`}
                </pre>
              </div>
            )}

            {/* Bottom Screen Bar */}
            <div className="pt-4 mt-4 border-t border-purple-950 flex flex-wrap items-center justify-between text-[11px] text-purple-300/60 font-mono">
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                <span>Thread Ephemeral Cloud Sandbox • 100% Isolated Container</span>
              </div>
              <span className="text-purple-300 font-bold">VERIFIED LAB ENVIRONMENT</span>
            </div>

          </div>

        </div>

      </div>

      {/* ── LAPTOP BASE HINGE & KEYBOARD BASE ── */}
      <div className="relative w-[104%] -ml-[2%] h-5 bg-gradient-to-r from-purple-950 via-slate-800 to-purple-950 rounded-b-2xl border-t border-purple-800/60 flex justify-center items-center shadow-2xl">
        <div className="w-16 h-1.5 bg-purple-950 rounded-full border border-purple-800/40" />
      </div>

    </div>
  );
}
