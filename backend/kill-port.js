const { execSync } = require('child_process');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });
const port = process.env.PORT || 8001;

try {
  let pid;
  if (process.platform === 'win32') {
    // Search for TCP connections on local port matching the target port
    const output = execSync(`netstat -ano | findstr :${port}`, { stdio: ['pipe', 'pipe', 'ignore'] }).toString();
    const lines = output.split('\n');
    for (const line of lines) {
      if (line.includes('LISTENING')) {
        const parts = line.trim().split(/\s+/).filter(Boolean);
        // The PID is the last element in the netstat row
        pid = parts[parts.length - 1];
        if (pid && pid !== '0') {
          console.log(`[Port Clean] Port ${port} is in use by PID ${pid}. Terminating process...`);
          execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
          console.log(`[Port Clean] Successfully killed process ${pid}.`);
          break;
        }
      }
    }
  } else {
    // macOS / Linux fallback using lsof
    const output = execSync(`lsof -t -i:${port}`, { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();
    if (output) {
      pid = output.split('\n')[0];
      console.log(`[Port Clean] Port ${port} is in use by PID ${pid}. Terminating process...`);
      execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
      console.log(`[Port Clean] Successfully killed process ${pid}.`);
    }
  }
} catch (error) {
  // If port is not in use, execSync throws (which we ignore)
}
