import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { complaintsApi } from '../../api/complaintsApi';
import { adminApi } from '../../api/adminApi';
import { Category, AiTriageResult } from '../../types';
import { LocationPickerMap } from '../../components/map/LocationPickerMap';
import {
  Sparkles,
  MapPin,
  UploadCloud,
  Trash2,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Building2,
  Layers,
} from 'lucide-react';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const ReportIssuePage: React.FC = () => {
  const navigate = useNavigate();

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | ''>('');
  const [address, setAddress] = useState('Market St & 5th Ave, Ward 4');
  const [latitude, setLatitude] = useState<number>(37.7749);
  const [longitude, setLongitude] = useState<number>(-122.4194);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // AI Preview state
  const [aiPreview, setAiPreview] = useState<AiTriageResult | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // Load existing categories for dropdown
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => adminApi.getCategories(),
  });

  // AI Triage Preview action
  const handleAiPreview = async () => {
    if (!title.trim() || !description.trim()) {
      alert('Please enter at least a title and description before requesting AI analysis.');
      return;
    }
    setIsPreviewLoading(true);
    try {
      const result = await complaintsApi.previewAi(title, description, address);
      setAiPreview(result);

      // Auto-select category if matched
      if (result.category) {
        const found = categories.find(
          (c) => c.name.toLowerCase() === result.category.toLowerCase()
        );
        if (found) {
          setSelectedCategoryId(found.id);
        }
      }
    } catch (err: any) {
      console.warn('AI Preview failed', err);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  // Image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (imageUrls.length + files.length > 5) {
      alert('Maximum 5 images allowed per complaint.');
      return;
    }

    setIsUploading(true);
    setErrorMsg('');
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`File ${file.name} exceeds 5 MB.`);
        }
        const res = await complaintsApi.uploadImage(file);
        setImageUrls((prev) => [...prev, res.fileUrl]);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Image upload failed');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  // Submit Complaint Mutation
  const createMutation = useMutation({
    mutationFn: () => {
      if (!title.trim() || !description.trim()) {
        throw new Error('Please fill in both title and description.');
      }
      return complaintsApi.create({
        title: title.trim(),
        description: description.trim(),
        categoryId: selectedCategoryId ? Number(selectedCategoryId) : undefined,
        address: address.trim(),
        latitude,
        longitude,
        imageUrls,
      });
    },
    onSuccess: (complaint) => {
      navigate(`/citizen/complaints/${complaint.id}`);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to submit complaint');
    },
  });

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Report a Civic Issue
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Submit details, pinpoint the location, and let our Gemini AI triage and route your report.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          createMutation.mutate();
        }}
        className="space-y-6"
      >
        {/* Section 1: Basic Details */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 text-xs flex items-center justify-center font-bold">
              1
            </span>
            Issue Details
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Issue Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Hazardous deep pothole on Main Street"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Detailed Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you observed, hazard level, proximity to schools/crossings..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Category (Optional – AI can determine)
              </label>
              <select
                value={selectedCategoryId}
                onChange={(e) =>
                  setSelectedCategoryId(e.target.value ? Number(e.target.value) : '')
                }
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">-- Let AI Auto-Classify --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.department?.name || 'Municipal'})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleAiPreview}
                disabled={isPreviewLoading || !title.trim() || !description.trim()}
                className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-semibold text-xs shadow-md shadow-primary-500/20 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
              >
                {isPreviewLoading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Analyzing with Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Preview AI Triage & Routing</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Real-time AI Triage Card */}
          {aiPreview && (
            <div className="p-4 rounded-2xl bg-primary-50/70 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800 shadow-inner space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  <span className="text-xs font-bold text-primary-900 dark:text-primary-200 uppercase tracking-wide">
                    Gemini AI Triage Analysis
                  </span>
                </div>
                <span className="text-[11px] font-mono font-bold bg-white dark:bg-slate-900 px-2 py-0.5 rounded-full border border-primary-300 text-primary-700 dark:text-primary-300">
                  {Math.round(aiPreview.confidence * 100)}% Confidence
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-white/80 dark:bg-slate-900/60 p-2.5 rounded-xl border border-primary-100 dark:border-primary-900">
                  <span className="text-[10px] text-slate-400 font-bold block">CATEGORY</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {aiPreview.category}
                  </span>
                </div>
                <div className="bg-white/80 dark:bg-slate-900/60 p-2.5 rounded-xl border border-primary-100 dark:border-primary-900">
                  <span className="text-[10px] text-slate-400 font-bold block">PRIORITY</span>
                  <PriorityBadge priority={aiPreview.priority} size="sm" />
                </div>
                <div className="bg-white/80 dark:bg-slate-900/60 p-2.5 rounded-xl border border-primary-100 dark:border-primary-900">
                  <span className="text-[10px] text-slate-400 font-bold block">DEPARTMENT</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {aiPreview.department}
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300">
                <span className="font-semibold">Summary: </span>
                {aiPreview.summary}
              </div>
              <div className="text-[11px] text-slate-500 italic">
                <span className="font-semibold">Reasoning: </span>
                {aiPreview.reasoning}
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Location Pinning */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 text-xs flex items-center justify-center font-bold">
              2
            </span>
            Location Pinning (OpenStreetMap)
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Street Address / Landmark
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Market St, Ward 4"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Pin Exact Location on Map (Drag pin or click map)
            </label>
            <LocationPickerMap
              latitude={latitude}
              longitude={longitude}
              onChange={(lat, lng) => {
                setLatitude(lat);
                setLongitude(lng);
              }}
              className="h-80"
            />
          </div>
        </div>

        {/* Section 3: Photo Evidence */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 text-xs flex items-center justify-center font-bold">
              3
            </span>
            Issue Photos (Optional, Max 5)
          </h2>

          {imageUrls.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {imageUrls.map((url, idx) => (
                <div
                  key={idx}
                  className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm group"
                >
                  <img src={url} alt={`Issue ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImageUrls((prev) => prev.filter((_, i) => i !== idx))}
                    className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-rose-600 text-white rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {imageUrls.length < 5 && (
            <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50 dark:bg-slate-900/40 hover:bg-primary-50/20 transition-all">
              <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-primary-500 mb-1" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                {isUploading ? 'Uploading photos...' : 'Upload Photos (JPG, PNG, WEBP)'}
              </span>
              <span className="text-[11px] text-slate-400 mt-1">Up to 5 images, max 5MB each</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                disabled={isUploading}
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Submit action */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/citizen')}
            className="px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending || isUploading || !title.trim() || !description.trim()}
            className="px-7 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-primary-600/30 transition-all flex items-center gap-2 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          >
            {createMutation.isPending ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Submitting & Triaging...</span>
              </>
            ) : (
              <>
                <span>Submit Civic Report</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
