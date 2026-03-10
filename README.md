# docker-cli-setup

A CLI tool for installing Docker Engine + CLI on Ubuntu with an interactive setup process.

## Install

### From npm (Recommended)

**Linux users (one-time setup):**

If you get permission errors, configure npm once:

```bash
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

Then install normally:

```bash
npm install -g docker-cli-setup
```

**macOS/Windows users:**

Install directly:

```bash
npm install -g docker-cli-setup
```

### From source

```bash
git clone https://github.com/aikengunay/docker-cli-setup.git
cd docker-cli-setup
npm install -g .
```

The `-g` flag installs the package globally, making `docker-cli-setup` available from any directory in your terminal.

**Note:** After the one-time setup on Linux, you can use `npm install -g` for any package without sudo or permission issues.

## Usage

```bash
docker-cli-setup
```

Run `docker-cli-setup` from any directory. The tool will guide you through the installation process.

**Examples:**

```bash
# Run setup
docker-cli-setup

# Show version
docker-cli-setup --version

# Show help
docker-cli-setup --help
```

## Features

- Interactive installation process
- Automatic removal of old Docker packages
- Installs Docker Engine, CLI, Containerd, Buildx, and Compose plugin
- Installs shell completion (bash/zsh) for tab completion support
- Adds your user to the docker group
- Enables and starts Docker service
- Verifies installation with hello-world test
- Colored output for better UX
- Cross-platform detection (Linux/Ubuntu optimized)

## What it installs

- **Docker Engine** (`docker-ce`)
- **Docker CLI** (`docker-ce-cli`)
- **Containerd** (`containerd.io`)
- **Docker Buildx plugin** (`docker-buildx-plugin`)
- **Docker Compose plugin** (`docker-compose-plugin`)
- **Shell completion** (bash/zsh) - enables tab completion for Docker commands

## Requirements

- Node.js
- Ubuntu/Debian Linux system
- sudo privileges
- Internet connection

## Important Notes

### After Installation

After the installation completes, you need to **log out and back in** (or run `newgrp docker`) so that your user's membership in the `docker` group takes effect. After logging back in, you can use Docker commands without `sudo`.

### Platform Support

This tool is optimized for **Ubuntu/Debian** systems. It will warn you if you're running on a different Linux distribution, but you can choose to proceed anyway.

### What it does

1. Removes any old Docker packages (docker, docker-engine, docker.io, containerd, runc)
2. Installs prerequisites (ca-certificates, curl)
3. Adds Docker's official GPG key and APT repository
4. Installs Docker Engine, CLI, Containerd, Buildx, and Compose plugin
5. Installs shell completion (bash/zsh) for tab completion
6. Adds your user to the `docker` group
7. Enables and starts the Docker service
8. Runs `docker run hello-world` to verify the install
9. Offers to apply docker group membership immediately

## Uninstall

```bash
npm uninstall -g docker-cli-setup
```

Note: This will not remove Docker from your system. To remove Docker:

```bash
sudo apt remove -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo rm -rf /var/lib/docker
sudo rm -rf /var/lib/containerd
```

## License

MIT
