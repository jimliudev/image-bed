# ARP (Address Resolution Protocol)

ARP是一個尋找目標MAC的一個協定，會封裝Layer2的內容向Router詢問。

* **重點：**它是 Layer 2 與 Layer 3 的翻譯官。
* **關鍵角色：**主機、路由器、交換機。

## 封包內容

**ARP 的打包（發起請求）:**

乙太網路標頭：目標 MAC 是 FF:FF:FF:FF:FF:FF（廣播） 。

內容物：直接就是 ARP Payload。

關鍵欄位：操作碼 (Opcode)、發送者 IP/MAC、目標 IP、目標 MAC (全 0) 。

特點：封包非常小（通常約 42 到 60 位元組），沒有 TCP 序列號，也沒有 Port 的概念 。

## 實際溝通流程

### 傳送的順序邏輯
這對你的部落格文章會很有幫助：ARP 永遠發生在 HTTP 之前。

情境：你想傳送一個 HTTP Request 給 192.168.1.1 。

卡關：電腦發現不知道 192.168.1.1 的 MAC 地址，無法完成 Layer 2 的封裝 。

動作：電腦暫停 HTTP 打包，先發出一個 ARP Request 封包到Router，如果不同網段就會到ISP去問，電信商查詢路由表，都查不到才會drop回報ICMP封包 -> 我電腦。

結果：收到 ARP Reply 拿到 MAC 後，電腦才會正式發出 HTTP 封包 。
