import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import {
    FaShieldAlt,
    FaChrome,
    FaFirefox,
    FaEdge,
    FaOpera,
    FaGlobe,
    FaMobileAlt,
    FaLock,
    FaUserSecret,
    FaBug
} from 'react-icons/fa';

const Home = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { theme, darkMode } = useTheme();
    const [url, setUrl] = useState('');

    const handleCheck = () => {
        if (url.trim() !== '') {
            navigate(`/phishing?url=${encodeURIComponent(url)}`);
        } else {
            navigate('/phishing');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleCheck();
    };

    const browsers = [
        { name: 'Chrome', icon: <FaChrome className="text-4xl text-blue-500" /> },
        { name: 'Edge', icon: <FaEdge className="text-4xl text-blue-700" /> },
        { name: 'Firefox', icon: <FaFirefox className="text-4xl text-orange-500" /> },
        { name: 'Opera', icon: <FaOpera className="text-4xl text-red-500" /> },
    ];

    const features = [
        { icon: <FaGlobe className="text-4xl text-green-500" />, title: t('home.features.safe_browsing'), desc: t('home.features.safe_browsing_desc') },
        { icon: <FaMobileAlt className="text-4xl text-blue-500" />, title: t('home.features.cross_platform'), desc: t('home.features.cross_platform_desc') },
        { icon: <FaLock className="text-4xl text-purple-500" />, title: t('home.features.realtime'), desc: t('home.features.realtime_desc') },
        { icon: <FaUserSecret className="text-4xl text-red-500" />, title: t('home.features.privacy'), desc: t('home.features.privacy_desc') },
        { icon: <FaBug className="text-4xl text-yellow-500" />, title: t('home.features.scam_reporting'), desc: t('home.features.scam_reporting_desc') },
        { icon: <FaShieldAlt className="text-4xl text-teal-500" />, title: t('home.features.ai_analysis'), desc: t('home.features.ai_analysis_desc') },
    ];

    const stats = [
        { value: '1.2M+', label: 'URLs Scanned' },
        { value: '85K+', label: 'Phishing Detected' },
        { value: '50K+', label: 'Users Protected' },
    ];

    /* ── shared font styles ── */
    const fontThin = { fontFamily: "'DM Sans', 'Inter', sans-serif", fontWeight: 200 };
    const fontLight = { fontFamily: "'DM Sans', 'Inter', sans-serif", fontWeight: 300 };
    const fontNormal = { fontFamily: "'DM Sans', 'Inter', sans-serif", fontWeight: 400 };
    const fontMedium = { fontFamily: "'DM Sans', 'Inter', sans-serif", fontWeight: 500 };
    const fontBold = { fontFamily: "'DM Sans', 'Inter', sans-serif", fontWeight: 700 };

    return (
        <div style={{ backgroundColor: theme.bg }}>

            {/* ════════════════════════════════
                HERO — full-screen with navbar clearance
                The Navbar is fixed & transparent at top.
                h-screen covers full viewport; pt pushes inner
                content below the navbar so nothing is hidden.
            ════════════════════════════════ */}
            <section
                className="min-h-screen flex items-center justify-center overflow-hidden"
                style={{
                    background: darkMode
                        ? 'linear-gradient(135deg, #060d1a 0%, #0a0a0b 55%, #051209 100%)'
                        : 'linear-gradient(135deg, #1e3a5f 0%, #1a237e 55%, #0d3b2e 100%)',
                }}
            >
                {/* Ambient blobs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div
                        className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full blur-3xl animate-pulse"
                        style={{ background: darkMode ? 'rgba(29,78,216,0.25)' : 'rgba(29,78,216,0.35)', opacity: 0.5 }}
                    />
                    <div
                        className="absolute bottom-0 right-0 w-[420px] h-[420px] rounded-full blur-3xl animate-pulse"
                        style={{ background: darkMode ? 'rgba(22,163,74,0.2)' : 'rgba(22,163,74,0.3)', opacity: 0.4, animationDelay: '1.2s' }}
                    />
                </div>

                {/*
                    paddingTop = NAVBAR_HEIGHT ensures the visible
                    content top edge sits below the fixed navbar bar.
                    The section still fills h-screen perfectly.
                */}
                <div
                    className="relative z-10 w-full text-center max-w-5xl mx-auto px-6 pt-32 pb-12"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 32 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, ease: 'easeOut' }}
                    >
                        {/* Eyebrow */}
                        <p
                            className="text-sm md:text-base mb-4 tracking-[0.35em] uppercase"
                            style={{ ...fontThin, color: 'rgba(148,163,184,0.85)', letterSpacing: '0.35em' }}
                        >
                            {t('hero.title_part1')}
                        </p>

                        {/* Main heading */}
                        <h1
                            className="text-5xl md:text-7xl mb-6 leading-[1.1]"
                            style={{ ...fontBold, color: '#f8fafc' }}
                        >
                            {t('hero.title_part2')}{' '}
                            <span
                                className="text-transparent bg-clip-text"
                                style={{ backgroundImage: 'linear-gradient(90deg, #4ade80, #60a5fa)' }}
                            >
                                {t('hero.title_part3')}
                            </span>
                        </h1>

                        {/* Subtitle */}
                        <p
                            className="text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
                            style={{ ...fontLight, color: 'rgba(148,163,184,0.9)' }}
                        >
                            {t('hero.subtitle')}
                        </p>

                        {/* URL input bar */}
                        <div className="relative w-full max-w-lg mx-auto">
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={t('hero.placeholder')}
                                className="w-full py-4 pl-6 pr-36 rounded-full focus:outline-none focus:ring-4 focus:ring-green-500/50 shadow-2xl"
                                style={{
                                    ...fontLight,
                                    background: darkMode ? 'rgba(15,23,42,0.85)' : 'rgba(255,255,255,0.95)',
                                    color: darkMode ? '#f8fafc' : '#0f172a',
                                    border: `1px solid ${darkMode ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.3)'}`,
                                    backdropFilter: 'blur(12px)',
                                    fontSize: '0.95rem',
                                }}
                            />
                            <button
                                onClick={handleCheck}
                                className="absolute right-2 top-2 bottom-2 rounded-full px-6 text-sm text-white transition-all hover:opacity-90 active:scale-95"
                                style={{
                                    ...fontMedium,
                                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                                    boxShadow: '0 4px 18px rgba(34,197,94,0.4)',
                                }}
                            >
                                {t('hero.btn_check')}
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ════════════════════════════════
                FEATURES
            ════════════════════════════════ */}
            <section
                className="py-24"
                style={{ background: darkMode ? '#111114' : '#ffffff' }}
            >
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2
                            className="text-3xl md:text-4xl mb-4"
                            style={{ ...fontBold, color: theme.text }}
                        >
                            {t('home.why_choose_us')}
                        </h2>
                        <p
                            className="max-w-xl mx-auto text-base"
                            style={{ ...fontLight, color: theme.textMuted }}
                        >
                            {t('home.why_desc')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                whileHover={{ y: -8, scale: 1.02 }}
                                transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                                className="p-8 rounded-2xl border transition-shadow hover:shadow-xl"
                                style={{
                                    background: theme.bgCard2,
                                    borderColor: theme.border,
                                }}
                            >
                                <div className="mb-5">{feature.icon}</div>
                                <h3
                                    className="text-lg mb-2"
                                    style={{ ...fontMedium, color: theme.text }}
                                >
                                    {feature.title}
                                </h3>
                                <p
                                    className="text-sm leading-relaxed"
                                    style={{ ...fontLight, color: theme.textMuted }}
                                >
                                    {feature.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ════════════════════════════════
                STATS
            ════════════════════════════════ */}
            <section
                className="py-20"
                style={{ background: darkMode ? '#0a0a0b' : '#f1f5f9' }}
            >
                <div className="max-w-5xl mx-auto px-6 text-center">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15, duration: 0.6 }}
                            >
                                <div
                                    className="text-5xl mb-2"
                                    style={{ ...fontBold, color: '#22c55e' }}
                                >
                                    {stat.value}
                                </div>
                                <div
                                    className="text-xs uppercase tracking-[0.25em]"
                                    style={{ ...fontLight, color: theme.textDim }}
                                >
                                    {stat.label}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ════════════════════════════════
                BENCHMARKS
            ════════════════════════════════ */}
            <section
                className="py-24"
                style={{ background: theme.bg }}
            >
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2
                            className="text-3xl md:text-4xl mb-4"
                            style={{ ...fontBold, color: theme.text }}
                        >
                            {t('home.benchmarks.title')}
                        </h2>
                        <p
                            className="max-w-2xl mx-auto text-base"
                            style={{ ...fontLight, color: theme.textMuted }}
                        >
                            {t('home.benchmarks.subtitle')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Accuracy Table */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="p-8 rounded-3xl border"
                            style={{ background: theme.bgCard, borderColor: theme.border }}
                        >
                            <h3 className="text-xl mb-6 flex items-center gap-3" style={{ ...fontBold, color: theme.text }}>
                                <i className='bx bx-target-lock text-green-500'></i> {t('home.benchmarks.accuracy_title')}
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b" style={{ borderColor: theme.border }}>
                                            <th className="py-3 text-xs uppercase tracking-wider" style={{ ...fontMedium, color: theme.textDim }}>{t('home.benchmarks.modality')}</th>
                                            <th className="py-3 text-xs uppercase tracking-wider" style={{ ...fontMedium, color: theme.textDim }}>{t('home.benchmarks.baseline')}</th>
                                            <th className="py-3 text-xs uppercase tracking-wider text-right" style={{ ...fontBold, color: '#22c55e' }}>{t('home.benchmarks.proposed')}</th>
                                        </tr>
                                    </thead>
                                    <tbody style={{ color: theme.text }}>
                                        <tr className="border-b" style={{ borderColor: theme.border }}>
                                            <td className="py-4 text-sm font-medium">{t('home.benchmarks.url')}</td>
                                            <td className="py-4 text-sm text-gray-500">SVM (RBF) 90.2%</td>
                                            <td className="py-4 text-sm text-right font-bold">93.0%</td>
                                        </tr>
                                        <tr className="border-b" style={{ borderColor: theme.border }}>
                                            <td className="py-4 text-sm font-medium">{t('home.benchmarks.email')}</td>
                                            <td className="py-4 text-sm text-gray-500">MLP 96.1%</td>
                                            <td className="py-4 text-sm text-right font-bold">99.0%</td>
                                        </tr>
                                        <tr className="border-b" style={{ borderColor: theme.border }}>
                                            <td className="py-4 text-sm font-medium">{t('home.benchmarks.pdf')}</td>
                                            <td className="py-4 text-sm text-gray-500">SVM 94.5%</td>
                                            <td className="py-4 text-sm text-right font-bold">99.0%</td>
                                        </tr>
                                        <tr className="border-b" style={{ borderColor: theme.border }}>
                                            <td className="py-4 text-sm font-medium">{t('home.benchmarks.image')}</td>
                                            <td className="py-4 text-sm text-gray-500">ResNet-18 81.2%</td>
                                            <td className="py-4 text-sm text-right font-bold">88.0%</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>

                        {/* Latency Table */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="p-8 rounded-3xl border"
                            style={{ background: theme.bgCard, borderColor: theme.border }}
                        >
                            <h3 className="text-xl mb-6 flex items-center gap-3" style={{ ...fontBold, color: theme.text }}>
                                <i className='bx bx-timer text-blue-500'></i> {t('home.benchmarks.latency_title')}
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b" style={{ borderColor: theme.border }}>
                                            <th className="py-3 text-xs uppercase tracking-wider" style={{ ...fontMedium, color: theme.textDim }}>{t('home.benchmarks.modality')}</th>
                                            <th className="py-3 text-xs uppercase tracking-wider" style={{ ...fontMedium, color: theme.textDim }}>{t('home.benchmarks.latency')}</th>
                                            <th className="py-3 text-xs uppercase tracking-wider" style={{ ...fontMedium, color: theme.textDim }}>{t('home.benchmarks.comment')}</th>
                                        </tr>
                                    </thead>
                                    <tbody style={{ color: theme.text }}>
                                        <tr className="border-b" style={{ borderColor: theme.border }}>
                                            <td className="py-4 text-sm font-medium">{t('home.benchmarks.url')}</td>
                                            <td className="py-4 text-sm font-bold text-blue-500">6-8 ms</td>
                                            <td className="py-4 text-xs opacity-70">{t('home.benchmarks.latency_url_cmt')}</td>
                                        </tr>
                                        <tr className="border-b" style={{ borderColor: theme.border }}>
                                            <td className="py-4 text-sm font-medium">{t('home.benchmarks.email')}</td>
                                            <td className="py-4 text-sm font-bold text-blue-500">12-18 ms</td>
                                            <td className="py-4 text-xs opacity-70">{t('home.benchmarks.latency_email_cmt')}</td>
                                        </tr>
                                        <tr className="border-b" style={{ borderColor: theme.border }}>
                                            <td className="py-4 text-sm font-medium">{t('home.benchmarks.pdf')}</td>
                                            <td className="py-4 text-sm font-bold text-blue-500">20-35 ms</td>
                                            <td className="py-4 text-xs opacity-70">{t('home.benchmarks.latency_pdf_cmt')}</td>
                                        </tr>
                                        <tr className="border-b" style={{ borderColor: theme.border }}>
                                            <td className="py-4 text-sm font-medium">{t('home.benchmarks.image')}</td>
                                            <td className="py-4 text-sm font-bold text-blue-500">65-95 ms</td>
                                            <td className="py-4 text-xs opacity-70">{t('home.benchmarks.latency_image_cmt')}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ════════════════════════════════
                BROWSERS
            ════════════════════════════════ */}
            <section
                className="py-16 border-t"
                style={{
                    background: darkMode ? '#111114' : '#f8fafc',
                    borderColor: theme.border,
                }}
            >
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2
                        className="text-xl mb-10"
                        style={{ ...fontLight, color: theme.textMuted, letterSpacing: '0.1em' }}
                    >
                        {t('home.browsers_title')}
                    </h2>
                    <div className="flex justify-center gap-12 flex-wrap">
                        {browsers.map((browser, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ scale: 1.12, y: -4 }}
                                transition={{ type: 'spring', stiffness: 400 }}
                                className="flex flex-col items-center gap-2"
                            >
                                {browser.icon}
                                <span
                                    className="text-xs tracking-wider"
                                    style={{ ...fontLight, color: theme.textDim }}
                                >
                                    {browser.name}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Home;