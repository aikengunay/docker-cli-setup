# docker-cli-setup

A CLI tool for installing Docker Engine + CLI on Ubuntu with an interactive setup process.

## Install

### From npm (Recommended)

```bash
npm install -g docker-cli-setup
```

**Linux users (one-time setup):**

If you get permission errors, configure npm once:

```bash
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

After this one-time setup, you can use `npm install -g` for any package without sudo or permission issues.

### From source

For development or to install from source:

```bash
git clone https://github.com/aikengunay/docker-cli-setup.git
cd docker-cli-setup
npm install -g .
```

The `-g` flag installs the package globally, making `docker-cli-setup` available from any directory in your terminal.

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

## Requirements

- Node.js 14 or higher
- Ubuntu/Debian Linux system
- sudo privileges
- Internet connection

## Platform Support

This tool is optimized for **Ubuntu/Debian** systems. It will warn you if you're running on a different Linux distribution, but you can choose to proceed anyway.

## After Installation

After the installation completes, you need to **log out and back in** (or run `newgrp docker`) so that your user's membership in the `docker` group takes effect. After logging back in, you can use Docker commands without `sudo`.

## Uninstall

```bash
npm uninstall -g docker-cli-setup
```

**Note:** This will not remove Docker from your system. To remove Docker:

```bash
sudo apt remove -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo rm -rf /var/lib/docker
sudo rm -rf /var/lib/containerd
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT
