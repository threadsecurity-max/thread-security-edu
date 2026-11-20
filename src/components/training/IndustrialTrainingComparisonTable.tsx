'use client';

import React, { useState } from 'react';
import {
  PROGRAM_COMPARISON_TRACKS,
  ProgramComparisonTrack,
} from '@/data/industrialTrainingCities';
import {
  CheckCircle2,
  Clock,
  Award,
  Terminal,
  Shield,
  Brain,
  FileCheck2,
  Briefcase,
  Layers,
  Sparkles,
} from 'lucide-react';

interface ComparisonTableProps {
  cityName?: string;
}

export function IndustrialTrainingComparisonTable({ cityName }: ComparisonTableProps) {
  const [selectedMobileTab, setSelectedMobileTab] = useState<'both' | '45-days' | '6-months'>('both');
  const tracks = PROGRAM_COMPARISON_TRACKS;

  return (
    <div className="w-full space-y-6">
      {/* Mobile Tab Filter (visible only on small screens) */}
      <div className="flex md:hidden items-center justify-center p-1 bg-slate-100 rounded-xl border border-slate-200">
        <button
          type="button"
          onClick={() => setSelectedMobileTab('both')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            selectedMobileTab === 'both' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          Compare Both
        </button>
        <button
          type="button"
          onClick={() => setSelectedMobileTab('45-days')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            selectedMobileTab === '45-days' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          45 Days
        </button>
        <button
          type="button"
          onClick={() => setSelectedMobileTab('6-months')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            selectedMobileTab === '6-months' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          6 Months
        </button>
      </div>

      {/* Semantic Comparison Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left text-xs sm:text-sm border-collapse" aria-label="Comparison between 45-Day Summer Training and 6-Month Industrial Training">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th scope="col" className="p-4 sm:p-5 font-bold text-slate-700 w-1/4 min-w-[140px]">
                Program Dimension
              </th>
              {(selectedMobileTab === 'both' || selectedMobileTab === '45-days') && (
                <th scope="col" className="p-4 sm:p-5 font-bold text-slate-950 w-3/8 min-w-[260px] bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                    <span>45-Day Summer Training</span>
                  </div>
                  <span className="block text-xs font-normal text-slate-500 mt-0.5">
                    Fast-Track Sprint (6 Weeks)
                  </span>
                </th>
              )}
              {(selectedMobileTab === 'both' || selectedMobileTab === '6-months') && (
                <th scope="col" className="p-4 sm:p-5 font-bold text-slate-950 w-3/8 min-w-[260px] bg-purple-50/40">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600 shrink-0" />
                    <span>6-Month Industrial Training</span>
                  </div>
                  <span className="block text-xs font-normal text-slate-500 mt-0.5">
                    Full-Semester Fellowship (24 Weeks)
                  </span>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {/* Row 1: Target Audience */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <th scope="row" className="p-4 font-semibold text-slate-900 bg-slate-50/30 align-top">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>Target Students &amp; Stage</span>
                </div>
              </th>
              {(selectedMobileTab === 'both' || selectedMobileTab === '45-days') && (
                <td className="p-4 align-top">
                  <p className="font-semibold text-slate-900">{tracks[0].targetAudience}</p>
                  <p className="text-xs text-slate-500 mt-1">{tracks[0].academicFit}</p>
                </td>
              )}
              {(selectedMobileTab === 'both' || selectedMobileTab === '6-months') && (
                <td className="p-4 align-top bg-purple-50/15">
                  <p className="font-semibold text-slate-900">{tracks[1].targetAudience}</p>
                  <p className="text-xs text-slate-500 mt-1">{tracks[1].academicFit}</p>
                </td>
              )}
            </tr>

            {/* Row 2: Daily Commitment */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <th scope="row" className="p-4 font-semibold text-slate-900 bg-slate-50/30 align-top">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>Daily Commitment</span>
                </div>
              </th>
              {(selectedMobileTab === 'both' || selectedMobileTab === '45-days') && (
                <td className="p-4 align-top">
                  <span className="inline-block px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200/60">
                    {tracks[0].dailyCommitment}
                  </span>
                </td>
              )}
              {(selectedMobileTab === 'both' || selectedMobileTab === '6-months') && (
                <td className="p-4 align-top bg-purple-50/15">
                  <span className="inline-block px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200/60">
                    {tracks[1].dailyCommitment}
                  </span>
                </td>
              )}
            </tr>

            {/* Row 3: Cybersecurity Track Curriculum */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <th scope="row" className="p-4 font-semibold text-slate-900 bg-slate-50/30 align-top">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Cybersecurity Track</span>
                </div>
              </th>
              {(selectedMobileTab === 'both' || selectedMobileTab === '45-days') && (
                <td className="p-4 align-top">
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {tracks[0].cyberTrackCurriculum.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </td>
              )}
              {(selectedMobileTab === 'both' || selectedMobileTab === '6-months') && (
                <td className="p-4 align-top bg-purple-50/15">
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {tracks[1].cyberTrackCurriculum.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </td>
              )}
            </tr>

            {/* Row 4: AI & Machine Learning Track */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <th scope="row" className="p-4 font-semibold text-slate-900 bg-slate-50/30 align-top">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>AI &amp; Automation Track</span>
                </div>
              </th>
              {(selectedMobileTab === 'both' || selectedMobileTab === '45-days') && (
                <td className="p-4 align-top">
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {tracks[0].aiTrackCurriculum.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </td>
              )}
              {(selectedMobileTab === 'both' || selectedMobileTab === '6-months') && (
                <td className="p-4 align-top bg-purple-50/15">
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {tracks[1].aiTrackCurriculum.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </td>
              )}
            </tr>

            {/* Row 5: Lab Infrastructure */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <th scope="row" className="p-4 font-semibold text-slate-900 bg-slate-50/30 align-top">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-slate-600 shrink-0" />
                  <span>Lab Environment</span>
                </div>
              </th>
              {(selectedMobileTab === 'both' || selectedMobileTab === '45-days') && (
                <td className="p-4 align-top text-xs">
                  <p className="font-medium text-slate-800">{tracks[0].labEnvironment}</p>
                </td>
              )}
              {(selectedMobileTab === 'both' || selectedMobileTab === '6-months') && (
                <td className="p-4 align-top text-xs bg-purple-50/15">
                  <p className="font-medium text-slate-800">{tracks[1].labEnvironment}</p>
                </td>
              )}
            </tr>

            {/* Row 6: Capstone Deliverable */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <th scope="row" className="p-4 font-semibold text-slate-900 bg-slate-50/30 align-top">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Capstone Deliverable</span>
                </div>
              </th>
              {(selectedMobileTab === 'both' || selectedMobileTab === '45-days') && (
                <td className="p-4 align-top text-xs">
                  <p className="font-semibold text-slate-900">{tracks[0].capstoneDeliverable}</p>
                </td>
              )}
              {(selectedMobileTab === 'both' || selectedMobileTab === '6-months') && (
                <td className="p-4 align-top text-xs bg-purple-50/15">
                  <p className="font-semibold text-slate-900">{tracks[1].capstoneDeliverable}</p>
                </td>
              )}
            </tr>

            {/* Row 7: University Documentation & Viva Prep */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <th scope="row" className="p-4 font-semibold text-slate-900 bg-slate-50/30 align-top">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>University Paperwork</span>
                </div>
              </th>
              {(selectedMobileTab === 'both' || selectedMobileTab === '45-days') && (
                <td className="p-4 align-top">
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {tracks[0].universityPaperwork.map((doc, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </td>
              )}
              {(selectedMobileTab === 'both' || selectedMobileTab === '6-months') && (
                <td className="p-4 align-top bg-purple-50/15">
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {tracks[1].universityPaperwork.map((doc, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </td>
              )}
            </tr>

            {/* Row 8: Placement Support */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <th scope="row" className="p-4 font-semibold text-slate-900 bg-slate-50/30 align-top">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-slate-600 shrink-0" />
                  <span>Placement Support</span>
                </div>
              </th>
              {(selectedMobileTab === 'both' || selectedMobileTab === '45-days') && (
                <td className="p-4 align-top text-xs">
                  <p>{tracks[0].placementSupport}</p>
                </td>
              )}
              {(selectedMobileTab === 'both' || selectedMobileTab === '6-months') && (
                <td className="p-4 align-top text-xs bg-purple-50/15">
                  <p className="font-medium text-slate-950">{tracks[1].placementSupport}</p>
                </td>
              )}
            </tr>

            {/* Row 9: Verifiable Credential */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <th scope="row" className="p-4 font-semibold text-slate-900 bg-slate-50/30 align-top">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Credential Standard</span>
                </div>
              </th>
              {(selectedMobileTab === 'both' || selectedMobileTab === '45-days') && (
                <td className="p-4 align-top">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-900 text-xs font-bold border border-slate-200">
                    <Award className="w-3.5 h-3.5 text-blue-600" />
                    <span>{tracks[0].credentialBadge}</span>
                  </span>
                </td>
              )}
              {(selectedMobileTab === 'both' || selectedMobileTab === '6-months') && (
                <td className="p-4 align-top bg-purple-50/15">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-bold border border-purple-200">
                    <Award className="w-3.5 h-3.5 text-purple-700" />
                    <span>{tracks[1].credentialBadge}</span>
                  </span>
                </td>
              )}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
