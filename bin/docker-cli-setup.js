#!/usr/bin/env node

const { execSync, spawnSync } = require('child_process');
const os = require('os');
const inquirer = require('inquirer');
const chalk = require('chalk');

function log(message, type = 'info') {
  const colors = {
    info: chalk.blue,
    success: chalk.green,
    error: chalk.red,
    warning: chalk.yellow,
  };
  console.log(colors[type](message));
}

function error(message) {
  log(message, 'error');
  process.exit(1);
}

function success(message) {
  log(message, 'success');
}

async function checkPlatform() {
  const platform = os.platform();
  if (platform !== 'linux') {
    error('This tool is designed for Linux/Ubuntu systems only.');
  }
  
  // Check if running on Ubuntu/Debian
  try {
    const osRelease = require('fs').readFileSync('/etc/os-release', 'utf8');
    if (!osRelease.includes('Ubuntu') && !osRelease.includes('Debian')) {
      log('Warning: This tool is optimized for Ubuntu/Debian systems.', 'warning');
      const { proceed } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'proceed',
          message: 'Do you want to proceed anyway?',
          default: false,
        },
      ]);
      if (!proceed) {
        process.exit(0);
      }
    }
  } catch (err) {
    log('Could not detect OS distribution. Proceeding anyway...', 'warning');
  }
}

function checkSudo() {
  try {
    execSync('sudo -n true', { stdio: 'ignore' });
    return true;
  } catch (err) {
    return false;
  }
}

function executeCommand(command, description, options = {}) {
  return new Promise((resolve, reject) => {
    log(description, 'info');
    
    const proc = spawnSync('bash', ['-c', command], {
      stdio: 'inherit',
      ...options,
    });
    
    if (proc.status !== 0) {
      reject(new Error(`Command failed with exit code ${proc.status}`));
    } else {
      resolve();
    }
  });
}

function showVersion() {
  try {
    const packageJsonPath = require('path').join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(require('fs').readFileSync(packageJsonPath, 'utf8'));
    log(`docker-cli-setup v${packageJson.version}`, 'info');
  } catch (err) {
    log('docker-cli-setup (version unknown)', 'info');
  }
}

function showHelp() {
  log('\nUsage: docker-cli-setup [options]', 'info');
  log('\nOptions:', 'info');
  log('  -v, --version             Show version number', 'info');
  log('  -h, --help                Show this help message', 'info');
  log('\nDescription:', 'info');
  log('  Interactive setup tool for Docker Engine + CLI on Ubuntu.', 'info');
  log('  Installs Docker Engine, CLI, Containerd, Buildx, and Compose plugin.', 'info');
}

