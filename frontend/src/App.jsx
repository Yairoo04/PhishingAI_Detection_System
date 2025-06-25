import React, { useState, useEffect } from 'react';
import Tabs from './components/Tabs';
import URLChecker from './components/URLChecker';
import ImageChecker from './components/ImageChecker';
import FileChecker from './components/FileChecker';
import EmailChecker from './components/EmailChecker';
import ResultDisplay from './components/ResultDisplay';
import FeaturesDisplay from './components/FeaturesDisplay';

const App = () => {
  const [activeTab, setActiveTab] = useState('url');
  const [tabResults, setTabResults] = useState({
    url: { result: null, features: null },
    image: { result: null, features: null },
    file: { result: null, features: null },
    email: { result: null, features: null },
  });
  const [loading, setLoading] = useState(false);
  const [activeAnalysisTab, setActiveAnalysisTab] = useState('headers'); // Tab phân tích mặc định

  const tabs = [
    { id: 'url', label: 'Kiểm Tra URL' },
    { id: 'image', label: 'Kiểm Tra Hình Ảnh' },
    { id: 'file', label: 'Kiểm Tra Tập Tin' },
    { id: 'email', label: 'Kiểm Tra Email' },
  ];

  const analysisTabs = [
    { id: 'headers', label: 'Headers' },
    { id: 'received', label: 'Received Lines' },
    { id: 'x_headers', label: 'X-Headers' },
    { id: 'security', label: 'Security' },
  ];

  const handleResult = (data, featuresData) => {
    setTabResults((prev) => ({
      ...prev,
      [activeTab]: { result: data, features: featuresData },
    }));
  };

  const handleSwitchToURLCheck = async (urlDomain) => {
    setActiveTab('url');
    setLoading(true);
    // Tạo URL đầy đủ với https
    const fullUrl = `https://${urlDomain}`;
    try {
      // Giả sử URLChecker có phương thức để xử lý URL và gọi API
      const response = await fetch('/api/url/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: fullUrl }),
      });
      const data = await response.json();
      handleResult(data, null); // Cập nhật kết quả từ URL check
    } catch (error) {
      console.error('Lỗi khi kiểm tra URL:', error);
      handleResult({ error: 'Không thể kiểm tra URL' }, null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-4">
      <div className="mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800 text-shadow">
          Kiểm Tra Lừa Đảo - Bảo Vệ Bạn Trực Tuyến
        </h1>
        <p className="text-center text-gray-600 mb-10">
          Nhập URL, tải hình ảnh, email hoặc tập tin để kiểm tra độ an toàn.
        </p>

        {/* Smaller Input Section */}
        <div className="max-w-3xl mx-auto bg-white bg-opacity-90 backdrop-blur-lg rounded-lg shadow-lg p-6 mb-8">
          <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="mt-6">
            {activeTab === 'url' && <URLChecker setLoading={setLoading} onResult={handleResult} />}
            {activeTab === 'image' && <ImageChecker setLoading={setLoading} onResult={handleResult} />}
            {activeTab === 'file' && <FileChecker setLoading={setLoading} onResult={handleResult} />}
            {activeTab === 'email' && <EmailChecker setLoading={setLoading} onResult={handleResult} />}
          </div>
        </div>
        {loading && (
          <div className="max-w-7xl mx-auto rounded-lg p-6">
            <div className="flex flex-row space-x-4">
              {/* Left Side: Skeleton for Analysis */}
              <div className="w-1/2 p-4 bg-white border rounded-lg shadow">
                <div className="loading" style={{ height: '200px', width: '100%', borderRadius: '5px' }}></div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 mt-4">Phân tích chi tiết</h3>
                <div className="space-y-4">
                  <div className="loading" style={{ height: '80px', width: '100%', borderRadius: '5px' }}></div>
                  <div className="loading" style={{ height: '80px', width: '100%', borderRadius: '5px' }}></div>
                  <div className="loading" style={{ height: '80px', width: '100%', borderRadius: '5px' }}></div>
                  <div className="loading" style={{ height: '80px', width: '100%', borderRadius: '5px' }}></div> {/* Thêm cho URL */}
                </div>
              </div>

              {/* Right Side: Skeleton for Results */}
              <div className="w-1/2 p-4 bg-white border rounded-lg shadow">
                <div className="loading" style={{ height: '600px', width: '100%', borderRadius: '5px' }}></div>
              </div>
            </div>
          </div>
        )}
        {!loading && tabResults[activeTab].result && (
          <div className="max-w-7xl mx-auto rounded-lg p-6 transition-opacity duration-500 opacity-100" style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
            <div className="flex flex-row space-x-4">
              {/* Left Side: Analysis and URLs */}
              <div className="w-1/2 p-4 bg-white border rounded-lg shadow">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Phân tích chi tiết</h3>
                <div className="mb-4">
                  <Tabs tabs={analysisTabs} activeTab={activeAnalysisTab} setActiveTab={setActiveAnalysisTab} />
                </div>
                {activeAnalysisTab === 'headers' && tabResults[activeTab].result.email_details && (
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <h4 className="text-lg font-semibold mb-2">Headers</h4>
                    <ul className="list-disc pl-5">
                      <li><strong>From:</strong> {tabResults[activeTab].result.email_details.headers.From || <span className="italic text-gray-400">None</span>}</li>
                      <li><strong>Display Name:</strong> {tabResults[activeTab].result.email_details.headers.DisplayName || <span className="italic text-gray-400">None</span>}</li>
                      <li><strong>Sender:</strong> {tabResults[activeTab].result.email_details.headers.Sender || <span className="italic text-gray-400">None</span>}</li>
                      <li><strong>To:</strong> {tabResults[activeTab].result.email_details.headers.To || <span className="italic text-gray-400">None</span>}</li>
                      <li><strong>CC:</strong> {tabResults[activeTab].result.email_details.headers.CC || <span className="italic text-gray-400">None</span>}</li>
                      <li><strong>In-Reply-To:</strong> {tabResults[activeTab].result.email_details.headers["In-Reply-To"] || <span className="italic text-gray-400">None</span>}</li>
                      <li><strong>Timestamp:</strong> {tabResults[activeTab].result.email_details.headers.Timestamp  || <span className="italic text-gray-400">None</span>}</li>
                      <li><strong>Reply-To:</strong> {tabResults[activeTab].result.email_details.headers["Reply-To"] || <span className="italic text-gray-400">None</span>}</li>
                      <li><strong>Message-ID:</strong> {tabResults[activeTab].result.email_details.headers["Message-ID"] || <span className="italic text-gray-400">None</span>}</li>
                      <li><strong>Return-Path:</strong> {tabResults[activeTab].result.email_details.headers["Return-Path"] || <span className="italic text-gray-400">None</span>}</li>
                      <li><strong>Originating IP:</strong> {tabResults[activeTab].result.email_details.headers.OriginatingIP || <span className="italic text-gray-400">None</span>}</li>
                      <li><strong>rDNS:</strong> {tabResults[activeTab].result.email_details.headers.rDNS || <span className="italic text-gray-400">None</span>}</li>
                    </ul>
                  </div>
                )}
                {activeAnalysisTab === 'received' && tabResults[activeTab].result.email_details && (
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <h4 className="text-lg font-semibold mb-2">Received Lines</h4>
                    <div className="space-y-4">
                      {tabResults[activeTab].result.email_details.received_lines.map((hop, index) => (
                        <div key={index} className="p-2 border rounded">
                          <p><strong>{hop.Hop}:</strong></p>
                          <ul className="list-disc pl-5">
                            <li><strong>Timestamp:</strong> {hop.Timestamp || <span className="italic text-gray-400">None</span>}</li>
                            <li><strong>Received From:</strong> {hop.ReceivedFrom || <span className="italic text-gray-400">None</span>}</li>
                            <li><strong>Received By:</strong> {hop.ReceivedBy || <span className="italic text-gray-400">None</span>}</li>
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {activeAnalysisTab === 'x_headers' && tabResults[activeTab].result.email_details && (
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <h4 className="text-lg font-semibold mb-2">X-Headers</h4>
                    <ul className="list-disc pl-5">
                      <li><strong>X-Priority:</strong> {tabResults[activeTab].result.email_details.x_headers["x-priority"] || <span className="italic text-gray-400">None</span>}</li>
                      <li><strong>X-MSMail-Priority:</strong> {tabResults[activeTab].result.email_details.x_headers["x-msmail-priority"] || <span className="italic text-gray-400">None</span>}</li>
                      <li><strong>X-OriginalArrivalTime:</strong> {tabResults[activeTab].result.email_details.x_headers["x-originalarrivaltime"] || <span className="italic text-gray-400">None</span>}</li>
                    </ul>
                  </div>
                )}
                {activeAnalysisTab === 'security' && tabResults[activeTab].result.email_details && (
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <h4 className="text-lg font-semibold mb-2">Security</h4>
                    <div className="ml-4">
                      <h5 className="font-semibold">SPF</h5>
                      <ul className="list-disc pl-5">
                        <li><strong>Result:</strong> {tabResults[activeTab].result.email_details.security.SPF.Result || <span className="italic text-gray-400">None</span>}</li>
                        <li><strong>Originating IP:</strong> {tabResults[activeTab].result.email_details.security.SPF.OriginatingIP || <span className="italic text-gray-400">None</span>}</li>
                        <li><strong>rDNS:</strong> {tabResults[activeTab].result.email_details.security.SPF.rDNS || <span className="italic text-gray-400">None</span>}</li>
                        <li><strong>Return-Path Domain:</strong> {tabResults[activeTab].result.email_details.security.SPF.ReturnPathDomain || <span className="italic text-gray-400">None</span>}</li>
                        <li><strong>SPF Record:</strong> {tabResults[activeTab].result.email_details.security.SPF.SPFRecord || <span className="italic text-gray-400">None</span>}</li>
                      </ul>
                      <h5 className="font-semibold mt-2">DKIM</h5>
                      <ul className="list-disc pl-5">
                        <li><strong>Result:</strong> {tabResults[activeTab].result.email_details.security.DKIM.Result || <span className="italic text-gray-400">None</span>}</li>
                        <li><strong>Verifications:</strong> {tabResults[activeTab].result.email_details.security.DKIM.Verifications || <span className="italic text-gray-400">None</span>}</li>
                      </ul>
                      <h5 className="font-semibold mt-2">DMARC</h5>
                      <ul className="list-disc pl-5">
                        <li><strong>Result:</strong> {tabResults[activeTab].result.email_details.security.DMARC.Result || <span className="italic text-gray-400">None</span>}</li>
                        <li><strong>From Domain:</strong> {tabResults[activeTab].result.email_details.security.DMARC.FromDomain || <span className="italic text-gray-400">None</span>}</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Đánh giá từ bên thứ ba */}
                {activeTab === 'email' && tabResults[activeTab].result.email_details && (
                  <div className="mt-4">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Đánh giá từ bên thứ ba</h3>
                    <div className="space-y-4">
                      {tabResults[activeTab].result.third_party_eval?.scanii && (
                        <div className={`p-4 rounded-lg ${getColorClass(tabResults[activeTab].result.third_party_eval.scanii.status)} border`}>
                          <p className="text-md font-semibold">Scanii: <span className="font-bold">{tabResults[activeTab].result.third_party_eval.scanii.status}</span></p>
                          <p className="text-sm">{tabResults[activeTab].result.third_party_eval.scanii.details || <span className="italic text-gray-400">None</span>}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Phát hiện URL */}
                {activeTab === 'email' && tabResults[activeTab].result.email_details && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                    {tabResults[activeTab].result.email_details.urls === null || 
                    tabResults[activeTab].result.email_details.urls.length === 0 ? (
                      <p className="text-md font-semibold">Message URLs: None</p>
                    ) : (
                      <div>
                        <p className="text-md font-semibold mb-2">Phát hiện URL trong email:</p>
                        <ul className="space-y-2">
                          {tabResults[activeTab].result.email_details.urls.map((url, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <a 
                                href={`https://${url.Domain}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                https://{url.Domain}
                              </a>
                              <button
                                onClick={() => handleSwitchToURLCheck(url.Domain)}
                                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm relative group"
                                title="Chuyển sang kiểm tra URL"
                              >
                                Kiểm tra
                                <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 left-1/2 transform -translate-x-1/2">
                                  Chuyển sang kiểm tra URL
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Side: Results and Features */}
              <div className="w-1/2 p-4 bg-white border rounded-lg shadow">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Kết quả phân tích</h2>
                {tabResults[activeTab].result.qr_results ? (
                  <div>
                    {tabResults[activeTab].result.qr_results.map((qr, index) => (
                      <div key={index} className={`p-4 rounded-lg mb-6 ${getColorClass(qr.prediction)} border`}>
                        <p className="text-lg font-semibold">URL từ mã QR: <span className="font-bold">{qr.qr_url}</span></p>
                        <p className="text-lg font-semibold">Phân loại: <span className="font-bold">{qr.prediction}</span></p>
                        <div className="mt-3">
                          <p className="text-md">Xác suất Phishing: <span className="font-bold text-lg">{qr.rf_confidence || 0}%</span></p>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div className="bg-red-600 h-3 rounded-full" style={{ width: `${qr.rf_confidence || 0}%` }}></div>
                          </div>
                        </div>
                        <div className="mt-3">
                          <p className="text-md">Xác suất Hợp pháp: <span className="font-bold text-lg">{qr.legitimate_prob || 0}%</span></p>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div className="bg-green-600 h-3 rounded-full" style={{ width: `${qr.legitimate_prob || 0}%` }}></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : activeTab === 'email' && tabResults[activeTab].result.email_details ? (
                  <div>
                    <div className={`p-4 rounded-lg mb-6 ${getColorClass(tabResults[activeTab].result.result)} border`}>
                      <p className="text-lg font-semibold">Phân loại: <span className="font-bold">
                        {tabResults[activeTab].result.result}
                      </span></p>
                      <div className="mt-3">
                        <p className="text-md">Xác suất Phishing: <span className="font-bold text-lg">{tabResults[activeTab].result.rf_confidence || 0}%</span></p>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div className="bg-red-600 h-3 rounded-full" style={{ width: `${tabResults[activeTab].result.rf_confidence || 0}%` }}></div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <p className="text-md">Xác suất Hợp pháp: <span className="font-bold text-lg">{tabResults[activeTab].result.legitimate_prob || 0}%</span></p>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div className="bg-green-600 h-3 rounded-full" style={{ width: `${tabResults[activeTab].result.legitimate_prob || 0}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={`p-4 rounded-lg mb-6 ${getColorClass(activeTab === 'file' ? tabResults[activeTab].result.result : tabResults[activeTab].result.prediction || tabResults[activeTab].result.result)} border`}>
                    <p className="text-lg font-semibold">Phân loại: <span className="font-bold">
                      {activeTab === 'file' ? tabResults[activeTab].result.result : 
                       tabResults[activeTab].result.prediction || tabResults[activeTab].result.result}
                    </span></p>
                    <div className="mt-3">
                      <p className="text-md">Xác suất Phishing: <span className="font-bold text-lg">{tabResults[activeTab].result.rf_confidence || 0}%</span></p>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-red-600 h-3 rounded-full" style={{ width: `${tabResults[activeTab].result.rf_confidence || 0}%` }}></div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-md">Xác suất Hợp pháp: <span className="font-bold text-lg">{tabResults[activeTab].result.legitimate_prob || 0}%</span></p>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-green-600 h-3 rounded-full" style={{ width: `${tabResults[activeTab].result.legitimate_prob || 0}%` }}></div>
                      </div>
                    </div>
                  </div>
                )}
                {tabResults[activeTab].features && !tabResults[activeTab].result.qr_results && <FeaturesDisplay features={tabResults[activeTab].features} />}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Assuming getColorClass is defined here for consistency
const getColorClass = (status) => {
  if (!status || typeof status !== 'string') return 'bg-gray-100 text-gray-700';

  switch (status.toLowerCase()) {
    case 'phishing':
    case 'nguy hiểm':
      return 'bg-red-100 text-red-600';
    case 'hợp pháp':
    case 'an toàn':
      return 'bg-green-100 text-green-700';
    case 'đang xử lý':
      return 'bg-yellow-100 text-yellow-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

// CSS inline cho skeleton loading với màu nhẹ hơn và hiệu ứng chuyển đổi
const styles = `
  .loading {
    background: #d3d3d3 !important; /* Màu xám nhạt hơn */
    position: relative;
    overflow: hidden;
    opacity: 1;
    transition: opacity 0.5s ease-in-out;
  }
  .loading::before {
    content: '';
    height: 100%;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    background: linear-gradient(to right, rgba(240, 240, 240, 0.7), transparent) !important; /* Gradient nhẹ nhàng hơn */
    animation: loadingWave linear 1s infinite;
    transform: translateX(-100%);
  }
  @keyframes loadingWave {
    100% {
      transform: translateX(100%);
    }
  }
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  .transition-opacity {
    transition: opacity 0.5s ease-in-out;
  }
`;

// Thêm style vào document
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

export default App;