你觀察得非常細銳！這正是許多開發者在初次設定 CI/CD 時最容易卡關的地方：**「消失的 .env 檔案」**。

這裡有兩個核心邏輯你需要釐清：

### 1. Vite Build 的「硬編碼」特性
當你在本地執行 `npm run build` 時，Vite 會去讀取專案根目錄的 `.env`。它會把程式碼中所有的 `import.meta.env.VITE_XXX` 替換成 **字串常數**。
* **原始碼**：`const api = import.meta.env.VITE_API_URL;`
* **Build 後的 JS**：`const api = "https://api.jimliu.dev";`

一旦 Build 完成，這個 `api` 變數就再也無法透過環境變數更改了，因為它已經變成死資料。

---

### 2. GitHub Actions 為什麼沒有 .env？
因為 `.env` 通常會被列入 `.gitignore`（為了安全），所以當 GitHub Actions 執行 `git checkout` 時，你的虛擬機環境裡確實**沒有**這個檔案。

**要在 GitHub Actions 裡讓 Vite 抓到變數，有兩種做法：**

#### 做法 A：利用 Shell 環境變數 (最常用)
Vite 非常聰明，如果它在系統環境中發現了以 `VITE_` 開頭的變數，它會優先採用，效果等同於 `.env` 檔案。

你只需要修改你的 `yml` 檔：
```yaml
- name: Build frontend
  working-directory: src/frontend/jimliudev
  run: npm run build
  env:
    # 這裡直接定義，Vite Build 的時候就會自動抓到這組變數
    VITE_API_URL: "https://your-azure-api.azurewebsites.net"
    VITE_APP_NAME: "JimLiu Dev API"
```

#### 做法 B：在 Action 中動態產生 .env (較暴力)
如果你的專案邏輯一定要讀檔案，你可以在 Build 之前用指令噴一個檔案出來：
```yaml
- name: Create .env file
  run: |
    echo "VITE_API_URL=https://api.jimliu.dev" > src/frontend/jimliudev/.env
    echo "VITE_OTHER_VAR=value" >> src/frontend/jimliudev/.env
```

---

### 3. 這會導致一個嚴重的問題：部署靈活性
如果你用上述方法把 `VITE_API_URL` 塞進去，這意味著你的 **Frontend Image/Artifact 是「環境特定」的**。
* 如果你想把同一個 Build 好的產出物從 `Staging` 移到 `Production`，你會發現 `API_URL` 還是舊的。
* 你必須針對每個環境 **重新 Build 一次**。

---

### 💡 針對你的情況（前端放在 .NET wwwroot）

既然你希望能從 **Azure Portal 的 Settings** 統一控管，我強烈建議你改用 **「運行時注入 (Runtime Injection)」**，而不是「編譯時注入」。

**最優雅的「繞過」方式：**
在你的 `.NET` 專案中，建立一個簡單的 `ConfigController`：

```csharp
// .NET API
[HttpGet("api/config")]
public IActionResult GetFrontendConfig()
{
    return Ok(new {
        // 從 Azure Portal 的環境變數讀取
        apiUrl = Environment.GetEnvironmentVariable("VITE_API_URL") 
    });
}
```

**前端程式碼修改：**
不要直接用 `import.meta.env`，改用一個非同步的載入方式：
```typescript
// 在 App 啟動時
const response = await fetch('/api/config');
const config = await response.json();
const API_URL = config.apiUrl;
```



**這樣做的好處：**
1. **GitHub Actions 不必管變數**：隨便 Build，產出物是通用的。
2. **Azure Portal 掌控一切**：你在 Azure 進階編輯改了 `VITE_API_URL`，重新整理網頁，前端就立刻抓到新網址。

**你現在 GitHub Actions 裡的 `Build frontend` 步驟有設定 `env` 嗎？** 如果沒有，那你的前端現在抓到的可能全是 `undefined`。