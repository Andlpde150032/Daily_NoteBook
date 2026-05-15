# 🐧 Linux Essentials Cheatsheet

Sổ tay các câu lệnh Linux cơ bản và nâng cao phục vụ quá trình Pentest và quản trị hệ thống.

---

## 📂 Quản lý tệp tin & Thư mục
| Command | Mô tả | Ví dụ |
| :--- | :--- | :--- |
| `ls -la` | Liệt kê tất cả file (bao gồm file ẩn) | `ls -la /var/www/html` |
| `find` | Tìm kiếm file theo tên/quyền | `find / -name "*.conf" 2>/dev/null` |
| `grep` | Tìm kiếm chuỗi trong file | `grep -rnw "/" -e "password"` |

## 🌐 Mạng & Kết nối
| Command | Mô tả | Ví dụ |
| :--- | :--- | :--- |
| `ip a` | Kiểm tra địa chỉ IP | `ip a` |
| `netstat -tunlp` | Kiểm tra các cổng đang mở | `netstat -tunlp` |
| `curl` | Gửi yêu cầu HTTP | `curl -X POST -d "param=val" http://target.com` |

## 🛡️ Đặc quyền & Người dùng
| Command | Mô tả | Ví dụ |
| :--- | :--- | :--- |
| `sudo -l` | Kiểm tra quyền sudo của user | `sudo -l` |
| `chmod` | Thay đổi quyền file | `chmod 600 id_rsa` |
| `chown` | Thay đổi chủ sở hữu | `chown root:root secret.txt` |
