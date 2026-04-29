# Cat

**1. file name called -**

cat ./-

**2. file name called -- spaces in this filename --**
- cat "./--spaces in this filename--"
- cat -- "--spaces in this filename--"
- 先打cat ./-再按tab自動補全。

**3. check the file format.**

file ./*

**4. find**

find . -type f -size 1033c

**5. find hidden file**

find . -name ".*"
ls -la

. current directory
/ root directory

```
find / -user bandit7 -group bandit6 -size 33c -exec cat {} + 2>/dev/null

```

- -exec ... {} +：這是 find 的強大功能，意思是「對找到的每一個檔案執行後面的指令」 。

- cat：這是你想要執行的指令（讀取內容） 。

- {}：這是一個佔位符，find 會自動把找到的檔案路徑填入這裡 。

- +：代表將所有找到的檔案一次性交給 cat 處理，效能較佳 。

- 2>/dev/null：依然保留，用來過濾掉因權限不足產生的錯誤雜訊 。

### Other

2>/dev/null
系統會開啟三個標準的資料通道 0 1 2
>把資料導入到其他地方
/dev/null 黑洞



