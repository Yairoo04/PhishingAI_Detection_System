import pandas as pd
import numpy as np
import re
import math
import os
import logging
from urllib.parse import urlparse
from collections import Counter
from datetime import datetime
from email import policy
from email.parser import BytesParser
from PyPDF2 import PdfReader
from pdfminer.high_level import extract_text
from pdfminer.layout import LAParams

logger = logging.getLogger(__name__)

# ==========================================
# URL FEATURE EXTRACTION
# ==========================================
URL_FEATURES = [
    "url_length", "num_special_chars", "is_https", "num_digits",
    "domain_length", "num_subdomains", "num_dashes", "path_length",
    "query_length", "has_ip", "has_at_symbol", "redirect_count",
    "num_letters_in_domain", "num_numbers_in_domain", "letter_to_number_ratio",
    "has_phishing_keywords", "num_query_params", "query_string_complexity",
    "unicode_in_url"
]

PHISHING_KEYWORDS = [
    "login", "secure", "account", "bank", "verify",
    "update", "signin", "confirm",
    "bonus", "free", "reward"
]

def shannon_entropy(text: str) -> float:
    if not text:
        return 0.0
    counts = Counter(text)
    probs = [count / len(text) for count in counts.values()]
    return -sum(p * math.log2(p) for p in probs if p > 0)

def has_ip_address(domain: str) -> int:
    return 1 if re.match(r"^(?:\d{1,3}\.){3}\d{1,3}$", domain) else 0

def is_shortened_url(url: str) -> int:
    shorteners = [
        "bit.ly", "goo.gl", "tinyurl", "ow.ly", "t.co",
        "is.gd", "buff.ly", "adf.ly", "rebrand.ly", "shorturl.at",
        "shorte.st", "tiny.cc", "tr.im"
    ]
    return 1 if any(shortener in url.lower() for shortener in shorteners) else 0

def extract_url_features(url: str) -> dict:
    try:
        if not url.lower().startswith(('http://', 'https://')):
            url = 'http://' + url

        parsed = urlparse(url)
        if not parsed.hostname:
            raise ValueError("Invalid URL - no hostname found")

        domain = parsed.hostname.lower()
        path = parsed.path or "/"
        query = parsed.query or ""
        url_lower = url.lower()

        url_len = len(url)
        num_special_chars = sum(not c.isalnum() for c in url)
        is_https = 1 if parsed.scheme == "https" else 0
        num_digits = sum(c.isdigit() for c in url)
        domain_length = len(domain)
        num_subdomains = max(domain.count(".") - 1, 0) if "www" not in domain else max(domain.count(".") - 2, 0)
        num_dashes = url.count("-")
        path_length = len(path)
        query_length = len(query)
        has_at_symbol = 1 if "@" in url else 0
        redirect_count = url.count("//") - 1 if url.count("//") > 1 else 0
        
        num_letters_in_domain = sum(c.isalpha() for c in domain)
        num_numbers_in_domain = sum(c.isdigit() for c in domain)
        letter_to_number_ratio = num_letters_in_domain / max(num_numbers_in_domain, 1)
        
        has_phishing_keywords = 1 if any(kw in url_lower for kw in PHISHING_KEYWORDS) else 0
        num_query_params = query.count("&") + 1 if query else 0
        query_string_complexity = shannon_entropy(query)
        unicode_in_url = 1 if any(ord(c) > 127 for c in url) else 0

        features = {
            "url_length": url_len,
            "num_special_chars": num_special_chars,
            "is_https": is_https,
            "num_digits": num_digits,
            "domain_length": domain_length,
            "num_subdomains": num_subdomains,
            "num_dashes": num_dashes,
            "path_length": path_length,
            "query_length": query_length,
            "has_ip": has_ip_address(domain),
            "has_at_symbol": has_at_symbol,
            "redirect_count": redirect_count,
            "num_letters_in_domain": num_letters_in_domain,
            "num_numbers_in_domain": num_numbers_in_domain,
            "letter_to_number_ratio": letter_to_number_ratio,
            "has_phishing_keywords": has_phishing_keywords,
            "num_query_params": num_query_params,
            "query_string_complexity": query_string_complexity,
            "unicode_in_url": unicode_in_url
        }

        # Ensure order and existence
        return {feat: features.get(feat, 0) for feat in URL_FEATURES}

    except Exception as e:
        logger.warning(f"Error extracting features from URL '{url}': {str(e)}")
        return {feat: 0 for feat in URL_FEATURES}


