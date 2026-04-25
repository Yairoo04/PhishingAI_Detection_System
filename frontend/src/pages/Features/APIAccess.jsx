import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';

const APIAccess = () => {
    const { t } = useTranslation();
    const { theme, darkMode } = useTheme();

    return (
        <div style={{ minHeight: '100vh', background: theme.bg, paddingTop: '80px', paddingBottom: '60px' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px' }}>
                <div style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <div style={{ width: '3px', height: '20px', background: '#ec4899', borderRadius: '2px' }} />
                        <span style={{ color: '#ec4899', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>{t('features.api.portal')}</span>
                    </div>
                    <h1 style={{ fontSize: '32px', fontWeight: 800, color: theme.text, margin: 0 }}>{t('features.api.title')} <span style={{ color: '#ec4899' }}>{t('features.api.title_hl')}</span></h1>
                    <p style={{ color: theme.textMuted, fontSize: '13px', marginTop: '4px' }}>{t('features.api.desc')}</p>
                </div>

                <div style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: '12px', padding: '32px', marginBottom: '24px' }}>
                    <h3 style={{ color: theme.text, fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>{t('features.api.your_key')}</h3>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ flex: 1, background: theme.badgeBg, border: `1px solid ${theme.border}`, borderRadius: '6px', padding: '12px 16px', fontFamily: 'monospace', color: '#ec4899', fontSize: '14px' }}>
                            pk_live_51Mxxxxxxxxxxxxxxxxxxxxxxxxxxxx
                        </div>
                        <button style={{ padding: '0 20px', borderRadius: '6px', background: '#ec4899', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                            {t('features.api.copy')}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: '12px', padding: '24px' }}>
                        <h4 style={{ color: theme.text, fontWeight: 700, marginBottom: '16px' }}>{t('features.api.quick_start')}</h4>
                        <pre style={{ background: '#1e293b', color: '#f8fafc', padding: '16px', borderRadius: '8px', fontSize: '12px', overflowX: 'auto' }}>
                            {`import requests

url = "https://api.uep-iq.framework/v1/scan"
payload = {"url": "http://suspicious-site.com"}
headers = {"Authorization": "Bearer YOUR_API_KEY"}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`}
                        </pre>
                    </div>
                    <div style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: '12px', padding: '24px' }}>
                        <h4 style={{ color: theme.text, fontWeight: 700, marginBottom: '16px' }}>{t('features.api.endpoints')}</h4>
                        {[
                            { method: 'POST', path: '/v1/url/scan', desc: t('features.api.desc_scan') },
                            { method: 'POST', path: '/v1/file/scan', desc: t('features.api.desc_file') },
                            { method: 'GET', path: '/v1/history', desc: t('features.api.desc_history') },
                        ].map((e, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', paddingBottom: '12px', borderBottom: i < 2 ? `1px solid ${theme.border}` : 'none' }}>
                                <span style={{ fontSize: '10px', padding: '2px 6px', background: '#ec489920', color: '#ec4899', borderRadius: '4px', fontWeight: 800 }}>{e.method}</span>
                                <div>
                                    <div style={{ color: theme.textSub, fontSize: '12px', fontWeight: 600, fontFamily: 'monospace' }}>{e.path}</div>
                                    <div style={{ color: theme.textDim, fontSize: '11px' }}>{e.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default APIAccess;
