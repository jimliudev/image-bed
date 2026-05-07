### 🛠️ 第一階段：建立環境與資料準備
[cite_start]在開始解壓縮之前，必須先在 `/tmp` 下建立一個具備寫入權限的工作目錄，並將原始 hexdump 還原為二進制檔 [cite: 173, 174, 181]。

1.  **建立工作目錄**：
    ```bash
    MYDIR=$(mktemp -d)
    cd $MYDIR
    ```
2.  [cite_start]**搬移與備份檔案** [cite: 48, 181]：
    ```bash
    cp ~/data.txt .
    ```
3.  [cite_start]**Hexdump 還原** [cite: 1, 175]：
    ```bash
    xxd -r data.txt > datafile
    ```

---

### 🔄 第二階段：解壓縮循環流程 (The Loop)
[cite_start]接下來請進入這個重複動作的循環。每解開一層，系統會產生一個新檔案，請對該新檔案重複以下步驟 [cite: 176, 184]：


| 步驟 | 動作指令 | 目的與說明 |
| :--- | :--- | :--- |
| **1. 識別** | `file [檔案名稱]` | [cite_start]**最關鍵的一步**。確認目前檔案的壓縮格式（gzip, bzip2, tar 等） [cite: 85, 176]。 |
| **2. 重新命名** | `mv [原檔名] [原檔名].[副檔名]` | [cite_start]根據 `file` 的結果補上正確副檔名（如 `.gz`），否則部分工具（如 `gunzip`）可能拒絕執行 [cite: 48, 176]。 |
| **3. 解壓縮** | *見下方對照表* | [cite_start]使用對應工具進行解壓，產生下一層檔案 [cite: 176, 183]。 |
| **4. 檢查** | `ls -l` | [cite_start]確認是否產出了新的檔案，並回到步驟 1 繼續檢查 [cite: 176, 183]。 |

---

### 📦 指令工具對照表 (Decompression Tools)
[cite_start]根據 `file` 指令回傳的結果，選擇對應的解壓工具 [cite: 176, 183]：

* **POSIX tar archive**：
    * [cite_start]`tar -xf [檔案]` [cite: 183]
* **gzip compressed data**：
    * [cite_start]`mv [檔案] [檔案].gz` -> `gunzip [檔案].gz` [cite: 48, 176]
* **bzip2 compressed data**：
    * [cite_start]`mv [檔案] [檔案].bz2` -> `bzip2 -d [檔案].bz2` [cite: 48, 176]

---

### 🏁 第三階段：終點判定
當執行 `file [檔案]` 後，輸出的結果不再是壓縮格式，而是：
> [cite_start]`[檔案]: ASCII text` [cite: 93, 176]

[cite_start]這代表你已經抵達最後一層！此時只需執行最後的讀取指令 [cite: 1, 48]：
```bash
cat [檔案名稱]
```
[cite_start]螢幕上出現的隨機字串即為 **Bandit Level 13** 的密碼 [cite: 18, 176][cite_start]。請務必將此密碼記錄在你的本地筆記中，並在完成後手動刪除暫存目錄以保持系統整潔 [cite: 13, 168]。

您目前解到哪一層了？如果看到不認識的檔案格式（例如 `data:`, `LZMA` 等），可以隨時把 `file` 的結果貼上來！