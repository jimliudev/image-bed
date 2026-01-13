import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

interface GitHubUploadResponse {
  content: {
    name: string;
    path: string;
    sha: string;
    size: number;
    url: string;
    html_url: string;
    git_url: string;
    download_url: string;
  };
}

class GitHubImageUploader {
  private owner: string;
  private repo: string;
  private token: string;
  private branch: string;
  private apiUrl: string;

  constructor() {
    this.owner = process.env.GITHUB_OWNER || '';
    this.repo = process.env.GITHUB_REPO || '';
    this.token = process.env.GITHUB_TOKEN || '';
    this.branch = process.env.GITHUB_BRANCH || 'main';
    this.apiUrl = 'https://api.github.com';

    this.validateConfig();
  }

  private validateConfig(): void {
    if (!this.owner || !this.repo || !this.token) {
      throw new Error('請設定環境變數: GITHUB_OWNER, GITHUB_REPO, GITHUB_TOKEN');
    }
  }

  /**
   * 將圖片檔案轉換為 Base64
   */
  private fileToBase64(filePath: string): string {
    const fileBuffer = fs.readFileSync(filePath);
    return fileBuffer.toString('base64');
  }

  /**
   * 生成唯一的檔案名稱（使用時間戳）
   */
  private generateFileName(originalName: string): string {
    const timestamp = Date.now();
    const ext = path.extname(originalName);
    const nameWithoutExt = path.basename(originalName, ext);
    return `${nameWithoutExt}-${timestamp}${ext}`;
  }

  /**
   * 上傳圖片到 GitHub
   */
  async uploadImage(
    localFilePath: string,
    remotePath?: string,
    customFileName?: string
  ): Promise<string> {
    try {
      // 檢查檔案是否存在
      if (!fs.existsSync(localFilePath)) {
        throw new Error(`檔案不存在: ${localFilePath}`);
      }

      // 取得檔案資訊
      const fileName = customFileName || this.generateFileName(path.basename(localFilePath));
      const base64Content = this.fileToBase64(localFilePath);
      
      // 設定遠端路徑（預設為 images 資料夾）
      const remoteDir = remotePath || 'images';
      const remoteFilePath = `${remoteDir}/${fileName}`;

      console.log(`正在上傳圖片: ${localFilePath}`);
      console.log(`目標路徑: ${remoteFilePath}`);

      // 呼叫 GitHub API
      const url = `${this.apiUrl}/repos/${this.owner}/${this.repo}/contents/${remoteFilePath}`;
      
      const response = await axios.put<GitHubUploadResponse>(
        url,
        {
          message: `Upload image: ${fileName}`,
          content: base64Content,
          branch: this.branch,
        },
        {
          headers: {
            Authorization: `token ${this.token}`,
            'Content-Type': 'application/json',
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );

      const downloadUrl = response.data.content.download_url;
      console.log('✅ 上傳成功!');
      console.log(`圖片 URL: ${downloadUrl}`);
      
      return downloadUrl;
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        console.error('❌ 上傳失敗:', error.response?.data || error.message);
        throw new Error(`GitHub API 錯誤: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }

  /**
   * 批次上傳多個圖片
   */
  async uploadImages(
    filePaths: string[],
    remotePath?: string
  ): Promise<string[]> {
    const results: string[] = [];
    
    for (const filePath of filePaths) {
      try {
        const url = await this.uploadImage(filePath, remotePath);
        results.push(url);
      } catch (error: any) {
        console.error(`上傳失敗 ${filePath}:`, error.message);
        results.push('');
      }
    }
    
    return results;
  }
}

// CLI 執行
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('使用方式:');
    console.log('  單一檔案: npm run upload <file-path> [remote-path] [custom-filename]');
    console.log('  多個檔案: npm run upload <file1> <file2> <file3> ... [remote-path]');
    console.log('');
    console.log('範例:');
    console.log('  npm run upload ./my-image.png');
    console.log('  npm run upload ./my-image.png images/screenshots');
    console.log('  npm run upload ./my-image.png images custom-name.png');
    console.log('  npm run upload ./img1.png ./img2.png ./img3.png');
    process.exit(1);
  }

  try {
    const uploader = new GitHubImageUploader();
    
    // 過濾出檔案路徑（存在的檔案）
    const filePaths = args.filter(arg => fs.existsSync(arg));
    const nonFilePaths = args.filter(arg => !fs.existsSync(arg));
    
    if (filePaths.length === 0) {
      throw new Error('沒有找到有效的檔案');
    }

    // 判斷是單一檔案還是多個檔案
    if (filePaths.length === 1) {
      // 單一檔案模式
      const [filePath] = filePaths;
      const [remotePath, customFileName] = nonFilePaths;
      await uploader.uploadImage(filePath, remotePath, customFileName);
    } else {
      // 多檔案模式
      const remotePath = nonFilePaths[0];
      console.log(`批次上傳 ${filePaths.length} 個檔案...`);
      const urls = await uploader.uploadImages(filePaths, remotePath);
      console.log('\n上傳結果:');
      urls.forEach((url, index) => {
        if (url) {
          console.log(`${index + 1}. ${url}`);
        } else {
          console.log(`${index + 1}. 失敗`);
        }
      });
    }
  } catch (error: any) {
    console.error('錯誤:', error.message);
    process.exit(1);
  }
}

// 如果直接執行此檔案
if (require.main === module) {
  main();
}

export { GitHubImageUploader };
