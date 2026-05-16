# 🪟 Windows Essentials Cheatsheet

Tổng hợp các lệnh CMD và PowerShell cơ bản để quản trị và kiểm tra hệ thống Windows.

---

## 🔍 Thông tin hệ thống (System Info)
| Lệnh (CMD) | Mô tả | Ví dụ |
| :--- | :--- | :--- |
| `systeminfo` | Hiển thị thông tin chi tiết về OS, phần cứng, Hotfix | `systeminfo \| findstr /B /C:"OS Name" /C:"OS Version"` |
| `hostname` | Hiển thị tên máy tính | `hostname` |
| `ver` | Hiển thị phiên bản Windows | `ver` |
| `whoami` | Hiển thị user hiện tại và quyền hạn | `whoami /all` (Xem cả Group SID và Privileges) |

## 👥 Quản lý người dùng & Nhóm (User & Group)
| Lệnh (CMD) | Mô tả | Ví dụ |
| :--- | :--- | :--- |
| `net user` | Liệt kê hoặc quản lý user | `net user Administrator` (Xem chi tiết user) |
| `net localgroup` | Liệt kê hoặc quản lý nhóm local | `net localgroup Administrators` (Xem các admin máy) |
| `net session` | Xem các máy đang kết nối đến (cần quyền Admin) | `net session` |
| `query user` | Xem các user đang login vào máy (RDP/Local) | `query user` |

## 🌐 Mạng lưới (Networking)
| Lệnh (CMD) | Mô tả | Ví dụ |
| :--- | :--- | :--- |
| `ipconfig` | Xem cấu hình IP | `ipconfig /all` (Xem cả DNS, MAC, DHCP) |
| `netstat` | Xem các kết nối mạng và port đang mở | `netstat -ano \| findstr LISTENING` |
| `route print` | Xem bảng định tuyến (Routing Table) | `route print` |
| `arp -a` | Xem bảng ARP (Địa chỉ MAC của các máy lân cận) | `arp -a` |
| `nslookup` | Truy vấn DNS | `nslookup google.com` |

## ⚙️ Tiến trình & Dịch vụ (Processes & Services)
| Lệnh (CMD) | Mô tả | Ví dụ |
| :--- | :--- | :--- |
| `tasklist` | Liệt kê các tiến trình đang chạy | `tasklist /v` (Xem chi tiết user chạy tiến trình) |
| `taskkill` | Tắt một tiến trình | `taskkill /F /IM notepad.exe` |
| `net start/stop` | Khởi động hoặc dừng dịch vụ | `net stop WinRM` |
| `sc query` | Kiểm tra trạng thái dịch vụ chi tiết | `sc query state= all` |

## 🐚 PowerShell Essentials
| Lệnh (PS) | Mô tả | Tương đương CMD |
| :--- | :--- | :--- |
| `Get-Service` | Liệt kê các dịch vụ | `sc query` |
| `Get-Process` | Liệt kê các tiến trình | `tasklist` |
| `Get-Content` | Đọc nội dung file | `type` |
| `Get-ExecutionPolicy`| Kiểm tra chính sách thực thi script | - |
| `Set-ExecutionPolicy`| Thay đổi chính sách (ví dụ: `RemoteSigned`)| - |
| `Test-NetConnection` | Kiểm tra port (thay thế telnet) | `tnc <IP> -Port 445` |

## 📁 Tệp tin & Hệ thống (Filesystem)
| Lệnh (CMD) | Mô tả | Ví dụ |
| :--- | :--- | :--- |
| `dir` | Liệt kê tệp tin | `dir /a /s` (Liệt kê cả file ẩn trong thư mục con) |
| `tree` | Hiển thị cấu trúc thư mục dạng cây | `tree /f` |
| `icacls` | Kiểm tra/Thay đổi quyền truy cập file | `icacls C:\Windows` |
| `findstr` | Tìm kiếm chuỗi trong tệp | `findstr /si "password" *.txt` |
