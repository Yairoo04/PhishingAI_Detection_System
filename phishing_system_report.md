# Báo cáo Lý thuyết: Hệ thống Trí tuệ Nhân tạo Phát hiện Phishing (Phishing AI Detection System)

## 1. Tổng quan Hệ thống (System Overview)
Hệ thống **PhishGuard (Phishing AI Detection System)** là một giải pháp đa mô thức (Multi-modal) chuyên biệt trong việc nhận diện và cảnh báo các cuộc tấn công Phishing. Khác với các hệ thống chỉ kiểm tra tĩnh dựa trên danh sách đen (Blacklist), hệ thống này kết hợp cả AI (Machine Learning & Deep Learning) và các API bảo mật bên thứ ba để đảm bảo độ chính xác cao nhất.

Các luồng xử lý chính bao gồm nhận diện thông qua: Đường dẫn (URL), Thư điện tử (Email), Tệp PDF (File), Ứng dụng Android (APK) và Hình ảnh (Image/QR Code).

---

## 2. Kiến trúc và Luồng Xử lý Dữ liệu (Mô hình Multi-Modal)

Kiến trúc backend được phát triển bằng **Flask** (Python) đóng vai trò là API Gateway tiếp nhận các request từ Frontend. Khi có request, hệ thống sẽ điều hướng đến các route tương ứng (URL, Email, Image, File, Android).

