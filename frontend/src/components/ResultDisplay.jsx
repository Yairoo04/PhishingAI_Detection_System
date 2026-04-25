import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

const ResultDisplay = ({ result, onCheckMore }) => {
    const { t } = useTranslation();
    const { darkMode } = useTheme();

    if (!result) return null;

    if (result.error) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-8 rounded-3xl border-2 border-red-500/20 bg-red-500/5 backdrop-blur-md dark:bg-gray-800"
            >
                <div className="flex items-center gap-4 mb-4 text-red-500">
                    <i className="bx bx-error-circle text-3xl" />
                    <h3 className="text-xl font-black tracking-tight">{t('tools.checkers.scan_failed')}</h3>
                </div>
                <p className="text-sm opacity-70 text-gray-800 dark:text-gray-100">{result.error}</p>
                {result.filename && (
                    <div className="mt-4 pt-4 text-xs opacity-50 font-mono text-gray-800 dark:text-gray-100 border-t border-red-500/10">
                        FILE: {result.filename}
                    </div>
                )}
            </motion.div>
        );
    }

    const isPhishing = result.prediction?.toLowerCase() === 'phishing' ||
        result.prediction?.toLowerCase() === 'malicious' ||
        result.prediction?.toLowerCase() === 'dangerous';

    const statusColor = isPhishing ? 'text-red-500' : 'text-green-500';
    const statusBg = isPhishing ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20';
    const statusBorderColor = isPhishing ? 'border-red-500/20' : 'border-green-500/20';

    const phishingScore = result.score !== undefined ? result.score : (result.phishing_probability || 0);
    const legitimateScore = 100 - phishingScore;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`mt-12 overflow-hidden rounded-[2.5rem] border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700`}
        >
            {/* Header / Status Banner */}
            <div className={`p-10 relative overflow-hidden border-b ${statusBg} ${statusBorderColor}`}>
                <div className={`absolute top-0 right-0 p-8 opacity-10 ${isPhishing ? 'text-red-500' : 'text-green-500'}`}>
                    <i className={`bx ${isPhishing ? 'bx-shield-x' : 'bx-shield-check'} text-9xl`} />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4 opacity-60">
                        <div className={`w-2 h-2 rounded-full animate-pulse ${isPhishing ? 'bg-red-500' : 'bg-green-500'}`} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-800 dark:text-gray-100">{t('tools.checkers.analysis_complete')}</span>
                    </div>

                    <h2 className="text-sm font-black uppercase tracking-widest opacity-50 mb-2 text-gray-800 dark:text-gray-100">
                        {t('tools.checkers.classification')}
                    </h2>
                    <div className={`text-6xl font-black tracking-tighter uppercase ${statusColor}`}>
                        {result.prediction}
                    </div>
                </div>
            </div>

            <div className="p-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Multi-Modal Probabilities */}
                    <div className="space-y-8">
                        <div>
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <i className="bx bx-brain text-blue-500 text-lg" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-800 dark:text-gray-100">
                                            {t('tools.checkers.integrated_risk', 'Integrated Phishing Risk')}
                                        </span>
                                    </div>
                                    <p className="text-[10px] opacity-40 font-bold uppercase tracking-wider text-gray-800 dark:text-gray-100">
                                        {result.analysis_mode === 'multi-modal' ? 'Fused Intelligence (URL + Vision)' : 'Single Modality Analysis'}
                                    </p>
                                </div>
                                <span className={`text-4xl font-black font-mono leading-none ${isPhishing ? 'text-red-500' : 'text-green-500'}`}>
                                    {Math.round(phishingScore)}%
                                </span>
                            </div>
                            <div className="h-4 w-full rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-0.5">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${phishingScore}%` }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className={`h-full rounded-full ${isPhishing ? 'bg-gradient-to-r from-red-600 to-red-400' : 'bg-gradient-to-r from-green-600 to-green-400'} shadow-lg`}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* URL Specific Score */}
                            {result.extra?.url_score !== undefined && (
                                <div className="p-4 rounded-3xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center gap-2 mb-2 opacity-60">
                                        <i className="bx bx-link-alt text-blue-500" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-800 dark:text-gray-100">URL Features</span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <span className={`text-lg font-black font-mono ${result.extra.url_score >= 50 ? 'text-red-500' : 'text-green-500'}`}>
                                            {Math.round(result.extra.url_score)}%
                                        </span>
                                        <div className="w-16 h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                                            <div className={`h-full ${result.extra.url_score >= 50 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${result.extra.url_score}%` }} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Vision Specific Score */}
                            {result.extra?.image_score !== undefined && result.extra.image_score !== null && (
                                <div className="p-4 rounded-3xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center gap-2 mb-2 opacity-60">
                                        <i className="bx bx-scan text-purple-500" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-800 dark:text-gray-100">Visual Patterns</span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <span className={`text-lg font-black font-mono ${result.extra.image_score >= 50 ? 'text-red-500' : 'text-green-500'}`}>
                                            {Math.round(result.extra.image_score)}%
                                        </span>
                                        <div className="w-16 h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                                            <div className={`h-full ${result.extra.image_score >= 50 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${result.extra.image_score}%` }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Legitimate Confidence Row */}
                        <div className="flex items-center justify-between p-5 rounded-[2rem] bg-green-500/5 border border-green-500/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                                    <i className="bx bx-check-shield text-xl" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-green-600">Legitimate Confidence</div>
                                    <div className="text-[9px] opacity-60 font-bold text-gray-800 dark:text-gray-100">System reliability score</div>
                                </div>
                            </div>
                            <span className="text-2xl font-black font-mono text-green-500">{Math.round(legitimateScore)}%</span>
                        </div>

                        {/* Extracted URLs List */}
                        {result.extra?.urls_found && result.extra.urls_found.length > 0 && (
                            <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
                                <h3 className="text-xs font-black uppercase tracking-widest opacity-50 mb-6 text-gray-800 dark:text-gray-100">
                                    {t('tools.checkers.extracted_urls', 'Extracted URLs')}
                                </h3>
                                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {result.extra.urls_found.map((foundUrl, idx) => (
                                        <div key={idx} className="p-4 rounded-2xl flex justify-between items-center transition-all bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 gap-4">
                                            <span className="text-xs font-mono truncate text-gray-800 dark:text-gray-100" title={foundUrl}>
                                                {foundUrl}
                                            </span>
                                            <button 
                                              onClick={() => onCheckMore && onCheckMore(foundUrl)}
                                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider transition-colors shrink-0">
                                                {t('tools.checkers.check_btn')}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Features List */}
                        {result.extra?.features && Object.keys(result.extra.features).length > 0 && (
                            <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
                                <h3 className="text-xs font-black uppercase tracking-widest opacity-50 mb-6 text-gray-800 dark:text-gray-100">
                                    {t('tools.checkers.extracted_features', 'Extracted Features')}
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {Object.entries(result.extra.features).map(([key, value]) => (
                                        <div key={key} className="p-4 rounded-2xl flex justify-between items-center transition-all bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                                            <span className="text-[10px] font-bold uppercase opacity-60 text-gray-800 dark:text-gray-100">
                                                {key.replace(/_/g, ' ')}
                                            </span>
                                            <span className="text-xs font-black truncate max-w-[120px] text-gray-800 dark:text-gray-100" title={String(value)}>
                                                {String(value)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Visual Evidence / Screenshot */}
                    <div className="space-y-8">
                        {result.extra?.screenshot_url && !result.extra.screenshot_url.includes('No+Screenshot') ? (
                            <div className="relative group">
                                <h3 className="text-xs font-black uppercase tracking-widest opacity-50 mb-4 text-gray-800 dark:text-gray-100">
                                    {t('tools.checkers.screenshot', 'Screenshot')}
                                </h3>
                                <div className="rounded-3xl overflow-hidden shadow-2xl relative border border-gray-200 dark:border-gray-700">
                                    <img src={result.extra.screenshot_url} alt="Scan Evidence" className="w-full h-auto object-contain bg-gray-50 dark:bg-gray-900" />
                                    <div className="absolute inset-0 bg-green-500/5 mix-blend-overlay pointer-events-none" />
                                </div>
                            </div>
                        ) : result.type === 'image' && result.filename ? (
                            <div className="relative group">
                                <h3 className="text-xs font-black uppercase tracking-widest opacity-50 mb-4 text-gray-800 dark:text-gray-100">
                                    {t('tools.checkers.image_preview', 'Image Preview')}
                                </h3>
                                <div className="rounded-3xl p-8 border border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
                                     <i className="bx bx-image text-4xl mb-2 text-gray-400" />
                                     <span className="text-xs text-gray-500 font-mono text-center break-all">{result.filename}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center p-12 rounded-[2rem] border border-dashed border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500">
                                <i className="bx bx-scan text-6xl mb-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">{t('tools.checkers.no_visual_evidence')}</span>
                            </div>
                        )}

                        {/* Third Party */}
                        {result.extra?.third_party_eval && (
                            <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
                                <h3 className="text-xs font-black uppercase tracking-widest opacity-50 mb-6 text-gray-800 dark:text-gray-100">{t('tools.checkers.external_intel')}</h3>
                                <div className="space-y-4">
                                    {Object.entries(result.extra.third_party_eval).map(([source, data]) => (
                                        <div key={source} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full ${data && data.status && data.status.toLowerCase().includes('safe') ? 'bg-green-500' : 'bg-red-500'}`} />
                                                <span className="text-xs font-black capitalize text-gray-800 dark:text-gray-100">{source}</span>
                                            </div>
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${data && data.status && data.status.toLowerCase().includes('safe') ? 'text-green-500' : 'text-red-500'}`}>
                                                {data && data.status ? data.status : 'UNAVAILABLE'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-[10px] font-black uppercase tracking-widest opacity-40 text-gray-800 dark:text-gray-100">
                        {result.filename ? `${t('tools.checkers.source_label')}: ${result.filename}` : `${t('tools.checkers.target_label')}: ${result.url || result.extra?.qr_url || t('tools.checkers.analyzed_content')}`}
                    </div>
                    <div className="flex gap-2">
                        <button className="p-2 rounded-xl transition-colors bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800">
                            <i className="bx bx-share-alt" />
                        </button>
                        <button className="p-2 rounded-xl transition-colors bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800">
                            <i className="bx bx-download" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ResultDisplay;
