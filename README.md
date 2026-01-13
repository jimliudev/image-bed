# image-bed

使用 GitHub API 上傳圖片的 TypeScript 工具

## 功能特色

- ✅ 使用 GitHub API 上傳圖片到倉庫
- ✅ 支援單一檔案或批次上傳
- ✅ 自動生成唯一檔案名稱（帶時間戳）
- ✅ 可自訂遠端路徑和檔案名稱
- ✅ TypeScript 完整型別支援

## 安裝

1. 複製 `.env.example` 為 `.env` 並設定你的 GitHub 資訊：

```bash
cp .env.example .env
```

2. 編輯 `.env` 檔案，填入你的 GitHub 資訊：

```env
GITHUB_OWNER=your-github-username
GITHUB_REPO=image-bed
GITHUB_TOKEN=your-github-personal-access-token
GITHUB_BRANCH=main
```

3. 安裝依賴套件：

```bash
npm install
```

## 取得 GitHub Token

1. 前往 GitHub Settings > Developer settings > Personal access tokens
2. 點擊 "Generate new token (classic)"
3. 選擇權限：勾選 `repo` (完整倉庫權限)
4. 生成 token 並複製到 `.env` 檔案

## 使用方式

### 上傳單一圖片

```bash
# 上傳到預設路徑 (images/)
npm run upload ./my-image.png

# 上傳到指定路徑
npm run upload ./my-image.png images/screenshots

# 上傳並指定檔案名稱
npm run upload ./my-image.png images custom-name.png
```

### 批次上傳多個圖片

```bash
# 上傳多個檔案到預設路徑
npm run upload ./img1.png ./img2.png ./img3.png

# 上傳多個檔案到指定路徑
npm run upload ./img1.png ./img2.png images/photos
```

## 程式碼範例

也可以在其他 TypeScript 專案中引入使用：

```typescript
import { GitHubImageUploader } from './script/upload-image';

const uploader = new GitHubImageUploader();

// 上傳單一圖片
const url = await uploader.uploadImage('./my-image.png');
console.log('圖片 URL:', url);

// 批次上傳
const urls = await uploader.uploadImages([
  './img1.png',
  './img2.png',
  './img3.png'
], 'images/batch');
```

## 專案結構

```
image-bed/
├── script/
│   └── upload-image.ts    # 上傳圖片的主要 script
├── .env.example           # 環境變數範例
├── .gitignore             # Git 忽略檔案
├── package.json           # 專案設定
├── tsconfig.json          # TypeScript 設定
└── README.md              # 說明文件
```

## 注意事項

- 確保 `.env` 檔案不要提交到 Git（已在 `.gitignore` 中設定）
- GitHub Token 需要有 `repo` 權限才能上傳檔案
- 預設會將圖片上傳到 `images/` 目錄
- 檔案名稱會自動加上時間戳以避免重複

## License

MIT

