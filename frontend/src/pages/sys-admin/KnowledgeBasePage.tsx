import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { kbApi } from '../../api/kbApi';
import { KnowledgeDocument } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  BookOpen,
  Plus,
  Trash2,
  RefreshCw,
  Sparkles,
  Layers,
  FileText,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const KnowledgeBasePage: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Municipal Regulations');
  const [source, setSource] = useState('City Municipal Charter');
  const [content, setContent] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['kb-documents'],
    queryFn: () => kbApi.getAll(0, 100),
  });

  const docs = data?.content || [];

  const createMutation = useMutation({
    mutationFn: () => {
      if (!title.trim() || !content.trim()) {
        throw new Error('Title and content are required.');
      }
      return kbApi.create({
        title: title.trim(),
        category: category.trim(),
        source: source.trim(),
        content: content.trim(),
        active: true,
      });
    },
    onSuccess: (newDoc) => {
      setStatusMessage(`Document indexed into ${newDoc.chunkCount} vector chunks.`);
      setIsAddModalOpen(false);
      setTitle('');
      setContent('');
      refetch();
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to save document');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => kbApi.delete(id),
    onSuccess: () => {
      setStatusMessage('Document deleted and vector embeddings pruned.');
      refetch();
    },
  });

  const reindexMutation = useMutation({
    mutationFn: () => kbApi.reindex(),
    onSuccess: (res) => {
      setStatusMessage('All documents successfully re-chunked and embedded in vector store.');
      refetch();
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-primary-500" />
            <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">
              Grounded AI Civic Assistant Knowledge Store
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            RAG Knowledge Base & pgvector Index
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Official municipal regulations, bylaws, and SLAs chunked into 768-dim embeddings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => reindexMutation.mutate()}
            disabled={reindexMutation.isPending}
            className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm transition-all flex items-center gap-1.5"
            title="Re-embed all knowledge chunks"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${reindexMutation.isPending ? 'animate-spin' : ''}`}
            />
            <span>Re-Index Vectors</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-md shadow-primary-500/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Document</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Documents Grid */}
      {isLoading ? (
        <div className="py-24 text-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : docs.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8">
          <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            No Knowledge Documents
          </h3>
          <p className="text-xs text-slate-500">
            Add municipal charters, grievance guidelines, or FAQs to power the AI Civic Assistant.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300">
                    {doc.category || 'General'}
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
                    <Layers className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{doc.chunkCount} Vector Chunks</span>
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {doc.title}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                  {doc.content}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/60 text-[11px] text-slate-400">
                <span className="truncate max-w-[200px]">Source: {doc.source || 'Municipal'}</span>

                <button
                  onClick={() => {
                    if (confirm(`Delete "${doc.title}" and its vector embeddings?`)) {
                      deleteMutation.mutate(doc.id);
                    }
                  }}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Delete Document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Document Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Add Knowledge Base Document
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 text-rose-800 rounded-xl text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Municipal Pothole Repair Standard Operating Procedure"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Roads & Infrastructure"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Authority / Source
                  </label>
                  <input
                    type="text"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    placeholder="e.g. Public Works Manual 2026"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Document Content (Markdown / Plain Text) *
                </label>
                <textarea
                  required
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter policy details, SLA timelines, procedural guidelines. The system automatically segments content into ~500 token chunks and generates pgvector embeddings..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || !title.trim() || !content.trim()}
                  className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-md shadow-primary-500/20 flex items-center gap-1.5"
                >
                  {createMutation.isPending ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Embedding Chunks...</span>
                    </>
                  ) : (
                    <span>Index & Store Embeddings</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