# ==========================================
# EMAIL FEATURE EXTRACTION
# ==========================================
EMAIL_FEATURES = [
    "hops", "missing_subject", "missing_to", "missing_content-type",
    "missing_mime-version", "missing_x-mailer", "missing_delivered-to",
    "missing_list-unsubscribe", "missing_received-spf", "missing_reply-to",
    "str_from_chevron", "str_to_chevron", "str_message-ID_dollar",
    "str_return-path_bounce", "str_content-type_texthtml",
    "domain_match_from_return-path", "domain_match_to_from",
    "domain_match_to_message-id", "domain_match_from_reply-to",
    "domain_match_message-id_from", "length_from", "num_recipients_to",
    "num_recipients_cc", "time_zone", "day_of_week", "span_time",
    "date_comp_date_received", "content-encoding-val", "received_str_forged",
    "number_replies"
]

def extract_email_details(msg):
    headers = dict(msg.items())
    received_lines = msg.get_all("Received", [])
    x_headers = {k: v for k, v in headers.items() if k.lower().startswith("x-")}

    urls = re.findall(r'https?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', str(msg))
    url_domains = [re.search(r'https?://(.*?)(?:/|$)', url).group(1) for url in urls if re.search(r'https?://(.*?)(?:/|$)', url)]

    headers_details = {
        "From": headers.get("From", ""),
        "DisplayName": re.search(r'"(.*?)"', headers.get("From", "") or "").group(1) if re.search(r'"(.*?)"', headers.get("From", "")) else "",
        "Sender": headers.get("Sender", ""),
        "To": headers.get("To", ""),
        "CC": headers.get("Cc", ""),
        "In-Reply-To": headers.get("In-Reply-To", ""),
        "Timestamp": headers.get("Date", ""),
        "Reply-To": headers.get("Reply-To", ""),
        "Message-ID": headers.get("Message-ID", ""),
        "Return-Path": headers.get("Return-Path", ""),
        "OriginatingIP": "",
        "rDNS": ""
    }

    if received_lines:
        originating_ip_match = re.search(r'from\s+([\d\.]+)', received_lines[-1])
        headers_details["OriginatingIP"] = originating_ip_match.group(1) if originating_ip_match else ""
        rdns_match = re.search(r'from\s+[\w\.-]+\s+\(([\w\.-]+)\)', received_lines[-1])
        headers_details["rDNS"] = rdns_match.group(1) if rdns_match else ""

    received_details = []
    for i, received in enumerate(received_lines, 1):
        hop = {
            "Hop": f"Hop {i}",
            "Timestamp": re.search(r';(.*)', received).group(1).strip() if re.search(r';(.*)', received) else "",
            "ReceivedFrom": re.search(r'from\s+([\w\.-]+|\[[\d\.]+\])', received).group(1) if re.search(r'from\s+([\w\.-]+|\[[\d\.]+\])', received) else "",
            "ReceivedBy": re.search(r'by\s+([\w\.-]+)', received).group(1) if re.search(r'by\s+([\w\.-]+)', received) else ""
        }
        received_details.append(hop)

    x_headers_details = {
        "x-priority": x_headers.get("X-Priority", ""),
        "x-msmail-priority": x_headers.get("X-MSMail-Priority", ""),
        "x-originalarrivaltime": x_headers.get("X-OriginalArrivalTime", "")
    }

    security_details = {
        "SPF": {
            "Result": "SOFTFAIL" if "softfail" in headers.get("Received-SPF", "").lower() else headers.get("Received-SPF", "None").split()[0] if headers.get("Received-SPF") else "None",
            "OriginatingIP": headers_details["OriginatingIP"],
            "rDNS": headers_details["rDNS"],
            "ReturnPathDomain": re.search(r'@([\w\.-]+)', headers.get("Return-Path", "")).group(1) if headers.get("Return-Path") and re.search(r'@([\w\.-]+)', headers.get("Return-Path", "")) else "",
        },
        "DKIM": {
            "Result": headers.get("DKIM-Signature", "None") != "None" and "pass" in headers.get("Authentication-Results", "").lower() and "dkim=pass" or "None",
        },
        "DMARC": {
            "Result": headers.get("Authentication-Results", "").lower().find("dmarc=") != -1 and "pass" if "dmarc=pass" in headers.get("Authentication-Results", "").lower() else "None",
            "FromDomain": re.search(r'@([\w\.-]+)', headers.get("From", "")).group(1) if headers.get("From") and re.search(r'@([\w\.-]+)', headers.get("From", "")) else "",
        }
    }

    url_details = [{"Domain": domain, "Path": "/", "Scheme": "https", "url": urls[idx] if idx < len(urls) else domain} for idx, domain in enumerate(url_domains)] if url_domains else []
    return headers_details, received_details, x_headers_details, security_details, url_details

