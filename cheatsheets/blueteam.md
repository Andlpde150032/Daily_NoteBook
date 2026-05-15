# 🛡️ Blue Team Defense Cheatsheet

Tổng hợp các câu lệnh phòng thủ, xử lý sự cố và gia cố (Hardening) hệ thống Windows/Active Directory.

---

## 🔑 Quản lý Tài khoản & Xác thực
| Command / Thao tác | Mô tả | Ví dụ |
| :--- | :--- | :--- |
| `net user` | Thay đổi mật khẩu tài khoản ngay lập tức | `net user Administrator NewP@ssw0rd!` |
| `Disable-LocalUser` | Vô hiệu hóa tài khoản (PowerShell) | `Disable-LocalUser -Name "Guest"` |
| **Reset krbtgt (x2)** | **BẮT BUỘC** thực hiện 2 lần để vô hiệu hóa hoàn toàn vé TGT cũ (Golden Ticket) | Chạy script `Reset-KrbTgt-Password.ps1` lần 1, đợi replicate, sau đó chạy lần 2. |
| `Set-LocalUser` | Gán lại mật khẩu cho user local | `$pass = ConvertTo-SecureString "..." -AsPlainText -Force; Set-LocalUser -Name "User" -Password $pass` |


## 🚫 Xử lý Phiên làm việc (Session Management)
| Command / Thao tác | Mô tả | Ví dụ |
| :--- | :--- | :--- |
| `Restart-Service WinRM` | Ngắt toàn bộ kết nối WinRM đang active | `Restart-Service WinRM -Force` |
| `qwinsta` / `rwinsta` | Liệt kê và ngắt session RDP | `qwinsta` -> `rwinsta [ID]` |
| `Get-SmbSession` | Xem các kết nối SMB hiện tại | `Get-SmbSession \| Close-SmbSession` |

## 🧱 Gia cố Tường lửa (Firewall Hardening)
| Command / Thao tác | Mô tả | Ví dụ |
| :--- | :--- | :--- |
| `Set-NetFirewallRule` | Bật/tắt luật tường lửa | `Set-NetFirewallRule -Name "WINRM-HTTP-In-TCP-PUBLIC" -Enabled False` |
| `IP Whitelisting` (GUI) | Giới hạn IP truy cập cổng dịch vụ | Vào Inbound Rules -> Scope -> Remote IP address -> Add IP |
| `New-NetFirewallRule` | Tạo luật block IP cụ thể | `New-NetFirewallRule -DisplayName "Block Attacker" -Direction Inbound -RemoteAddress 192.168.1.100 -Action Block` |

## 🕵️ Giám sát & Ghi log (Auditing)
| Command / Thao tác | Mô tả | Ví dụ |
| :--- | :--- | :--- |
| `auditpol` | Kiểm tra cấu hình Audit Policy hiện tại | `auditpol /get /category:*` |
| `Turn on PowerShell Logging` | Bật ghi log script block (GPO) | GPO: `Computer Configuration > Admin Templates > Windows Components > PowerShell` |
| `Event Viewer (eventvwr)` | Truy cập log hệ thống | `Security` (4624, 5140), `WinRM Operational` (91) |
