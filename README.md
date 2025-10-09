# PhishingAI Detection System

Hệ thống phát hiện Phishing đa kênh (URL, Email (.eml), PDF, Ảnh/QR) sử dụng kết hợp Random Forest và CNN (EfficientNetB0) — Web app + Chrome extension để kiểm tra nhanh các nguy cơ phishing.

## Description

Dự án này tập trung vào việc ứng dụng trí tuệ nhân tạo để phát hiện và ngăn chặn các cuộc tấn công phishing qua các định dạng dữ liệu phổ biến như URL, email, file PDF và hình ảnh (bao gồm mã QR). Hệ thống sử dụng thuật toán Random Forest cho phân loại dữ liệu văn bản và Mạng nơ-ron tích chập (CNN) dựa trên EfficientNetB0 kết hợp Random Forest cho xử lý hình ảnh. 

Nghiên cứu dựa trên dữ liệu từ các nguồn uy tín như PhishTank, OpenPhish, Kaggle, Majestic Million, CIRCL Images Phishing Dataset, CIC-Evasive-PDFMal2022, Nazario Phishing Corpus và SpamAssassin Public Corpus. Hệ thống được triển khai dưới dạng web app để kiểm tra file/upload và Chrome extension để kiểm tra nhanh URL trên trình duyệt.

Mục tiêu chính là xây dựng một giải pháp bảo mật thực tiễn, dễ sử dụng, với hiệu suất cao và khả năng tích hợp vào các hệ thống an ninh mạng, giúp bảo vệ người dùng trước các mối đe dọa phishing ngày càng tinh vi.

## Features

- **Kiểm tra URL**: Trích xuất khoảng 19 đặc trưng (độ dài URL, số ký tự đặc biệt, số subdomain, có IP, có ký tự Unicode, v.v.) và phân loại bằng Random Forest.
- **Kiểm tra Email (.eml)**: Trích xuất header & metadata (from, received, x-spam-*, span_time, mismatch domain, v.v.) và phân loại bằng Random Forest.
- **Kiểm tra File PDF**: Phân tích đặc trưng kỹ thuật (kích thước file, số trang, số script, metadata, v.v.) và phân loại bằng Random Forest.
- **Kiểm tra Ảnh / QR**: Phát hiện và giải mã QR bằng pyzbar (trích xuất URL nếu có), hoặc sử dụng EfficientNetB0 để trích xuất đặc trưng hình ảnh + Random Forest để phân loại (phát hiện giao diện web giả mạo, logo mờ, font chữ bất thường).
- **Giao diện Web**: Hỗ trợ upload file (email, PDF, ảnh), kiểm tra URL, preview nội dung, và hiển thị kết quả (khả năng phishing % và kết luận).
- **Chrome Extension**: Kiểm tra nhanh URL đang truy cập bằng cách gửi request đến API web app.
- **Tích hợp thực tế**: Hệ thống xử lý dữ liệu thời gian thực, dễ triển khai trên web server và trình duyệt.

## Installation

### Yêu cầu hệ thống
- Python 3.12+ (cho backend: Random Forest, CNN với TensorFlow/Keras, pyzbar, urlparse, v.v.)
- Node.js và npm (cho frontend web app)
- Các thư viện Python chính: scikit-learn, tensorflow, keras, opencv-python, pyzbar, pandas, numpy.
- Môi trường: Không yêu cầu internet cho inference (sau khi huấn luyện), nhưng cần GPU khuyến nghị cho CNN.

### Hướng dẫn cài đặt
1. Clone repository: 
```
git clone https://github.com/Yairoo04/PhishingAI_Detection_System.git
cd PhishingAI_Detection_System
```
2. Cài đặt Backend
```
python -m venv env
source env/bin/activate   # (Windows: env\Scripts\activate)
pip install -r requirements.txt
python .\backend\app.py
```

4. Cài đặt frontend:
```
cd frontend
npm install
npm start
```
3, Hình ảnh website
<p align="center">
  <img src="https://github.com/user-attachments/assets/a6d18659-7eda-4445-a9dc-a784e5984267" 
       alt="PhishingAI Extension Preview" width="300">
