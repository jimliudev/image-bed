# Step 1: install Raspberry Pi and set the auto connect WiFi.
I used a Raspberry Pi4 ModelB. Use the UI Tools of Office.
Not need create wpa_supplicant.conf.

# Step 2: search for Respberry Pi ip.
Pi 4 的標準開頭應該是 dc:a6:32、e4:5f:01 或 d8:3a:dd。
```bash
$ arp -a
```

# Step 3: ssh connect into Pi.
```bash
$ ssh username@ip
```

# Step 4: install claude code.

[How to control claude code with Telegram](https://jimliu.dev/en/posts/how-to-control-claudecode-with-telegram)

# Step 5: set tmux let claude code stiil live after closing the ssh.

### 1. install tmux
```bash
$ sudo apt update && sudo apt install tmux -y
```

### 2. new session
```
$ tmux new -s my-claude
```

### 3. run claude
```
claude --channels plugin:telegram@claude-plugins-official
```

### 4. 優雅地離開」(Detach)
按下組合鍵 Ctrl + b，然後放開，再按一下 d。

### 5. re-connect next into ssh.
```
tmux attach -t my-claude
```

### 6. kill session 徹底關閉某個會話（裡面的程式會死掉）
```
tmux kill-session -t <name>	
```

## other commands.

查詢安裝在哪 which tmux.






 