def extract_email_features(file_path: str) -> tuple:
    try:
        with open(file_path, 'rb') as f:
            msg = BytesParser(policy=policy.default).parse(f)
        headers_dict = dict(msg.items())

        received_headers = msg.get_all("Received", []) if msg else []
        hops = len(received_headers)
        most_recent_received = received_headers[0] if received_headers else ""

        is_missing = lambda h: int(h not in headers_dict or not str(headers_dict[h]).strip())
        domain_match = lambda h1, h2_val: int(
            bool(re.search(r'@([\w\.-]+)', str(headers_dict.get(h1, '')))) and
            bool(re.search(r'@([\w\.-]+)', str(h2_val))) and
            re.search(r'@([\w\.-]+)', str(headers_dict.get(h1, ''))).group(1) ==
            re.search(r'@([\w\.-]+)', str(h2_val)).group(1)
        ) if h2_val else 0

        span_time = 0
        if "Date" in headers_dict and most_recent_received:
            try:
                dt_str = headers_dict["Date"][:31]
                dt = datetime.strptime(dt_str, "%a, %d %b %Y %H:%M:%S %z")
                rec = most_recent_received.split(";")[-1].strip()[:31]
                if rec:
                    rec_dt = datetime.strptime(rec, "%a, %d %b %Y %H:%M:%S %z")
                    span_time = abs((dt - rec_dt).total_seconds())
            except Exception:
                pass

        time_zone = int(bool(re.search(r'([+-]\d{4})', str(headers_dict.get("Date", "")))))
        day_of_week = 0
        if "Date" in headers_dict:
            try:
                dt = datetime.strptime(headers_dict["Date"][:31], "%a, %d %b %Y %H:%M:%S %z")
                day_of_week = dt.weekday()
            except:
                pass

        date_comp_date_received = int("Date" in headers_dict and "Received" in headers_dict)
        content_encoding_val = str(headers_dict.get("Content-Transfer-Encoding", "")).lower()
        content_encoding_val = (
            1 if "quoted-printable" in content_encoding_val else
            2 if "base64" in content_encoding_val else
            3 if content_encoding_val in ["7bit", "8bit"] else
            0
        )

        received_str_forged = any("forged" in rec.lower() or not re.search(r'from [\w\.-]+', rec) for rec in received_headers)

        feats = {
            "hops": hops,
            "missing_subject": is_missing("Subject"),
            "missing_to": is_missing("To"),
            "missing_content-type": is_missing("Content-Type"),
            "missing_mime-version": is_missing("MIME-Version"),
            "missing_x-mailer": is_missing("X-Mailer"),
            "missing_delivered-to": is_missing("Delivered-To"),
            "missing_list-unsubscribe": is_missing("List-Unsubscribe"),
            "missing_received-spf": is_missing("Received-SPF"),
            "missing_reply-to": is_missing("Reply-To"),
            "str_from_chevron": int(bool(re.search(r'<[\w\.-]+@[\w\.-]+>', str(headers_dict.get("From", ""))))),
            "str_to_chevron": int(bool(re.search(r'<[\w\.-]+@[\w\.-]+>', str(headers_dict.get("To", ""))))),
            "str_message-ID_dollar": int(bool(re.search(r'\$', str(headers_dict.get("Message-ID", ""))))),
            "str_return-path_bounce": int(bool(re.search(r'bounce', str(headers_dict.get("Return-Path", "")), re.IGNORECASE))),
            "str_content-type_texthtml": int(bool(re.search(r'text/html', str(headers_dict.get("Content-Type", "")), re.IGNORECASE))),
            "domain_match_from_return-path": domain_match("From", headers_dict.get("Return-Path", "")),
            "domain_match_to_from": domain_match("To", headers_dict.get("From", "")),
            "domain_match_to_message-id": domain_match("To", headers_dict.get("Message-ID", "")),
            "domain_match_from_reply-to": domain_match("From", headers_dict.get("Reply-To", "")),
            "domain_match_message-id_from": domain_match("Message-ID", headers_dict.get("From", "")),
            "length_from": len(str(headers_dict.get("From", ""))),
            "num_recipients_to": len([x for x in str(headers_dict.get("To", "")).split(",") if x.strip()]),
            "num_recipients_cc": len([x for x in str(headers_dict.get("Cc", "")).split(",") if x.strip()]),
            "time_zone": time_zone,
            "day_of_week": day_of_week,
            "span_time": span_time,
            "date_comp_date_received": date_comp_date_received,
            "content-encoding-val": content_encoding_val,
            "received_str_forged": 1 if received_str_forged else 0,
            "number_replies": len([h for h in str(headers_dict.get("References", "")).split() if h.strip()]) if "References" in headers_dict else 0,
        }

        for f in EMAIL_FEATURES:
            if f not in feats:
                feats[f] = 0

        df = pd.DataFrame([feats], columns=EMAIL_FEATURES)
        headers_details, received_details, x_headers_details, security_details, url_details = extract_email_details(msg)

        analysis = {
            "explanation": "Phân tích dựa trên các tiêu chí header, received chain, domain khớp, và thời gian.",
            "headers_analysis": "Header From/Return-Path/Reply-To khớp" if feats["domain_match_from_return-path"] and feats["domain_match_from_reply-to"] else "Có dấu hiệu không khớp domain giữa From/Return-Path hoặc Reply-To",
            "received_analysis": f"Span time giữa Date và Received đầu tiên: {span_time}s → {'nghi ngờ giả mạo' if span_time > 3600 else 'bình thường'}",
            "security_analysis": f"SPF: {security_details['SPF']['Result']}, DKIM: {security_details['DKIM']['Result']}",
            "url_analysis": f"Tìm thấy {len(url_details)} link HTTPS" if url_details else "Không tìm thấy link HTTPS",
        }

        return df, headers_details, received_details, x_headers_details, security_details, url_details, analysis

    except Exception as e:
        logger.error(f"Error extracting features from {file_path}: {str(e)}", exc_info=True)
        raise ValueError(f"Không thể trích xuất đặc trưng từ file email: {str(e)}")