</p>

## Usage

### Web App
1. Truy cập localhost:3000 (hoặc port frontend).
2. **Kiểm tra URL**: Nhập URL vào input, nhấn "Check URL". Kết quả hiển thị % phishing và kết luận (Phishing/Legitimate).
3. **Kiểm tra File**: Upload file (.eml, .pdf, .png/.jpg) qua phần "Check File". Nhấn "Check File" để xem preview và kết quả.
- Ví dụ: Upload email nghi ngờ → Hệ thống phân tích header/metadata → Trả về % phishing.

### Kiểm tra URL/Ảnh/PDF/Email Phishing
<p align="center">
  <img src="https://github.com/user-attachments/assets/4e7b3e18-1058-4283-be1b-60fdb327a56a" 
       alt="PhishingAI Extension Preview" width="300">
</p>

### Chrome Extension (Chưa được phát hành)
<p align="center">
  <img src="https://github.com/user-attachments/assets/24628320-c83d-4665-8c82-ad65c6971e39" 
       alt="PhishingAI Extension Preview" width="300">
</p>


## Models and Performance

Hệ thống sử dụng:
- **Random Forest**: Cho URL, Email, PDF. Sử dụng Gini impurity để chọn đặc trưng quan trọng, chống overfitting qua ensemble learning.
- **CNN (EfficientNetB0 + RF)**: Transfer learning từ ImageNet cho trích xuất đặc trưng hình ảnh, kết hợp RF cho phân loại.

Kết quả thực nghiệm (dựa trên tập kiểm tra):
| Loại dữ liệu | Mô hình             | Accuracy                  | Precision | Recall |
| ------------ | ------------------- | ------------------------- | --------- | ------ |
| URL          | Random Forest       | 0.93                      | 0.95      | 0.95   |
| PDF          | Random Forest       | 0.99                      | 0.99      | 0.99   |
| Email        | Random Forest       | 0.99                      | 1.00      | 0.99   |
| Image / QR   | EfficientNetB0 + RF | 0.88 (train) / 0.85 (val) | —         | —      |


Đánh giá trên dữ liệu thực tế cho thấy hệ thống hiệu quả trong việc giảm false positive và phát hiện các trường hợp tinh vi (URL rút gọn, mã QR độc hại, giao diện giả mạo).

## Data Sources

- **URL**: PhishTank, OpenPhish, UCI Phishing URL Dataset, Majestic Million.
- **Ảnh**: CIRCL Images Phishing Dataset.
- **PDF**: CIC-Evasive-PDFMal2022.
- **Email**: Nazario Phishing Corpus, SpamAssassin Public Corpus.

## Limitations

- Random Forest: Thời gian inference chậm với rừng cây lớn; khó giải thích quyết định.
- CNN: Yêu cầu tài nguyên cao; dễ overfitting nếu dữ liệu hạn chế.
- Hạn chế chung: Dữ liệu thiên lệch hoặc chất lượng kém có thể ảnh hưởng hiệu suất.

## Future Work

- Mở rộng sang smishing/vishing.
- Tích hợp BERT/LSTM cho phân tích nội dung sâu.
- Sử dụng Explainable AI (SHAP/LIME) để minh bạch.
- Adversarial training để chống tấn công giả mạo mô hình.

## References

- IBM Security, Cost of a Data Breach Report, 2022. [https://www.ibm.com/security/data-breach](https://www.ibm.com/security/data-breach)
- ENISA, Threat Landscape Report, 2021. [https://www.enisa.europa.eu/publications/enisa-threat-landscape-2021](https://www.enisa.europa.eu/publications/enisa-threat-landscape-2021)
- Breiman, L. (2001). Random Forests. Machine Learning, 45(1), 5-32.
- Yann Lecun et al. (2015). Deep Learning. Nature, 521(7553), 436-444.
- Các nguồn dữ liệu: PhishTank, OpenPhish, UCI ML Repository, CIRCL, CIC, Nazario Corpus, SpamAssassin.