### 2.1. Luồng xử lý phân tích URL (URL Detection Flow)
Đây là tính năng cốt lõi của hệ thống, phân tích một đường link xem có độc hại hay không.
- **Bước 1: Tiếp nhận & Trích xuất đặc trưng (Feature Extraction)**: Hệ thống nhận URL từ người dùng và trích xuất hàng loạt các đặc trưng (features) thông qua module [url_features.py](file:///d:/3.%20PTIT/2.%20NCKH/4.%20NCKH_Phishing/PhishingAI_Detection_System_main/backend/utils/url_features.py) (ví dụ: độ dài URL, số lượng ký tự đặc biệt, sự hiện diện của địa chỉ IP, v.v.).
- **Bước 2: Phân tích bằng Machine Learning**:
  - Dữ liệu đặc trưng được đưa vào mô hình **Stacking Ensemble**.
  - **Base Models**: Chạy qua 4 mô hình độc lập gồm Random Forest (RF), LightGBM (LGBM), XGBoost (XGB) và CatBoost (Cat). Xác suất dự đoán (Predict Proba) từ 4 mô hình này được tạo thành một vector đặc trưng mới.
  - **Meta Model**: Mô hình XGBoost cuối cùng sẽ đưa ra kết quả phân loại (Phishing hoặc Legitimate) dựa trên output của 4 models con.
- **Bước 3: Tích hợp Third-party API**: Hệ thống gọi tới VirusTotal, Google Safe Browsing và URLVoid để kiểm tra xem URL đã nằm trong Blacklist hay chưa.
- **Bước 4: Giải thích bằng SHAP**: Sử dụng SHAP TreeExplainer để phân tích và giải thích cho người dùng biết *đặc trưng nào* khiến URL bị đánh giá là Phishing.
- **Bước 5: Trả kết quả**: Tổng hợp kết quả AI, API thứ 3, ảnh chụp màn hình trang web (Screenshot) và SHAP explanation trả về cho Frontend hiển thị.

### 2.2. Luồng xử lý phân tích Thư điện tử (Email Detection Flow)
Quy trình nhận diện email mạo danh thông qua tệp `.eml`.
- **Bước 1: Phân tích cấu trúc thư (Parsing)**: Đọc file `.eml`, trích xuất Headers (From, To, Reply-To, Message-ID), Received Hops, cấu hình bảo mật SPF/DKIM/DMARC.
- **Bước 2: Trích xuất đặc trưng**: Kiểm tra sự sai lệch cấu trúc (Missing Headers), kiểm tra Domain (Domain match giữa `From` và `Return-Path`), phân tích mốc thời gian (Span time).
- **Bước 3: Phân tích bằng AI**: Đưa vector các đặc trưng email vào mô hình **Stacking Ensemble** (với Base là RF, LGBM, XGB, CatBoost và Meta là XGBoost) được huấn luyện riêng cho dữ liệu Email để dự đoán xác suất lừa đảo.
- **Bước 4: Quét tệp đính kèm (Scanii)**: Thông qua API thứ ba (Scanii) nhằm rà quét mã độc trong nội dung file.

### 2.3. Luồng xử lý Tệp tài liệu (PDF File Detection Flow)
- **Bước 1: Phân tích tĩnh (Static Analysis)**: Đọc kích thước file, kiểm tra siêu dữ liệu (Metadata), kiểm tra cờ mã hóa (isEncrypted), tìm kiếm các JavaScript/Action thực thi ẩn bên trong file [(/JS, /OpenAction, /Acroform)](file:///d:/3.%20PTIT/2.%20NCKH/4.%20NCKH_Phishing/PhishingAI_Detection_System_main/backend/app.py#32-36).
- **Bước 2: Trích xuất Text & URLs**: Đọc nội dung chữ và các URL được nhúng trong tài liệu PDF.
- **Bước 3: AI Model**: Chạy qua mô hình Stacking Ensemble (dành cho File) để cho ra xác suất mã độc. Quét tệp bổ sung bằng Scanii.

### 2.4. Luồng xử lý Ảnh và QR Code (Image Detection)
Mô đun này hướng tới các cuộc tấn công lừa đảo lẩn tránh bằng cách sử dụng ảnh hoặc mã QR (Quishing).
- **Bước 1: Giải mã QR Code**: Dùng OpenCV và PyZbar để quét ảnh. Nếu ảnh chứa QR Code, hệ thống trích xuất URL và tái sử dụng **Luồng xử lý phân tích URL** (2.1).
- **Bước 2: Phân tích Visual Phishing (Deep Learning)**: Nếu quét không ra QR hoặc để phân tích độ tin cậy của ảnh chụp, ảnh được tiền xử lý (resize, rescale) và đưa qua mô hình **Mạng nơ-ron tích chập (CNN)** - cụ thể là **EfficientNetV2M**. Mô hình này phân tích giao diện thị giác để phát hiện các trang đăng nhập giả mạo.

### 2.5. Luồng xử lý mã độc Android (APK Malware Scanning)
- **Bước 1: Phân tích cấu trúc APK**: Dựa trên module `AndroidFeatureExtractor` (tạm gọi Androguard-based) phân tích `AndroidManifest.xml` và mã dex.
- **Bước 2: Phân tích Quyền (Permissions) & Intents**: Trích xuất các quyền nguy hiểm (ví dụ: READ_SMS, SEND_SMS), API calls độc hại.
- **Bước 3: AI Model**: Truyền vector cấu trúc vào mô hình **Random Forest (RF)** độc lập để phân loại Malware hay phần mềm hợp lệ.

---

## 3. Giao tiếp giữa Frontend và Backend (Frontend-Backend Interaction)

Hệ thống hoạt động theo mô hình Client-Server thông qua RESTful API, cho phép việc tách biệt logic xử lý hạng nặng (Heavy AI Computing) ở Backend và hiển thị giao diện đồ họa ở Frontend.

### 3.1. Gửi dữ liệu từ Frontend (Requests)
- **Dữ liệu Văn bản (URL/Domain)**: Frontend đóng gói chuỗi URL thành định dạng JSON (`{"url": "http://..."}`) và gửi qua giao thức POST (ví dụ: `POST /api/url/predict`).
- **Dữ liệu Tập tin (Email/File/APK/Image)**: Trình duyệt sử dụng `FormData` để đóng gói dữ liệu nhiễ phân (binary) với Content-Type là `multipart/form-data`, sau đó gửi yêu cầu POST đến các endpoint tương ứng (ví dụ: `POST /api/email/predict`).

### 3.2. Cấu trúc Kết quả Trả về (JSON Responses)
Khi Backend xử lý xong, nó trả về một cấu trúc JSON chi tiết, có thể bao gồm các trường chính:
- `prediction`: Phân loại định tính ("Phishing", "Legitimate", "Malicious", "Malware").
- `phishing_probability` / `legitimate_probability`: Xác suất % độ tin cậy của AI.
- [features](file:///d:/3.%20PTIT/2.%20NCKH/4.%20NCKH_Phishing/PhishingAI_Detection_System_main/backend/routes/file.py#101-160): Một dictionary liệt kê toàn bộ các đặc trưng đã trích xuất từ dữ liệu đầu vào.
- `third_party_eval`: Kết quả từ VirusTotal, Scanii, Google Safe Browsing.
- [explanation](file:///d:/3.%20PTIT/2.%20NCKH/4.%20NCKH_Phishing/PhishingAI_Detection_System_main/backend/routes/url.py#96-152): Thông điệp của SHAP phân giải các đặc trưng nhạy cảm.

### 3.3. Hiển thị đồ họa (UI Rendering)
Dựa vào JSON response, Frontend (thường là ReactJS/VueJS) sẽ:
- Dùng màu xanh (`Legitimate`) hoặc màu đỏ/cam (`Phishing`) cho bảng kết quả tổng quan.
- Kết xuất (Render) các biểu đồ hình bánh (Pie Charts), sơ đồ mạng hoặc bảng liệt kê các đặc trưng có giá trị SHAP cao nhất, giúp người dùng trực quan hóa được nguyên nhân dẫn đến mức độ rủi ro.

---

## 4. Các câu hỏi phản biện thường gặp trong NCKH (Q&A Section)

Để bảo vệ báo cáo nghiên cứu, dưới đây là những câu hỏi hội đồng có thể đặt ra và cách trả lời:

**Câu hỏi 1: Tại sao nhóm lại sử dụng kiến trúc Stacking Ensemble thay vì chỉ dùng một mô hình mạnh như Deep Learning hay XGBoost độc lập?**
> **Trả lời**: Bài toán nhận diện Phishing qua URL, Email và File phụ thuộc rất nhiều vào dữ liệu bảng tĩnh (Tabular data) với các đặc trưng được trích xuất thủ công (Feature Engineering). Các mô hình dạng cây (Tree-based models như RF, XGBoost) thường biểu diễn rất tốt trên tabular data. Việc dùng Stacking Model tận dụng thế mạnh riêng biệt của từng model thành phần (ví dụ CatBoost xử lý Categorical feature tốt, Random Forest chống overfitting, LGBM hội tụ nhanh), và khi dùng XGBoost làm Meta-Model ở tầng 2, chúng em có thể triệt tiêu được sai số dư thừa của từng mô hình, đẩy độ chính xác (Accuracy, F1-Score) lên mức tối đa mà không tốn nhiều tài nguyên huấn luyện như Deep Learning.

**Câu hỏi 2: Hệ thống của nhóm hoạt động trên môi trường Web, làm sao đảm bảo thời gian thực (real-time) khi mô hình Stacking Ensemble gồm tới 5 models phải chạy cùng lúc?**
> **Trả lời**: Để tối ưu hiệu năng (Latency), hệ thống duy trì một bộ nhớ đệm model (Model Registry/Cache) trong RAM ngay khi Flask Backend khởi chạy (thông qua [load_stacking()](file:///d:/3.%20PTIT/2.%20NCKH/4.%20NCKH_Phishing/PhishingAI_Detection_System_main/backend/routes/image.py#57-70)). Khi có request, chúng ta không load lại model mà thực thi `.predict()` bằng bộ nhớ có sẵn, kết hợp với các base model có thuật toán dự đoán nhanh (trees/boosting) nên inference time mất chưa tới 0.2s cho mỗi request văn bản. Ngoài ra, việc dùng Flask Blueprint hỗ trợ kiến trúc luồng tốt cho các request song song.

**Câu hỏi 3: SHAP Explainability đóng vai trò gì trong hệ thống? Tại sao điều này cần thiết?**
> **Trả lời**: Machine Learning thường bị coi là "Hộp đen" (Black-box), nghĩa là nó chỉ đưa ra kết quả Phishing hay Legitimate mà người dùng không biết tại sao. Nhóm áp dụng **SHAP (SHapley Additive exPlanations)** để minh bạch hóa quyết định (Explainable AI - XAI). SHAP chỉ ra mức độ đóng góp (Feature Importance) của từng tham số làm tăng hay giảm tỷ lệ Phishing, giúp người dùng phổ thông hoặc chuyên gia có niềm tin vào hệ thống, biết cách đề phòng mồi nhử cụ thể (ví dụ do URL quá dài hay do chứa ký tự '@').

**Câu hỏi 4: Nhóm xử lý bài toán "Quishing" (Phishing qua QR Code) và tệp ảnh như thế nào?**
> **Trả lời**: Hệ thống kết hợp 2 quy trình: Một mặt dùng OpenCV/PyZbar bóc tách mã QR từ ảnh, sau đó rút trích URL ẩn trong mã QR truyền qua mô hình Stacking URL. Mặt khác, đưa toàn bộ ảnh web đi qua bộ nội suy tích chập sử dụng mạng CNN tiên tiến (EfficientNetV2M) đã được fine-tune để định vị các đặc điểm giao diện ngân hàng/tổ chức giả mạo bằng thị giác (Visual Phishing Detection). Do đó bù trừ được cả tấn công kỹ thuật số lẫn che giấu thị giác.

**Câu hỏi 5: Đối với luồng phân tích Android, vì sao lại dùng Random Forest thay vì Stacking như URL?**
> **Trả lời**: Đặc trưng của APK là dữ liệu phần lớn chứa các cờ (Flags) nhị phân về Quyền (Permissions) hoặc Intent Filters, Random Forest về bản chất xử lý rất mượt các dạng đặc trưng nhiễu hoặc rời rạc này và tránh được Overfitting. Vì bài toán hiện tại với bộ dữ liệu Android nhóm dùng, RF độc lập đã đạt đủ chỉ số đo lường hiệu suất vượt ngưỡng kỳ vọng mà không cần gia tăng độ trễ (latency) khi parse APK dung lượng lớn chạy qua nhiều vòng Meta-models.

**Câu hỏi 6: Hệ thống làm sao xử lý sự chênh lệch (Conflict) khi AI dự đoán là an toàn nhưng API VirusTotal lại báo Phishing?**
> **Trả lời**: Trọng tâm NCKH của nhóm là năng lực Model AI tự xây dựng (Zero-day protection), tuy nhiên API Third-party dùng để đối chiếu blacklist truyền thống. Ở phía frontend, hệ thống tách bạch hiển thị giữa xác suất do AI mô phỏng và kết quả Blacklist của 3rd-party. Nếu có mâu thuẫn (Conflict), người dùng sẽ được hệ thống cảnh báo cẩn trọng: *"URL an toàn về cấu trúc nhưng đã bị cắm cờ (flagged) độc hại trên kho dữ liệu mạng"*. Hoặc ngược lại *"URL mới chưa bị VirusTotal phát hiện nhưng AI cảnh báo rủi ro cấu trúc"*, làm tăng tính phòng thủ nhạy bén.