# ==========================================
# PDF FEATURE EXTRACTION
# ==========================================
EXPECTED_PDF_FEATURES = [
    "PdfSize", "MetadataSize", "Pages", "XrefLength", "TitleCharacters",
    "isEncrypted", "EmbeddedFiles", "Images", "Text", "Header", "Obj",
    "Endobj", "Stream", "Endstream", "Xref", "Trailer", "StartXref",
    "PageNo", "Encrypt", "ObjStm", "JS", "Javascript", "AA", "OpenAction",
    "Acroform", "JBIG2Decode", "RichMedia", "Launch", "EmbeddedFile",
    "XFA", "Colors"
]

def extract_urls_from_pdf(pdf_path: str):
    try:
        text = extract_text(pdf_path, laparams=LAParams())
        urls = re.findall(r'https?://[^\s<>"]+|www\.[^\s<>"]+', text)
        return [{"Domain": u, "url": u} for u in urls]
    except Exception:
        return []

def extract_pdf_features(pdf_path: str):
    pdf = PdfReader(pdf_path)
    features = {f: 0 for f in EXPECTED_PDF_FEATURES}

    features["PdfSize"] = os.path.getsize(pdf_path) / 1024.0
    features["MetadataSize"] = len(str(pdf.metadata)) if pdf.metadata else 0
    features["Pages"] = len(pdf.pages)
    features["PageNo"] = len(pdf.pages)
    features["TitleCharacters"] = len(pdf.metadata.get("/Title", "")) if pdf.metadata else 0
    features["isEncrypted"] = 1 if pdf.is_encrypted else 0

    with open(pdf_path, "rb") as f:
        content = f.read()

    features["Header"] = content.count(b"%PDF")
    features["Obj"] = content.count(b" obj")
    features["Endobj"] = content.count(b"endobj")
    features["Stream"] = content.count(b"stream")
    features["Endstream"] = content.count(b"endstream")
    features["Xref"] = content.count(b"xref")
    features["Trailer"] = content.count(b"trailer")
    features["StartXref"] = content.count(b"startxref")
    features["Encrypt"] = content.count(b"/Encrypt")
    features["ObjStm"] = content.count(b"/ObjStm")
    features["AA"] = content.count(b"/AA")
    features["OpenAction"] = content.count(b"/OpenAction")
    features["Acroform"] = content.count(b"/AcroForm")
    features["JBIG2Decode"] = content.count(b"JBIG2Decode")
    features["RichMedia"] = content.count(b"/RichMedia")
    features["Launch"] = content.count(b"/Launch")
    features["EmbeddedFile"] = content.count(b"/EmbeddedFile")
    features["EmbeddedFiles"] = content.count(b"/EmbeddedFiles")
    features["XFA"] = content.count(b"/XFA")
    features["Colors"] = content.count(b"/Color")

    text = ""
    try:
        text = extract_text(pdf_path, laparams=LAParams())
        features["Text"] = len(text)
        features["JS"] = int("javascript" in text.lower())
        features["Javascript"] = features["JS"]
    except Exception:
        features["Text"] = 0
        features["JS"] = features["Javascript"] = 0

    features["Images"] = int(features["Pages"] > 0 and features["PdfSize"] / features["Pages"] > 50)

    file_details = {
        "metadata": dict(pdf.metadata) if pdf.metadata else {},
        "content": {
            "phishing_keywords": re.findall(r"login|password|bank|account|secure", text.lower()),
            "has_javascript": bool(features["JS"]),
            "has_forms": bool(features["Acroform"]),
        },
        "urls": extract_urls_from_pdf(pdf_path)
    }

    return {"features": features, "file_details": file_details}
