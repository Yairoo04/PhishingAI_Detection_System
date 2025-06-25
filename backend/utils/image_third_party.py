import requests

def check_image_sightengine(image_bytes):
    """
    Quét ảnh với Sightengine để phát hiện nội dung nhạy cảm (nudity, vũ khí, v.v.)
    
    :param image_bytes: Dữ liệu ảnh ở dạng bytes
    :return: dict chứa trạng thái và chi tiết
    """
    API_USER = "88702856"
    API_SECRET = "2DAJCGQDRijUUbtfmQyBXXc92dL4wrqk"
    url = 'https://api.sightengine.com/1.0/check.json'
    try:
        response = requests.post(
            url,
            data={
                'models': 'nudity,wad,offensive,text-content',
                'api_user': API_USER,
                'api_secret': API_SECRET
            },
            files={'media': ('image.jpg', image_bytes)}
        )
        response.raise_for_status()
        result = response.json()
        print(f"[Sightengine] API response: {result}")  # Thêm log để kiểm tra
        # Phân tích kết quả
        nudity_score = result.get("nudity", {}).get("raw", 0)
        offensive_prob = result.get("offensive", {}).get("prob", 0)

        if nudity_score > 0.5 or offensive_prob > 0.5:
            return {
                "status": "nguy hiểm",
                "details": "Ảnh chứa nội dung nhạy cảm hoặc phản cảm",
                "color": "red"
            }
        else:
            return {
                "status": "an toàn",
                "details": "Không phát hiện nội dung xấu",
                "color": "green"
            }

    except Exception as e:
        print(f"[Sightengine] Lỗi khi quét ảnh: {e}")
        return {
            "status": "lỗi",
            "details": "Không thể quét ảnh bằng Sightengine",
            "color": "gray"
        }
