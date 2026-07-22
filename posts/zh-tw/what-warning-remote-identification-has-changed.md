## 錯誤紀錄： WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!

![Screenshot 2026-07-22 at 10.22.48 PM](https://raw.githubusercontent.com/jimliudev/image-bed/main/image/blog/Screenshot 2026-07-22 at 10.22.48 PM-1784730195366.png)

SSH登入時會把遠端的公鑰、domain、ip做紀錄，如果第二次登入時做的紀錄不一樣就會有這個WARNING。

### SSH 登入原理：
SSH 採用的是 TOFU (Trust On First Use，首次連線即信任) 模型：
會依照第一次登入的為準。

### 流程如下：

```
[首次連線]
Client ──(請求連線)──> Server
Client <──(傳送公鑰)── Server
  │
  ├─> 跳出提示：「這是第一次連線，確定要信任這台主機嗎？」
  └─> 輸入 yes ──> 將 [IP/Domain + 伺服器公鑰] 存入 known_hosts

[後續連線]
Client ──(請求連線)──> Server
Client <──(傳送公鑰)── Server
  │
  ├─> 拿 Server 給的公鑰 vs known_hosts 紀錄
  ├─> 比對一致 ──> 允許連線
  └─> 比對不符 ──> 觸發 WARNING，強制切斷連線！
```

### 錯誤問題：
[你電腦裡的 known_hosts 第 3 行]
紀錄：192.168.204.122 屬於 舊公鑰 A (舊指紋 A)
                                │
                                ✕ (兩者不吻合！)
                                │
[伺服器這次傳過來的身分]
給出：192.168.204.122 的 新公鑰 B (新指紋 B: SHA256:lJjKt8pgh...)


### 解決辦法：Clean the cached key (Recommended)
```
sudo ssh-keygen -f '/root/.ssh/known_hosts' -R '192.168.204.122'
```
