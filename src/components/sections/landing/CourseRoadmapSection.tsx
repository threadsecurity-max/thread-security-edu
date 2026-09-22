'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Brain,
  Layers,
  Clock,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Award,
  Terminal,
  Cpu,
  Lock,
  ChevronRight,
  Zap,
  Code2,
  Workflow,
  Laptop,
  Check,
  User,
  Mail,
  Phone,
  Send,
  FileText,
  Database,
  Cloud,
  Server,
  Star,
  Target,
  Rocket,
  TrendingUp,
  BarChart3,
  CheckCheck,
  MessageSquare,
  Network,
  Volume2,
  VolumeX,
  Sliders
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES & DATA STRUCTURES
// ─────────────────────────────────────────────────────────────────────────────

type DomainType = 'all' | 'ai' | 'cyber';
type DurationType = '45days' | '3months' | '6months';

interface ModuleItem {
  id: string;
  moduleNumber: string;
  tag: string;
  title: string;
  durationText: string;
  description: string;
  topics: string[];
  skillsGained: string[];
  task?: string;
  labsCount: number;
  highlightIcon: React.ReactNode;
}

interface CourseItem {
  id: string;
  slug: string;
  title: string;
  category: 'ai' | 'cyber';
  categoryLabel: string;
  supportedDurations: DurationType[];
  rating: number;
  reviewCount: number;
  badge: string;
  tagline: string;
  highlights: string[];
  level: 'Beginner (From Scratch)' | 'Intermediate' | 'Advanced Fellowship';
  durationData: Partial<Record<DurationType, {
    durationText: string;
    modules: ModuleItem[];
  }>>;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPREHENSIVE COURSES DATA (OFFICIAL BROCHURE CURRICULUM)
// ─────────────────────────────────────────────────────────────────────────────

const COURSES_DATA: CourseItem[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // 6-MONTHS FELLOWSHIP SPECIALIZED AI COURSES
  // ═══════════════════════════════════════════════════════════════════════════
  
  // ── 1. FOUNDATIONAL AI (6 MONTHS) ──
  {
    id: 'foundational-ai',
    slug: 'foundational-ai',
    title: 'Foundational AI',
    category: 'ai',
    categoryLabel: '6 Months Fellowship',
    supportedDurations: ['6months'],
    rating: 4.95,
    reviewCount: 2150,
    badge: 'FLAGSHIP FELLOWSHIP',
    tagline: 'Complete zero-to-senior curriculum: Python, Pandas, Power BI, ML, Deep Learning, FastAPI, SQL & Docker.',
    highlights: ['Zero to Industry Fellowship', '10 Comprehensive Modules', 'Full-Stack Model Deployment', 'Guaranteed Placement Track'],
    level: 'Beginner (From Scratch)',
    durationData: {
      '6months': {
        durationText: '6 Months Comprehensive Fellowship',
        modules: [
          {
            id: 'fai-m1',
            moduleNumber: 'Module 1',
            tag: '3 Weeks',
            title: 'Programming with Python (Fundamentals & Advanced)',
            durationText: '3 WEEKS',
            description: 'Start from absolute scratch: data types, comprehensions, recursion, OOP architecture, and file/exception handling.',
            topics: [
              'Introduction to Python & Environment Setup',
              'Variables, Data Types & Operators',
              'List, Dictionary & Set Comprehensions',
              'Conditional Statements, Loops & Pattern Programming',
              'Functions, Recursion, Modules & Packages',
              'File Handling & Exception Handling',
              'OOP: Classes, Objects, Constructors, Inheritance, Polymorphism, Encapsulation & Abstraction',
            ],
            skillsGained: ['Python 3', 'OOP Architecture', 'Data Structures', 'Comprehensions'],
            labsCount: 16,
            highlightIcon: <Code2 className="w-5 h-5" />,
          },
          {
            id: 'fai-m2',
            moduleNumber: 'Module 2',
            tag: '2 Weeks',
            title: 'Data Analysis with Python (NumPy, Pandas, EDA)',
            durationText: '2 WEEKS',
            description: 'NumPy vectorization, Pandas wrangling, missing value handling, feature engineering, and Matplotlib/Plotly visualizations.',
            topics: [
              'NumPy Arrays, Indexing, Vectorization & Matrix Math',
              'Pandas Series & DataFrames Wrangling',
              'Data Cleaning, Missing Values & Imputation',
              'Feature Engineering, GroupBy, Merge & Concatenation',
              'Matplotlib & Plotly Statistical Visualizations',
              'Exploratory Data Analysis (EDA) Insight Generation',
            ],
            skillsGained: ['NumPy', 'Pandas', 'EDA', 'Plotly'],
            labsCount: 14,
            highlightIcon: <Database className="w-5 h-5" />,
          },
          {
            id: 'fai-m3',
            moduleNumber: 'Module 3',
            tag: '1 Week',
            title: 'Data Analytics with Excel & Reporting',
            durationText: '1 WEEK',
            description: 'Excel modeling, dynamic functions (IF/IFS, XLOOKUP, INDEX-MATCH), and interactive Pivot Dashboards.',
            topics: [
              'Data Formatting, Tables & Named Ranges',
              'Sorting, Filtering, Data Validation & Flash Fill',
              'Functions: IF, IFS, SUMIF, COUNTIF, VLOOKUP, XLOOKUP, INDEX & MATCH',
              'Text & Date Functions for Business Analytics',
              'Pivot Tables, Pivot Charts & Interactive KPI Reporting',
            ],
            skillsGained: ['Excel XLOOKUP', 'Pivot Dashboards', 'KPI Modeling'],
            labsCount: 8,
            highlightIcon: <BarChart3 className="w-5 h-5" />,
          },
          {
            id: 'fai-m4',
            moduleNumber: 'Module 4',
            tag: '1-2 Weeks',
            title: 'Business Intelligence with Power BI',
            durationText: '2 WEEKS',
            description: 'Power BI Desktop, Power Query ETL, Star/Snowflake schemas, and advanced DAX time-intelligence calculations.',
            topics: [
              'Power BI Desktop & Power Query Data Ingestion',
              'Data Modeling: Relationships, Star Schema & Snowflake Schema',
              'DAX Formulas: CALCULATE, FILTER, SWITCH, Measures & Columns',
              'DAX Time Intelligence & Rank Functions (RANKX)',
              'Interactive KPI Dashboards, Drill-Throughs & Slicers',
            ],
            skillsGained: ['Power BI', 'DAX Measures', 'Data Modeling', 'KPI Dashboards'],
            labsCount: 12,
            highlightIcon: <TrendingUp className="w-5 h-5" />,
          },
          {
            id: 'fai-m5',
            moduleNumber: 'Module 5',
            tag: '3 Weeks',
            title: 'Machine Learning Engineering',
            durationText: '3 WEEKS',
            description: 'End-to-end ML lifecycle: supervised regression/classification, unsupervised clustering, PCA, and hyperparameter tuning.',
            topics: [
              'ML Lifecycle, Preprocessing, Scaling & Train-Test Split',
              'Supervised: Linear/Logistic Regression, Decision Trees, Random Forest, SVM, KNN, Naive Bayes',
              'Unsupervised: K-Means, Hierarchical, DBSCAN, PCA, Apriori',
              'Model Evaluation: Confusion Matrix, Precision, Recall, F1, ROC-AUC',
              'Cross Validation & Hyperparameter Optimization',
            ],
            skillsGained: ['Scikit-Learn', 'Supervised ML', 'Clustering & PCA', 'ROC-AUC'],
            labsCount: 18,
            highlightIcon: <Cpu className="w-5 h-5" />,
          },
          {
            id: 'fai-m6',
            moduleNumber: 'Module 6',
            tag: '4 Weeks',
            title: 'Deep Learning Engineering (TensorFlow & PyTorch)',
            durationText: '4 WEEKS',
            description: 'Perceptron math, backprop, TensorFlow & PyTorch, CNN image classification, transfer learning, RNNs/LSTMs, and Transformers.',
            topics: [
              'Neural Networks: Perceptron, ANN, Forward & Backpropagation',
              'Activation Functions, Optimizers (Adam, SGD) & Regularization',
              'TensorFlow & PyTorch Tensor Operations & Model Training',
              'CNNs: Image Classification & Transfer Learning',
              'RNNs, LSTMs & GRUs: Sequential Data & NLP Preprocessing',
              'Introduction to Transformers: Attention Mechanism & BERT vs GPT',
            ],
            skillsGained: ['PyTorch', 'TensorFlow', 'CNN Vision', 'Transformers Intro'],
            labsCount: 22,
            highlightIcon: <Brain className="w-5 h-5" />,
          },
          {
            id: 'fai-m7',
            moduleNumber: 'Module 7',
            tag: '3-4 Weeks',
            title: 'FastAPI & Backend Development',
            durationText: '4 WEEKS',
            description: 'RESTful architecture, FastAPI routing, Pydantic validation, PostgreSQL SQLAlchemy integration, and JWT authentication.',
            topics: [
              'REST API Fundamentals, HTTP Methods, Status Codes & JSON',
              'FastAPI Routing, Path/Query Params, Request/Response Models',
              'PostgreSQL Integration with SQLAlchemy / SQLModel CRUD APIs',
              'Security: JWT Authentication, Password Hashing & Protected Routes',
              'File Upload APIs, Error Handling & Swagger Documentation',
            ],
            skillsGained: ['FastAPI', 'PostgreSQL', 'SQLAlchemy', 'JWT Security'],
            labsCount: 18,
            highlightIcon: <Server className="w-5 h-5" />,
          },
          {
            id: 'fai-m8',
            moduleNumber: 'Module 8',
            tag: '2-3 Weeks',
            title: 'SQL & Database Engineering',
            durationText: '3 WEEKS',
            description: 'Relational database design, normal forms, joins, subqueries, window functions, ACID transactions, and query tuning.',
            topics: [
              'DBMS vs RDBMS, ER Diagrams, Normalization & Constraints',
              'SQL CRUD, Operators, Joins, Subqueries & CTEs',
              'Window Functions & Stored Procedures',
              'ACID Transactions: COMMIT, ROLLBACK, SAVEPOINT & Concurrency',
              'Query Optimization: Indexes, EXPLAIN ANALYZE & Latency Tuning',
              'SQL for AI: Feature Extraction & Time-Series Aggregations',
            ],
            skillsGained: ['Advanced SQL', 'EXPLAIN ANALYZE', 'ACID Transactions', 'Indexing'],
            labsCount: 16,
            highlightIcon: <Database className="w-5 h-5" />,
          },
          {
            id: 'fai-m9',
            moduleNumber: 'Module 9',
            tag: '2 Weeks',
            title: 'AI Application Development with Streamlit',
            durationText: '2 WEEKS',
            description: 'Interactive AI frontends with Streamlit, connecting FastAPI backend microservices for live model inference.',
            topics: [
              'Streamlit Widgets, Session State, Layouts & Forms',
              'Connecting Streamlit with FastAPI Microservices',
              'File Upload Interface & Live Model Inference',
              'Real-Time Predictive Analytics Dashboard Development',
            ],
            skillsGained: ['Streamlit', 'Full-Stack AI Integration', 'Model Serving'],
            labsCount: 12,
            highlightIcon: <Laptop className="w-5 h-5" />,
          },
          {
            id: 'fai-m10',
            moduleNumber: 'Module 10',
            tag: '1 Week',
            title: 'AI Deployment & DevOps Fundamentals',
            durationText: '1 WEEK',
            description: 'Docker containerization, images, Docker Compose, CI/CD concepts, and model versioning workflows.',
            topics: [
              'Git Fundamentals & GitHub Collaboration Workflows',
              'Docker: Images, Containers, Dockerfile & Docker Compose',
              'DevOps Basics: CI/CD Pipelines & Model Versioning',
              'Capstone: Full-Stack AI System Deployed to Cloud',
            ],
            skillsGained: ['Docker', 'CI/CD Pipelines', 'Model Versioning', 'Cloud Hosting'],
            labsCount: 10,
            highlightIcon: <Award className="w-5 h-5" />,
          },
        ],
      },
      '3months': {
        durationText: '3 Months Foundational Mastery',
        modules: [
          {
            id: 'fai-3m1',
            moduleNumber: 'Module 1',
            tag: 'Core Track',
            title: 'Python, Data Analytics & SQL Engineering',
            durationText: '4 WEEKS',
            description: 'Master Python OOP, NumPy/Pandas, SQL window functions, and advanced Excel modeling.',
            topics: ['Python OOP & Vectorized NumPy', 'Pandas Wrangling & Cleaning', 'SQL Joins, CTEs & Window Functions', 'Excel XLOOKUP & Dashboards'],
            skillsGained: ['Python 3', 'Pandas', 'SQL', 'Excel'],
            labsCount: 18,
            highlightIcon: <Code2 className="w-5 h-5" />,
          },
          {
            id: 'fai-3m2',
            moduleNumber: 'Module 2',
            tag: 'Core Track',
            title: 'Machine Learning & Power BI Intelligence',
            durationText: '4 WEEKS',
            description: 'End-to-end supervised and unsupervised ML, model tuning, and Power BI DAX dashboards.',
            topics: ['Supervised & Unsupervised ML Algorithms', 'Power BI DAX & Data Modeling', 'Model Evaluation & Hyperparameter Tuning'],
            skillsGained: ['Scikit-Learn', 'Power BI DAX', 'ML Tuning'],
            labsCount: 16,
            highlightIcon: <Cpu className="w-5 h-5" />,
          },
          {
            id: 'fai-3m3',
            moduleNumber: 'Module 3',
            tag: 'Core Track',
            title: 'Deep Learning, FastAPI & Docker Deployment',
            durationText: '4 WEEKS',
            description: 'PyTorch neural networks, FastAPI model serving, and containerization with Docker.',
            topics: ['PyTorch Neural Networks & CNNs', 'FastAPI REST APIs & Security', 'Docker Deployment & Streamlit Frontend'],
            skillsGained: ['PyTorch', 'FastAPI', 'Docker'],
            labsCount: 16,
            highlightIcon: <Award className="w-5 h-5" />,
          },
        ],
      },
      '45days': {
        durationText: '45 Days Primer',
        modules: [
          {
            id: 'fai-45m1',
            moduleNumber: 'Module 1',
            tag: 'Sprint Track',
            title: 'Python, Data Analysis & Machine Learning Basics',
            durationText: '3 WEEKS',
            description: 'Python fundamentals, Pandas data cleaning, and core supervised machine learning models.',
            topics: ['Python Fundamentals & OOP', 'Pandas & NumPy Data Cleaning', 'Supervised Machine Learning Algorithms'],
            skillsGained: ['Python', 'Pandas', 'ML Basics'],
            labsCount: 12,
            highlightIcon: <Code2 className="w-5 h-5" />,
          },
          {
            id: 'fai-45m2',
            moduleNumber: 'Module 2',
            tag: 'Sprint Track',
            title: 'SQL, Deep Learning & Streamlit Deployment',
            durationText: '3 WEEKS',
            description: 'SQL queries, neural networks in PyTorch, and interactive Streamlit deployment.',
            topics: ['SQL Queries & Joins', 'Neural Network Foundations', 'Streamlit Web Deployment'],
            skillsGained: ['SQL', 'Neural Networks', 'Streamlit'],
            labsCount: 12,
            highlightIcon: <Award className="w-5 h-5" />,
          },
        ],
      },
    },
  },

  // ── 2. AGENTIC AI (6 MONTHS) ──
  {
    id: 'agentic-ai',
    slug: 'agentic-ai',
    title: 'Agentic AI',
    category: 'ai',
    categoryLabel: '6 Months Fellowship',
    supportedDurations: ['6months'],
    rating: 4.95,
    reviewCount: 1780,
    badge: 'AUTONOMOUS SYSTEMS',
    tagline: 'Design autonomous AI agents, LangGraph multi-agent networks, reasoning loops, RAG & enterprise automation.',
    highlights: ['Autonomous Multi-Agent Systems', 'LangGraph & LlamaIndex', 'Knowledge Graphs & RAG', 'Enterprise Tool Calling'],
    level: 'Advanced Fellowship',
    durationData: {
      '6months': {
        durationText: '6 Months Agentic AI Fellowship',
        modules: [
          {
            id: 'agt-m1',
            moduleNumber: 'Module 1',
            tag: '2 Weeks',
            title: 'Foundations of GenAI & Large Language Models',
            durationText: '2 WEEKS',
            description: 'Evolution of AI, transformer architecture, tokenization, embeddings, context windows, and sampling strategies.',
            topics: [
              'Evolution of AI & Generative AI Fundamentals',
              'Transformer Architecture & LLM Mechanics',
              'Decoder-only vs Encoder-Decoder Models',
              'Tokens, Tokenization, Embeddings & Context Windows',
              'Open-source vs Proprietary Models (API vs Local)',
              'AI Application Architecture & Model Selection',
            ],
            skillsGained: ['Transformer Internals', 'Tokenization', 'Context Windows', 'Model Selection'],
            labsCount: 10,
            highlightIcon: <Brain className="w-5 h-5" />,
          },
          {
            id: 'agt-m2',
            moduleNumber: 'Module 2',
            tag: '2 Weeks',
            title: 'Prompt Engineering & AI Reasoning',
            durationText: '2 WEEKS',
            description: 'Zero-shot, few-shot, Chain-of-Thought, ReAct pattern, Tree of Thoughts, and structured JSON outputs.',
            topics: [
              'Prompt Engineering Fundamentals & Best Practices',
              'Zero-shot, One-shot & Few-shot Prompting',
              'Chain-of-Thought, Self-Consistency & Tree of Thoughts',
              'ReAct Pattern & Role Prompting',
              'Structured Outputs & JSON Response Validation',
              'Prompt Optimization & Automated Testing',
            ],
            skillsGained: ['ReAct Pattern', 'Chain-of-Thought', 'Structured JSON', 'Prompt Testing'],
            labsCount: 12,
            highlightIcon: <Zap className="w-5 h-5" />,
          },
          {
            id: 'agt-m3',
            moduleNumber: 'Module 3',
            tag: '2 Weeks',
            title: 'AI Agent Fundamentals & Architecture',
            durationText: '2 WEEKS',
            description: 'Agent lifecycle, planning, reasoning, memory, tool calling, reflection, and human-in-the-loop systems.',
            topics: [
              'What are AI Agents? Architecture & Lifecycle',
              'Planning, Reasoning & Autonomous Decision Making',
              'Tool Calling & Function Execution',
              'Agent Memory (Short-Term, Long-Term & Ephemeral)',
              'Reflection Loops & Self-Correction Mechanisms',
              'Human-in-the-Loop AI Systems',
            ],
            skillsGained: ['Agent Architecture', 'Tool Calling', 'Agent Memory', 'Human-in-the-Loop'],
            labsCount: 14,
            highlightIcon: <Workflow className="w-5 h-5" />,
          },
          {
            id: 'agt-m4',
            moduleNumber: 'Module 4',
            tag: '3 Weeks',
            title: 'Retrieval-Augmented Generation (RAG)',
            durationText: '3 WEEKS',
            description: 'Document chunking strategies, embeddings, semantic search, hybrid retrieval, reranking, and Graph RAG basics.',
            topics: [
              'RAG Architecture & Document Processing Pipelines',
              'Chunking Strategies (Fixed, Semantic, Recursive)',
              'Semantic Search, Vector Similarity & Hybrid Search',
              'Metadata Filtering & Cross-Encoder Reranking',
              'Context Window Management & Query Rewriting',
              'Introduction to Graph RAG & Enterprise Search',
            ],
            skillsGained: ['Advanced RAG', 'Hybrid Search', 'Reranking', 'Graph RAG'],
            labsCount: 16,
            highlightIcon: <Database className="w-5 h-5" />,
          },
          {
            id: 'agt-m5',
            moduleNumber: 'Module 5',
            tag: '2 Weeks',
            title: 'Vector Databases & Knowledge Systems',
            durationText: '2 WEEKS',
            description: 'Vector databases (Pinecone, Chroma, Qdrant, Milvus), indexing, collections, metadata, and ingestion pipelines.',
            topics: [
              'Vector Databases & Embedding Model Selection',
              'Similarity Search, Indexing & Collections',
              'Metadata Management & Partitioning',
              'Knowledge Graphs Integration with Vector Stores',
              'Automated Enterprise Data Ingestion Pipelines',
            ],
            skillsGained: ['Vector DBs', 'Pinecone/Qdrant', 'Knowledge Graphs', 'Ingestion'],
            labsCount: 12,
            highlightIcon: <Database className="w-5 h-5" />,
          },
          {
            id: 'agt-m6',
            moduleNumber: 'Module 6',
            tag: '3 Weeks',
            title: 'Agent Frameworks & Orchestration (LangGraph, LlamaIndex)',
            durationText: '3 WEEKS',
            description: 'Building multi-step stateful workflows with LangChain, LangGraph, LlamaIndex, DSPy, and OpenAI Agents SDK.',
            topics: [
              'LangChain, LangGraph, LlamaIndex & DSPy',
              'OpenAI Agents SDK & Assistants API',
              'Stateful Workflow Design & Agent Routing',
              'Memory Management & Multi-Tool Orchestration',
              'State Persistence & Checkpointing in LangGraph',
            ],
            skillsGained: ['LangGraph', 'LlamaIndex', 'DSPy', 'Stateful Agents'],
            labsCount: 18,
            highlightIcon: <Network className="w-5 h-5" />,
          },
          {
            id: 'agt-m7',
            moduleNumber: 'Module 7',
            tag: '2 Weeks',
            title: 'Multi-Agent Systems Engineering',
            durationText: '2 WEEKS',
            description: 'Multi-agent architectures, inter-agent communication, coordinator pattern, supervisor pattern, and conflict resolution.',
            topics: [
              'Multi-Agent Architectures & Collaboration Protocols',
              'Task Delegation: Coordinator, Planner & Supervisor Patterns',
              'Reflection Loops & Multi-Agent Debate',
              'Conflict Resolution & Distributed Agents',
            ],
            skillsGained: ['Multi-Agent Networks', 'Supervisor Pattern', 'Inter-Agent Comms'],
            labsCount: 14,
            highlightIcon: <Cpu className="w-5 h-5" />,
          },
          {
            id: 'agt-m8',
            moduleNumber: 'Module 8',
            tag: '2 Weeks',
            title: 'Enterprise AI Integration & Automation',
            durationText: '2 WEEKS',
            description: 'Connecting agents to enterprise REST APIs, OAuth, webhooks, CRMs, ERPs, email systems, and calendar automation.',
            topics: [
              'Enterprise APIs, REST Integration, OAuth & Webhooks',
              'CRM & ERP Automation (Salesforce, SAP integrations)',
              'Email & Calendar Automated AI Agents',
              'AI Business Process Automation Workflows',
            ],
            skillsGained: ['Enterprise APIs', 'CRM/ERP Automation', 'OAuth Integration'],
            labsCount: 12,
            highlightIcon: <Server className="w-5 h-5" />,
          },
          {
            id: 'agt-m9',
            moduleNumber: 'Module 9',
            tag: '2 Weeks',
            title: 'AI Application Engineering (FastAPI + Streamlit)',
            durationText: '2 WEEKS',
            description: 'Full-stack agentic web applications with FastAPI, Streamlit, chat interfaces, file uploads, and session management.',
            topics: [
              'FastAPI Backend Architecture for Streaming Agents',
              'Streamlit Interactive Chat Interfaces & File Handling',
              'Authentication, Session Management & Rate Limiting',
              'Project Organization & Production Code Structure',
            ],
            skillsGained: ['FastAPI Streaming', 'Streamlit UI', 'Session Management'],
            labsCount: 12,
            highlightIcon: <Laptop className="w-5 h-5" />,
          },
          {
            id: 'agt-m10',
            moduleNumber: 'Module 10',
            tag: '2 Weeks',
            title: 'Deployment, LLMOps & Production Systems',
            durationText: '2 WEEKS',
            description: 'Docker, CI/CD, LLMOps, model versioning, API scaling, observability, cost optimization, caching, and rate limiting.',
            topics: [
              'Docker, Docker Compose & CI/CD Pipelines',
              'LLMOps Lifecycle, Model Registry & Versioning',
              'Monitoring, Logging & Observability (Langfuse / Phoenix)',
              'Cost Optimization, Semantic Caching & Rate Limiting',
              'Capstone: Enterprise Autonomous Multi-Agent Solution',
            ],
            skillsGained: ['LLMOps', 'Langfuse', 'Semantic Caching', 'Docker CI/CD'],
            labsCount: 12,
            highlightIcon: <Award className="w-5 h-5" />,
          },
        ],
      },
    },
  },

  // ── 3. GENERATIVE AI (6 MONTHS) ──
  {
    id: 'generative-ai',
    slug: 'generative-ai',
    title: 'Generative AI',
    category: 'ai',
    categoryLabel: '6 Months Fellowship',
    supportedDurations: ['6months'],
    rating: 4.9,
    reviewCount: 1940,
    badge: 'LLM & MULTIMODAL',
    tagline: 'Transformer architectures, Fine-Tuning (PEFT/LoRA), Multimodal Vision-Language Models & Production LLMOps.',
    highlights: ['Fine-Tuning with LoRA/QLoRA', 'Multimodal Vision & Speech', 'OpenAI/Gemini/Claude APIs', 'Enterprise Knowledge RAG'],
    level: 'Advanced Fellowship',
    durationData: {
      '6months': {
        durationText: '6 Months Generative AI Fellowship',
        modules: [
          {
            id: 'gen-m1',
            moduleNumber: 'Module 1',
            tag: '2 Weeks',
            title: 'Foundations of GenAI & Large Language Models',
            durationText: '2 WEEKS',
            description: 'Transformer mechanics, Encoders vs Decoders, GPT, BERT, LLaMA, Mistral, tokenization, and attention math.',
            topics: [
              'Evolution of AI & Transformer Architecture',
              'Encoder vs Decoder Models (GPT, BERT, T5, LLaMA, Mistral)',
              'Tokenization, Embeddings & Context Windows',
              'Attention Mechanism & Sampling Strategies',
              'Open-source vs Proprietary Model Landscape',
            ],
            skillsGained: ['Transformer Mechanics', 'Attention Math', 'LLaMA & Mistral'],
            labsCount: 10,
            highlightIcon: <Brain className="w-5 h-5" />,
          },
          {
            id: 'gen-m2',
            moduleNumber: 'Module 2',
            tag: '2 Weeks',
            title: 'Prompt Engineering & LLM Application Design',
            durationText: '2 WEEKS',
            description: 'Zero/Few-shot, Chain-of-Thought, ReAct, structured JSON, function calling, and automated prompt evaluation.',
            topics: [
              'Prompt Engineering Fundamentals',
              'Zero-shot, One-shot & Few-shot Prompting',
              'Chain-of-Thought & Self-Consistency',
              'Structured Outputs, JSON & Function Calling',
              'Prompt Testing & Evaluation Metrics',
            ],
            skillsGained: ['Prompt Design', 'Function Calling', 'Structured JSON'],
            labsCount: 12,
            highlightIcon: <Zap className="w-5 h-5" />,
          },
          {
            id: 'gen-m3',
            moduleNumber: 'Module 3',
            tag: '2 Weeks',
            title: 'LLM APIs & AI Application Development',
            durationText: '2 WEEKS',
            description: 'OpenAI, Gemini, Claude & Hugging Face inference APIs, streaming tokens, token optimization, and error handling.',
            topics: [
              'OpenAI, Gemini, Claude & Hugging Face APIs',
              'API Authentication & Streaming Responses',
              'Token Usage & Cost Optimization Strategies',
              'Error Handling & API Rate Limit Management',
            ],
            skillsGained: ['LLM APIs', 'Streaming Tokens', 'Cost Optimization'],
            labsCount: 12,
            highlightIcon: <Cloud className="w-5 h-5" />,
          },
          {
            id: 'gen-m4',
            moduleNumber: 'Module 4',
            tag: '2 Weeks',
            title: 'Embeddings, Vector Databases & Semantic Search',
            durationText: '2 WEEKS',
            description: 'Dense vs sparse retrieval, vector similarity, metadata filtering, hybrid search, and cross-encoder reranking.',
            topics: [
              'Embeddings Generation & Similarity Search',
              'Dense vs Sparse Retrieval & Hybrid Search',
              'Metadata Filtering & Vector Indexing',
              'Cross-Encoder Reranking for Precision',
            ],
            skillsGained: ['Embeddings', 'Semantic Search', 'Reranking'],
            labsCount: 12,
            highlightIcon: <Database className="w-5 h-5" />,
          },
          {
            id: 'gen-m5',
            moduleNumber: 'Module 5',
            tag: '3 Weeks',
            title: 'Retrieval-Augmented Generation (RAG)',
            durationText: '3 WEEKS',
            description: 'RAG architecture, document chunking, multi-document retrieval, prompt augmentation, and Graph RAG concepts.',
            topics: [
              'RAG Architecture & Document Chunking Strategies',
              'Embedding Pipelines & Retrieval Techniques',
              'Context Management & Prompt Augmentation',
              'Query Rewriting & Multi-Document Synthesis',
              'Enterprise Knowledge Systems & Graph RAG Intro',
            ],
            skillsGained: ['Advanced RAG', 'Multi-Doc Synthesis', 'Graph RAG'],
            labsCount: 16,
            highlightIcon: <Workflow className="w-5 h-5" />,
          },
          {
            id: 'gen-m6',
            moduleNumber: 'Module 6',
            tag: '2 Weeks',
            title: 'Multimodal AI Engineering',
            durationText: '2 WEEKS',
            description: 'Vision-language models, image understanding, OCR, speech-to-text (Whisper), text-to-speech, and image generation.',
            topics: [
              'Vision-Language Models & Image Understanding',
              'OCR Integration & Document Intelligence',
              'Speech-to-Text (Whisper) & Text-to-Speech (TTS)',
              'Generative Diffusion Models & Image Captioning',
            ],
            skillsGained: ['Vision-Language Models', 'Whisper Speech', 'OCR Document AI'],
            labsCount: 14,
            highlightIcon: <Cpu className="w-5 h-5" />,
          },
          {
            id: 'gen-m7',
            moduleNumber: 'Module 7',
            tag: '2 Weeks',
            title: 'Fine-Tuning & Model Customization',
            durationText: '2 WEEKS',
            description: 'Fine-tuning foundation models, PEFT, LoRA, QLoRA, instruction dataset curation, and quantization (GGUF, AWQ).',
            topics: [
              'Fine-Tuning Fundamentals & Transfer Learning',
              'Parameter-Efficient Fine-Tuning: PEFT, LoRA & QLoRA',
              'Dataset Preparation & Instruction Tuning',
              'Quantization (GGUF, AWQ) & Model Evaluation',
            ],
            skillsGained: ['LoRA & QLoRA', 'Instruction Tuning', 'Quantization'],
            labsCount: 16,
            highlightIcon: <Award className="w-5 h-5" />,
          },
          {
            id: 'gen-m8',
            moduleNumber: 'Module 8',
            tag: '2 Weeks',
            title: 'AI Application Engineering (FastAPI + Gradio)',
            durationText: '2 WEEKS',
            description: 'FastAPI microservices, Streamlit/Gradio interfaces, authentication, session state, and file upload systems.',
            topics: [
              'FastAPI Backend Architecture & API Design',
              'Streamlit & Gradio Frontend Interfaces',
              'Authentication, Session Management & File Uploads',
              'Project Organization & Production Code Structure',
            ],
            skillsGained: ['FastAPI', 'Gradio & Streamlit', 'Production Web Architecture'],
            labsCount: 12,
            highlightIcon: <Laptop className="w-5 h-5" />,
          },
          {
            id: 'gen-m9',
            moduleNumber: 'Module 9',
            tag: '2 Weeks',
            title: 'AI Deployment & LLMOps',
            durationText: '2 WEEKS',
            description: 'Docker containerization, model versioning, CI/CD, monitoring, logging, API scaling, and semantic caching.',
            topics: [
              'Docker, Docker Compose & Environment Management',
              'Model Versioning & CI/CD Pipelines',
              'Monitoring, Logging & Observability',
              'API Scaling, Caching & Cost Optimization',
            ],
            skillsGained: ['Docker', 'LLMOps', 'API Scaling', 'Semantic Caching'],
            labsCount: 12,
            highlightIcon: <Server className="w-5 h-5" />,
          },
          {
            id: 'gen-m10',
            moduleNumber: 'Module 10',
            tag: '2 Weeks',
            title: 'Enterprise AI Solutions & Integration',
            durationText: '2 WEEKS',
            description: 'Enterprise AI architecture, REST APIs, webhooks, CRM/ERP integration, and enterprise product deployment.',
            topics: [
              'Enterprise AI Architecture & Integration Patterns',
              'REST APIs, Webhooks & Database Connectivity',
              'CRM & ERP Automation Integration (Concept)',
              'Capstone: Real-World Enterprise GenAI Product',
            ],
            skillsGained: ['Enterprise AI Architecture', 'Product Design', 'Placement Capstone'],
            labsCount: 12,
            highlightIcon: <Award className="w-5 h-5" />,
          },
        ],
      },
    },
  },

  // ── 4. AI INFRASTRUCTURE, CLOUD & LLMOPS (6 MONTHS) ──
  {
    id: 'ai-infrastructure',
    slug: 'ai-infrastructure',
    title: 'AI Infrastructure, Cloud & LLMOps Engineering',
    category: 'ai',
    categoryLabel: '6 Months Fellowship',
    supportedDurations: ['6months'],
    rating: 4.85,
    reviewCount: 1340,
    badge: 'PLATFORM ENGINEERING',
    tagline: 'Scale AI systems: Docker, Kubernetes, GPU optimization, MLOps/LLMOps pipelines & enterprise platforms.',
    highlights: ['Kubernetes Orchestration', 'GPU Optimization & Triton', 'LLMOps & MLOps CI/CD', 'Enterprise Platform Design'],
    level: 'Advanced Fellowship',
    durationData: {
      '6months': {
        durationText: '6 Months AI Infrastructure Fellowship',
        modules: [
          {
            id: 'inf-m1',
            moduleNumber: 'Module 1',
            tag: '2 Weeks',
            title: 'AI Infrastructure Fundamentals & Linux',
            durationText: '2 WEEKS',
            description: 'AI system architecture, CPU vs GPU vs TPU hardware, Linux administration, remote SSH, and environment variables.',
            topics: ['AI Infrastructure Overview & System Architecture', 'CPU vs GPU vs TPU Hardware Basics', 'Linux for AI Engineers, File Systems & SSH'],
            skillsGained: ['Linux Admin', 'GPU Hardware', 'Remote SSH'],
            labsCount: 10,
            highlightIcon: <Terminal className="w-5 h-5" />,
          },
          {
            id: 'inf-m2',
            moduleNumber: 'Module 2',
            tag: '2 Weeks',
            title: 'Cloud Computing for AI (AWS/Azure/GCP)',
            durationText: '2 WEEKS',
            description: 'Cloud compute services, object storage, IAM access management, load balancers, and cost optimization.',
            topics: ['Cloud Service Models (IaaS, PaaS, SaaS)', 'Cloud Compute, Storage & Networking Basics', 'IAM, Secrets Management & Auto-Scaling'],
            skillsGained: ['Cloud IAM', 'Object Storage', 'Auto-Scaling'],
            labsCount: 12,
            highlightIcon: <Cloud className="w-5 h-5" />,
          },
          {
            id: 'inf-m3',
            moduleNumber: 'Module 3',
            tag: '2 Weeks',
            title: 'Docker & Containerization',
            durationText: '2 WEEKS',
            description: 'Dockerfiles, container lifecycles, Docker Compose multi-container setups, volumes, and multi-stage builds.',
            topics: ['Docker Fundamentals, Images & Containers', 'Dockerfile Best Practices & Multi-Stage Builds', 'Docker Compose, Networks & Volume Management'],
            skillsGained: ['Docker', 'Multi-Stage Builds', 'Docker Compose'],
            labsCount: 14,
            highlightIcon: <Server className="w-5 h-5" />,
          },
          {
            id: 'inf-m4',
            moduleNumber: 'Module 4',
            tag: '3 Weeks',
            title: 'Kubernetes & Container Orchestration',
            durationText: '3 WEEKS',
            description: 'Kubernetes architecture, Pods, Deployments, Services, ConfigMaps, Secrets, Ingress, HPA, and Helm charts.',
            topics: ['Kubernetes Architecture, Pods & Deployments', 'Services, Ingress & Horizontal Pod Autoscaling (HPA)', 'Persistent Volumes, ConfigMaps, Secrets & Helm'],
            skillsGained: ['Kubernetes', 'HPA Scaling', 'Helm Charts', 'Ingress'],
            labsCount: 18,
            highlightIcon: <Network className="w-5 h-5" />,
          },
          {
            id: 'inf-m5',
            moduleNumber: 'Module 5',
            tag: '2 Weeks',
            title: 'MLOps & LLMOps Foundations',
            durationText: '2 WEEKS',
            description: 'Model registries, experiment tracking, dataset/prompt versioning, and automated pipeline orchestration.',
            topics: ['MLOps & LLMOps Lifecycle Management', 'Model Registry, Experiment Tracking & Versioning', 'Prompt & Dataset Versioning & Reproducibility'],
            skillsGained: ['MLOps Lifecycle', 'Experiment Tracking', 'Model Registry'],
            labsCount: 12,
            highlightIcon: <Workflow className="w-5 h-5" />,
          },
          {
            id: 'inf-m6',
            moduleNumber: 'Module 6',
            tag: '2 Weeks',
            title: 'CI/CD for AI Systems',
            durationText: '2 WEEKS',
            description: 'GitHub Actions, automated testing, container image deployment, release automation, and rollback strategies.',
            topics: ['GitHub Actions & CI/CD Pipelines for AI', 'Automated Testing, Build & Image Deployment', 'Release & Rollback Strategies for AI Workloads'],
            skillsGained: ['GitHub Actions', 'Automated Testing', 'Release Strategies'],
            labsCount: 12,
            highlightIcon: <Cpu className="w-5 h-5" />,
          },
          {
            id: 'inf-m7',
            moduleNumber: 'Module 7',
            tag: '2 Weeks',
            title: 'Production AI Deployment & Serving',
            durationText: '2 WEEKS',
            description: 'FastAPI/Streamlit model serving, API gateways, reverse proxy, load balancing, and high availability.',
            topics: ['FastAPI Model Serving & API Gateways', 'Reverse Proxy, Load Balancing & High Availability', 'Scaling AI APIs & Serverless AI Introduction'],
            skillsGained: ['Model Serving', 'API Gateways', 'High Availability'],
            labsCount: 12,
            highlightIcon: <Server className="w-5 h-5" />,
          },
          {
            id: 'inf-m8',
            moduleNumber: 'Module 8',
            tag: '2 Weeks',
            title: 'Monitoring, Logging & Observability',
            durationText: '2 WEEKS',
            description: 'Infrastructure monitoring, API telemetry, prompt monitoring, model/data drift detection, and incident response.',
            topics: ['AI & Infrastructure Monitoring (Prometheus/Grafana)', 'Model Drift, Data Drift & Log Management', 'Real-Time Metric Alerts & Incident Response'],
            skillsGained: ['Observability', 'Drift Detection', 'Prometheus & Grafana'],
            labsCount: 12,
            highlightIcon: <TrendingUp className="w-5 h-5" />,
          },
          {
            id: 'inf-m9',
            moduleNumber: 'Module 9',
            tag: '2 Weeks',
            title: 'AI Performance & GPU Optimization',
            durationText: '2 WEEKS',
            description: 'GPU utilization, dynamic request queuing, Redis caching, rate limiting, and inference latency optimization.',
            topics: ['GPU Utilization & Batch Processing Optimization', 'Request Queuing, Redis Caching & Rate Limiting', 'Model Quantization & Inference Latency Tuning'],
            skillsGained: ['GPU Optimization', 'Redis Caching', 'Low Latency Inference'],
            labsCount: 12,
            highlightIcon: <Zap className="w-5 h-5" />,
          },
          {
            id: 'inf-m10',
            moduleNumber: 'Module 10',
            tag: '2 Weeks',
            title: 'Security & Governance for AI Infrastructure',
            durationText: '2 WEEKS',
            description: 'AI infrastructure security, JWT, secrets management, network security, encryption, and disaster recovery.',
            topics: ['AI Infrastructure Security, Auth & Secrets', 'Network Security, TLS Encryption & Hardening', 'AI Governance, Compliance & Disaster Recovery'],
            skillsGained: ['Infra Security', 'Secrets Management', 'Disaster Recovery'],
            labsCount: 12,
            highlightIcon: <Lock className="w-5 h-5" />,
          },
          {
            id: 'inf-m11',
            moduleNumber: 'Module 11',
            tag: '2 Weeks',
            title: 'Enterprise AI Platform Engineering & Capstone',
            durationText: '2 WEEKS',
            description: 'Multi-tenant platform architecture, event-driven workflows, message queues, and enterprise deployment.',
            topics: ['AI Platform Architecture & Multi-Tenant Design', 'Workflow Scheduling & Event-Driven Message Queues', 'Capstone: Enterprise AI Infrastructure Platform'],
            skillsGained: ['Platform Engineering', 'Multi-Tenancy', 'Capstone Deployment'],
            labsCount: 10,
            highlightIcon: <Award className="w-5 h-5" />,
          },
        ],
      },
    },
  },

  // ── 5. AI SECURITY & RESPONSIBLE AI (6 MONTHS) ──
  {
    id: 'ai-security-responsible',
    slug: 'ai-security-responsible',
    title: 'AI Security & Responsible AI Engineering',
    category: 'cyber',
    categoryLabel: '6 Months Fellowship',
    supportedDurations: ['6months'],
    rating: 4.9,
    reviewCount: 1560,
    badge: 'AI RED TEAM & DEFENSE',
    tagline: 'Protect AI systems: Data/Model poisoning defense, LLM jailbreak red teaming, guardrails, privacy & AI governance.',
    highlights: ['LLM Threat Modeling & Prompt Injection', 'Adversarial Machine Learning', 'AI Safety Guardrails', 'Privacy-Preserving AI'],
    level: 'Advanced Fellowship',
    durationData: {
      '6months': {
        durationText: '6 Months AI Security Fellowship',
        modules: [
          {
            id: 'ais-m1',
            moduleNumber: 'Module 1',
            tag: '2 Weeks',
            title: 'Foundations of AI Security & Responsible AI',
            durationText: '2 WEEKS',
            description: 'AI threat landscape, attack surface, secure AI development lifecycle, ethics, fairness, and AI risk management.',
            topics: ['Introduction to AI Security & Threat Landscape', 'AI Attack Surface & Secure AI Development Lifecycle', 'Responsible AI: Fairness, Transparency, Explainability & Governance'],
            skillsGained: ['AI Threat Modeling', 'Responsible AI', 'Risk Management'],
            labsCount: 10,
            highlightIcon: <Shield className="w-5 h-5" />,
          },
          {
            id: 'ais-m2',
            moduleNumber: 'Module 2',
            tag: '2 Weeks',
            title: 'Machine Learning Security',
            durationText: '2 WEEKS',
            description: 'ML pipeline security, data poisoning, label poisoning, evasion attacks, model extraction, and membership inference.',
            topics: ['ML Pipeline Security: Data & Label Poisoning', 'Model Poisoning, Evasion Attacks & Extraction', 'Membership Inference, Data Leakage & Defense'],
            skillsGained: ['Poisoning Defense', 'Evasion Attacks', 'Membership Inference'],
            labsCount: 12,
            highlightIcon: <Cpu className="w-5 h-5" />,
          },
          {
            id: 'ais-m3',
            moduleNumber: 'Module 3',
            tag: '3 Weeks',
            title: 'LLM Security & Prompt Injection',
            durationText: '3 WEEKS',
            description: 'Direct/indirect prompt injection, jailbreak attacks, prompt leakage, system prompt protection, and tool abuse.',
            topics: ['LLM Threat Model: Direct & Indirect Injection', 'Jailbreak Attacks, Prompt Leakage & System Defense', 'Sensitive Data Exposure, Tool Abuse & Output Validation'],
            skillsGained: ['Prompt Injection', 'Jailbreak Testing', 'Tool Abuse Defense'],
            labsCount: 16,
            highlightIcon: <Zap className="w-5 h-5" />,
          },
          {
            id: 'ais-m4',
            moduleNumber: 'Module 4',
            tag: '2 Weeks',
            title: 'AI Red Teaming & Adversarial Testing',
            durationText: '2 WEEKS',
            description: 'AI red team methodology, threat modeling, attack simulation, adversarial examples, and penetration testing.',
            topics: ['AI Red Team Methodology & Attack Simulation', 'Adversarial Examples & Model Robustness Testing', 'AI Penetration Testing & Vulnerability Reporting'],
            skillsGained: ['AI Red Teaming', 'Robustness Testing', 'Vulnerability Reporting'],
            labsCount: 14,
            highlightIcon: <Terminal className="w-5 h-5" />,
          },
          {
            id: 'ais-m5',
            moduleNumber: 'Module 5',
            tag: '2 Weeks',
            title: 'AI Evaluation & Model Validation',
            durationText: '2 WEEKS',
            description: 'Benchmarking, hallucination evaluation, factuality, toxicity detection, bias detection, and safety testing.',
            topics: ['AI Evaluation: Accuracy, Hallucination & Factuality', 'Toxicity Detection, Bias Detection & Safety Benchmarks', 'Automated & Human Evaluation Frameworks'],
            skillsGained: ['Hallucination Benchmarks', 'Toxicity Detection', 'Safety Auditing'],
            labsCount: 12,
            highlightIcon: <CheckCheck className="w-5 h-5" />,
          },
          {
            id: 'ais-m6',
            moduleNumber: 'Module 6',
            tag: '2 Weeks',
            title: 'AI Safety Engineering & Guardrails',
            durationText: '2 WEEKS',
            description: 'Input validation, output filtering, safety classifiers, content moderation, and fail-safe mechanisms.',
            topics: ['AI Guardrails: Input Validation & Output Filtering', 'Policy Enforcement, Safety Classifiers & Moderation', 'Secure Tool Calling & Fail-Safe Mechanisms'],
            skillsGained: ['AI Guardrails', 'Content Moderation', 'Fail-Safe Design'],
            labsCount: 12,
            highlightIcon: <Lock className="w-5 h-5" />,
          },
          {
            id: 'ais-m7',
            moduleNumber: 'Module 7',
            tag: '2 Weeks',
            title: 'Privacy-Preserving AI',
            durationText: '2 WEEKS',
            description: 'PII masking, data anonymization, differential privacy concepts, federated learning, and secure storage.',
            topics: ['Data Privacy, PII Handling & Anonymization', 'Differential Privacy & Federated Learning Basics', 'Encryption, Secure Storage & Access Control'],
            skillsGained: ['PII Masking', 'Differential Privacy', 'Secure Storage'],
            labsCount: 12,
            highlightIcon: <Shield className="w-5 h-5" />,
          },
          {
            id: 'ais-m8',
            moduleNumber: 'Module 8',
            tag: '2 Weeks',
            title: 'Secure AI Application Engineering',
            durationText: '2 WEEKS',
            description: 'Secure FastAPI development, JWT, authentication, API security, secrets management, and input sanitization.',
            topics: ['Secure FastAPI Development & JWT Security', 'API Security, Secrets Management & Logging', 'Rate Limiting, Input Sanitization & Error Handling'],
            skillsGained: ['Secure FastAPI', 'JWT Authentication', 'API Hardening'],
            labsCount: 12,
            highlightIcon: <Server className="w-5 h-5" />,
          },
          {
            id: 'ais-m9',
            moduleNumber: 'Module 9',
            tag: '2 Weeks',
            title: 'AI Infrastructure Security',
            durationText: '2 WEEKS',
            description: 'Docker security, Kubernetes security basics, cloud IAM, network encryption, and infrastructure hardening.',
            topics: ['Container Security & Docker Isolation', 'Kubernetes Security & Cloud IAM Hardening', 'Network Security & Secure CI/CD Deployments'],
            skillsGained: ['Container Security', 'Cloud IAM', 'Secure Deployments'],
            labsCount: 12,
            highlightIcon: <Cloud className="w-5 h-5" />,
          },
          {
            id: 'ais-m10',
            moduleNumber: 'Module 10',
            tag: '2 Weeks',
            title: 'Responsible AI Governance & Compliance',
            durationText: '2 WEEKS',
            description: 'Model cards, datasheets for datasets, AI audit trails, risk registers, compliance, and incident management.',
            topics: ['AI Governance Frameworks & Model Cards', 'Datasheets for Datasets & AI Audit Trails', 'Risk Registers, Compliance & Incident Management'],
            skillsGained: ['Model Cards', 'AI Audit Trails', 'Governance Compliance'],
            labsCount: 10,
            highlightIcon: <FileText className="w-5 h-5" />,
          },
          {
            id: 'ais-m11',
            moduleNumber: 'Module 11',
            tag: '2 Weeks',
            title: 'AI Monitoring & Incident Response Capstone',
            durationText: '2 WEEKS',
            description: 'Production AI drift monitoring, security alerts, incident response playbooks, and enterprise attack war games.',
            topics: ['Production AI Monitoring & Drift Detection', 'AI Incident Response, Root Cause Analysis & Playbooks', 'Capstone: Enterprise Multi-Vector AI Attack & Defense War Drill'],
            skillsGained: ['Incident Response', 'Drift Monitoring', 'War Drill Mastery'],
            labsCount: 12,
            highlightIcon: <Award className="w-5 h-5" />,
          },
        ],
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 45-DAY & 3-MONTH CORE AI PROGRAMS
  // ═══════════════════════════════════════════════════════════════════════════
  
  // ── 6. PYTHON FOR AI (45 DAYS & 3 MONTHS) ──
  {
    id: 'python-for-ai',
    slug: 'python-for-ai',
    title: 'Python For AI',
    category: 'ai',
    categoryLabel: 'AI Programming',
    supportedDurations: ['45days', '3months'],
    rating: 4.9,
    reviewCount: 1420,
    badge: 'ZERO TO HERO',
    tagline: 'Start from absolute scratch: clean programming, OOP, NumPy, Pandas & Tkinter GUI.',
    highlights: ['Zero prerequisites', 'Live Google Colab Labs', 'Tkinter Desktop GUI', 'GitHub Portfolio'],
    level: 'Beginner (From Scratch)',
    durationData: {
      '45days': {
        durationText: '45 Days Sprint',
        modules: [
          {
            id: 'py45-1',
            moduleNumber: 'Module 1',
            tag: 'Beginner Starting Point',
            title: 'Python Programming Fundamentals',
            durationText: '1.5 WEEKS',
            description: 'Google Colab setup, variables, data types, operators, conditional loops, functions, and OOP concepts.',
            topics: ['Introduction to AI and Python', 'Google Colab Setup', 'Variables, Data Types, Operators', 'Conditional Statements & Loops', 'Functions & Modular Programming', 'OOP & Exception Handling'],
            skillsGained: ['Python 3', 'OOP Concepts', 'Modular Code'],
            task: 'Student Result Management System',
            labsCount: 8,
            highlightIcon: <Code2 className="w-5 h-5" />,
          },
          {
            id: 'py45-2',
            moduleNumber: 'Module 2',
            tag: 'Data Manipulation',
            title: 'Libraries in Python & EDA',
            durationText: '1.5 WEEKS',
            description: 'NumPy matrix computing, Pandas Series/DataFrames, data cleaning, aggregation, and Matplotlib/Seaborn plots.',
            topics: ['NumPy Fundamentals & Advanced Operations', 'Pandas Series & DataFrames', 'Data Cleaning & Transformation', 'Exploratory Data Analysis (EDA)', 'Matplotlib & Seaborn Visualization'],
            skillsGained: ['NumPy', 'Pandas', 'EDA', 'Matplotlib'],
            task: 'Netflix Content Analysis & Insights Pipeline',
            labsCount: 10,
            highlightIcon: <Database className="w-5 h-5" />,
          },
          {
            id: 'py45-3',
            moduleNumber: 'Module 3',
            tag: 'UI & GUI Engineering',
            title: 'Error Handling, Debugging & GUI Development',
            durationText: '1 WEEK',
            description: 'Structured approaches to resolve runtime errors, debugging workflows, and desktop GUI creation using Tkinter.',
            topics: ['Understanding Different Types of Errors', 'Approaches to Resolve & Debug Code', 'GUI Development using Tkinter', 'Frontend Integration with Python Scripts'],
            skillsGained: ['Tkinter GUI', 'Error Debugging', 'Event-Driven Code'],
            task: 'Tkinter-Based Interactive Desktop Frontend',
            labsCount: 6,
            highlightIcon: <Laptop className="w-5 h-5" />,
          },
          {
            id: 'py45-4',
            moduleNumber: 'Module 4',
            tag: 'Project & Deployment',
            title: 'Industry-Based Project & GitHub Deployment',
            durationText: '1.5 WEEKS',
            description: 'Requirement analysis, dataset preparation, Tkinter deployment, Git version control, and portfolio publishing.',
            topics: ['Problem Identification & Requirement Analysis', 'Dataset Collection & Preparation', 'Deployment using Tkinter', 'Git Fundamentals & GitHub Collaboration'],
            skillsGained: ['Git & GitHub', 'Project Delivery', 'Portfolio Building'],
            task: 'Collaborative Portfolio Repository on GitHub',
            labsCount: 8,
            highlightIcon: <Award className="w-5 h-5" />,
          },
        ],
      },
      '3months': {
        durationText: '3 Months Mastery',
        modules: [
          {
            id: 'py3m-1',
            moduleNumber: 'Module 1',
            tag: 'Core Python Architecture',
            title: 'Advanced Python, OOP & Functional Architecture',
            durationText: '4 WEEKS',
            description: 'Comprehensions, lambda, recursion, encapsulation, abstraction, and custom exceptions.',
            topics: ['Python Comprehensions & Recursion', 'Advanced OOP: Polymorphism & Inheritance', 'File I/O & Custom Package Creation'],
            skillsGained: ['Advanced Python', 'OOP Architecture', 'Custom Packages'],
            labsCount: 14,
            highlightIcon: <Code2 className="w-5 h-5" />,
          },
          {
            id: 'py3m-2',
            moduleNumber: 'Module 2',
            tag: 'Scientific Libraries',
            title: 'NumPy, Pandas & Interactive Analytics',
            durationText: '4 WEEKS',
            description: 'Broadcasting, multi-indexing, time-series dataframes, and Plotly interactive visualizations.',
            topics: ['NumPy Linear Algebra & Broadcasting', 'Pandas Multi-Indexing & Imputation', 'Plotly Interactive Visual Analytics'],
            skillsGained: ['NumPy Vectorization', 'Pandas Wrangling', 'Plotly Analytics'],
            labsCount: 16,
            highlightIcon: <Database className="w-5 h-5" />,
          },
          {
            id: 'py3m-3',
            moduleNumber: 'Module 3',
            tag: 'Backend & Deploy',
            title: 'FastAPI Microservices & Docker Deployment',
            durationText: '4 WEEKS',
            description: 'Web scraping with BeautifulSoup, building REST APIs with FastAPI, and Docker deployment.',
            topics: ['Web Scraping with Requests & BeautifulSoup', 'FastAPI Routing & Swagger Docs', 'Docker Containerization & Cloud Deployment'],
            skillsGained: ['FastAPI Backend', 'Web Scraping', 'Docker Deploy'],
            labsCount: 16,
            highlightIcon: <Award className="w-5 h-5" />,
          },
        ],
      },
    },
  },

  // ── 7. DATA ANALYSIS (45 DAYS & 3 MONTHS) ──
  {
    id: 'data-analysis',
    slug: 'data-analysis',
    title: 'Data Analysis',
    category: 'ai',
    categoryLabel: 'Business Intelligence',
    supportedDurations: ['45days', '3months'],
    rating: 4.8,
    reviewCount: 980,
    badge: 'BUSINESS ANALYTICS',
    tagline: 'Transform raw data into executive business insights using Python, Excel, SQL & Dashboards.',
    highlights: ['Advanced Excel & XLOOKUP', 'SQL Window Functions', 'Seaborn & Plotly', 'Executive KPI Dashboards'],
    level: 'Beginner (From Scratch)',
    durationData: {
      '45days': {
        durationText: '45 Days Sprint',
        modules: [
          {
            id: 'da45-1',
            moduleNumber: 'Module 1',
            tag: 'Python for Analytics',
            title: 'Python Programming for Data Analytics',
            durationText: '1.5 WEEKS',
            description: 'Variables, conditional loops, functions, OOP, and structured exception handling.',
            topics: ['Python Environment Setup', 'Variables & Data Types', 'Conditional Loops & Functions', 'OOP Concepts & Exception Handling'],
            skillsGained: ['Python Basics', 'Business Automation', 'Data Types'],
            task: 'Business Record Processing System',
            labsCount: 8,
            highlightIcon: <Code2 className="w-5 h-5" />,
          },
          {
            id: 'da45-2',
            moduleNumber: 'Module 2',
            tag: 'Pandas & EDA',
            title: 'Data Manipulation using NumPy & Pandas',
            durationText: '1.5 WEEKS',
            description: 'Data cleaning, transformation, grouping, aggregations, merges, and exploratory analysis.',
            topics: ['NumPy Fundamentals', 'Pandas DataFrames', 'Cleaning & Preprocessing', 'Grouping & Aggregations', 'Exploratory Data Analysis (EDA)'],
            skillsGained: ['Pandas EDA', 'Data Cleaning', 'Aggregation'],
            task: 'Enterprise Data Cleaning & Analytics Pipeline',
            labsCount: 10,
            highlightIcon: <Database className="w-5 h-5" />,
          },
          {
            id: 'da45-3',
            moduleNumber: 'Module 3',
            tag: 'Excel & Visualization',
            title: 'Visualization & Business Data Analysis with Excel',
            durationText: '1 WEEK',
            description: 'Matplotlib/Seaborn visualization, advanced Excel logical functions (IF/IFS, XLOOKUP), and Pivot Charts.',
            topics: ['Matplotlib & Seaborn Visualizations', 'Excel Formulas: IF/IFS, VLOOKUP, XLOOKUP', 'Pivot Tables, Pivot Charts & Slicers'],
            skillsGained: ['Excel Modeling', 'Pivot Charts', 'KPI Dashboards'],
            task: 'Executive Sales & Performance Dashboard',
            labsCount: 8,
            highlightIcon: <BarChart3 className="w-5 h-5" />,
          },
          {
            id: 'da45-4',
            moduleNumber: 'Module 4',
            tag: 'SQL & Project',
            title: 'SQL for Data Analysis & Industry Project',
            durationText: '1.5 WEEKS',
            description: 'Data retrieval, filtering, table joins, SQL window functions, and portfolio deployment on GitHub.',
            topics: ['SQL SELECT, WHERE, GROUP BY, HAVING', 'Table Joins & Relationships', 'SQL Window Functions (RANK, ROW_NUMBER)', 'Git Fundamentals & Cloud Deployment'],
            skillsGained: ['SQL Window Functions', 'Joins', 'GitHub Portfolio'],
            task: 'Sales & Customer Data Analysis using SQL',
            labsCount: 8,
            highlightIcon: <Award className="w-5 h-5" />,
          },
        ],
      },
      '3months': {
        durationText: '3 Months Specialization',
        modules: [
          {
            id: 'da3m-1',
            moduleNumber: 'Module 1',
            tag: 'Extraction Track',
            title: 'Advanced Python Analytics & Web Extraction',
            durationText: '4 WEEKS',
            description: 'Web scraping with BeautifulSoup, JSON API ingestion, and automated ETL pipelines.',
            topics: ['Automated Data Extraction & Web Scraping', 'JSON APIs & Pandas Statistical Profiling', 'ETL Data Pipeline Automation'],
            skillsGained: ['Automated Extraction', 'JSON APIs', 'ETL Pipelines'],
            labsCount: 15,
            highlightIcon: <Code2 className="w-5 h-5" />,
          },
          {
            id: 'da3m-2',
            moduleNumber: 'Module 2',
            tag: 'BI Track',
            title: 'Power BI Desktop, Data Modeling & DAX',
            durationText: '4 WEEKS',
            description: 'Star schema modeling, Power Query ETL, and complex DAX measures (CALCULATE, Time Intelligence).',
            topics: ['Power Query ETL & Data Relationships', 'DAX Measures: CALCULATE, FILTER, Time Intelligence', 'Executive Reports & Drill-Throughs'],
            skillsGained: ['Power BI DAX', 'Data Modeling', 'Executive Reporting'],
            labsCount: 18,
            highlightIcon: <BarChart3 className="w-5 h-5" />,
          },
          {
            id: 'da3m-3',
            moduleNumber: 'Module 3',
            tag: 'SQL & Capstone',
            title: 'PostgreSQL Database Engineering & Capstone',
            durationText: '4 WEEKS',
            description: 'Advanced SQL CTEs, window functions, query plans (EXPLAIN ANALYZE), and final business case study.',
            topics: ['Advanced SQL: CTEs, Subqueries & Window Functions', 'Query Optimization with Indexes & EXPLAIN ANALYZE', 'End-to-End Analytics Capstone Presentation'],
            skillsGained: ['Advanced SQL', 'EXPLAIN ANALYZE', 'Executive Presentation'],
            labsCount: 16,
            highlightIcon: <Award className="w-5 h-5" />,
          },
        ],
      },
    },
  },

  // ── 8. DATA SCIENCE (45 DAYS & 3 MONTHS) ──
  {
    id: 'data-science',
    slug: 'data-science',
    title: 'Data Science',
    category: 'ai',
    categoryLabel: 'Data Science & ML',
    supportedDurations: ['45days', '3months'],
    rating: 4.75,
    reviewCount: 1150,
    badge: 'END-TO-END DATA SCIENCE',
    tagline: 'From data extraction and statistical analysis to machine learning models and visual dashboards.',
    highlights: ['Web Scraping & Extraction', 'Kaggle Datasets Analysis', 'Scikit-Learn ML', 'Power BI & Cloud Deploy'],
    level: 'Beginner (From Scratch)',
    durationData: {
      '45days': {
        durationText: '45 Days Sprint',
        modules: [
          {
            id: 'ds45-1',
            moduleNumber: 'Module 1',
            tag: 'Python & EDA',
            title: 'Python for Data Analytics & Kaggle EDA',
            durationText: '1.5 WEEKS',
            description: 'NumPy numerical computing, Pandas data preprocessing, and insight generation on real Kaggle datasets.',
            topics: ['Python Environment & Loops', 'NumPy Numerical Computing', 'Data Cleaning with Pandas', 'Exploratory Data Analysis (EDA) on Kaggle Datasets'],
            skillsGained: ['NumPy & Pandas', 'Kaggle EDA', 'Preprocessing'],
            task: 'Real-World Data Analysis using Kaggle Datasets',
            labsCount: 10,
            highlightIcon: <Code2 className="w-5 h-5" />,
          },
          {
            id: 'ds45-2',
            moduleNumber: 'Module 2',
            tag: 'Extraction & BI',
            title: 'Data Extraction (JSON/Scraping) & Power BI',
            durationText: '1.5 WEEKS',
            description: 'Web scraping with Requests/BeautifulSoup, JSON processing, and building Power BI visual dashboards.',
            topics: ['Working with JSON Data & APIs', 'Web Scraping with BeautifulSoup', 'Visual Analytics with Seaborn & Plotly', 'Business Intelligence with Power BI'],
            skillsGained: ['Web Scraping', 'JSON APIs', 'Power BI Dashboards'],
            task: 'Automated Web Data Collection & BI Dashboard',
            labsCount: 12,
            highlightIcon: <Workflow className="w-5 h-5" />,
          },
          {
            id: 'ds45-3',
            moduleNumber: 'Module 3',
            tag: 'SQL & Deployment',
            title: 'SQL Analytics, Window Functions & Cloud Deploy',
            durationText: '2 WEEKS',
            description: 'SQL queries, joins, window functions, and deploying real-time projects on GitHub.',
            topics: ['Database Fundamentals & SQL Queries', 'Filtering, Sorting, Joins & Subqueries', 'SQL Window Functions', 'Git Version Control & Project Deployment'],
            skillsGained: ['SQL Window Functions', 'Joins', 'GitHub Deployment'],
            task: 'Deploy a Real-Time Project on GitHub',
            labsCount: 10,
            highlightIcon: <Award className="w-5 h-5" />,
          },
        ],
      },
      '3months': {
        durationText: '3 Months Specialization',
        modules: [
          {
            id: 'ds3m-1',
            moduleNumber: 'Module 1',
            tag: 'Modeling Track',
            title: 'Data Extraction, EDA & Statistical Inference',
            durationText: '4 WEEKS',
            description: 'Automated scraping, hypothesis testing, distributions, and feature engineering pipelines.',
            topics: ['Automated Web Scraping with BeautifulSoup', 'Statistical Hypothesis Testing & Distributions', 'Feature Selection & Encoding Pipelines'],
            skillsGained: ['Feature Engineering', 'Hypothesis Testing', 'Data Extraction'],
            labsCount: 16,
            highlightIcon: <Code2 className="w-5 h-5" />,
          },
          {
            id: 'ds3m-2',
            moduleNumber: 'Module 2',
            tag: 'ML Track',
            title: 'Supervised ML & Power BI DAX Analytics',
            durationText: '4 WEEKS',
            description: 'Regression, classification, Random Forests, XGBoost, and Power BI DAX calculations.',
            topics: ['Supervised Learning: Regression, Trees & SVM', 'Model Evaluation: Precision, Recall, ROC-AUC', 'Power BI Data Modeling & DAX Measures'],
            skillsGained: ['Scikit-Learn', 'XGBoost', 'Power BI DAX'],
            labsCount: 18,
            highlightIcon: <Cpu className="w-5 h-5" />,
          },
          {
            id: 'ds3m-3',
            moduleNumber: 'Module 3',
            tag: 'Deploy Track',
            title: 'Unsupervised ML, Streamlit & Cloud Deployment',
            durationText: '4 WEEKS',
            description: 'Clustering, PCA dimensionality reduction, Streamlit web app development, and Docker cloud hosting.',
            topics: ['Clustering: K-Means, Hierarchical & DBSCAN', 'Dimensionality Reduction with PCA', 'Interactive Web Apps with Streamlit & Docker'],
            skillsGained: ['Streamlit', 'PCA & Clustering', 'Docker Deploy'],
            labsCount: 14,
            highlightIcon: <Award className="w-5 h-5" />,
          },
        ],
      },
    },
  },

  // ── 9. MACHINE LEARNING (45 DAYS & 3 MONTHS) ──
  {
    id: 'machine-learning',
    slug: 'machine-learning',
    title: 'Machine Learning',
    category: 'ai',
    categoryLabel: 'Machine Learning',
    supportedDurations: ['45days', '3months'],
    rating: 4.9,
    reviewCount: 1680,
    badge: 'CORE ML MASTERY',
    tagline: 'Master supervised & unsupervised algorithms, gradient descent, hyperparameter tuning & production pipelines.',
    highlights: ['XGBoost & Random Forests', 'Customer Churn Prediction', 'K-Means & DBSCAN', 'Model Optimization'],
    level: 'Intermediate',
    durationData: {
      '45days': {
        durationText: '45 Days Sprint',
        modules: [
          {
            id: 'ml45-1',
            moduleNumber: 'Module 1',
            tag: 'Python for ML',
            title: 'Python for Machine Learning & Preprocessing',
            durationText: '1.5 WEEKS',
            description: 'NumPy, Pandas, data preprocessing, feature scaling, encoding, and exploratory analysis.',
            topics: ['NumPy & Pandas for Machine Learning', 'Data Preprocessing & Imputation', 'Feature Scaling & One-Hot Encoding', 'Exploratory Data Analysis (EDA)'],
            skillsGained: ['Preprocessing', 'Feature Scaling', 'Scikit-Learn'],
            task: 'Data Preprocessing & EDA Pipeline',
            labsCount: 8,
            highlightIcon: <Code2 className="w-5 h-5" />,
          },
          {
            id: 'ml45-2',
            moduleNumber: 'Module 2',
            tag: 'Supervised Algorithms',
            title: 'Supervised Machine Learning Algorithms',
            durationText: '1.5 WEEKS',
            description: 'Linear/Logistic regression, decision trees, random forests, KNN, SVM, and gradient descent.',
            topics: ['Linear & Logistic Regression Cost Functions', 'Gradient Descent Optimization', 'Decision Trees, Random Forests, KNN & SVM', 'Train-Test Splits & Cross-Validation'],
            skillsGained: ['Supervised Learning', 'Gradient Descent', 'SVM & Forests'],
            task: 'Customer Churn Prediction',
            labsCount: 10,
            highlightIcon: <Cpu className="w-5 h-5" />,
          },
          {
            id: 'ml45-3',
            moduleNumber: 'Module 3',
            tag: 'Unsupervised & Tuning',
            title: 'Unsupervised Learning & Model Optimization',
            durationText: '1.5 WEEKS',
            description: 'K-Means, Hierarchical, DBSCAN, PCA dimensionality reduction, and hyperparameter tuning.',
            topics: ['Clustering: K-Means & DBSCAN', 'Principal Component Analysis (PCA)', 'Evaluation Metrics: Precision, Recall, F1, ROC-AUC', 'Hyperparameter Tuning & Bias-Variance Tradeoff'],
            skillsGained: ['PCA Reduction', 'Clustering', 'Hyperparameter Tuning'],
            task: 'Customer Segmentation & Model Optimization',
            labsCount: 10,
            highlightIcon: <Workflow className="w-5 h-5" />,
          },
          {
            id: 'ml45-4',
            moduleNumber: 'Module 4',
            tag: 'Industry Project',
            title: 'End-to-End Machine Learning Solution',
            durationText: '1 WEEK',
            description: 'End-to-end model development, explainability, serialization, and portfolio deployment.',
            topics: ['Problem Identification & Requirements', 'End-to-End Model Pipeline Development', 'Model Explainability & Serialization', 'GitHub Portfolio Repository Development'],
            skillsGained: ['End-to-End ML', 'Model Serialization', 'Portfolio Building'],
            task: 'End-to-End ML Business Solution',
            labsCount: 8,
            highlightIcon: <Award className="w-5 h-5" />,
          },
        ],
      },
      '3months': {
        durationText: '3 Months Specialization',
        modules: [
          {
            id: 'ml3m-1',
            moduleNumber: 'Module 1',
            tag: 'Math & Regression',
            title: 'Math for ML, Gradient Optimization & Ensembles',
            durationText: '4 WEEKS',
            description: 'Linear algebra, calculus, convex loss optimization, Random Forests, XGBoost, and CatBoost.',
            topics: ['Matrix Operations & Gradients', 'Regularization: L1 Lasso & L2 Ridge', 'Ensemble Boosting: XGBoost, LightGBM, CatBoost'],
            skillsGained: ['Convex Optimization', 'XGBoost & LightGBM', 'Ensemble Stacking'],
            labsCount: 18,
            highlightIcon: <Cpu className="w-5 h-5" />,
          },
          {
            id: 'ml3m-2',
            moduleNumber: 'Module 2',
            tag: 'Unsupervised & Anomaly',
            title: 'Clustering, Anomaly Detection & PCA',
            durationText: '4 WEEKS',
            description: 'K-Means++, Gaussian Mixture Models, Isolation Forests for anomaly detection, and t-SNE / PCA.',
            topics: ['K-Means++ & Hierarchical Clustering', 'Anomaly Detection with Isolation Forests', 'Dimensionality Reduction with PCA & t-SNE'],
            skillsGained: ['Isolation Forests', 'PCA & t-SNE', 'Anomaly Detection'],
            labsCount: 16,
            highlightIcon: <Database className="w-5 h-5" />,
          },
          {
            id: 'ml3m-3',
            moduleNumber: 'Module 3',
            tag: 'Serving & MLOps',
            title: 'Model Evaluation, Serving & FastAPI Deployment',
            durationText: '4 WEEKS',
            description: 'Hyperparameter tuning with Optuna, SHAP explainability, FastAPI serving, and Docker cloud hosting.',
            topics: ['Hyperparameter Tuning with Optuna', 'Model Explainability with SHAP & LIME', 'FastAPI Serving & Streamlit Web App Deployment'],
            skillsGained: ['Optuna', 'SHAP & LIME', 'FastAPI Serving', 'Docker'],
            labsCount: 14,
            highlightIcon: <Award className="w-5 h-5" />,
          },
        ],
      },
    },
  },

  // ── 10. DEEP LEARNING (45 DAYS & 3 MONTHS) ──
  {
    id: 'deep-learning',
    slug: 'deep-learning',
    title: 'Deep Learning',
    category: 'ai',
    categoryLabel: 'Neural Networks',
    supportedDurations: ['45days', '3months'],
    rating: 4.9,
    reviewCount: 1890,
    badge: 'NEURAL NETWORKS & PYTORCH',
    tagline: 'Master deep neural networks, mathematical backprop from scratch, CNN computer vision & Transformer architectures.',
    highlights: ['Gradient Descent from Scratch', 'PyTorch & TensorFlow', 'CNN Computer Vision', 'Streamlit & Flask Deploy'],
    level: 'Advanced Fellowship',
    durationData: {
      '45days': {
        durationText: '45 Days Sprint',
        modules: [
          {
            id: 'dl45-1',
            moduleNumber: 'Module 1',
            tag: 'Foundations of DL',
            title: 'Foundations of Deep Learning & Frameworks',
            durationText: '1.5 WEEKS',
            description: 'AI vs ML vs DL, biological/artificial neurons, TensorFlow/PyTorch/Keras setup, and GPU CUDA basics.',
            topics: ['Evolution of Deep Learning & Applications', 'Biological vs Artificial Neurons', 'TensorFlow, PyTorch & Keras Frameworks', 'Google Colab GPU & CUDA Basics'],
            skillsGained: ['PyTorch Basics', 'CUDA GPU Setup', 'Neural Architecture'],
            labsCount: 8,
            highlightIcon: <Brain className="w-5 h-5" />,
          },
          {
            id: 'dl45-2',
            moduleNumber: 'Module 2',
            tag: 'Math Foundations',
            title: 'Mathematical Foundations for Deep Learning',
            durationText: '1.5 WEEKS',
            description: 'Linear algebra, tensors, multivariable calculus, chain rule, gradients, and cost/loss optimization.',
            topics: ['Scalars, Vectors, Matrices & Tensors', 'Calculus: Derivatives & Multivariable Gradients', 'Gradient Descent Optimization & Cost Functions', 'Convex vs Non-Convex Optimization'],
            skillsGained: ['Vector Calculus', 'Loss Optimization', 'Tensors'],
            task: 'Implement Gradient Descent from Scratch',
            labsCount: 10,
            highlightIcon: <Cpu className="w-5 h-5" />,
          },
          {
            id: 'dl45-3',
            moduleNumber: 'Module 3',
            tag: 'Neural Networks',
            title: 'Neural Network Fundamentals & Deep Networks',
            durationText: '1.5 WEEKS',
            description: 'Feedforward networks, forward/backpropagation, activation functions, weight initialization, and Adam optimizers.',
            topics: ['Feed Forward Neural Networks & Backpropagation', 'Activation Functions (Sigmoid, ReLU, Softmax)', 'Vanishing Gradients & Weight Initialization', 'Optimizers (Adam, SGD, RMSProp) & Early Stopping'],
            skillsGained: ['Backpropagation', 'Activation Functions', 'Adam Optimizer'],
            task: 'Loan Approval Prediction Neural Network',
            labsCount: 12,
            highlightIcon: <Workflow className="w-5 h-5" />,
          },
          {
            id: 'dl45-4',
            moduleNumber: 'Module 4',
            tag: 'Deployment Project',
            title: 'Deep Learning Solution Deployment',
            durationText: '1 WEEK',
            description: 'Model serialization (SavedModel, PyTorch state_dict), Streamlit/Flask deployment, and GitHub documentation.',
            topics: ['End-to-End Deep Learning Workflow', 'Model Saving & PyTorch Serialization', 'Streamlit & Flask-Based Model Deployment', 'GitHub Documentation & Interview Preparation'],
            skillsGained: ['Streamlit Deployment', 'Model Serialization', 'GitHub'],
            task: 'Develop & Deploy a Real-World Deep Learning Solution',
            labsCount: 8,
            highlightIcon: <Award className="w-5 h-5" />,
          },
        ],
      },
      '3months': {
        durationText: '3 Months Specialization',
        modules: [
          {
            id: 'dl3m-1',
            moduleNumber: 'Module 1',
            tag: 'Neural Math & ANN',
            title: 'Neural Networks from Scratch & PyTorch Tensors',
            durationText: '4 WEEKS',
            description: 'Deriving backpropagation, custom autograd engines, GPU acceleration, and batch normalization.',
            topics: ['Custom Autograd Engine & Backprop Derivation', 'PyTorch Tensor Computations & CUDA Acceleration', 'Regularization: Dropout & Batch Normalization'],
            skillsGained: ['Autograd Engine', 'PyTorch Tensors', 'Batch Norm'],
            labsCount: 16,
            highlightIcon: <Brain className="w-5 h-5" />,
          },
          {
            id: 'dl3m-2',
            moduleNumber: 'Module 2',
            tag: 'Vision & Transformers',
            title: 'CNN Computer Vision, LSTMs & Transformers',
            durationText: '4 WEEKS',
            description: 'ResNet, transfer learning, YOLO object detection, multi-head self-attention, and Transformer encoders.',
            topics: ['CNNs: Convolutions, ResNet & Transfer Learning', 'YOLO Object Detection & Image Segmentation', 'Multi-Head Self-Attention & Transformer Architecture'],
            skillsGained: ['CNNs & ResNet', 'YOLO Object Detection', 'Transformers'],
            labsCount: 18,
            highlightIcon: <Cpu className="w-5 h-5" />,
          },
          {
            id: 'dl3m-3',
            moduleNumber: 'Module 3',
            tag: 'Serving & Capstone',
            title: 'FastAPI TorchScript Serving & Cloud Deployment',
            durationText: '4 WEEKS',
            description: 'Serving deep learning models with FastAPI, TorchScript & ONNX optimization, and Streamlit interfaces.',
            topics: ['TorchScript & ONNX Model Optimization', 'FastAPI Real-Time Model Serving Microservice', 'Streamlit Interactive Deep Learning Web App Deployment'],
            skillsGained: ['ONNX Export', 'FastAPI Serving', 'Cloud Deployment'],
            labsCount: 14,
            highlightIcon: <Award className="w-5 h-5" />,
          },
        ],
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CYBERSECURITY SPECIALIZATIONS (LIME THEMED)
  // ═══════════════════════════════════════════════════════════════════════════
  
  // ── 11. VAPT & WEB PENETRATION TESTING ──
  {
    id: 'vapt-web-security',
    slug: 'vapt-web-security',
    title: 'VAPT & Web Penetration Testing',
    category: 'cyber',
    categoryLabel: 'Offensive Security',
    supportedDurations: ['45days', '3months', '6months'],
    rating: 4.9,
    reviewCount: 1540,
    badge: 'OFFENSIVE SECURITY',
    tagline: 'Hands-on ethical hacking, OWASP Top 10 exploitation, Burp Suite Pro mastery & vulnerability reporting.',
    highlights: ['OWASP Top 10 Deep Dive', 'Burp Suite Pro Labs', 'Active Directory Attacks', 'Real Client Audit Reports'],
    level: 'Beginner (From Scratch)',
    durationData: {
      '45days': {
        durationText: '45 Days Sprint',
        modules: [
          {
            id: 'vapt45-1',
            moduleNumber: 'Module 0',
            tag: 'Beginner Starting Point',
            title: 'Linux CLI, Networking & HTTP Architecture',
            durationText: '1.5 WEEKS',
            description: 'Zero prerequisites: Linux navigation, bash scripting, TCP/IP, OSI model, packet analysis with Wireshark, and HTTP headers.',
            topics: ['Linux Command Line Mastery & Permissions', 'TCP/IP, Subnetting & Port Scanning with Nmap', 'HTTP Request-Response Lifecycle & Status Codes', 'Packet Capture Analysis using Wireshark & tcpdump'],
            skillsGained: ['Linux Hardening', 'Nmap Port Scanning', 'Wireshark'],
            labsCount: 8,
            highlightIcon: <Terminal className="w-5 h-5" />,
          },
          {
            id: 'vapt45-2',
            moduleNumber: 'Module 1',
            tag: 'Web Pentesting Core',
            title: 'OWASP Top 10 Web Vulnerability Exploitation',
            durationText: '2 WEEKS',
            description: 'Live exploitation of SQL Injection, Cross-Site Scripting (XSS), CSRF, broken authentication, and session hijacking.',
            topics: ['SQL Injection (SQLi): Union, Blind & Error-Based', 'Cross-Site Scripting (XSS): Stored, Reflected & DOM', 'Broken Authentication, Session Fixation & IDOR Flaws', 'Burp Suite Essentials: Proxy, Repeater & Intruder Workflows'],
            skillsGained: ['Burp Suite', 'OWASP Top 10', 'IDOR & SQLi'],
            task: 'Comprehensive Web Application Vulnerability Assessment',
            labsCount: 14,
            highlightIcon: <Zap className="w-5 h-5" />,
          },
          {
            id: 'vapt45-3',
            moduleNumber: 'Module 2',
            tag: 'Capstone & Audit',
            title: 'API Security & Professional Audit Reporting',
            durationText: '1.5 WEEKS',
            description: 'API security testing (OWASP API Top 10), JWT token attacks, and compiling enterprise-grade penetration testing reports.',
            topics: ['REST API Vulnerabilities & JWT Manipulation', 'Server-Side Request Forgery (SSRF) & File Inclusion', 'Writing Professional VAPT Audit Reports with Remediation', 'Fast-Track Live Cyber Range Capture The Flag (CTF)'],
            skillsGained: ['API Security', 'VAPT Reporting', 'CTF Warfare'],
            labsCount: 10,
            highlightIcon: <Award className="w-5 h-5" />,
          },
        ],
      },
      '3months': {
        durationText: '3 Months Specialization',
        modules: [
          {
            id: 'vapt3m-1',
            moduleNumber: 'Module 1',
            tag: 'Recon & Web Core',
            title: 'Advanced OSINT, Surface Mapping & Web Pentest',
            durationText: '3 WEEKS',
            description: 'Reconnaissance, subdomain enumeration, JavaScript analysis, and advanced exploitation of complex business logic flaws.',
            topics: ['OSINT & Attack Surface Mapping (Amass, Subfinder, Nmap)', 'Advanced Burp Suite Pro Extensions & Custom Macros', 'Complex Authentication: OAuth 2.0, SAML & 2FA Bypasses', 'Race Conditions, SSRF & Remote Code Execution (RCE)'],
            skillsGained: ['OSINT', 'Burp Pro', 'OAuth Bypasses', 'SSRF to RCE'],
            labsCount: 18,
            highlightIcon: <Terminal className="w-5 h-5" />,
          },
          {
            id: 'vapt3m-2',
            moduleNumber: 'Module 2',
            tag: 'API & Mobile Pentest',
            title: 'REST/GraphQL API Security & Mobile Pentesting',
            durationText: '3 WEEKS',
            description: 'API authorization flaws, GraphQL introspection abuse, Android APK reverse engineering, and SSL pinning bypasses.',
            topics: ['OWASP API Top 10: BOLA, BFLA & Mass Assignment Exploits', 'GraphQL Vulnerabilities & Batch Request Amplification', 'Android Pentesting: APK Decompilation with Jadx & Frida Hooking'],
            skillsGained: ['GraphQL Auditing', 'Android Pentest (Frida)', 'BOLA Exploitation'],
            labsCount: 20,
            highlightIcon: <Zap className="w-5 h-5" />,
          },
          {
            id: 'vapt3m-3',
            moduleNumber: 'Module 3',
            tag: 'Active Directory',
            title: 'Network Pentesting & Active Directory Attacks',
            durationText: '3 WEEKS',
            description: 'Internal network pivoting, Kerberoasting, AS-REP roasting, BloodHound graph analysis, and domain compromise.',
            topics: ['Active Directory Reconnaissance with BloodHound & PowerView', 'Kerberos Attacks: Kerberoasting, Golden Ticket & Silver Ticket', 'NTLM Relay Attacks & Lateral Movement Techniques'],
            skillsGained: ['Active Directory', 'BloodHound', 'Kerberoasting'],
            labsCount: 22,
            highlightIcon: <Shield className="w-5 h-5" />,
          },
          {
            id: 'vapt3m-4',
            moduleNumber: 'Module 4',
            tag: 'Bug Bounty & Capstone',
            title: 'Bug Bounty Methodology & Enterprise War Drill',
            durationText: '3 WEEKS',
            description: 'Bug bounty triage workflows, vulnerability disclosure, and a 48-hour live corporate attack simulation.',
            topics: ['Bug Bounty Automation with Nuclei, Axiom & Custom Scripts', 'Responsible Disclosure & Executive Vulnerability Reporting', '48-Hour Live Corporate Cyber Range Simulation'],
            skillsGained: ['Bug Bounty', 'Nuclei Automation', 'Cyber Range'],
            labsCount: 14,
            highlightIcon: <Award className="w-5 h-5" />,
          },
        ],
      },
      '6months': {
        durationText: '6 Months Fellowship',
        modules: [
          {
            id: 'vapt6m-1',
            moduleNumber: 'Module 1',
            tag: 'Systems & Exploit Dev',
            title: 'Low-Level Architecture, Assembly & Buffer Overflows',
            durationText: '5 WEEKS',
            description: 'Computer architecture, CPU registers, stack/heap memory, x86/x64 assembly, and basic buffer overflow exploit development.',
            topics: ['CPU Registers, Stack Memory Layout & Assembly Basics', 'Memory Protections: DEP, ASLR, Stack Canaries', 'Vanilla Buffer Overflow Exploitation & Shellcoding in C'],
            skillsGained: ['x86 Assembly', 'Buffer Overflows', 'Shellcoding'],
            labsCount: 24,
            highlightIcon: <Terminal className="w-5 h-5" />,
          },
          {
            id: 'vapt6m-2',
            moduleNumber: 'Module 2',
            tag: 'Advanced Red Team',
            title: 'Enterprise Active Directory & Cloud Red Teaming',
            durationText: '5 WEEKS',
            description: 'Multi-forest Active Directory compromise, AWS/Azure cloud privilege escalation, and credential dumping.',
            topics: ['Multi-Forest Trusts, DCShadow & Certificate Services (AD CS) Exploits', 'AWS IAM Privilege Escalation & CloudTrail Evasion', 'C2 Frameworks (Cobalt Strike, Sliver) & Beaconing Strategy'],
            skillsGained: ['AD CS Attacks', 'Cloud Red Teaming', 'C2 Frameworks'],
            labsCount: 28,
            highlightIcon: <Zap className="w-5 h-5" />,
          },
          {
            id: 'vapt6m-3',
            moduleNumber: 'Module 3',
            tag: 'EDR Evasion',
            title: 'Payload Development & Antivirus / EDR Evasion',
            durationText: '5 WEEKS',
            description: 'Bypassing modern EDR solutions using syscalls, process injection, API unhooking, and AMSI memory patching.',
            topics: ['Direct & Indirect System Calls (SysWhispers) in C/C++', 'Process Injection: Early Bird, Process Hollowing & Fiber Injection', 'Bypassing AMSI & ETW Memory Patching Techniques'],
            skillsGained: ['Syscalls', 'EDR Evasion', 'Process Injection'],
            labsCount: 26,
            highlightIcon: <Lock className="w-5 h-5" />,
          },
          {
            id: 'vapt6m-4',
            moduleNumber: 'Module 4',
            tag: 'Fellowship Capstone',
            title: 'Simulated Multinational Cyber Arena & Placement',
            durationText: '5 WEEKS',
            description: 'Full-scale simulated enterprise red team operation, board-level risk presentation, and placement coaching.',
            topics: ['Red Team Operation on Simulated Enterprise Infrastructure', 'Executive Risk Scoring & Boardroom Strategy Briefing', 'Direct Placement Drives with Leading Security Firms'],
            skillsGained: ['Enterprise Red Teaming', 'Executive Strategy', 'Placement Mastery'],
            labsCount: 16,
            highlightIcon: <Award className="w-5 h-5" />,
          },
        ],
      },
    },
  },

  // ── 12. SOC & BLUE TEAM OPERATIONS ──
  {
    id: 'soc-blue-team',
    slug: 'soc-blue-team',
    title: 'SOC & Blue Team Operations',
    category: 'cyber',
    categoryLabel: 'Defensive Security',
    supportedDurations: ['45days', '3months', '6months'],
    rating: 4.85,
    reviewCount: 1320,
    badge: 'DEFENSIVE CYBER OPS',
    tagline: 'Master enterprise SIEM (Splunk/Elastic), Sysmon log analysis, threat hunting & live incident response.',
    highlights: ['Splunk Enterprise & Wazuh', 'Sysmon & Windows Events', 'MITRE ATT&CK Mapping', 'Live Malware Triage'],
    level: 'Beginner (From Scratch)',
    durationData: {
      '45days': {
        durationText: '45 Days Sprint',
        modules: [
          {
            id: 'soc45-1',
            moduleNumber: 'Module 0',
            tag: 'Beginner Starting Point',
            title: 'Computing, Networking & Linux Security Basics',
            durationText: '1.5 WEEKS',
            description: 'Core systems architecture, Linux permissions, TCP/IP networking, packet analysis, and security principles.',
            topics: ['Linux CLI Administration & System Logs (/var/log)', 'TCP/IP Protocol Stack & Wireshark Traffic Inspection', 'DNS, DHCP, HTTP/S Handshakes & Firewall Basics'],
            skillsGained: ['Linux Logs', 'Wireshark', 'TCP/IP Analysis'],
            labsCount: 8,
            highlightIcon: <Terminal className="w-5 h-5" />,
          },
          {
            id: 'soc45-2',
            moduleNumber: 'Module 1',
            tag: 'SIEM & Detection',
            title: 'SOC Architecture & Log Analysis with Splunk',
            durationText: '2 WEEKS',
            description: 'SOC tiers, Splunk Search Processing Language (SPL), Windows Event logs, Sysmon, and MITRE ATT&CK mapping.',
            topics: ['SOC Operations & Security Analyst Workflow', 'Splunk Enterprise: Search Processing Language (SPL) & Dashboards', 'Windows Event Logs & Sysmon Threat Detection Patterns', 'MITRE ATT&CK Framework Mapping & Tactics'],
            skillsGained: ['Splunk SPL', 'Sysmon Logs', 'MITRE ATT&CK'],
            task: 'Build Splunk Threat Detection Dashboard',
            labsCount: 12,
            highlightIcon: <Shield className="w-5 h-5" />,
          },
          {
            id: 'soc45-3',
            moduleNumber: 'Module 2',
            tag: 'Incident Response',
            title: 'Phishing Triage & Incident Containment',
            durationText: '1.5 WEEKS',
            description: 'Phishing email header analysis, malicious attachments, memory triage, and NIST incident response playbooks.',
            topics: ['Phishing Email Header Analysis & SPF/DKIM/DMARC Verification', 'Malware Behavior Analysis in Sandboxes (Any.Run)', 'NIST SP 800-61 Incident Response Playbooks & Containment'],
            skillsGained: ['Phishing Triage', 'Sandbox Analysis', 'Incident Playbooks'],
            labsCount: 10,
            highlightIcon: <Award className="w-5 h-5" />,
          },
        ],
      },
      '3months': {
        durationText: '3 Months Specialization',
        modules: [
          {
            id: 'soc3m-1',
            moduleNumber: 'Module 1',
            tag: 'Enterprise SIEM',
            title: 'Enterprise SIEM Engineering (Splunk & Wazuh)',
            durationText: '3 WEEKS',
            description: 'Deploying forwarders, authoring custom Sigma rules, indexing strategies, and automated alert correlation.',
            topics: ['Splunk Architecture & Universal Forwarder Deployment', 'Writing Custom Sigma Rules & Correlation Searches', 'Wazuh Open-Source EDR/XDR Integration & Alerting'],
            skillsGained: ['Sigma Rules', 'Splunk Engineering', 'Wazuh EDR'],
            labsCount: 16,
            highlightIcon: <Shield className="w-5 h-5" />,
          },
          {
            id: 'soc3m-2',
            moduleNumber: 'Module 2',
            tag: 'Threat Hunting',
            title: 'Network Threat Hunting & C2 Beacon Analysis',
            durationText: '3 WEEKS',
            description: 'Hunting malicious persistence, Zeek network logs, Suricata IDS alerts, and identifying Cobalt Strike beacons.',
            topics: ['Zeek Network Security Monitoring & Suricata Alert Triage', 'Detecting Command & Control (C2) Jitter & Beaconing', 'Hunting Lateral Movement: PsExec, WMI & WinRM Logs'],
            skillsGained: ['Zeek & Suricata', 'C2 Hunting', 'Lateral Movement Detection'],
            labsCount: 18,
            highlightIcon: <Zap className="w-5 h-5" />,
          },
          {
            id: 'soc3m-3',
            moduleNumber: 'Module 3',
            tag: 'DFIR & Forensics',
            title: 'Digital Forensics & Memory Investigation',
            durationText: '3 WEEKS',
            description: 'Memory forensics with Volatility 3, disk imaging (FTK Imager), registry hive analysis, and timeline generation.',
            topics: ['Memory Forensics with Volatility 3: Process Trees & Injected Code', 'Windows Registry Forensics & UserAssist Artifacts', 'Live Ransomware Incident Triage & Containment Exercise'],
            skillsGained: ['Volatility 3', 'Registry Forensics', 'Ransomware Triage'],
            labsCount: 16,
            highlightIcon: <Lock className="w-5 h-5" />,
          },
          {
            id: 'soc3m-4',
            moduleNumber: 'Module 4',
            tag: 'SOC War Room',
            title: 'SOAR Automation & 48h Blue Team Defense Battle',
            durationText: '3 WEEKS',
            description: 'Automated SOAR playbooks, threat intelligence (MISP/OpenCTI), and defending live simulated infrastructure.',
            topics: ['Security Orchestration & Automated Response (SOAR) Playbooks', 'Threat Intelligence Platform (MISP / OpenCTI) Integration', '48-Hour Live Blue Team Cyber Arena Defense Operation'],
            skillsGained: ['SOAR Playbooks', 'Threat Intel (MISP)', 'Cyber Range Defense'],
            labsCount: 14,
            highlightIcon: <Award className="w-5 h-5" />,
          },
        ],
      },
      '6months': {
        durationText: '6 Months Fellowship',
        modules: [
          {
            id: 'soc6m-1',
            moduleNumber: 'Module 1',
            tag: 'Advanced Forensics',
            title: 'Enterprise DFIR, Kernel Internals & Reverse Engineering',
            durationText: '5 WEEKS',
            description: 'Windows/Linux kernel internals, rootkit detection, disassembly with Ghidra/x64dbg, and malware unpacking.',
            topics: ['Kernel Internals, Hooking & Kernel-Level Rootkit Hunting', 'Static & Dynamic Malware Analysis with Ghidra & x64dbg', 'Unpacking Obfuscated Payloads & Authoring YARA Rules'],
            skillsGained: ['Malware Analysis (Ghidra)', 'YARA Rules', 'Rootkit Hunting'],
            labsCount: 24,
            highlightIcon: <Terminal className="w-5 h-5" />,
          },
          {
            id: 'soc6m-2',
            moduleNumber: 'Module 2',
            tag: 'Cloud SOC & eBPF',
            title: 'Cloud Threat Detection (AWS/Azure) & eBPF Security',
            durationText: '5 WEEKS',
            description: 'CloudTrail/GuardDuty telemetry, Kubernetes container runtime security with Cilium/Tetragon eBPF, and cloud forensics.',
            topics: ['AWS CloudTrail, GuardDuty & VPC Flow Log Threat Detection', 'Linux eBPF Kernel Tracing with Tetragon for Zero-Day Alerts', 'Kubernetes Pod Compromise Forensics & Containment'],
            skillsGained: ['eBPF Tetragon', 'AWS Threat Hunting', 'K8s Forensics'],
            labsCount: 26,
            highlightIcon: <Shield className="w-5 h-5" />,
          },
          {
            id: 'soc6m-3',
            moduleNumber: 'Module 3',
            tag: 'Threat Intelligence',
            title: 'Strategic Cyber Threat Intelligence (CTI) & Threat Modeling',
            durationText: '5 WEEKS',
            description: 'Adversary emulation, tracking APT groups (Diamond Model), ATT&CK Navigator, and executive threat reporting.',
            topics: ['Diamond Model of Intrusion Analysis & STIX/TAXII Standards', 'Adversary Emulation with Caldera & Atomic Red Team', 'Authoring Enterprise Threat Intelligence Briefings for Leadership'],
            skillsGained: ['Caldera Emulation', 'CTI Diamond Model', 'Executive Briefings'],
            labsCount: 22,
            highlightIcon: <Zap className="w-5 h-5" />,
          },
          {
            id: 'soc6m-4',
            moduleNumber: 'Module 4',
            tag: 'Fellowship Capstone',
            title: 'Live Enterprise Blue Team Arena & SOC Lead Placement',
            durationText: '5 WEEKS',
            description: 'Lead a high-stakes enterprise defensive operation against coordinated red team attacks, with direct senior placement.',
            topics: ['Enterprise Blue Team Defense Operation in Simulated Range', 'Incident Post-Mortem & SOC Strategy Presentation', 'Direct Placement Referral Network for Senior Security Roles'],
            skillsGained: ['Incident Leadership', 'SOC Strategy', 'Senior Placement'],
            labsCount: 16,
            highlightIcon: <Award className="w-5 h-5" />,
          },
        ],
      },
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATED TRAIN TRACK COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

interface TrainProgressTrackProps {
  modules: ModuleItem[];
  activeModuleIndex: number;
  onSelectModule: (index: number) => void;
  durationLabel: string;
  isCyber: boolean;
}

function TrainProgressTrack({
  modules,
  activeModuleIndex,
  onSelectModule,
  durationLabel,
  isCyber,
}: TrainProgressTrackProps) {
  const totalStations = modules.length;
  const progressPercent = totalStations > 1 ? (activeModuleIndex / (totalStations - 1)) * 100 : 0;

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const targetIndex = Math.round(ratio * (totalStations - 1));
    onSelectModule(targetIndex);
  };

  return (
    <div className={`w-full rounded-3xl p-5 sm:p-7 text-white shadow-2xl relative overflow-hidden mb-10 border transition-all duration-500 backdrop-blur-2xl ${
      isCyber
        ? 'bg-[#0a110c]/90 border-[#C6FF34]/30 shadow-[#C6FF34]/10'
        : 'bg-slate-950/90 border-white/10 shadow-violet-500/10'
    }`}>
      {/* Ambient Background Glow & Micro-Grid */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-24 rounded-full blur-3xl pointer-events-none opacity-20 transition-colors ${
        isCyber ? 'bg-[#C6FF34]' : 'bg-cyan-400'
      }`} />
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* ── TOP HUD HEADER (iOS Dynamic Control Aesthetic) ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-2xl flex items-center justify-center border shadow-sm ${
            isCyber
              ? 'bg-[#C6FF34]/15 text-[#C6FF34] border-[#C6FF34]/40'
              : 'bg-cyan-500/15 text-cyan-300 border-cyan-400/30'
          }`}>
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold tracking-widest font-mono uppercase px-2 py-0.5 rounded-full border ${
                isCyber
                  ? 'bg-[#C6FF34]/10 text-[#C6FF34] border-[#C6FF34]/30'
                  : 'bg-cyan-400/10 text-cyan-300 border-cyan-400/25'
              }`}>
                iOS PROGRESSION CONTROL
              </span>
              <span className={`w-2 h-2 rounded-full animate-ping ${isCyber ? 'bg-[#C6FF34]' : 'bg-cyan-400'}`} />
            </div>
            <h4 className="text-sm sm:text-base font-semibold text-white tracking-tight mt-0.5">
              Station-by-Station Learning Milestone
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/10 text-xs font-mono shadow-inner">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400">Pace:</span>
          <span className="text-white font-medium">{durationLabel}</span>
          <span className="text-slate-600">•</span>
          <span className={`font-bold ${isCyber ? 'text-[#C6FF34]' : 'text-cyan-300'}`}>
            Station {activeModuleIndex + 1}/{totalStations}
          </span>
        </div>
      </div>

      {/* ── THE IPHONE VOLUME SLIDER TRACK ── */}
      <div className="relative z-10 my-4">
        <div
          onClick={handleTrackClick}
          className="w-full h-14 sm:h-16 bg-slate-900/90 rounded-full border border-white/15 relative overflow-hidden shadow-2xl cursor-pointer select-none group backdrop-blur-md flex items-center transition-all duration-300 hover:border-white/30"
        >
          {/* Station Notches / Tick Marks along the Track */}
          <div className="absolute inset-0 flex justify-between items-center px-4 sm:px-6 pointer-events-none z-0 opacity-25">
            {modules.map((_, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1">
                <div className="w-[2px] h-3 bg-white rounded-full" />
              </div>
            ))}
          </div>

          {/* Dynamic Volume Fill Bar */}
          <motion.div
            className={`h-full rounded-full relative overflow-hidden flex items-center transition-all duration-300 ${
              isCyber
                ? 'bg-gradient-to-r from-emerald-600 via-lime-500 to-[#C6FF34] shadow-[0_0_25px_rgba(198,255,52,0.4)]'
                : 'bg-gradient-to-r from-indigo-600 via-violet-500 to-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.4)]'
            }`}
            initial={{ width: `${progressPercent}%` }}
            animate={{ width: `${Math.max(progressPercent, 3)}%` }}
            transition={{ type: 'spring', stiffness: 220, damping: 25 }}
          >
            {/* Top Glossy Glass Reflection */}
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-full pointer-events-none" />

            {/* Micro Sparkle Wave inside Fill */}
            <div className="absolute inset-0 opacity-20 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] animate-pulse" />

            {/* Leading Edge iOS Handle Pill */}
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 w-2.5 h-8 sm:h-10 bg-white rounded-full shadow-[0_0_12px_rgba(255,255,255,0.9)] z-20" />
          </motion.div>

          {/* Floating Text Overlay inside Volume Slider */}
          <div className="absolute inset-0 flex items-center justify-between px-5 sm:px-7 pointer-events-none z-10">
            <div className="flex items-center gap-2 text-white text-xs sm:text-sm font-semibold tracking-wide drop-shadow-md">
              <span className="w-2 h-2 rounded-full bg-white/80 animate-pulse" />
              <span className="font-mono text-white/90 text-xs sm:text-sm truncate max-w-[200px] sm:max-w-none">
                {modules[activeModuleIndex]?.moduleNumber}: {modules[activeModuleIndex]?.title}
              </span>
            </div>

            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-xs font-mono font-bold text-white shadow-md">
              <span>{Math.round(progressPercent)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── STATIONS / MILESTONE CHECKPOINTS (iOS Style Nodes) ── */}
      <div className="relative flex justify-between items-start pt-3 px-1 sm:px-3 z-10">
        {modules.map((module, idx) => {
          const isActive = idx === activeModuleIndex;
          const isPassed = idx <= activeModuleIndex;

          return (
            <button
              key={module.id}
              onClick={() => onSelectModule(idx)}
              className="group flex flex-col items-center focus:outline-none text-center transition-all duration-300 max-w-[75px] sm:max-w-[105px] cursor-pointer"
            >
              {/* Station Node Capsule */}
              <div
                className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all duration-300 shadow-lg ${
                  isActive
                    ? isCyber
                      ? 'bg-[#C6FF34] text-slate-950 scale-125 ring-4 ring-[#C6FF34]/40 font-black shadow-[0_0_15px_rgba(198,255,52,0.6)]'
                      : 'bg-cyan-400 text-slate-950 scale-125 ring-4 ring-cyan-400/40 font-black shadow-[0_0_15px_rgba(34,211,238,0.6)]'
                    : isPassed
                    ? isCyber
                      ? 'bg-emerald-600/80 text-white border border-emerald-400/40 hover:bg-emerald-500'
                      : 'bg-violet-600/80 text-white border border-violet-400/40 hover:bg-violet-500'
                    : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/15 hover:text-white'
                }`}
              >
                {idx === 0 ? '0' : idx}
              </div>

              {/* Station Label */}
              <div className="mt-2.5 space-y-0.5">
                <span
                  className={`block text-[10px] sm:text-xs font-medium leading-tight transition-colors ${
                    isActive
                      ? isCyber
                        ? 'text-[#C6FF34] font-bold'
                        : 'text-cyan-300 font-bold'
                      : isPassed
                      ? 'text-slate-200'
                      : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                >
                  {module.moduleNumber}
                </span>
                <span className="hidden sm:block text-[9px] text-slate-400 line-clamp-1">
                  {idx === 0 ? 'From Scratch' : module.tag}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PREMIUM 2-COLUMN COURSE ADMISSIONS MODAL
// ─────────────────────────────────────────────────────────────────────────────

interface CourseApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCourse: CourseItem;
  initialDuration: DurationType;
}

function CourseApplicationModal({
  isOpen,
  onClose,
  selectedCourse,
  initialDuration,
}: CourseApplicationModalProps) {
  const [activeCourseId, setActiveCourseId] = useState<string>(selectedCourse.id);
  const [selectedDuration, setSelectedDuration] = useState<DurationType>(initialDuration);
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentStatus: 'scratch',
    enquiryPurpose: '',
    preferredSchedule: 'weekday',
  });

  React.useEffect(() => {
    if (isOpen) {
      setActiveCourseId(selectedCourse.id);
      setSelectedDuration(initialDuration);
      setStep(1);
      setIsSubmitted(false);
    }
  }, [isOpen, selectedCourse, initialDuration]);

  const currentCourse = COURSES_DATA.find((c) => c.id === activeCourseId) || selectedCourse;
  const isCyber = currentCourse.category === 'cyber';

  const durationLabels: Record<DurationType, string> = {
    '45days': '45 Days Sprint',
    '3months': '3 Months Mastery',
    '6months': '6 Months Fellowship',
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-white text-slate-900 border-none sm:rounded-3xl shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-12 items-stretch min-h-[540px]">
          
          {/* ── LEFT COLUMN (CHARCOAL/DARK BRAND CARD) ── */}
          <div className="md:col-span-5 bg-gradient-to-br from-[#0c0c14] via-[#09090f] to-[#040408] p-8 text-white flex flex-col justify-between relative overflow-hidden">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
            
            {/* Brand Header */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-wider text-base">THREAD SECURITY</span>
                <span className="text-[9px] bg-white/15 px-2 py-0.5 rounded-sm uppercase font-semibold tracking-widest text-slate-300">
                  EDUCATION
                </span>
              </div>
            </div>

            {/* Pitch Message */}
            <div className="relative z-10 my-6 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-[10px] font-semibold tracking-wider text-slate-300 uppercase">
                <Sparkles className="w-3 h-3 text-[#C6FF34]" />
                <span>ADMISSIONS OPEN • 2026 COHORT</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight">
                Accelerate your<br />
                <span className={`italic font-serif font-light ${isCyber ? 'text-[#C6FF34]' : 'text-violet-400'}`}>
                  technical mastery.
                </span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                Hands-on practical training taught from scratch by senior engineers with dedicated mentor support.
              </p>
            </div>

            {/* Program Highlights Pill Box */}
            <div className="relative z-10 bg-white/[0.04] backdrop-blur-sm rounded-2xl p-4 border border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                <span className="text-slate-400 font-medium">Selected Program</span>
                <span className={`font-semibold ${isCyber ? 'text-[#C6FF34]' : 'text-violet-300'}`}>
                  {currentCourse.title}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                <span className="text-slate-400 font-medium">Track Pace</span>
                <span className="font-semibold text-white">{durationLabels[selectedDuration]}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Rating</span>
                <span className="font-semibold text-amber-400 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {currentCourse.rating}/5.0 ({currentCourse.reviewCount}+ learners)
                </span>
              </div>
            </div>

          </div>

          {/* ── RIGHT COLUMN (PREMIUM MULTI-STEP FORM) ── */}
          <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-center bg-white">
            
            {!isSubmitted ? (
              <>
                {step === 1 ? (
                  <form onSubmit={handleNext} className="space-y-5">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                          Enroll for {currentCourse.title}
                        </h3>
                        <span className="text-xs font-semibold text-slate-400">Step 1 of 2</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-500">
                        Fill in your basic credentials to receive syllabus & schedule.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Name Input */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 tracking-wide">Full Name *</label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            required
                            placeholder="e.g. Aditi Sharma"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all text-sm font-medium"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                        </div>
                      </div>

                      {/* Email Input */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 tracking-wide">Email Address *</label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="email"
                            required
                            placeholder="aditi@example.com"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all text-sm font-medium"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          />
                        </div>
                      </div>

                      {/* Phone Input with +91 Code */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 tracking-wide">WhatsApp / Phone Number *</label>
                        <div className="flex border border-slate-200 rounded-xl overflow-hidden bg-slate-50 focus-within:ring-2 focus-within:ring-slate-900 focus-within:bg-white transition-all">
                          <div className="flex items-center gap-1 px-3.5 border-r border-slate-200 bg-slate-100 text-xs font-semibold text-slate-700 select-none">
                            <Phone className="w-3.5 h-3.5 text-slate-500" />
                            <span>+91</span>
                          </div>
                          <input
                            type="tel"
                            required
                            placeholder="98765 43210"
                            className="w-full bg-transparent px-4 py-3 text-slate-950 placeholder-slate-400 focus:outline-none text-sm font-medium"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Step Indicators */}
                    <div className="flex justify-center items-center gap-1.5 py-1">
                      <span className={`w-3.5 h-1.5 rounded-full ${isCyber ? 'bg-emerald-600' : 'bg-violet-600'}`} />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                    </div>

                    <Button
                      type="submit"
                      className={`w-full py-4 text-white font-semibold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 ${
                        isCyber
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-violet-600 hover:bg-violet-700 text-white'
                      }`}
                    >
                      <span>Continue to Learning Goals & Enquiry</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                          Goals & Enquiry
                        </h3>
                        <span className="text-xs font-semibold text-slate-400">Step 2 of 2</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-500">
                        Tell us your background and specific questions for the academic team.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* What describes you best */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 tracking-wide">Current Experience Level *</label>
                        <select
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all text-xs sm:text-sm font-medium cursor-pointer"
                          value={formData.currentStatus}
                          onChange={(e) => setFormData({ ...formData, currentStatus: e.target.value })}
                        >
                          <option value="scratch">Absolute Beginner (Starting from Scratch)</option>
                          <option value="college">College Student / Recent Graduate</option>
                          <option value="working">Working Professional Seeking Role Transition</option>
                          <option value="experienced">Experienced Engineer Upskilling</option>
                        </select>
                      </div>

                      {/* Explicit Enquiry Purpose Input */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 tracking-wide flex items-center justify-between">
                          <span>Specific Enquiry / What are you looking to achieve? *</span>
                          <span className="text-[10px] text-slate-400">Required</span>
                        </label>
                        <div className="relative">
                          <MessageSquare className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                          <textarea
                            required
                            rows={3}
                            placeholder="e.g. Inquiring about weekend batch timings, internship assistance, or switching to SOC/AI fellowship..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all text-xs sm:text-sm font-medium resize-none"
                            value={formData.enquiryPurpose}
                            onChange={(e) => setFormData({ ...formData, enquiryPurpose: e.target.value })}
                          />
                        </div>
                      </div>

                      {/* Preferred Schedule */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 tracking-wide">Preferred Batch Schedule</label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: 'weekday', label: 'Weekday Live Evenings' },
                            { id: 'weekend', label: 'Weekend Intensive' },
                          ].map((b) => (
                            <button
                              type="button"
                              key={b.id}
                              onClick={() => setFormData({ ...formData, preferredSchedule: b.id })}
                              className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                                formData.preferredSchedule === b.id
                                  ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
                              }`}
                            >
                              {b.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Step Indicators */}
                    <div className="flex justify-center items-center gap-1.5 py-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                      <span className={`w-3.5 h-1.5 rounded-full ${isCyber ? 'bg-emerald-600' : 'bg-violet-600'}`} />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        onClick={() => setStep(1)}
                        className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3.5 rounded-xl transition-all text-xs"
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        className={`w-2/3 py-3.5 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 ${
                          isCyber
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-violet-600 hover:bg-violet-700 text-white'
                        }`}
                      >
                        <span>Submit Application & Enquiry</span>
                        <Send className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </form>
                )}
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6 space-y-4"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Application Submitted!
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Thank you, <strong className="text-slate-900">{formData.name}</strong>! Your application and enquiry for{' '}
                  <strong className={isCyber ? 'text-emerald-700' : 'text-violet-700'}>
                    {currentCourse.title} ({durationLabels[selectedDuration]})
                  </strong>{' '}
                  has been routed to our academic advisor.
                </p>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-1.5 max-w-sm mx-auto">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Contact:</span>
                    <span className="font-semibold text-slate-800">{formData.phone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Enquiry Logged:</span>
                    <span className="font-semibold text-slate-800 truncate max-w-[200px]">{formData.enquiryPurpose}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={onClose}
                    className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-8 py-2.5 font-semibold text-xs shadow-md"
                  >
                    Close & Continue Exploring
                  </Button>
                </div>
              </motion.div>
            )}

          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COURSE ROADMAP SECTION COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function CourseRoadmapSection() {
  const [domainFilter, setDomainFilter] = useState<DomainType>('all');
  const [selectedDuration, setSelectedDuration] = useState<DurationType>('6months');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('foundational-ai');
  const [activeModuleIndex, setActiveModuleIndex] = useState<number>(0);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Filtered courses based on selected duration and domain tab
  const filteredCourses = useMemo(() => {
    return COURSES_DATA.filter((course) => {
      const matchesDuration = course.supportedDurations.includes(selectedDuration);
      const matchesDomain = domainFilter === 'all' || course.category === domainFilter;
      return matchesDuration && matchesDomain;
    });
  }, [domainFilter, selectedDuration]);

  // Keep selected course valid
  const currentCourse = useMemo(() => {
    return (
      filteredCourses.find((c) => c.id === selectedCourseId) ||
      filteredCourses[0] ||
      COURSES_DATA[0]
    );
  }, [filteredCourses, selectedCourseId]);

  const currentDurationData =
    currentCourse.durationData[selectedDuration] ||
    currentCourse.durationData['6months'] ||
    currentCourse.durationData['3months'] ||
    currentCourse.durationData['45days']!;

  const modules = currentDurationData?.modules || [];

  // Handle active module index bounds
  React.useEffect(() => {
    if (activeModuleIndex >= modules.length) {
      setActiveModuleIndex(0);
    }
  }, [modules.length, activeModuleIndex]);

  const activeModule = modules[activeModuleIndex] || modules[0];
  const isCyber = currentCourse.category === 'cyber';

  const durationLabels: Record<DurationType, string> = {
    '45days': '45 Days Sprint',
    '3months': '3 Months Mastery',
    '6months': '6 Months Fellowship',
  };

  return (
    <section
      id="curriculum-roadmap"
      className={`py-20 sm:py-28 relative overflow-hidden border-t transition-colors duration-700 ${
        isCyber
          ? 'bg-[#090e0b] text-white border-[#C6FF34]/20'
          : 'bg-[#F8FAFC] text-slate-900 border-slate-200/80'
      }`}
    >
      {/* ── TSE BORDER SVG BACKGROUND OVERLAY ── */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center">
        <Image
          src="/images/TSE Border.svg"
          alt="TSE Grid Border"
          fill
          className={`object-cover transition-opacity duration-700 ${
            isCyber ? 'opacity-[0.08] invert' : 'opacity-[0.45]'
          }`}
          priority={false}
        />
      </div>

      {/* Background Soft Glows */}
      <div className={`absolute top-10 left-1/2 -translate-x-1/2 w-[850px] h-[380px] rounded-full blur-3xl pointer-events-none transition-colors duration-700 z-0 ${
        isCyber ? 'bg-[#C6FF34]/10' : 'bg-violet-200/35'
      }`} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ── SECTION HEADER ── */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className={`inline-flex items-center gap-2 text-xs font-medium tracking-[0.2em] uppercase font-sans mb-3 ${
            isCyber ? 'text-[#C6FF34]' : 'text-slate-500'
          }`}>
            <span className={`w-6 h-[1.5px] ${isCyber ? 'bg-[#C6FF34]/40' : 'bg-slate-300'}`} />
            CURRICULUM & ROADMAP
            <span className={`w-6 h-[1.5px] ${isCyber ? 'bg-[#C6FF34]/40' : 'bg-slate-300'}`} />
          </div>

          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight ${
            isCyber ? 'text-white' : 'text-slate-900'
          }`}>
            Your{' '}
            <span className={`text-transparent bg-clip-text ${
              isCyber
                ? 'bg-gradient-to-r from-[#C6FF34] via-emerald-400 to-lime-200'
                : 'bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600'
            }`}>
              Step-by-Step Roadmap
            </span>{' '}
            To Senior Role Growth
          </h2>

          <p className={`text-xs sm:text-sm mt-3 max-w-2xl mx-auto leading-relaxed ${
            isCyber ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Structured learning <strong className={isCyber ? 'text-white' : 'text-slate-900'}>starting from very scratch (Module 0/1)</strong> with verified practical labs, live mentorship, and industry-grade projects.
          </p>
        </div>

        {/* ── DURATION TABS + DOMAIN FILTER + HORIZONTAL MARQUEE ── */}
        <div className="flex flex-col items-center gap-5 mb-8">
          
          {/* Top Duration Switcher (6 Months Fellowship | 3 Months Mastery | 45 Days Sprint) */}
          <div className="flex items-center gap-3 text-xs flex-wrap justify-center">
            <span className={`font-medium uppercase tracking-wider text-[11px] ${
              isCyber ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Select Pace & Depth:
            </span>
            <div className={`inline-flex p-1.5 rounded-2xl border shadow-sm ${
              isCyber ? 'bg-[#111914] border-[#C6FF34]/30' : 'bg-white border-slate-200'
            }`}>
              {(['6months', '3months', '45days'] as DurationType[]).map((dur) => (
                <button
                  key={dur}
                  id={`duration-${dur}`}
                  onClick={() => {
                    setSelectedDuration(dur);
                    setActiveModuleIndex(0);
                    // Automatically adjust selected course if not in current duration
                    if (dur === '6months') {
                      setSelectedCourseId('foundational-ai');
                    } else {
                      setSelectedCourseId('python-for-ai');
                    }
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-medium transition-all text-xs cursor-pointer ${
                    selectedDuration === dur
                      ? isCyber
                        ? 'bg-[#C6FF34] text-slate-950 font-semibold shadow-md'
                        : 'bg-violet-600 text-white shadow-md'
                      : isCyber
                      ? 'text-slate-300 hover:text-white hover:bg-white/5'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {dur === '6months' && <Rocket className="w-3.5 h-3.5" />}
                  {dur === '3months' && <Target className="w-3.5 h-3.5" />}
                  {dur === '45days' && <Zap className="w-3.5 h-3.5" />}
                  <span>{dur === '6months' ? '6 Months Fellowship' : dur === '3months' ? '3 Months Mastery' : '45 Days Sprint'}</span>
                </button>
              ))}
            </div>

            {/* Rating Pill Badge */}
            <div className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-medium shadow-2xs border ${
              isCyber
                ? 'bg-[#111914] border-amber-400/40 text-amber-300'
                : 'bg-amber-50 border-amber-200/80 text-amber-900'
            }`}>
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{currentCourse.rating}/5.0 Rated Program</span>
              <span className="font-normal opacity-80">({currentCourse.reviewCount}+ reviews)</span>
            </div>
          </div>

          {/* Domain Category Filter Tabs (All | AI Courses [Violet] | Cybersecurity [Lime]) */}
          <div className={`inline-flex p-1 rounded-2xl border shadow-sm max-w-full overflow-x-auto ${
            isCyber ? 'bg-[#111914] border-[#C6FF34]/30' : 'bg-white border-slate-200'
          }`}>
            <button
              onClick={() => setDomainFilter('all')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                domainFilter === 'all'
                  ? isCyber
                    ? 'bg-[#C6FF34] text-slate-950 font-semibold shadow-md'
                    : 'bg-slate-900 text-white shadow-md'
                  : isCyber
                  ? 'text-slate-300 hover:text-white hover:bg-white/5'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Programs</span>
            </button>

            <button
              onClick={() => {
                setDomainFilter('ai');
                if (currentCourse.category !== 'ai') {
                  setSelectedCourseId(selectedDuration === '6months' ? 'foundational-ai' : 'python-for-ai');
                  setActiveModuleIndex(0);
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                domainFilter === 'ai'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-500/20'
                  : isCyber
                  ? 'text-violet-300 hover:text-white hover:bg-white/5'
                  : 'text-violet-700 hover:text-violet-900 hover:bg-violet-50'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>AI & Data Science</span>
            </button>

            <button
              onClick={() => {
                setDomainFilter('cyber');
                if (currentCourse.category !== 'cyber') {
                  setSelectedCourseId(selectedDuration === '6months' ? 'vapt-web-security' : 'vapt-web-security');
                  setActiveModuleIndex(0);
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                domainFilter === 'cyber'
                  ? 'bg-[#C6FF34] text-slate-950 font-semibold shadow-md shadow-lime-500/10'
                  : isCyber
                  ? 'text-[#C6FF34] hover:text-white hover:bg-white/5'
                  : 'text-emerald-800 hover:text-emerald-950 hover:bg-emerald-50'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Cybersecurity</span>
            </button>
          </div>

          {/* ── HORIZONTAL COURSE SWITCHER MARQUEE / CAROUSEL STRIP ── */}
          <div className="w-full relative px-2">
            <div className="w-full overflow-x-auto pb-3 pt-1 scrollbar-thin">
              <div className="flex flex-wrap items-stretch gap-2.5 px-2 justify-center">
                {filteredCourses.map((course) => {
                  const isSelected = course.id === currentCourse.id;
                  const isCourseCyber = course.category === 'cyber';

                  return (
                    <button
                      key={course.id}
                      id={`course-tab-${course.id}`}
                      onClick={() => {
                        setSelectedCourseId(course.id);
                        setActiveModuleIndex(0);
                      }}
                      className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border transition-all duration-300 text-left group cursor-pointer ${
                        isSelected
                          ? isCourseCyber
                            ? 'bg-[#142316] border-[#C6FF34] ring-1 ring-[#C6FF34]/40 text-white shadow-sm'
                            : 'bg-violet-950 border-violet-400 ring-1 ring-violet-500/40 text-white shadow-sm'
                          : isCyber
                          ? 'bg-[#111914] hover:bg-[#16221a] border-slate-800 text-slate-300 hover:border-slate-700'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? isCourseCyber
                            ? 'bg-[#C6FF34] text-slate-950'
                            : 'bg-violet-500 text-white'
                          : isCourseCyber
                          ? 'bg-[#ecfccb] text-emerald-800'
                          : 'bg-violet-100 text-violet-700'
                      }`}>
                        {isCourseCyber ? <Shield className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-medium truncate max-w-[180px] ${
                            isSelected ? 'text-white' : isCyber ? 'text-slate-100' : 'text-slate-900'
                          }`}>
                            {course.title}
                          </span>
                          <span className={`text-[9px] font-normal px-1.5 py-0.5 rounded-full ${
                            isSelected
                              ? isCourseCyber ? 'bg-[#C6FF34]/20 text-[#C6FF34]' : 'bg-violet-500/30 text-violet-200'
                              : isCourseCyber ? 'bg-[#C6FF34]/10 text-[#C6FF34]' : 'bg-violet-50 text-violet-700'
                          }`}>
                            {course.categoryLabel}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 mt-0.5 text-[10px]">
                          <span className="flex items-center gap-0.5 font-medium text-amber-400">
                            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                            {course.rating.toFixed(1)}/5
                          </span>
                          <span className={isSelected ? 'text-slate-300' : 'text-slate-400'}>
                            {course.reviewCount.toLocaleString()}+ learners
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* ── LOCOMOTIVE TRAIN PROGRESSION TRACK ── */}
        <TrainProgressTrack
          modules={modules}
          activeModuleIndex={activeModuleIndex}
          onSelectModule={(idx) => setActiveModuleIndex(idx)}
          durationLabel={durationLabels[selectedDuration]}
          isCyber={isCyber}
        />

        {/* ── SPLIT ROADMAP EXPLORER ── */}
        <div className={`rounded-3xl border shadow-xl overflow-hidden p-4 sm:p-8 transition-colors duration-500 ${
          isCyber
            ? 'bg-[#0f1712] border-[#C6FF34]/30 shadow-[#C6FF34]/5'
            : 'bg-white border-violet-200 shadow-violet-500/5'
        }`}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* ── LEFT RAIL: MODULE NAVIGATION LIST ── */}
            <div className="lg:col-span-4 flex flex-col space-y-2.5 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin">
              <div className={`pb-3 border-b mb-1 flex items-center justify-between sticky top-0 backdrop-blur-md z-10 ${
                isCyber ? 'border-slate-800 bg-[#0f1712]/90' : 'border-slate-100 bg-white/90'
              }`}>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium uppercase tracking-wider ${
                    isCyber ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    {currentCourse.title} Modules ({modules.length})
                  </span>
                </div>
                <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-medium border ${
                  isCyber
                    ? 'bg-[#C6FF34]/15 text-[#C6FF34] border-[#C6FF34]/30'
                    : 'bg-violet-50 text-violet-900 border-violet-200'
                }`}>
                  {currentCourse.badge}
                </span>
              </div>

              {modules.map((mod, idx) => {
                const isSelected = idx === activeModuleIndex;

                return (
                  <button
                    key={mod.id}
                    onClick={() => setActiveModuleIndex(idx)}
                    className={`w-full text-left p-4 rounded-2xl transition-all duration-200 flex items-start gap-3.5 relative border cursor-pointer ${
                      isSelected
                        ? isCyber
                          ? 'bg-[#18291c] border-[#C6FF34] shadow-sm text-white'
                          : 'bg-violet-50/70 border-violet-500/50 shadow-sm text-slate-950'
                        : isCyber
                        ? 'bg-[#111914] hover:bg-[#142218] border-slate-800/80 text-slate-400 hover:text-slate-200'
                        : 'bg-white hover:bg-slate-50/80 border-transparent hover:border-slate-200 text-slate-600'
                    }`}
                  >
                    {/* Active Left Indicator Bar */}
                    {isSelected && (
                      <div className={`absolute left-0 top-3 bottom-3 w-1.5 rounded-r-full ${
                        isCyber ? 'bg-[#C6FF34]' : 'bg-violet-600'
                      }`} />
                    )}

                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected
                        ? isCyber ? 'bg-[#C6FF34] text-slate-950 font-bold' : 'bg-violet-600 text-white'
                        : isCyber ? 'bg-[#1b2b1f] text-[#C6FF34]' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {idx === 0 ? <Sparkles className="w-4 h-4" /> : mod.highlightIcon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium ${
                          isSelected
                            ? isCyber ? 'text-[#C6FF34]' : 'text-violet-700'
                            : isCyber ? 'text-slate-300' : 'text-slate-800'
                        }`}>
                          {mod.moduleNumber}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400">
                          • {idx === 0 ? 'Beginner Starting Point' : mod.tag}
                        </span>
                      </div>
                      <h4 className={`text-xs sm:text-sm font-normal mt-0.5 truncate ${
                        isSelected
                          ? isCyber ? 'text-white' : 'text-slate-900'
                          : isCyber ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        {mod.title}
                      </h4>
                    </div>

                    <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${
                      isSelected
                        ? isCyber ? 'text-[#C6FF34] translate-x-0.5' : 'text-violet-600 translate-x-0.5'
                        : 'text-slate-400 opacity-0 group-hover:opacity-100'
                    }`} />
                  </button>
                );
              })}

              {/* Bottom Apply Advisory Card */}
              <div className={`mt-4 p-4 rounded-2xl text-white space-y-3 shadow-md ${
                isCyber
                  ? 'bg-gradient-to-br from-[#0c140e] to-[#142316] border border-[#C6FF34]/30'
                  : 'bg-gradient-to-br from-slate-900 to-violet-950 border border-violet-800/40'
              }`}>
                <div className="flex items-center gap-2">
                  <BookOpen className={`w-4 h-4 ${isCyber ? 'text-[#C6FF34]' : 'text-cyan-300'}`} />
                  <span className="text-xs font-medium">1-on-1 Academic Advisory</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed font-normal">
                  Need personalized advice for our 6 Months Fellowship or Fast-Track Sprint? Connect with our senior counselors.
                </p>
                <Button
                  onClick={() => setIsApplyModalOpen(true)}
                  className={`w-full py-2.5 rounded-xl text-xs font-medium shadow-md cursor-pointer ${
                    isCyber
                      ? 'bg-[#C6FF34] hover:bg-[#b8f520] text-slate-950 font-semibold'
                      : 'bg-violet-600 hover:bg-violet-500 text-white'
                  }`}
                >
                  Apply & Talk to Faculty
                </Button>
              </div>
            </div>

            {/* ── RIGHT PANEL: DETAILED MODULE VIEW ── */}
            <div className={`lg:col-span-8 rounded-2xl p-6 sm:p-8 flex flex-col justify-between border ${
              isCyber
                ? 'bg-[#111c14] border-[#C6FF34]/20'
                : 'bg-slate-50/70 border-slate-200/80'
            }`}>
              <div className="space-y-6">
                
                {/* Module Header Bar */}
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b ${
                  isCyber ? 'border-slate-800' : 'border-slate-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner ${
                      isCyber ? 'bg-[#1b2b1f] text-[#C6FF34]' : 'bg-violet-100 text-violet-700'
                    }`}>
                      {activeModule.highlightIcon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-[10px] font-medium ${
                          isCyber ? 'text-[#C6FF34] bg-[#C6FF34]/10 border-[#C6FF34]/30' : 'text-violet-700 bg-violet-50 border-violet-200'
                        }`}>
                          {activeModule.tag}
                        </Badge>
                        {activeModuleIndex === 0 && (
                          <Badge className="bg-emerald-700 text-white text-[10px] font-medium">
                            Zero Prerequisites
                          </Badge>
                        )}
                        <span className="text-[11px] font-medium text-amber-400 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {currentCourse.rating}/5.0
                        </span>
                      </div>
                      <h3 className={`text-lg sm:text-xl font-semibold mt-1 tracking-tight ${
                        isCyber ? 'text-white' : 'text-slate-900'
                      }`}>
                        {activeModule.moduleNumber} - {activeModule.title}
                      </h3>
                    </div>
                  </div>

                  <div className={`flex items-center gap-2 self-start sm:self-auto px-3.5 py-1.5 rounded-xl border text-xs font-mono font-medium shadow-xs ${
                    isCyber
                      ? 'bg-[#152319] border-slate-700 text-[#C6FF34]'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}>
                    <Clock className="w-3.5 h-3.5" />
                    <span>{activeModule.durationText}</span>
                  </div>
                </div>

                {/* Module Description */}
                <p className={`text-xs sm:text-sm leading-relaxed ${
                  isCyber ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  {activeModule.description}
                </p>

                {/* Topics Covered Checklist */}
                <div className="space-y-3">
                  <h4 className={`text-xs font-medium uppercase tracking-wider flex items-center gap-2 ${
                    isCyber ? 'text-slate-300' : 'text-slate-800'
                  }`}>
                    <span>TOPICS COVERED:</span>
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {activeModule.topics.map((topic, i) => (
                      <li key={i} className={`flex items-start gap-2.5 text-xs ${
                        isCyber ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                          isCyber ? 'bg-[#C6FF34]' : 'bg-violet-600'
                        }`} />
                        <span className="leading-snug">{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Hands-on Task if specified */}
                {activeModule.task && (
                  <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
                    isCyber ? 'bg-[#152419] border-[#C6FF34]/30' : 'bg-violet-50/80 border-violet-200'
                  }`}>
                    <Laptop className={`w-4 h-4 shrink-0 ${isCyber ? 'text-[#C6FF34]' : 'text-violet-700'}`} />
                    <div className="text-xs">
                      <span className={`font-medium ${isCyber ? 'text-white' : 'text-slate-900'}`}>
                        Practical Milestone Task:{' '}
                      </span>
                      <span className={`font-medium ${isCyber ? 'text-[#C6FF34]' : 'text-violet-900'}`}>
                        {activeModule.task}
                      </span>
                    </div>
                  </div>
                )}

                {/* Skills Badges */}
                <div className={`pt-4 border-t flex flex-wrap items-center justify-between gap-3 ${
                  isCyber ? 'border-slate-800' : 'border-slate-200'
                }`}>
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1.5">
                      Key Competencies:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeModule.skillsGained.map((skill, i) => (
                        <span
                          key={i}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-medium border shadow-2xs ${
                            isCyber
                              ? 'bg-[#152419] border-slate-700 text-slate-200'
                              : 'bg-white border-slate-200 text-slate-800'
                          }`}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium ${
                    isCyber
                      ? 'bg-[#142316] text-[#C6FF34] border-[#C6FF34]/30'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}>
                    <Laptop className="w-4 h-4" />
                    <span>{activeModule.labsCount} Hands-on Live Labs</span>
                  </div>
                </div>

              </div>

              {/* ── ACTION CTA BAR ── */}
              <div className={`mt-8 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${
                isCyber ? 'border-slate-800' : 'border-slate-200'
              }`}>
                <div className="text-left w-full sm:w-auto">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full animate-pulse ${
                      isCyber ? 'bg-[#C6FF34]' : 'bg-emerald-500'
                    }`} />
                    <span className={`text-xs font-medium ${isCyber ? 'text-white' : 'text-slate-900'}`}>
                      Upcoming Batch Admissions Open
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    {durationLabels[selectedDuration]} • Live Cohort + 1-on-1 Mentorship
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsApplyModalOpen(true)}
                    className={`w-full sm:w-auto px-4 py-5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer ${
                      isCyber
                        ? 'border-slate-700 bg-[#142217] hover:bg-[#1a2d1f] text-slate-200'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <FileText className={`w-4 h-4 ${isCyber ? 'text-[#C6FF34]' : 'text-violet-600'}`} />
                    <span>Download Syllabus (PDF)</span>
                  </Button>

                  <Button
                    onClick={() => setIsApplyModalOpen(true)}
                    className={`w-full sm:w-auto px-6 py-5 text-xs font-medium rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isCyber
                        ? 'bg-[#C6FF34] hover:bg-[#b8f520] text-slate-950 font-semibold shadow-[#C6FF34]/20'
                        : 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-500/25'
                    }`}
                  >
                    <span>Apply for {currentCourse.title}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* ── APPLICATION MODAL DIALOG ── */}
        <CourseApplicationModal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          selectedCourse={currentCourse}
          initialDuration={selectedDuration}
        />

      </div>
    </section>
  );
}