async function main() {
  // Parse command-line arguments
  const args = process.argv.slice(2);
  
  if (args.length > 0) {
    if (args[0] === '--help' || args[0] === '-h') {
      showHelp();
      process.exit(0);
    }
    
    if (args[0] === '--version' || args[0] === '-v') {
      showVersion();
      process.exit(0);
    }
  }
  
  // Check platform
  await checkPlatform();
  
  // Check if sudo is available
  if (!checkSudo()) {
    error('This tool requires sudo privileges. Please run with sudo or ensure you have sudo access.');
  }
  
  log('\n=== Docker CLI Setup ===', 'info');
  log('This tool will install Docker Engine + CLI on your Ubuntu system.\n', 'info');
  
  // Show what will be installed
  log('What will be installed:', 'info');
  log('  • Docker Engine', 'info');
  log('  • Docker CLI', 'info');
  log('  • Containerd', 'info');
  log('  • Docker Buildx plugin', 'info');
  log('  • Docker Compose plugin', 'info');
  log('  • Shell completion (bash/zsh) for tab completion', 'info');
  log('  • Your user will be added to the docker group\n', 'info');
  
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Do you want to proceed with the installation?',
      default: true,
    },
  ]);
  
  if (!confirm) {
    log('Installation cancelled.', 'info');
    process.exit(0);
  }
  
  try {
    // Step 1: Remove old Docker
    log('\n=== Step 1: Removing old Docker (if any) ===', 'info');
    await executeCommand(
      'sudo apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true',
      'Removing old Docker packages...'
    );
    success('✓ Old Docker packages removed (if any)');
    
    // Step 2: Install prerequisites
    log('\n=== Step 2: Installing prerequisites ===', 'info');
    await executeCommand(
      'sudo apt update',
      'Updating package lists...'
    );
    await executeCommand(
      'sudo apt install -y ca-certificates curl',
      'Installing prerequisites...'
    );
    success('✓ Prerequisites installed');
    
    // Step 3: Add Docker's official GPG key and repository
    log('\n=== Step 3: Adding Docker\'s official GPG key and repository ===', 'info');
    await executeCommand(
      'sudo install -m 0755 -d /etc/apt/keyrings',
      'Creating keyrings directory...'
    );
    await executeCommand(
      'curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg',
      'Adding Docker GPG key...'
    );
    await executeCommand(
      'sudo chmod a+r /etc/apt/keyrings/docker.gpg',
      'Setting key permissions...'
    );
    
    // Get Ubuntu version codename
    const osRelease = require('fs').readFileSync('/etc/os-release', 'utf8');
    const versionMatch = osRelease.match(/VERSION_CODENAME=(\w+)/);
    const versionCodename = versionMatch ? versionMatch[1] : 'jammy';
    const arch = require('child_process').execSync('dpkg --print-architecture', { encoding: 'utf8' }).trim();
    
    const repoLine = `deb [arch=${arch} signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu ${versionCodename} stable`;
    await executeCommand(
      `echo "${repoLine}" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null`,
      'Adding Docker repository...'
    );
    success('✓ Docker repository added');
    
    // Step 4: Install Docker Engine, CLI, Containerd, and plugins
    log('\n=== Step 4: Installing Docker Engine, CLI, Containerd, and plugins ===', 'info');
    await executeCommand(
      'sudo apt update',
      'Updating package lists...'
    );
    await executeCommand(
      'sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin',
      'Installing Docker packages...'
    );
    success('✓ Docker Engine, CLI, Containerd, Buildx, and Compose plugin installed');
    
    // Step 5: Add user to docker group
    log('\n=== Step 5: Adding your user to the docker group ===', 'info');
    const username = os.userInfo().username;
    await executeCommand(
      `sudo usermod -aG docker ${username}`,
      `Adding ${username} to docker group...`
    );
    success(`✓ User ${username} added to docker group`);
    
    // Step 6: Enable and start Docker service
    log('\n=== Step 6: Starting Docker service ===', 'info');
    await executeCommand(
      'sudo systemctl enable docker',
      'Enabling Docker service...'
    );
    await executeCommand(
      'sudo systemctl start docker 2>/dev/null || true',
      'Starting Docker service...'
    );
    success('✓ Docker service enabled and started');
    
    // Step 7: Test installation
    log('\n=== Step 7: Testing Docker installation ===', 'info');
    await executeCommand(
      'sudo docker run --rm hello-world',
      'Running Docker test image...'
    );
    success('✓ Docker installation verified');
    
    // Step 8: Install shell completion (bash/zsh)
    log('\n=== Step 8: Installing shell completion ===', 'info');
    
    const shell = process.env.SHELL || '/bin/bash';
    const shellName = shell.split('/').pop();
    
    if (shellName === 'bash' || shellName === 'zsh') {
      const { installCompletion } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'installCompletion',
          message: `Install Docker CLI completion for ${shellName}? (enables tab completion)`,
          default: true,
        },
      ]);
      
      if (installCompletion) {
        try {
          // Download Docker completion script
          const completionUrl = shellName === 'bash' 
            ? 'https://raw.githubusercontent.com/docker/docker-ce/master/components/cli/contrib/completion/bash/docker'
            : 'https://raw.githubusercontent.com/docker/docker-ce/master/components/cli/contrib/completion/zsh/_docker';
          
          const completionDir = shellName === 'bash' 
            ? '/etc/bash_completion.d'
            : '/usr/local/share/zsh/site-functions';
          
          // Create directory if it doesn't exist
          await executeCommand(
            `sudo mkdir -p ${completionDir}`,
            `Creating ${completionDir} directory...`
          );
          
          // Download and install completion script
          const completionFile = shellName === 'bash'
            ? '/etc/bash_completion.d/docker'
            : '/usr/local/share/zsh/site-functions/_docker';
          
          await executeCommand(
            `curl -fsSL ${completionUrl} | sudo tee ${completionFile} > /dev/null`,
            `Downloading Docker ${shellName} completion script...`
          );
          
          // For bash, also source it in user's .bashrc if not already there
          if (shellName === 'bash') {
            const bashrcPath = `${os.homedir()}/.bashrc`;
            const bashrcContent = require('fs').existsSync(bashrcPath) 
              ? require('fs').readFileSync(bashrcPath, 'utf8')
              : '';
            
            if (!bashrcContent.includes('docker completion') && !bashrcContent.includes('/etc/bash_completion.d/docker')) {
              const { addToBashrc } = await inquirer.prompt([
                {
                  type: 'confirm',
                  name: 'addToBashrc',
                  message: 'Add Docker completion to your ~/.bashrc? (recommended)',
                  default: true,
                },
              ]);
              
              if (addToBashrc) {
                const completionLine = '\n# Docker CLI completion\n[ -f /etc/bash_completion.d/docker ] && source /etc/bash_completion.d/docker\n';
                require('fs').appendFileSync(bashrcPath, completionLine, 'utf8');
                success('✓ Docker completion added to ~/.bashrc');
              }
            }
          }
          
          success(`✓ Docker ${shellName} completion installed`);
          log(`  Tab completion will be available after restarting your terminal or running: source ${completionFile}`, 'info');
        } catch (err) {
          log(`Warning: Could not install ${shellName} completion: ${err.message}`, 'warning');
          log('  You can install it manually later from:', 'info');
          log(`  ${shellName === 'bash' ? 'https://raw.githubusercontent.com/docker/docker-ce/master/components/cli/contrib/completion/bash/docker' : 'https://raw.githubusercontent.com/docker/docker-ce/master/components/cli/contrib/completion/zsh/_docker'}`, 'info');
        }
      }
    } else {
      log(`Shell completion not configured for ${shellName}. Supported shells: bash, zsh`, 'info');
    }
    
    // Step 9: Test Docker without sudo and offer group application
    log('\n=== Step 9: Testing Docker without sudo ===', 'info');
    
    // Test if docker works without sudo (it won't work yet in this session)
    try {
      execSync('docker --version', { stdio: 'ignore' });
      success('✓ Docker works without sudo!');
    } catch (err) {
      log('Docker requires sudo in this session (group change not yet applied).', 'warning');
    }
    
    log('\nYour user has been added to the docker group.', 'info');
    log('To use Docker without sudo, you need to apply the group change.', 'info');
    
    const { applyGroup } = await inquirer.prompt([
      {
        type: 'list',
        name: 'applyGroup',
        message: 'How would you like to apply the docker group membership?',
        choices: [
          { name: 'Run "newgrp docker" now (starts new shell session)', value: 'newgrp' },
          { name: 'I will log out and back in later', value: 'later' },
          { name: 'I will open a new terminal', value: 'newterm' },
        ],
        default: 'newgrp',
      },
    ]);
    
    if (applyGroup === 'newgrp') {
      log('\n=== Installation Complete! ===', 'success');
      log('\nInstalled packages:', 'info');
      log('  • docker-ce (Docker Engine)', 'success');
      log('  • docker-ce-cli (Docker CLI)', 'success');
      log('  • containerd.io', 'success');
      log('  • docker-buildx-plugin', 'success');
      log('  • docker-compose-plugin', 'success');
      log('\nStarting new shell session with docker group...', 'info');
      log('You can now run Docker commands without sudo in this new session.', 'success');
      log('\nNote: To use Docker without sudo in other terminals, log out and back in.', 'info');
      
      // Execute newgrp docker which will start a new shell
      // Note: This will replace the current process
      log('\nExecuting: newgrp docker', 'info');
      require('child_process').spawnSync('newgrp', ['docker'], {
        stdio: 'inherit',
        shell: true,
      });
    } else {
      // Final message
      log('\n=== Installation Complete! ===', 'success');
      log('\nInstalled packages:', 'info');
      log('  • docker-ce (Docker Engine)', 'success');
      log('  • docker-ce-cli (Docker CLI)', 'success');
      log('  • containerd.io', 'success');
      log('  • docker-buildx-plugin', 'success');
      log('  • docker-compose-plugin', 'success');
      log('\nTo use Docker without sudo:', 'warning');
      if (applyGroup === 'later') {
        log('  • Log out and back in to apply the docker group membership', 'info');
      } else {
        log('  • Open a new terminal session', 'info');
      }
      log('  • Or run: newgrp docker', 'info');
      log('\nAfter applying the group change, you can run Docker commands without sudo.', 'info');
      log('Test it with: docker --version', 'info');
    }
    
  } catch (err) {
    error(`\nInstallation failed: ${err.message}`);
  }
}

// Ensure the script has execute permissions
process.on('exit', () => {
  const scriptPath = __filename;
  try {
    require('fs').chmodSync(scriptPath, '755');
  } catch (err) {
    // Ignore chmod errors
  }
});

// Run the main function
main().catch((err) => {
  error(`Unexpected error: ${err.message}`);
});
